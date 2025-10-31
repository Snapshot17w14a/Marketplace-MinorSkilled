namespace Backend.Protocols.ListingProtocols
{
    public class ListingQueryParameters
    {
        public string Phrase { get; set; } = null!;
        public string SortBy { get; set; } = "CreatedAt";
        public bool Descending { get; set; } = true;

        public int Page { get; set; } = 1;
        public int PageCount { get; set; } = 20;
    }
}
