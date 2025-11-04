namespace Backend.Protocols.ListingProtocols
{
    public class ListingQueryParameters
    {
        public string Phrase { get; set; } = null!;
        public string SortBy { get; set; } = "CreatedAt";
        public bool Descending { get; set; } = true;

        public int MinPrice { get; set; } = 0;
        public int MaxPrice { get; set; } = int.MaxValue;

        public int Page { get; set; } = 1;
        public int PageCount { get; set; } = 20;
    }
}
