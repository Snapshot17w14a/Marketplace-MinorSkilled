using Backend.Database;
using Backend.Models;
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

        private const long MaxBytes = 5L * 1024 * 1024; // 5 MB
        private static readonly HashSet<string> allowedTypes =
        [
            "image/png", "image/jpeg", "image/webp"
        ];

        [HttpPost]
        public async Task<ActionResult> UploadImage(IFormFile file, [FromHeader(Name = "index")]int index)
        {
            //Check the file for problems
            if (file == null) return BadRequest("File not sent!");
            if (file.Length == 0) return BadRequest("File is empty!");
            if (file.Length > MaxBytes) return BadRequest("File exceeds size limit (5MB)!");
            if (!allowedTypes.Contains(file.ContentType)) return BadRequest("The provided file format cannot be processes!");

            //Create the folder for the file to be saved to
            var uploadRoot = Path.Combine(_env.WebRootPath, "uploads");
            var subfolder = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var folder = Path.Combine(uploadRoot, subfolder);
            Directory.CreateDirectory(folder);

            //Create a guid to identify the file when needed
            var guid = Guid.NewGuid();

            //Create the path where the file will be saved to, as well as the filename with the extension
            var ext = Path.GetExtension(file.FileName);
            var filename = guid + ext;
            var relativePath = Path.Combine("uploads", subfolder, filename).Replace("\\", "/");
            var savePath = Path.Combine(folder, filename);

            //Async stream the file to disk so no memory is used
            await using (var fileStream = System.IO.File.Create(savePath))
            {
                await file.CopyToAsync(fileStream);
            }

            //Create the ListingImage instance that will be saved to the database
            var listingImage = new ListingImage()
            {
                Guid = guid,
                RelativePath = relativePath,
                ContentType = file.ContentType,
                Size = file.Length,
                Index = index
            };

            //Write it to the database and save the changes
            await _context.AddAsync(listingImage);
            await _context.SaveChangesAsync();

            //Create the url where the uploaded file can be accessed
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var publicUrl = $"{baseUrl}/{relativePath}";
            return Ok(new { id = guid, url = publicUrl });
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
