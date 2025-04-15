using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class ZarinpalVerificationResponse
    {
        public int Status { get; set; }
        public long RefID { get; set; }  // این باید وجود داشته باشه
    }
}
