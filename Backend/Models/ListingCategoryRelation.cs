using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class ListingCategoryRelation
    {
        public int ListingId { get; set; }
        [JsonIgnore]
        public Listing Listing { get; set; } = null!;

        public int CategoryId { get; set; }
        public ListingCategory Category { get; set; } = null!;
    }
}
