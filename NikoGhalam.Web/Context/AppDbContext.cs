using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Models;
using System.Reflection.Emit;

namespace NikoGhalam.Web.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }


        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Otp> Otps { get; set; }
        public DbSet<UserDashboard> UserDashboards { get; set; }
        public DbSet<UserAddress> UserAddresses { get; set; }
        public DbSet<CartItem> CartItem { get; set; }

        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<InvoiceItem> InvoiceItems { get; set; }

        public DbSet<UpdateQuantityRequest> UpdateQuantityRequests { get; set; }

        public DbSet<ZarinpalPaymentRequest> ZarinpalPaymentRequests { get; private set; }

        public DbSet<FeedBack> FeedBacks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Product>().HasData(
    new Product
    {
        Id = new Guid("11111111-1111-1111-1111-111111111111"),
        Name = "پک طلایی",
        Description = "   با سلام و عرض ادب خدمت هنرجویان عزیز\r\n\r\n                                این برنامه طوری طراحی شده که بتوانید در هر مکان و هر زمانی به راحتی مهارت زیبانویسی خود را ارتقا دهید.\r\n\r\n                                این پک آموزشی شامل :\r\n\r\n                                نرم افزار\r\n                                بیش از ۲۰۰ فیلم آموزشی\r\n                                دفتر بارگذاری\r\n                                دفتر تمرین\r\n                                پشتیبانی\r\n\r\n                               طلایی : چت با پشتیبان + تماس روزانه + پشتیبانی ویژه ۵۹۸ تومان",
        Price = 598000,
        CreateDate = new DateTime(2024, 1, 1),
        UpdateDate = new DateTime(2024, 1, 1),
        ImageUrl = "/assets/images/product/Gold.Webp",
        CoverImageUrl = "/assets/images/product/Cover-Gold.png"
    },
    new Product
    {
        Id = new Guid("22222222-2222-2222-2222-222222222222"),
        Name = "پک نقره ای",
        Description = "   با سلام و عرض ادب خدمت هنرجویان عزیز\r\n\r\n                                این برنامه طوری طراحی شده که بتوانید در هر مکان و هر زمانی به راحتی مهارت زیبانویسی خود را ارتقا دهید.\r\n\r\n                                این پک آموزشی شامل :\r\n\r\n                                نرم افزار\r\n                                بیش از ۲۰۰ فیلم آموزشی\r\n                                دفتر بارگذاری\r\n                                دفتر تمرین\r\n                                پشتیبانی\r\n\r\n                                نقره ای : چت با پشتیبان + تماس هفتگی ۴۹۸ تومان",
        Price = 498000,
        CreateDate = new DateTime(2024, 1, 1),
        UpdateDate = new DateTime(2024, 1, 1),
        ImageUrl = "/assets/images/product/Silver.Webp",
        CoverImageUrl = "/assets/images/product/Silver-Cover.png"


    },
        new Product
        {
            Id = new Guid("33333333-3333-3333-3333-333333333333"),
            Name = "پک برنزی",
            Description = "   با سلام و عرض ادب خدمت هنرجویان عزیز\r\n\r\n                                این برنامه طوری طراحی شده که بتوانید در هر مکان و هر زمانی به راحتی مهارت زیبانویسی خود را ارتقا دهید.\r\n\r\n                                این پک آموزشی شامل :\r\n\r\n                                نرم افزار\r\n                                بیش از ۲۰۰ فیلم آموزشی\r\n                                دفتر بارگذاری\r\n                                دفتر تمرین\r\n                                پشتیبانی\r\n\r\n                                برنزی (اقتصادی) : چت با پشتیبان  ۳۹۸ تومان",
            Price = 398000,
            CreateDate = new DateTime(2024, 1, 1),
            UpdateDate = new DateTime(2024, 1, 1),
            ImageUrl = "/assets/images/product/Browns.Webp",
            CoverImageUrl = "/assets/images/product/Browns-Cover.png"


        }
);
        }
    }

}
