using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    // مدل درخواست فاکتور از سمت کلاینت
    public class CreateInvoiceRequest
    {
        public Guid UserId { get; set; } // شناسه کاربر
        public List<CreateInvoiceItemRequest> Items { get; set; } // لیست اقلام سبد خرید
    }

    public class CreateInvoiceItemRequest
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

}
