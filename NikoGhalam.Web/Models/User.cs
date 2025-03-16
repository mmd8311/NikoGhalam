namespace NikoGhalam.Web.Models
{
    public class User : BaseEntity
    {
        public string PhoneNumber { get; set; }
        public List<UserDashboard> UserDashboard { get; set; }
        public List<UserAddress> UserAddress { get; set; }

        public List<Invoice> Invoice { get; set; }
        public List<CartItem> CartItem { get; set; }
        public string Role { get; set; } = "User"; // مقدار پیش‌فرض "User"
    }
}
