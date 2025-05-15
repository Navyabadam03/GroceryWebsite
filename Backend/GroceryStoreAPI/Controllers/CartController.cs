using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GroceryStoreAPI.Models;
using GroceryStoreAPI.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GroceryStoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly GroceryStoreDbContext _context;

        public CartController(GroceryStoreDbContext context)
        {
            _context = context;
        }

        // GET: api/Cart
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCartItems()
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            return await _context.CartItems
                .Where(c => c.UserId == userId)
                .Include(c => c.Product)
                .ToListAsync();
        }

        // POST: api/Cart
        [HttpPost]
        public async Task<ActionResult<CartItem>> AddToCart(CartItem cartItem)
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            cartItem.UserId = userId;

            // Check if product exists
            var product = await _context.Products.FindAsync(cartItem.ProductId);
            if (product == null)
            {
                return BadRequest("Product not found");
            }

            // Check if item already in cart
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == cartItem.ProductId);

            if (existingItem != null)
            {
                // Update quantity
                existingItem.Quantity += cartItem.Quantity;
                _context.Entry(existingItem).State = EntityState.Modified;
            }
            else
            {
                // Add new item
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCartItems), new { id = cartItem.Id }, cartItem);
        }

        // PUT: api/Cart/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, CartItem cartItem)
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            if (id != cartItem.Id)
            {
                return BadRequest();
            }

            // Ensure user owns this cart item
            var existingItem = await _context.CartItems.FindAsync(id);
            if (existingItem == null || existingItem.UserId != userId)
            {
                return NotFound();
            }

            // Update quantity
            existingItem.Quantity = cartItem.Quantity;
            _context.Entry(existingItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CartItemExists(id))
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

        // DELETE: api/Cart/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null || cartItem.UserId != userId)
            {
                return NotFound();
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Cart
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized();
            }

            var cartItems = await _context.CartItems
                .Where(c => c.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CartItemExists(int id)
        {
            return _context.CartItems.Any(e => e.Id == id);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }
    }
}
