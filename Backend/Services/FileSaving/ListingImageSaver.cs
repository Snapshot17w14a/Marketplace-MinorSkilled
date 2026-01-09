namespace Backend.Services.FileSaving
{
    public class ListingImageSaver : IFileSaver
    {
        public ListingImageSaveDetails SaveDetails { get; private set; }

        public async Task WriteToDisk(IFormFile file, string rootPath)
        {
            //Create the folder for the file to be saved to
            var uploadRoot = Path.Combine(rootPath, "uploads");
            var subfolder = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var folder = Path.Combine(uploadRoot, subfolder);
            Directory.CreateDirectory(folder);

            //Create a guid to identify the file when needed
            var guid = Guid.NewGuid();

            //Create the path where the file will be saved to, as well as the filename with the extension
            var ext = Path.GetExtension(file.FileName);
            var filename = guid + ext;
            var relativePath = Path.Combine("uploads", subfolder, filename).Replace("\\", "/");
            var savePath = Path.Combine(folder, filename);

            //Async stream the file to disk so no memory is used
            await using var fileStream = File.Create(savePath);
            await file.CopyToAsync(fileStream);

            SaveDetails = new(guid, relativePath);
        }

        public readonly struct ListingImageSaveDetails(Guid guid, string relativePath)
        {
            public readonly Guid guid = guid;
            public readonly string relativePath = relativePath;
        }
    }
}
