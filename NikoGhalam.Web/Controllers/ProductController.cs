using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using System.Diagnostics;
using WebUI.Controllers.Base;

namespace NikoGhalam.Web.Controllers
{
    public class ProductController : BaseController
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult AddProduct([FromForm] Product product, IFormFile? ImageFile)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                return Ok(new
                {
                    isSuccess = false,
                    message = "اطلاعات وارد شده صحیح نیست.",
                    errors = errors
                });
            }

            // اگر تصویر آپلود شد
            if (ImageFile != null && ImageFile.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(ImageFile.FileName);
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/images/product", fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    ImageFile.CopyTo(stream);
                }

                // ذخیره مسیر تصویر
                product.ImageUrl = "/assets/images/product/" + fileName;
            }

            _context.Products.Add(product);
            _context.SaveChanges();

            return Ok(new { isSuccess = true, message = "محصول با موفقیت اضافه شد." });
        }

    }
}
