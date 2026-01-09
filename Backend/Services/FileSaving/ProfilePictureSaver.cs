
namespace Backend.Services.FileSaving
{
    public class ProfilePictureSaver : IFileSaver
    {
        public ProfilePictureSaveDetails SaveDetails { get; private set; }

        public async Task WriteToDisk(IFormFile file, string rootPath)
        {
            var uploadRoot = Path.Combine(rootPath, "uploads", "profilePictures");
            Directory.CreateDirectory(uploadRoot);

            var guid = Guid.NewGuid();

            var extension = Path.GetExtension(file.FileName);
            var filename = guid + extension;
            var relativePath = Path.Combine("uploads", "profilePictures", filename).Replace("\\", "/");
            var savePath = Path.Combine(uploadRoot, filename);

            await using var fileStream = File.Create(savePath);
            await file.CopyToAsync(fileStream);

            SaveDetails = new(guid, relativePath);
        }

        public readonly struct ProfilePictureSaveDetails(Guid guid, string relativePath)
        {
            public readonly Guid guid = guid;
            public readonly string relativePath = relativePath;
        }
    }
}
