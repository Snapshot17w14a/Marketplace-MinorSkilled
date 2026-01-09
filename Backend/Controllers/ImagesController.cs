using Backend.Database;
using Backend.Extensions;
using Backend.Models;
using Backend.Services;
using Backend.Services.FileSaving;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ImagesController(IWebHostEnvironment env, ApplicationDbContext context) : ControllerBase
    {
        private readonly IWebHostEnvironment _env = env;
        private readonly ApplicationDbContext _context = context;

        [HttpPost]
        public async Task<ActionResult> UploadListingImage(IFormFile file, [FromHeader(Name = "index")]int index)
        {
            var fileSaver = new FileSaveService<ListingImageSaver>();

            try
            {
                await fileSaver.ValidateAndSaveFile(file, _env.WebRootPath);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            var saveDetails = fileSaver.FileSaverInstance.SaveDetails;

            //Create the ListingImage instance that will be saved to the database
            var listingImage = new ListingImage()
            {
                Guid = saveDetails.guid,
                RelativePath = saveDetails.relativePath,
                ContentType = file.ContentType,
                Size = file.Length,
                Index = index
            };

            //Write it to the database and save the changes
            await _context.AddAsync(listingImage);
            await _context.SaveChangesAsync();

            //Create the url where the uploaded file can be accessed
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var publicUrl = $"{baseUrl}/{saveDetails.relativePath}";
            return Ok(new { id = saveDetails.guid, url = publicUrl });
        }

        public async Task<ActionResult> UploadProfilePicture(IFormFile file)
        {
            User? user = HttpContext.AuthenticatedUser();
            if (user == null) return NotFound();

            var fileSaver = new FileSaveService<ProfilePictureSaver>();

            try
            {
                await fileSaver.ValidateAndSaveFile(file, _env.WebRootPath);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            var saveDetails = fileSaver.FileSaverInstance.SaveDetails;

            user.ProfilePictureId = saveDetails.guid;
            _context.Entry(user).DetectChanges();
            await _context.SaveChangesAsync();

            //Create the url where the uploaded file can be accessed
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var publicUrl = $"{baseUrl}/{saveDetails.relativePath}";
            return Ok(new { id = saveDetails, url = publicUrl });
        }

        [HttpGet("{guid}")]
        public async Task<ActionResult> Get(Guid guid)
        {
            var listingImage = await _context.ListingsImages.FirstOrDefaultAsync(li => li.Guid == guid);

            if (listingImage == null) return NotFound();

            return Ok(listingImage);
        }
    }
}
