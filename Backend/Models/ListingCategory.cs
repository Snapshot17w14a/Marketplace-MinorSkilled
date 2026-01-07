using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class ListingCategory
    {
        public int Id { get; set; }
        public required string Category { get; set; } = string.Empty;

        public ICollection<ListingCategoryRelation> ListingRelations { get; set; } = [];
    }
}
