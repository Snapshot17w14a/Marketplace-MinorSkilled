namespace Backend.Services.FileSaving
{
    public class FileSaveService<T> where T : IFileSaver, new()
    {
        private const long MaxBytes = 5L * 1024 * 1024; // 5 MB
        private static readonly HashSet<string> allowedTypes =
        [
            "image/png", "image/jpeg", "image/webp"
        ];

        public readonly T FileSaverInstance = new();

        public async Task ValidateAndSaveFile(IFormFile file, string rootPath)
        {
            if (file == null) throw new ArgumentNullException(nameof(file));
            if (file.Length == 0) throw new ArgumentException("The length of the file was 0", nameof(file));
            if (file.Length > MaxBytes) throw new ArgumentException(string.Format("The file exceeded the maximum allowed size of {0}bytes", MaxBytes), nameof(file));
            if (!allowedTypes.Contains(file.ContentType)) throw new ArgumentException(string.Format("The file with type {0} is not allowed, only .png, .jpeg, and .webp files are supported", file.ContentType), nameof(file));

            await FileSaverInstance.WriteToDisk(file, rootPath);
        }
    }

    public interface IFileSaver
    {
        public Task WriteToDisk(IFormFile file, string rootPath);
    }
}
