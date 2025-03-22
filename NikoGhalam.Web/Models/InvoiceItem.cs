using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NikoGhalam.Web.Models
{
    public class InvoiceItem : BaseEntity
    {
        public Guid ProductId { get; set; } // شناسه محصول
        public Product Product { get; set; }
        public int Quantity { get; set; } // تعداد
        public decimal Price { get; set; } // قیمت یک واحد
        public decimal TotalAmount { get; set; } // مبلغ کل این آیتم (قیمت * تعداد)

        // افزودن InvoiceId برای ارتباط با فاکتور
        public Guid InvoiceId { get; set; } // شناسه فاکتور
        public Invoice Invoice { get; set; } // ارتباط با فاکتور
    }
}
