namespace NikoGhalam.Web.Models
{
    public class Otp : BaseEntity
    {
        public string Mobile { get; set; }
        public int Code { get; set; }
    }
}
