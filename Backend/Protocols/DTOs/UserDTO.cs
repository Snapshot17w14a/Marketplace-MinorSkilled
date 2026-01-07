using Backend.Models;

namespace Backend.Protocols.DTOs
{
    public class UserDTO(User user)
    {
        public string Username { get; private set; } = user.Name;
        public DateTime CreatedAt { get; private set; } = user.CreatedAt;
        public Guid Identifier { get; private set; } = user.Identifier;
        public string Role { get; private set; } = user.Role;
        public bool IsVerified { get; private set; } = user.IsVerified;

        public static implicit operator UserDTO(User user) => new(user);
    }
}
