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

    }
}


