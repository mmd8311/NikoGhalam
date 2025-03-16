using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NikoGhalam.Web.Models
{

    public enum InvoiceStatus
    {
        Unpaid,
        Paid,
        Cancelled
    }
    public class Invoice : BaseEntity
    {
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        public decimal TotalAmount { get; set; }

        [Required]
        public InvoiceStatus Status { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public List<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();

        public Guid? DeliveryAddressId { get; set; }

        [ForeignKey(nameof(DeliveryAddressId))]
        public UserAddress DeliveryAddress { get; set; }

        public string InvoiceNumber { get; set; }
    }
}
