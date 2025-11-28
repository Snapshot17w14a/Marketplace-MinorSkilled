using Backend.Database;
using Backend.Extensions;
using Backend.Interfaces;
using Backend.Iterfaces;
using Backend.Models;
using Backend.Protocols.DTOs;
using Backend.Protocols.UserProtocols;
using Backend.Roles;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpNet;

namespace Backend.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class UserController(ApplicationDbContext context, PasswordHashService passwordHasher, JWTGeneratorService jwtGeneratorService, IEmailClient emailClient, I2FAProvider mfaProvider) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly PasswordHashService _passwordHasher = passwordHasher;
        private readonly JWTGeneratorService _jwtGeneratorService = jwtGeneratorService;
        private readonly IEmailClient _emailClient = emailClient;
        private readonly I2FAProvider _mfaProivder = mfaProvider;

        [HttpGet]
        [Authorize]
        [Role(IdentityRole.Admin)]
        public async Task<IEnumerable<UserDTO>> Get() => _context.Users.Cast<UserDTO>();

        [HttpGet("{id}")]
        public async Task<ActionResult> Get(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                user = new UserDTO(user),
                permissions = _context.PermissionClaims.Where(pc => pc.Role == user.Role).Select(pc => pc.Permission)
            });
        }

        [AllowAnonymous]
        [HttpGet("{guid}")]
        public async Task<ActionResult> GetUserRole(Guid guid)
        {
            var user = await _context.Users.FromIdentifier(guid);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                role = user.Role
            });
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<User>> Create([FromBody] CreateUserRequest requestUser)
        {
            requestUser.Username = requestUser.Username.Trim();

            if (await _context.Users.FromEmail(requestUser.Email) != null)
            {
                return Conflict(string.Format("A user with the email {0} already exists.", requestUser.Email));
            }
            else if (await _context.Users.FromUsername(requestUser.Username) != null)
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
                    Role = IdentityRole.Member
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
            User? user = await _context.Users.FromEmail(loginRequest.Email);

            if (user == null)
                return NotFound();

            if (user.Password != _passwordHasher.HashPassword(loginRequest.Password))
                return Forbid();

            var invalidRft = await _context.RefreshTokens.FirstOrDefaultAsync(rft => rft.UserId == user.Identifier);

            if (invalidRft != null)
            {
                _context.RefreshTokens.Remove(invalidRft);
                await _context.SaveChangesAsync();
            }

            if (user.IsMFAEnabled)
            {
                if (string.IsNullOrEmpty(loginRequest.Totp))
                    return Unauthorized("User has MFA enabled, provide totp code to log in");

                if (!_mfaProivder.ValidateOTP(loginRequest.Totp, user.MFASecret!))
                    return Forbid();
            }
            
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

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> RefreshLogin([FromBody] RefreshRequest refreshRequest)
        {
            var decodedTokenId = RefreshToken.DecodeTokenString(refreshRequest.Token).TokenId;

            RefreshToken? rft = await _context.RefreshTokens.Where(rft => rft.TokenId == decodedTokenId).FirstOrDefaultAsync();

            if (rft == null)
                return NotFound();

            if (rft.Expiration < DateTime.UtcNow)
            {
                _context.RefreshTokens.Remove(rft);
                await _context.SaveChangesAsync();
                return Forbid();
            }

            User? user = await _context.Users.FromIdentifier(rft.UserId);

            if (user == null)
                return NotFound();

            _context.RefreshTokens.Remove(rft);
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
        [AllowAnonymous]
        public async Task<ActionResult> RequestResetToken([FromBody] ResetTokenRequest request)
        {
            User? user = await _context.Users.FromEmail(request.Email);

            if (user == null)
            {
                return NotFound();
            }

            PasswordResetToken? prt = await _context.ResetTokens.FirstOrDefaultAsync(prt => prt.Email == request.Email);

            if (prt != null)
            {
                if (DateTime.UtcNow > prt.Expiration)
                {
                    _context.ResetTokens.Remove(prt);
                    prt = null;
                }
                else
                {
                    return Forbid();
                }
            }

            Guid resetToken = Guid.NewGuid();

            prt = new()
            {
                Email = request.Email,
                Expiration = DateTime.UtcNow.AddMinutes(5),
                Token = resetToken
            };

            _context.ResetTokens.Add(prt);
            await _context.SaveChangesAsync();

            _ = Task.Run(() => _emailClient.SendEmail(request.Email, "Password reset request",
                string.Format(@"
<h1>A request was made to reset your password</h1>
<p>Dear {0}, we got a request to reset your password.
If this was not you ignore this message.
To reset your password follow the link below.</p>
<small>The link expires in 5 minutes</small></br>
<a href='http://localhost:5173/account/changePassword/{1}'>Reset link</a>
<p>Thank you for using our marketplace! Stay awesome!</p>
                ", user.Name, resetToken)
                ));

            return Ok("Reset token sent!");
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> ResetPassword([FromBody] PasswordResetRequest request)
        {
            PasswordResetToken? prt = await _context.ResetTokens.FirstOrDefaultAsync(prt => prt.Token == request.Token);

            if (prt == null)
            {
                return NotFound("The token could not be found!");
            }

            if (DateTime.UtcNow > prt.Expiration)
            {
                _context.ResetTokens.Remove(prt);
                await _context.SaveChangesAsync();
                return Forbid();
            }

            User? user = await _context.Users.FromEmail(prt.Email);

            if (user == null)
            {
                return NotFound("The user with the specified token could not be found!");
            }

            user.Password = _passwordHasher.HashPassword(request.Password);
            _context.Entry(user).Property(u => u.Password).IsModified = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult> Enable2FA()
        {
            var callingUser = (User?)HttpContext.Items["User"];

            if (callingUser == null)
                return NotFound();

            if (callingUser.IsMFAEnabled)
                return BadRequest();

            var key = _mfaProivder.GetSecretKey(callingUser.Identifier, callingUser.Email, callingUser.Password);

            callingUser.EnableMFA(key);

            _context.Entry(callingUser).DetectChanges();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                key
            });
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> ValidateOTP([FromBody] OTPRequest request)
        {
            var user = await _context.Users.FromIdentifier(request.userId);
            if (user == null || !user.IsMFAEnabled)
                return NotFound();

            var secret = user.MFASecret!;

            var totp = new Totp(Base32Encoding.ToBytes(secret));
            var verified = totp.VerifyTotp(request.pass, out _);

            return verified ? Ok() : Forbid();
        }

        public record OTPRequest(string pass, Guid userId);
    }
}
