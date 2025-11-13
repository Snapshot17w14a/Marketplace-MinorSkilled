namespace Backend.Iterfaces
{
    public interface IEmailClient
    {
        Task SendEmail(string to, string subject, string body);
    }
}
