using back.Database;
using back.Models;
using back.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace back.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class UserController(ApplicationDbContext context, PasswordHashService passwordHasher) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly PasswordHashService _passwordHasher = passwordHasher;

        [HttpGet]
        public async Task<IEnumerable<User>> GetUsers() => await _context.Users.ToArrayAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return user;
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest requestUser)
        {
            try
            {
                User newUser = new()
                {
                    Id = 0,
                    Name = requestUser.Username,
                    Email = requestUser.Email,
                    Password = _passwordHasher.HashPassword(requestUser.Password),
                    CreatedAt = DateTime.UtcNow,
                };
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, requestUser);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }

    public class CreateUserRequest
    {
        public required string Email { get; set; } = null!;
        public required string Password { get; set; } = null!;
        public required string Username { get; set; } = null!;
    }
}
