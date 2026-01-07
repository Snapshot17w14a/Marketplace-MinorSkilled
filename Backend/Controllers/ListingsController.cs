using Backend.Database;
using Backend.Extensions;
using Backend.Models;
using Backend.Protocols.DTOs;
using Backend.Protocols.ListingProtocols;
using Backend.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class ListingsController(ApplicationDbContext context, IConfiguration config) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IConfiguration _config = config;

        [HttpPost]
        [Authorize]
        public async Task<ActionResult> CreateListing([FromBody] CreateListingRequest createListingRequest)
        {
            var listingImages = Array.Empty<ListingImage>();

            try
            {
                listingImages = [.. _context.ListingsImages.Where(li => createListingRequest.LinkedImages.Contains(li.Guid))];
            }
            catch
            {
                return BadRequest($"One or more of the provided Guids for images was incorrect");
            }

            User? creatingUser = HttpContext.AuthenticatedUser();

            if (creatingUser == null)
                return BadRequest("The user specified in the authorization token was not found!");

            var allowedCurrencyCodes = _config["Currencies"];
            if (allowedCurrencyCodes != null && !allowedCurrencyCodes.Contains(createListingRequest.Currency))
                return BadRequest("The provided currency code is not supported, please select a currency from the listing creator's dropdown");

            var categories = _context.ListingCategories.Where(cat => createListingRequest.Categories.Contains(cat.Id)).ToArray();

            var listing = new Listing()
            {
                UserId = creatingUser.Id,
                Title = createListingRequest.Title,
                Description = createListingRequest.Description,
                Price = createListingRequest.Price,
                Currency = createListingRequest.Currency,
                Images = listingImages,
                CategoryRelations = [.. categories.Select(cat => new ListingCategoryRelation()
                {
                    Category = cat,
                    CategoryId = cat.Id,
                })],
            };

            await _context.Listings.AddAsync(listing);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { guid = listing.Guid }, new ListingDTO(listing, null));
        }

        [HttpGet("{guid}")]
        public async Task<ActionResult<ListingDTO>> Get(Guid guid)
        {
            var listing = await _context.Listings
                .Include(l => l.Images.OrderBy(li => li.Index))
                .Include(l => l.CategoryRelations)
                .ThenInclude(lcr => lcr.Category)
                .FirstOrDefaultAsync(l => l.Guid == guid);

            if (listing == null)
                return NotFound();

            var user = await _context.Users.FindAsync(listing.UserId);

            return Ok(new ListingDTO(listing, user?.Identifier ?? Guid.Empty));
        }

        [HttpGet("{count}")]
        public async Task<ActionResult<ICollection<ListingDTO>>> GetLatest(int count)
        {
            var listingsCount = await _context.Listings.CountAsync();

            var listings = await _context.Listings
                .Include(l => l.Images.Where(li => li.Index == 0))
                .Include(l => l.CategoryRelations)
                .ThenInclude(lcr => lcr.Category)
                .OrderByDescending(li => li.CreatedAt)
                .Take(listingsCount < count ? listingsCount : count)
                .ToListAsync();

            return Ok(listings.ConvertAll<ListingDTO>(l => new(l, null)));
        }

        [HttpGet]
        public async Task<ActionResult> QueryPage([FromQuery] ListingQueryParameters query)
        {
            var listings = _context.Listings.AsQueryable();

            try
            {
                // Sort by search phrase
                listings = listings.Where(l =>
                    l.Title.Contains(query.Phrase) || l.Description.Contains(query.Phrase)
                );

                // Filter by categories
                if (query.Categories != null)
                {
                    listings = listings.Where(l =>
                        l.CategoryRelations.Any(lcr => query.Categories.Contains(lcr.CategoryId))
                    );
                }

                // Order by sorting method
                listings = query.SortBy.Trim().ToLower() switch
                {
                    "price" => query.Descending ? listings.OrderByDescending(l => l.Price) : listings.OrderBy(l => l.Price),
                    _ => query.Descending ? listings.OrderByDescending(l => l.CreatedAt) : listings.OrderBy(l => l.CreatedAt),
                };

                // Exclude if out of price range
                listings = listings.Where(l => l.Price >= query.MinPrice && l.Price <= query.MaxPrice);

                // Calculate the number of matches, number of pages, and max price
                var listingCount = await listings.CountAsync();
                var pageCount = (int)Math.Ceiling(listingCount / (float)query.PageCount);
                var maxPrice = listings.Max(l => l.Price);

                // Get the final listings, include images, skip pages, and take a page's worth of listings
                var finalListings = listings
                    .Include(l => l.Images.Where(li => li.Index == 0))
                    .Include(l => l.CategoryRelations)
                    .ThenInclude(lcr => lcr.Category)
                    .Skip(query.Page * query.PageCount)
                    .Take(query.PageCount);

                return Ok(new
                {
                    listings = finalListings.ToList().ConvertAll<ListingDTO>(l => new(l, null)),
                    query.Page,
                    pageCount,
                    listingCount,
                    maxPrice
                });
            }
            catch
            {
                return Ok(new
                {
                    listings = Array.Empty<Listing>(),
                    query.Page,
                    pageCount = 1,
                    listingCount = 0,
                    maxPrice = 0
                });
            }
        }

        [Authorize]
        [HttpPatch]
        public async Task<ActionResult> EditListing(EditListingRequest request)
        {
            var listing = await _context.Listings.FromGuid(request.ListingGuid);

            if (listing == null)
                return NotFound();

            var callingUser = ((User)HttpContext.Items["User"]!);
            if (callingUser.Role != IdentityRole.Admin && listing.UserId != callingUser.Id)
                return Forbid();

            // Apply changes to the listing object
            listing.ApplyChanges(request);

            // Apply changes to listing images, order could have changed
            for (int i = 0; i < request.ImageGuids.Length; i++)
            {
                var listingImage = await _context.ListingsImages.FirstOrDefaultAsync(li => li.Guid == request.ImageGuids[i]);

                if (listingImage == null)
                    continue;

                listingImage.ListingId = listing.Id;
                listingImage.Index = i;
            }

            context.Entry(listing).DetectChanges();

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
