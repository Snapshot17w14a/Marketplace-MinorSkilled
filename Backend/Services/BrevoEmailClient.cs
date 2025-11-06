using Backend.Iterfaces;
using brevo_csharp.Api;
using brevo_csharp.Model;

namespace Backend.Services
{
    public class BrevoEmailClient : IEmailClient
    {
        private readonly TransactionalEmailsApi apiInstance;

        public BrevoEmailClient()
        {
            apiInstance = new TransactionalEmailsApi(brevo_csharp.Client.Configuration.Default);
        }

        public async System.Threading.Tasks.Task SendEmail(string to, string subject, string body)
        {
            SendSmtpEmailSender sender = new("Kev's Marketplace", "noreply@mkev.dev");
            SendSmtpEmailTo recipient = new(to);

            var sendSmtpEmail = new SendSmtpEmail()
            {
                Sender = sender,
                To = [recipient],
                Subject = subject,
                HtmlContent = body
            };

            await apiInstance.SendTransacEmailAsync(sendSmtpEmail);
        }
    }
}
