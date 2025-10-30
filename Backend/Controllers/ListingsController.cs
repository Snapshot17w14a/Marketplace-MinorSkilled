using System.IdentityModel.Tokens.Jwt;
using Backend.Database;
using Backend.Models;
using Backend.Protocols;
using Backend.Protocols.ListingProtocols;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class ListingsController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateListing([FromBody] CreateListingRequest createListingRequest, [FromHeader] AuthorizationHeader auth)
        {
            var listingImages = Array.Empty<ListingImage>();

            try
            {
                listingImages = [.. _context.ListingsImages.Where(li => createListingRequest.LinkedImages.Contains(li.Guid))];
            }
            catch (Exception ex)
            {
                return BadRequest($"One or more of the provided Guids for images was incorrect.\n{ex.Message}");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = auth.Authorization;
            jwt = jwt[7..];
            var decodedToken = tokenHandler.ReadJwtToken(jwt);

            User? creatingUser;

            try
            {
                var userGuid = Guid.Parse(decodedToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "");
                creatingUser = await _context.Users.FirstOrDefaultAsync(u => u.Identifier == userGuid);
                if (creatingUser == null)
                    throw new NullReferenceException("User not found!");
            }
            catch
            {
                return BadRequest("The user specified in the authorization token was not found!");
            }

            var listing = new Listing()
            {
                UserId = creatingUser.Id,
                Title = createListingRequest.Title,
                Description = createListingRequest.Description,
                Price = createListingRequest.Price,
                Currency = createListingRequest.Currency,
                Images = listingImages
            };

            foreach (var img in listingImages)
            {
                img.Listing = listing;
                img.ListingId = listing.Id;
            }

            await _context.Listings.AddAsync(listing);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { guid = listing.Guid }, listing);
        }

        [HttpGet("{guid}")]
        public async Task<ActionResult<Listing>> Get(Guid guid)
        {
            var listing = await _context.Listings
                .Include(l => l.Images)
                .FirstOrDefaultAsync(l => l.Guid == guid);

            if (listing == null)
                return NotFound();

            return Ok(listing);
        }

        [HttpGet("{count}")]
        public async Task<ActionResult<ICollection<Listing>>> GetPage(int count)
        {
            var listingsCount = await _context.Listings.CountAsync();

            var listings = await _context.Listings.Include(l => l.Images).OrderByDescending(li => li.CreatedAt).Take(listingsCount < count ? listingsCount : count).ToArrayAsync();   

            return Ok(listings);
        }

        [HttpGet]
        public async Task<ActionResult> QueryPage([FromQuery] ListingQueryObject query)
        {
            var listings = _context.Listings.AsQueryable();

            listings = listings.Where(l => 
                l.Title.Contains(query.Phrase) || l.Description.Contains(query.Phrase));

            listings = query.SortBy.Trim().ToLower() switch
            {
                "price" => query.Descending ? listings.OrderByDescending(l => l.Price) : listings.OrderBy(l => l.Price),
                _ => query.Descending ? listings.OrderByDescending(l => l.CreatedAt) : listings.OrderBy(l => l.CreatedAt),
            };

            var listingCount = await listings.CountAsync();
            var pageCount = (int)Math.Ceiling(listingCount / (float)query.PageCount);

            var finalListings = listings.Include(l => l.Images).Skip((query.Page - 1) * query.PageCount).Take(query.PageCount).ToArray();

            return Ok(new
            {
                listings = finalListings,
                query.Page,
                pageCount,
                listingCount
            });
        }
    }
}
