using Backend.Database;
using Backend.Extensions;
using Backend.Models;
using Backend.Protocols.DTOs;
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
        public async Task<ActionResult> RemoveSaveListing(ListingSaveSelector removeSaveRequest)
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user == null) return NotFound();

            var savedListing = await _context.SavedListings.FirstOrDefaultAsync(sl => sl.UserId == user.Identifier && sl.ListingId == removeSaveRequest.ListingId);

            if (savedListing == null)
            {
                return NotFound();
            }

            _context.SavedListings.Remove(savedListing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Listing save deleted"});
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<SavedListing[]>> GetSaves(Guid userId)
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

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<Listing[]>> GetSavedListings()
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user == null) return NotFound();

            var savedListingObjects = _context.SavedListings.Where(sl => sl.UserId == user.Identifier);
            if (savedListingObjects == null) return Ok(Array.Empty<Listing>());

            var savedListings = await _context.Listings
                .Where(l => savedListingObjects.Any(slo => slo.ListingId == l.Guid))
                .Include(l => l.Images.Where(i => i.Index == 0))
                .Include(l => l.CategoryRelations)
                .ThenInclude(lcr => lcr.Category)
                .OrderBy(l => l.CreatedAt)
                .ToListAsync();

            return Ok(savedListings.ConvertAll<ListingDTO>(l => new(l, null)));
        }
    }
}
