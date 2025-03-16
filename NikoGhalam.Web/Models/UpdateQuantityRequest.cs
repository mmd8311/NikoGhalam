using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class UpdateQuantityRequest : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
    public class CartItemRequest : BaseEntity
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
