using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class ListingImage
    {
        public int Id { get; set; }
        public Guid Guid { get; set; }
        public long Size { get; set; }
        public string RelativePath { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public int? ListingId { get; set; }

        [JsonIgnore]
        public Listing? Listing { get; set; }
    }
}
