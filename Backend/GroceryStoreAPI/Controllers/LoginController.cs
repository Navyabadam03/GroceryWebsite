using GroceryStoreAPI.Models;
using GroceryStoreAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GroceryStoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly GroceryStoreDbContext _context;

        public LoginController(IConfiguration config, GroceryStoreDbContext context)
        {
            _config = config;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginModel credentials)
        {
            Console.WriteLine($"Login attempt with email: {credentials.Email}");

            // Always accept the default credentials for testing
            if (credentials.Email == "testuser@example.com" && credentials.Password == "Test@1234")
            {
                Console.WriteLine("Default credentials match, creating or retrieving user");

                // Try to find the user in the database
                var existingUser = await _context.Users.FirstOrDefaultAsync(u =>
                    u.Email == credentials.Email);

                User user;

                if (existingUser == null)
                {
                    // Create default user if it doesn't exist
                    user = new User
                    {
                        Name = "Test User",
                        Email = credentials.Email,
                        Password = credentials.Password,
                        Phone = "555-123-4567",
                        Address = "123 Main St, Anytown, USA"
                    };

                    // Add user to database
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                    Console.WriteLine("Created new default user");
                }
                else
                {
                    user = existingUser;
                    Console.WriteLine("Using existing default user");
                }

                // Generate token and return success
                var claims = GenerateClaims(user);
                var token = GenerateToken(claims);

                Console.WriteLine("Login successful with default credentials");
                return Ok(new {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    user = new {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email
                    }
                });
            }

            // If not using default credentials, try to find the user in the database
            var dbUser = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == credentials.Email && u.Password == credentials.Password);

            if (dbUser != null)
            {
                Console.WriteLine("Found matching user in database");
                // User found in database
                return Ok(new {
                    token = new JwtSecurityTokenHandler().WriteToken(GenerateToken(GenerateClaims(dbUser))),
                    user = new {
                        id = dbUser.Id,
                        name = dbUser.Name,
                        email = dbUser.Email
                    }
                });
            }

            Console.WriteLine("Invalid credentials");
            return Unauthorized("Invalid credentials");
        }

        private Claim[] GenerateClaims(User user)
        {
            return new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
            };
        }

        private JwtSecurityToken GenerateToken(Claim[] claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is missing")));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            return new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );
        }
    }
}
