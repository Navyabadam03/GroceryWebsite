namespace GroceryStoreAPI.Models
{
    public class LoginModel
    {
        public required string Email { get; set; }   // ✅ Add this line
        public required string Password { get; set; }
    }
}
