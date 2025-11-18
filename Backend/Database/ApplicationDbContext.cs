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
        public DbSet<PasswordResetToken> ResetTokens { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<PermissionClaim> PermissionClaims { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<Listing>()
                .HasKey(l => l.Id);

            modelBuilder.Entity<RefreshToken>()
                .HasKey(rt => rt.TokenId);

            modelBuilder.Entity<SavedListing>()
                .HasKey(sl => sl.Id);

            modelBuilder.Entity<PasswordResetToken>()
                .HasKey(prt => prt.Id);

            modelBuilder.Entity<UserRole>()
                .HasKey(ur => ur.Role);

            // Ensure PermissionClaim has a key (composite key of Role + Permission)
            modelBuilder.Entity<PermissionClaim>()
                .HasKey(pc => pc.Role);

            modelBuilder.Entity<User>()
                .HasMany<Listing>()
                .WithOne()
                .HasForeignKey(l => l.UserId)
                .IsRequired();

            // Correct relationship configuration: User.Role is a string FK, not a navigation property.
            // Configure relationship to UserRole by specifying the related entity type and FK/principal key.
            modelBuilder.Entity<User>()
                .HasOne<UserRole>()
                .WithMany()
                .HasForeignKey(u => u.Role)
                .HasPrincipalKey(ur => ur.Role)
                .IsRequired();

            modelBuilder.Entity<Listing>()
                .HasMany(l => l.Images)
                .WithOne(li => li.Listing)
                .HasForeignKey(li => li.ListingId);

            modelBuilder.Entity<UserRole>()
                .HasMany(ur => ur.Permissions)
                .WithOne()
                .HasForeignKey(pc => pc.Role)
                .IsRequired();
        }
    }
}
