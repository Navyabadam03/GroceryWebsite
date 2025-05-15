using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryStoreAPI.Models;
using GroceryStoreAPI.Data;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GroceryStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly GroceryStoreDbContext _context;

        public ProductsController(GroceryStoreDbContext context)
        {
            _context = context;

            // Seed data if the database is empty
            if (!_context.Products.Any())
            {
                SeedProducts();
            }
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // POST: api/Products
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }

        private void SeedProducts()
        {
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Fresh Apples",
                    Description = "Crisp and juicy apples freshly picked from the orchard.",
                    ImageUrl = "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&h=200",
                    Price = 2.99m
                },
                new Product
                {
                    Name = "Organic Bananas",
                    Description = "Sweet and nutritious organic bananas grown without pesticides.",
                    ImageUrl = "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=300&h=200",
                    Price = 1.99m
                },
                new Product
                {
                    Name = "Whole Wheat Bread",
                    Description = "Freshly baked whole wheat bread made with premium ingredients.",
                    ImageUrl = "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300&h=200",
                    Price = 3.49m
                },
                new Product
                {
                    Name = "Organic Milk",
                    Description = "Fresh organic milk from grass-fed cows.",
                    ImageUrl = "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&h=200",
                    Price = 4.29m
                },
                new Product
                {
                    Name = "Farm Fresh Eggs",
                    Description = "Free-range eggs from locally raised hens.",
                    ImageUrl = "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&h=200",
                    Price = 5.99m
                },
                new Product
                {
                    Name = "Organic Avocados",
                    Description = "Perfectly ripe organic avocados, ready to eat.",
                    ImageUrl = "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&h=200",
                    Price = 2.49m
                }
            };

            _context.Products.AddRange(products);
            _context.SaveChanges();
        }
    }
}
