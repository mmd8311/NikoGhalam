using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System;
using System.Collections.Generic;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using WebUI.Controllers.Base;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public class SoftwareTrainingController: BaseController
{
    private readonly AppDbContext _context;

    public SoftwareTrainingController(AppDbContext context)
    {
        _context = context;
    }
    public IActionResult Index()
    {
        return View();
    }
}

