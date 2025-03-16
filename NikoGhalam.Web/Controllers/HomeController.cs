using Microsoft.AspNetCore.Mvc;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using System.Diagnostics;
using WebUI.Controllers.Base;

namespace NikoGhalam.Web.Controllers
{
    public class HomeController : BaseController
    {
        private readonly AppDbContext _context;

        public HomeController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var products = _context.Products.ToList(); // دریافت محصولات از دیتابیس
            return View(products);
        }
    }
}
