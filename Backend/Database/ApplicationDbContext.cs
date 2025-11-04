using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Database
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Listing> Listings { get; set; }
        public DbSet<ListingImage> ListingsImages { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<SavedListing> SavedListings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<User>()
                .HasMany<Listing>()
                .WithOne()
                .HasForeignKey(l => l.UserId)
                .IsRequired();

            modelBuilder.Entity<Listing>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<Listing>()
                .HasMany(l => l.Images)
                .WithOne(li => li.Listing)
                .HasForeignKey(li => li.ListingId);

            modelBuilder.Entity<RefreshToken>()
                .HasKey(rt => rt.TokenId);

            modelBuilder.Entity<SavedListing>()
                .HasKey(sl => sl.Id);
        }
    }
}
