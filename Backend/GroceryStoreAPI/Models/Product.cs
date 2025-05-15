using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroceryStoreAPI.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]  // 👈 Fix for Price truncation
        public decimal Price { get; set; }

        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
    }
}
