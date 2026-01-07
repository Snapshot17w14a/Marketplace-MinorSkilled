using Backend.Models;

namespace Backend.Extensions
{
    public static class HttpContextExtensions
    {
        public static User? AuthenticatedUser(this HttpContext httpContext)
        {
            return (User?)httpContext.Items["User"];
        }
    }
}
