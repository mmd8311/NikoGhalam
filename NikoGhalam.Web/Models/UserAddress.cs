using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NikoGhalam.Web.Models
{
    public class UserAddress : BaseEntity 
    {
        public Guid UserId { get; set; }
        public string PhoneNumber { get; set; }
        public string Title { get; set; }
        public string AddressText { get; set; }
        public string PostalCode { get; set; }
        public string Province { get; set; }
        public string City { get; set; }
    }
    
}


