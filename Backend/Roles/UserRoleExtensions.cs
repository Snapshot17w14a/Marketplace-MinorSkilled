using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Roles
{
    public static class UserRoleExtensions
    {
        public static async Task<bool> RoleExistsAsync(this DbSet<UserRole> userRoles, string role)
        {
            var userRole = await userRoles.FirstOrDefaultAsync(ur => ur.Role == role);
            return userRole != null;
        }
    }
}
