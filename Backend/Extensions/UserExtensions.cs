using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Extensions
{
    public static class UserExtensions
    {
        public static Task<User?> FromEmail(this DbSet<User> db, string email)
        {
            return db.FirstOrDefaultAsync(u => u.Email == email);
        }

        public static Task<User?> FromUsername(this DbSet<User> db, string username)
        {
            return db.FirstOrDefaultAsync(u => u.Name == username);
        }

        public static Task<User?> FromIdentifier(this DbSet<User> db, Guid identifier)
        {
            return db.FirstOrDefaultAsync(u => u.Identifier == identifier);
        }
    }
}
