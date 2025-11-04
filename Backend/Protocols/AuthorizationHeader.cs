using Microsoft.AspNetCore.Mvc;

namespace Backend.Protocols
{
    public class AuthorizationHeader
    {
        [FromHeader]
        public required string Authorization { get; set; }
    }
}
