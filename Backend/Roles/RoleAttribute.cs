namespace Backend.Roles
{
    [AttributeUsage(AttributeTargets.Method)]
    public class RoleAttribute(string role) : Attribute
    {
        public string Role { get; private set; } = role;
    }
}
