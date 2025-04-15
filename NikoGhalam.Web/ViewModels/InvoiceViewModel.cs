using NikoGhalam.Web.Models;
using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.ViewModels
{
    public class InvoiceViewModel
    {
        public Invoice Invoice { get; set; }
        public List<InvoiceItemViewModel> Items { get; set; }
        public User User { get; set; }
        public UserAddress DeliveryAddress { get; set; }
    }

    public class InvoiceItemViewModel
    {
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalAmount { get; set; }
        public string ImageUrl { get; set; }
    }
}
