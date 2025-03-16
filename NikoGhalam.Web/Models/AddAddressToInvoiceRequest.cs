using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class AddAddressToInvoiceRequest
    {
        public Guid InvoiceId { get; set; }
        public Guid AddressId { get; set; }
    }
}
