using Backend.Database;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Protocols.UserProtocols;

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class UserController(ApplicationDbContext context, PasswordHashService passwordHasher, JWTGeneratorService jwtGeneratorService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly PasswordHashService _passwordHasher = passwordHasher;
        private readonly JWTGeneratorService _jwtGeneratorService = jwtGeneratorService;

        [HttpGet]
        public async Task<IEnumerable<User>> Get() => await _context.Users.ToArrayAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return user;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<User>> Create([FromBody] CreateUserRequest requestUser)
        {
            requestUser.Username = requestUser.Username.Trim();

            if (await _context.Users.FirstOrDefaultAsync(u => u.Email == requestUser.Email) != null)
            {
                return Conflict(string.Format("A user with the email {0} already exists.", requestUser.Email));
            }
            else if (await _context.Users.FirstOrDefaultAsync(u => u.Name == requestUser.Username) != null)
            {
                return Conflict(string.Format("A user with the username {0} already exists.", requestUser.Username));
            }

            try
            {
                User newUser = new()
                {
                    Id = 0,
                    Name = requestUser.Username,
                    Email = requestUser.Email,
                    Password = _passwordHasher.HashPassword(requestUser.Password),
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(Get), new { id = newUser.Id }, requestUser);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email && _passwordHasher.HashPassword(loginRequest.Password) == u.Password);

            if (user == null)
                return NotFound();

            var invalidRft = await _context.RefreshTokens.FirstAsync(rft => rft.UserId == user.Identifier);
            _context.RefreshTokens.Remove(invalidRft);
            await _context.SaveChangesAsync();

            return Ok(new {
                accessToken = _jwtGeneratorService.GenerateJWToken(user),
                refreshToken = await _jwtGeneratorService.GenerateRefreshToken(user),
                userData = new
                {
                    username = user.Name,
                    email = user.Email,
                    guid = user.Identifier
                }
            });
        }

        [HttpPost]
        public async Task<ActionResult> RefreshLogin([FromBody] RefreshRequest refreshRequest)
        {
            var decodedToken = RefreshToken.DecodeTokenString(refreshRequest.Token);

            if (! await _context.RefreshTokens.ContainsAsync(decodedToken))
            {
                return Forbid();
            }

            User? user = await _context.Users.FirstOrDefaultAsync(u => u.Identifier == decodedToken.UserId);

            if (user == null)
            {
                return NotFound();
            }

            _context.RefreshTokens.Remove(decodedToken);
            await _context.SaveChangesAsync();

            return Ok(new {
                accessToken = _jwtGeneratorService.GenerateJWToken(user),
                refreshToken = await _jwtGeneratorService.GenerateRefreshToken(user),
                userData = new
                {
                    username = user.Name,
                    email = user.Email,
                    guid = user.Identifier
                }
            });
        }
    }
}
