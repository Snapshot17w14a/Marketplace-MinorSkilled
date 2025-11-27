using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Extensions
{
    public static class ListingExtensions
    {
        public static Task<Listing?> FromGuid(this DbSet<Listing> db, Guid guid)
        {
            return db.FirstOrDefaultAsync(l => l.Guid == guid);
        }
    }
}
