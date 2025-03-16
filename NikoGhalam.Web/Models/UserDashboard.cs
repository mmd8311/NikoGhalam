using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace NikoGhalam.Web.Models
{
    public class UserDashboard : BaseEntity
    {
        public Guid UserId { get; set; }


        [Required(ErrorMessage = "نام الزامی است.")]
        public string Name { get; set; }

        public string? Address { get; set; }

        [Required(ErrorMessage = "شماره تلفن الزامی است.")]
        public string Phone { get; set; }
    }
}


