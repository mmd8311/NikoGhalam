using System.ComponentModel.DataAnnotations.Schema;

namespace NikoGhalam.Web.Models
{
    public class CartItem : BaseEntity
    {
        public Guid UserId { get; set; } // ارتباط با کاربر
        public Guid ProductId { get; set; } // ارتباط با محصول

        public int Quantity { get; set; } // تعداد
        public decimal Price { get; set; }
        public string ProductName { get; set; }

        // ارتباط با مدل User
        public User User { get; set; }

        // ارتباط با مدل Product
        public Product Product { get; set; }
    }


}
