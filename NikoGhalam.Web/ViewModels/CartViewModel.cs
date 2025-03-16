using NikoGhalam.Web.Models;
using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.ViewModels
{
    public class CartViewModel
    {
        public List<CartItem> Items { get; set; } = new List<CartItem>();
        public decimal TotalPrice => Items.Sum(item => item.Price * item.Quantity);
    }
}
