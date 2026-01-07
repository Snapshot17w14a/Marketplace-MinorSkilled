using Backend.Database;

namespace Backend.Services.Background
{
    public class TokenCleanerService(IServiceProvider services, ILogger<TokenCleanerService> logger) : BackgroundService
    {
        private readonly IServiceProvider _services = services;
        private readonly ILogger _logger = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Starting token cleaning service.");

            using var scope = _services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var timer = new PeriodicTimer(TimeSpan.FromHours(1));

            while(!stoppingToken.IsCancellationRequested)
            {
                _ = Task.Run(async () => CleanExpiredTokens(dbContext));
                _logger.LogInformation("Cleaning tokens...");

                await timer.WaitForNextTickAsync(stoppingToken);
            }

            return;
        }

        private async Task CleanExpiredTokens(ApplicationDbContext context)
        {
            var currentTime = DateTime.UtcNow;

            // Clean refresh tokens
            var expiredRft = context.RefreshTokens.Where(rt => rt.Expiration <= currentTime).ToArray();
            context.RefreshTokens.RemoveRange(expiredRft);

            // Clean reset tokens
            var expirtedRst = context.ResetTokens.Where(rt => rt.Expiration <= currentTime).ToArray();
            context.ResetTokens.RemoveRange(expirtedRst);

            await context.SaveChangesAsync();

            _logger.LogInformation("Cleaned {0} refresh, and {1} reset tokens from the database!", expiredRft.Length, expirtedRst.Length);
        }
    }
}
