using NikoGhalam.Web.Models;
using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.ViewModels
{
    public class CheckoutViewModel
    {
        public Invoice Invoice { get; set; }
        public List<UserAddress> UserAddresses { get; set; }
    }

}
