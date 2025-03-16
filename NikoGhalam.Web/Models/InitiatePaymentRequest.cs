using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class InitiatePaymentRequest
    {
        public Guid InvoiceId { get; set; }
    }

}
