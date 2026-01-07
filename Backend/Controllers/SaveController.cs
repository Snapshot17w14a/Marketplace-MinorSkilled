using System.IdentityModel.Tokens.Jwt;
using Backend.Database;
using Backend.Extensions;
using Backend.Models;
using Backend.Protocols;
using Backend.Protocols.ListingProtocols;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SaveController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpPost]
        public async Task<ActionResult> SaveListing(ListingSaveSelector saveListingRequest)
        {
            var callingUser = HttpContext.AuthenticatedUser();

            if (callingUser == null)
                return NotFound();

            var existingSave = await _context.SavedListings.FirstOrDefaultAsync(sl => sl.UserId == callingUser.Identifier && sl.ListingId == saveListingRequest.ListingId);

            if (existingSave != null)
                return Conflict(existingSave);

            SavedListing savedListing = new()
            {
                ListingId = saveListingRequest.ListingId,
                UserId = callingUser.Identifier,
            };

            _context.SavedListings.Add(savedListing);
            await _context.SaveChangesAsync();

            return Created((string?)null, savedListing);
        }

        [HttpPost]
        public async Task<ActionResult> RemoveSaveListing(ListingSaveSelector removeSaveRequest, [FromHeader] AuthorizationHeader auth)
        {
            var savedListing = await _context.SavedListings.FirstOrDefaultAsync(sl => sl.UserId == ExtractUserGuid(auth) && sl.ListingId == removeSaveRequest.ListingId);

            if (savedListing == null)
            {
                return NotFound();
            }

            _context.SavedListings.Remove(savedListing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Listing save deleted"});
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<SavedListing[]>> GetSavedListings(Guid userId)
        {
            SavedListing[] savedListings;

            try
            {
                savedListings = await _context.SavedListings.Where(sl => sl.UserId == userId).ToArrayAsync();
            }
            catch
            {
                savedListings = [];
            }

            return Ok(savedListings);
        }

        private Guid ExtractUserGuid(AuthorizationHeader auth)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = auth.Authorization;
            jwt = jwt[7..]; // Ignore the "Bearer " part of the header
            var decodedToken = tokenHandler.ReadJwtToken(jwt);
            var guid = Guid.Parse(decodedToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "");
            return guid;
        }
    }
}
