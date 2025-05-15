using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroceryStoreAPI.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
