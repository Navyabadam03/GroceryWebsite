using GroceryStoreAPI.Models;
using GroceryStoreAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GroceryStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly GroceryStoreDbContext _context;

        public ProductController(GroceryStoreDbContext context)
        {
            _context = context;
        }

        // ✅ GET all products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // ✅ GET single product by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return product;
        }

        // ✅ POST (Create new product)
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // ✅ PUT (Update existing product)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();
            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ✅ DELETE (Remove product)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
