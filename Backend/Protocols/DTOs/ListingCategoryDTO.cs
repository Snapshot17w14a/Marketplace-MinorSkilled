using Backend.Models;

namespace Backend.Protocols.DTOs
{
    public class ListingCategoryDTO(ListingCategory listingCategory)
    {
        public string CategoryName { get; } = listingCategory.Category;
        public int CategoryId { get; } = listingCategory.Id;
    }
}
