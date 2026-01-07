namespace Backend.Protocols.UserProtocols
{
    public class OTPValidateRequest
    {
        public required string Pass { get; set; }
        public Guid UserId { get; set; }
    }
}
