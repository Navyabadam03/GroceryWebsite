using Microsoft.EntityFrameworkCore;
using GroceryStoreAPI.Models;

namespace GroceryStoreAPI.Data
{
    public class GroceryStoreDbContext : DbContext
    {
        public GroceryStoreDbContext(DbContextOptions<GroceryStoreDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed default user
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Test User",
                    Email = "testuser@example.com",
                    Password = "Test@1234",
                    Phone = "555-123-4567",
                    Address = "123 Main St, Anytown, USA"
                }
            );
        }
    }
}
