using Microsoft.AspNetCore.Mvc;
using GroceryStoreAPI.Models; // adjust to your actual namespace
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GroceryStoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel login)
        {
            // ✅ Replace this with your actual validation (like checking DB)
            if (login.Email == "admin@grocery.com" && login.Password == "1234")
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes("your_secret_key"); // must match Program.cs

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.Name, login.Email)
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                string jwtToken = tokenHandler.WriteToken(token);

                return Ok(new { token = jwtToken });
            }

            return Unauthorized("Invalid credentials");
        }
    }
}
