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
        public DbSet<VerificationToken> VerificationTokens { get; set; }
        public DbSet<ListingCategory> ListingCategories { get; set; }

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

            modelBuilder.Entity<PermissionClaim>()
                .HasKey(pc => pc.Id);

            modelBuilder.Entity<VerificationToken>()
                .HasKey(vt => vt.Id);

            modelBuilder.Entity<ListingCategory>()
                .HasKey(lc => lc.Id);

            modelBuilder.Entity<User>()
                .HasMany<Listing>()
                .WithOne()
                .HasForeignKey(l => l.UserId)
                .IsRequired();

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

            modelBuilder.Entity<VerificationToken>()
                .HasOne<User>()
                .WithOne()
                .HasPrincipalKey<VerificationToken>(vt => vt.UserId);

            modelBuilder.Entity<ListingCategoryRelation>()
                .HasKey(x => new { x.ListingId, x.CategoryId });

            modelBuilder.Entity<ListingCategoryRelation>()
                .HasOne(x => x.Listing)
                .WithMany(l => l.CategoryRelations)
                .HasForeignKey(x => x.ListingId);

            modelBuilder.Entity<ListingCategoryRelation>()
                .HasOne(x => x.Category)
                .WithMany(c => c.ListingRelations)
                .HasForeignKey(x => x.CategoryId);
        }
    }
}
