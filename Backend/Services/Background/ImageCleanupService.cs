
using Backend.Database;

namespace Backend.Services.Background
{
    public class ImageCleanupService(IServiceProvider services, ILogger<ImageCleanupService> logger) : BackgroundService
    {
        private readonly IServiceProvider _services = services;
        private readonly ILogger _logger = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting image cleanup service.");

            using var scope = _services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var enviromnet = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
            var timer = new PeriodicTimer(TimeSpan.FromDays(1));

            while (!stoppingToken.IsCancellationRequested)
            {
                _ = Task.Run(async () => CleanOrphanedImages(dbContext, enviromnet));
                _logger.LogInformation("Cleaning images...");

                await timer.WaitForNextTickAsync(stoppingToken);
            }

            return;
        }

        private async Task CleanOrphanedImages(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            var listingIds = context.Listings.Select(l => l.Id).ToList();

            var imagesToRemove = context.ListingsImages.Where(li => li.ListingId == null || !listingIds.Contains((int)li.ListingId));
            if (!imagesToRemove.Any())
            {
                _logger.LogInformation("No images were found to be cleaned!");
                return;
            }

            var wwwroot = environment.WebRootPath;

            foreach (var image in imagesToRemove)
            {
                _logger.LogInformation("Cleaning orphaned image with GUID:{0}", image.Guid);

                var filepath = Path.Combine(wwwroot, image.RelativePath);
                File.Delete(filepath);
            }

            context.ListingsImages.RemoveRange(imagesToRemove);
            await context.SaveChangesAsync();

            _logger.LogInformation($"Cleaned images");

            return;
        }
    }
}
