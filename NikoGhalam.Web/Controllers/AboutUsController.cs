using Microsoft.AspNetCore.Mvc;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using System.Diagnostics;
using WebUI.Controllers.Base;

namespace NikoGhalam.Web.Controllers
{
    public class AboutUsController : BaseController
    {
        private readonly AppDbContext _context;

        public AboutUsController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }


    }
}
