using System.ComponentModel.DataAnnotations;

namespace NikoGhalam.Web.Models
{
    public class Product : BaseEntity
    {

        [Required(ErrorMessage = "نام محصول الزامی است.")]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "قیمت محصول الزامی است.")]
        [Range(1, double.MaxValue, ErrorMessage = "قیمت باید بزرگتر از صفر باشد.")]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }
    }
}
