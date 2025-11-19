using System.Text;

namespace Backend.Roles
{
    [AttributeUsage(AttributeTargets.Method)]
    public class PermissionAttribute(params string[] perms) : Attribute
    {
        public string[] RequiredPermissions { get; private set; } = perms;

        public override string ToString()
        {
            var sb = new StringBuilder();
            foreach(var perm in RequiredPermissions) 
                sb.Append(perm);
            return sb.ToString();
        }
    }
}
