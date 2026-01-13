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
    public class UsersController(ApplicationDbContext context, PasswordHashService passwordHasher, TokenService tokenService, IEmailClient emailClient, I2FAProvider mfaProvider) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly PasswordHashService _passwordHasher = passwordHasher;
        private readonly TokenService _tokenService = tokenService;
        private readonly IEmailClient _emailClient = emailClient;
        private readonly I2FAProvider _mfaProivder = mfaProvider;

        [HttpGet]
        [Authorize]
        [Role(IdentityRole.Admin)]
        public IEnumerable<UserDTO> Get() => _context.Users.Cast<UserDTO>();

        [HttpGet("{id}")]
        [Authorize]
        [Role(IdentityRole.Admin)]
        public async Task<ActionResult> GetDetailed(int id)
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

        [HttpGet("{guid}")]
        public async Task<ActionResult> Get(Guid guid)
        {
            var user = await _context.Users.FromIdentifier(guid);

            if (user == null) 
                return NotFound();

            return Ok((UserDTO)user);
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
                accessToken = _tokenService.GenerateJWToken(user),
                refreshToken = await _tokenService.GenerateRefreshToken(user),
                userData = new UserDTO(user)
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
                accessToken = _tokenService.GenerateJWToken(user),
                refreshToken = await _tokenService.GenerateRefreshToken(user),
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

            var html = System.IO.File.ReadAllText(Directory.GetCurrentDirectory() + "/html/ForgotPassword.html");

            html = html
                .Replace("{Username}", user.Name)
                .Replace("{ResetToken}", resetToken.ToString());

            //_ = Task.Run(() =>
            //{
            //    _emailClient.SendEmail(request.Email, "Password reset request", html);
            //});


            return NoContent();
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

            _context.ResetTokens.Remove(prt);

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
        public async Task<ActionResult> ValidateOTP([FromBody] OTPValidateRequest request)
        {
            var user = await _context.Users.FromIdentifier(request.UserId);
            if (user == null || !user.IsMFAEnabled)
                return NotFound();

            var secret = user.MFASecret!;

            var totp = new Totp(Base32Encoding.ToBytes(secret));
            var verified = totp.VerifyTotp(request.Pass, out _);

            return verified ? Ok() : Forbid();
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult> RequestVerification()
        {
            User? user = (User?)HttpContext.Items["User"];

            if (user == null)
                return NotFound();

            if (user.IsVerified)
                return Conflict();

            var token = await _context.VerificationTokens.FirstOrDefaultAsync(vt => vt.UserId == user.Identifier);

            if (token != null)
                return Forbid();

            var verificationCode = await _tokenService.GenerateVerificationToken(user);

            var html = System.IO.File.ReadAllText(Directory.GetCurrentDirectory() + "/html/VerificaitonRequest.html")
                .Replace("{VerificationCode}", verificationCode);

            _ = Task.Run(() => _emailClient.SendEmail(user.Email, "Verify your account", html));

            return NoContent();
        }

        [HttpGet("{verificationCode}")]
        [Authorize]
        public async Task<ActionResult> VerifyAccount(string verificationCode)
        {
            User? user = (User?)HttpContext.Items["User"];

            if (user == null)
                return NotFound();

            var token = await _context.VerificationTokens.FirstOrDefaultAsync(vt => vt.UserId == user.Identifier);

            if (token == null)
                return NotFound();

            user.IsVerified = true;
            _context.Entry(user).DetectChanges();

            _context.VerificationTokens.Remove(token);

            await _context.SaveChangesAsync();

            return token.Token == verificationCode ? NoContent() : Forbid();
        }

        [Authorize]
        [HttpPatch]
        public async Task<ActionResult> UpdateUserData(UpdateUserDetailsRequest request)
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user == null) return NotFound();

            user.ApplyChanges(request);
            _context.Entry(user).DetectChanges();
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
