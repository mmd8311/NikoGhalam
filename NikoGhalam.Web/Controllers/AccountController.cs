using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using NikoGhalam.Web.ViewModels;
using System.Diagnostics;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using NikoGhalam.Web.Helpers;
using WebUI.Controllers.Base;
using Microsoft.IdentityModel.Tokens;

namespace NikoGhalam.Web.Controllers
{
    public class AccountController : BaseController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly AppDbContext _context;

        public AccountController(AppDbContext context, ILogger<AccountController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [AllowAnonymous]
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> GetOtp(string mobile)
        {
            if (string.IsNullOrWhiteSpace(mobile))
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "شماره موبایل را وارد کنید"
                });
            }

            if (!Helper.IsPhoneNumber(mobile))
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "شماره موبایل نادرست است"
                });
            }

            var otp = await _context.Otps
                .Where(p => p.Mobile == mobile && p.CreateDate >= DateTime.Now.AddMinutes(-2))
                .FirstOrDefaultAsync();

            if (otp != null)
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "کد ارسال شده است لطفا 2 دقیقه دیگر مجدد تلاش کنید"
                });
            }

            Uri apiBaseAddress = new Uri("https://console.melipayamak.com");
            using (HttpClient client = new HttpClient() { BaseAddress = apiBaseAddress })
            {
                // You may need to Install-Package Microsoft.AspNet.WebApi.Client
                var result = client.PostAsJsonAsync("api/send/otp/d814dfbd13f447bebed9fbd7a3523a16",
                    new { to = mobile }).Result;

                if (result.IsSuccessStatusCode)
                {
                    var response = Newtonsoft.Json.JsonConvert.DeserializeObject<ResponseSendOtpViewModel>
                        (result.Content.ReadAsStringAsync().Result);

                    otp = new Otp()
                    {
                        Mobile = mobile,
                        Code = Convert.ToInt32(response.Code)
                    };

                    await _context.Otps.AddAsync(otp);

                    await _context.SaveChangesAsync();

                    return Ok(new Result()
                    {
                        IsSuccess = true,
                        Message = "کد عبور ارسال شد",
                        Data = mobile
                    });
                }
                else
                {
                    return Ok(new Result()
                    {
                        IsSuccess = false,
                        Message = "خطا در ارسال کد لطفا با پشتیبان تماس بگیرید",
                        Data = mobile
                    });
                }
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SignIn(string mobile, int code)
        {
            if (!Helper.IsPhoneNumber(mobile))
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "شماره موبایل نادرست است"
                });
            }

           

            var otp = await _context.Otps
                .Where(p => p.Mobile == mobile && p.CreateDate >= DateTime.Now.AddMinutes(-2) && p.Code == code)
                .FirstOrDefaultAsync();

            if (otp == null)
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "زمان استفاده از کد به پایان رسیده است",
                    Data = -1
                });
            }


            var adminPhones = new List<string> { "09033266571" };


            var user = await _context.Users
                .Where(p => p.PhoneNumber == mobile)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync();


            if (user == null)
            {
                user = new Models.User()
                {
                    PhoneNumber = mobile,
                    Role = adminPhones.Contains(mobile) ? "Admin" : "User"
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
            }


            var claims = new List<Claim>
            {
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(claimsIdentity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTime.UtcNow.AddMinutes(1440),
                    IssuedUtc = DateTime.UtcNow.AddMinutes(1440),
                });

            return Ok(new Result()
            {
                IsSuccess = true,
                Message = "با موفقیت وارد شدید",
                Data = claims
            });
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new Result()
            {
                IsSuccess = true,
                Message = "با موفقیت خارج شدید"
            });
        }
    }
}