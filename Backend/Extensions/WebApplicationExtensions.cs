using Backend.Database;
using Backend.Models;
using Backend.Roles;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Extensions
{
    public static class WebApplicationExtensions
    {
        public static async Task SeedPermissionRoles(this WebApplication app)
        {
            var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager>();

            if (!await dbContext.UserRoles.RoleExistsAsync(IdentityRole.Admin))
            {
                roleManager.CreateRole(IdentityRole.Admin);

                roleManager.AddPermission(IdentityRole.Admin, IdentityPermission.Read);
                roleManager.AddPermission(IdentityRole.Admin, IdentityPermission.Write);
                roleManager.AddPermission(IdentityRole.Admin, IdentityPermission.Delete);
                roleManager.AddPermission(IdentityRole.Admin, IdentityPermission.Update);

            }

            if (!await dbContext.UserRoles.RoleExistsAsync(IdentityRole.Member))
            {
                roleManager.CreateRole(IdentityRole.Member);

                roleManager.AddPermission(IdentityRole.Member, IdentityPermission.Read);
                roleManager.AddPermission(IdentityRole.Member, IdentityPermission.Update);
            }

            await roleManager.WriteToDatabase();
        }

        public static async Task SeedCategories(this WebApplication app)
        {
            var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var categories = new List<ListingCategory>()
            {
                new() { Category = "Gaming",        Id = 0 },
                new() { Category = "Electronics",   Id = 1 },
                new() { Category = "Books",         Id = 2 },
                new() { Category = "Clothing",      Id = 3 },
                new() { Category = "Furniture",     Id = 4 },
            };

            foreach(var category in categories)
            {
                if ((await dbContext.ListingCategories.FirstOrDefaultAsync(cat => cat.Category == category.Category)) != null)
                    continue;

                dbContext.ListingCategories.Add(category);
            }

            await dbContext.SaveChangesAsync();
        }
    }
}
