using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Database
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
    {
        public DbSet<Listing> Listings { get; set; }
        public DbSet<ListingImage> ListingsImages { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<SavedListing> SavedListings { get; set; }
        public DbSet<PasswordResetToken> ResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            modelBuilder.Entity<PasswordResetToken>()
                .HasKey(prt => prt.Id);
        }
    }
}
