using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class ZarinpalPaymentRequest : BaseEntity
    {
        public string MerchantId { get; set; }
        public decimal Amount { get; set; }
        public string CallbackUrl { get; set; }
        public string Description { get; set; }
    }
}
