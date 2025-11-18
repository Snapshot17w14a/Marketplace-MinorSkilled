using Backend.Models;

namespace Backend.Protocols.DTOs
{
    public class UserDTO(User user)
    {
        public string Name { get; private set; } = user.Name;
        public DateTime CreatedAt { get; private set; } = user.CreatedAt;
        public Guid Identifier { get; private set; } = user.Identifier;

        public static implicit operator UserDTO(User user) => new(user);
    }
}
