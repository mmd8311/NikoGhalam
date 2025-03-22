using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using System.Diagnostics;
using System.Security.Claims;
using WebUI.Controllers.Base;

namespace NikoGhalam.Web.Controllers
{
    public class DashboardController : BaseController
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(AppDbContext context, ILogger<DashboardController> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();

        }

        [HttpPost]
        [Route("/Dashboard/Upsert")]
        public async Task<IActionResult> Upsert([FromBody] UserDashboard entityDto)
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new Result<Guid>()
                {
                    IsSuccess = false,
                    Data = Guid.Empty,
                    Message = "لطفا وارد حساب کاربری خود شوید."
                });
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new Result<Guid>()
                {
                    IsSuccess = false,
                    Message = $"داده‌های ارسالی معتبر نیستند. {string.Join(" | ", errors)}",
                    Data = Guid.Empty
                });
            }

            try
            {

                var existingUser = await _context.UserDashboards
                    .FirstOrDefaultAsync(p => p.UserId == UserId);

                if (existingUser == null)
                {
                    existingUser = new UserDashboard
                    {
                        UserId = UserId,
                        Name = entityDto.Name,
                        Address = entityDto.Address,
                        Phone = entityDto.Phone
                    };
                    await _context.UserDashboards.AddAsync(existingUser);
                }
                else
                {
                    existingUser.Name = entityDto.Name;
                    existingUser.Address = entityDto.Address;
                    existingUser.Phone = entityDto.Phone;
                }

                await _context.SaveChangesAsync();

                return Ok(new Result<Guid>()
                {
                    IsSuccess = true,
                    Data = existingUser.Id,
                    Message = "اطلاعات پروفایل با موفقیت بروزرسانی شد."
                });
            }
            catch (Exception ex)
            {
                string innerExceptionMessage = ex.InnerException != null ? ex.InnerException.Message : "No inner exception";
                return StatusCode(500, new Result<Guid>()
                {
                    IsSuccess = false,
                    Message = $"خطایی در پردازش درخواست پیش آمده است: {ex.Message} | Inner Exception: {innerExceptionMessage}",
                    Data = Guid.Empty
                });
            }
        }

        [HttpPost]
        [Route("/Dashboard/AddAddress")]
        public async Task<IActionResult> AddAddress([FromBody] UserAddress address)
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new Result<Guid>()
                {
                    IsSuccess = false,
                    Data = Guid.Empty,
                    Message = "لطفا وارد حساب کاربری خود شوید."
                });
            }

            try
            {
                // بررسی اینکه آیا آدرس قبلا ثبت شده است
                if (await _context.UserAddresses.AnyAsync(p => p.Title == address.Title && p.IsDeleted == false))
                {
                    return Ok(new Result()
                    {
                        IsSuccess = false,
                        Message = "آدرسی با این نام قبلا ثبت شده است"
                    });
                }

                // ایجاد آدرس جدید
                var newAddress = new UserAddress
                {
                    UserId = UserId,
                    Title = address.Title,
                    PostalCode = address.PostalCode,
                    Province = address.Province,
                    City = address.City,
                    PhoneNumber = address.PhoneNumber,
                    AddressText = address.AddressText
                };

                await _context.UserAddresses.AddAsync(newAddress);
                await _context.SaveChangesAsync();

                return Ok(new Result<Guid>()
                {
                    IsSuccess = true,
                    Data = newAddress.Id,
                    Message = "آدرس با موفقیت افزوده شد."
                });
            }
            catch (Exception ex)
            {
                // لاگ کردن خطا
                _logger.LogError($"خطا در اضافه کردن آدرس: {ex.Message}");
                return StatusCode(500, new Result<Guid>()
                {
                    IsSuccess = false,
                    Data = Guid.Empty,
                    Message = $"خطا در پردازش درخواست: {ex.Message}"
                });
            }
        }
        [HttpGet]
        [Route("/Dashboard/GetUserAddresses")]
        public async Task<IActionResult> GetUserAddresses()
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new Result<List<object>>()
                {
                    IsSuccess = false,
                    Data = null,
                    Message = "لطفا وارد حساب کاربری خود شوید."
                });
            }

            var addresses = await _context.UserAddresses
                                          .Where(a => a.UserId == UserId && !a.IsDeleted) // بررسی عدم حذف آدرس
                                          .Select(a => new
                                          {
                                              a.Id,
                                              a.Title,
                                              a.PostalCode,
                                              a.Province,
                                              a.City,
                                              a.PhoneNumber,
                                              a.AddressText
                                          })
                                          .ToListAsync();

            return Ok(new Result<List<object>>()
            {
                IsSuccess = true,
                Data = addresses.Cast<object>().ToList(),
                Message = "لیست آدرس‌ها با موفقیت دریافت شد."
            });
        }

        [HttpPost]
        [Route("/Dashboard/DeleteAddress")]
        public async Task<IActionResult> DeleteAddress([FromBody] DeleteAddressRequest request)
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new Result<bool>()
                {
                    IsSuccess = false,
                    Message = "لطفا وارد حساب کاربری خود شوید."
                });
            }


            var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == UserId);

            if (address == null)
            {
                return NotFound(new Result<bool>()
                {
                    IsSuccess = false,
                    Message = "آدرس مورد نظر یافت نشد."
                });
            }


            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();

            return Ok(new Result<bool>()
            {
                IsSuccess = true,
                Message = "آدرس با موفقیت حذف شد."
            });
        }

        [HttpPost]
        [Route("/Dashboard/UpdateAddress")]
        public async Task<IActionResult> UpdateAddress([FromBody] UserAddress updatedAddress)
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new Result<bool>
                {
                    IsSuccess = false,
                    Message = "لطفا وارد حساب کاربری خود شوید."
                });
            }


            if (await _context.UserAddresses.AnyAsync(p => p.Title == updatedAddress.Title && p.IsDeleted == false))
            {
                return Ok(new Result()
                {
                    IsSuccess = false,
                    Message = "آدرسی با این نام قبلا ثبت شده است"
                });
            }

            var existingAddress = await _context.UserAddresses
                                                .FirstOrDefaultAsync(a => a.Id == updatedAddress.Id && a.UserId == UserId);

            if (existingAddress == null)
            {
                return NotFound(new Result<bool>
                {
                    IsSuccess = false,
                    Message = "آدرس مورد نظر یافت نشد."
                });
            }

            // **به‌روزرسانی مقادیر آدرس**
            existingAddress.Title = updatedAddress.Title;
            existingAddress.PostalCode = updatedAddress.PostalCode;
            existingAddress.Province = updatedAddress.Province;
            existingAddress.City = updatedAddress.City;
            existingAddress.PhoneNumber = updatedAddress.PhoneNumber;
            existingAddress.AddressText = updatedAddress.AddressText;

            await _context.SaveChangesAsync();

            return Ok(new Result<bool>
            {
                IsSuccess = true,
                Message = "آدرس با موفقیت ویرایش شد."
            });
        }

        public async Task<IActionResult> Dashboard()
        {
            var userPhone = await _context.Users.Select(p => p.PhoneNumber).FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(userPhone))
            {
                return View("Error", "شماره تلفن یافت نشد."); // یک صفحه خطا نمایش بده
            }
            var user = await _context.UserDashboards.FirstOrDefaultAsync(p => p.Phone == userPhone);

            if (user == null)
            {
                user = new UserDashboard { Name = "نام ثبت نشده", Phone = "-" }; // مقدار پیش‌فرض
            }

            return View(user);
        }

        [HttpGet]
        [Route("/Dashboard/GetUserProfile")]
        public async Task<IActionResult> GetUserProfile()
        {
            if (UserId == Guid.Empty)
            {
                return Unauthorized(new
                {
                    isSuccess = false,
                    message = "لطفاً وارد حساب کاربری خود شوید."
                });
            }

            var userProfile = await _context.UserDashboards
                .Where(u => u.UserId == UserId)
                .Select(u => new
                {
                    Name = u.Name ?? "-",
                    Phone = u.Phone ?? "-",
                    Address = u.Address ?? "-"
                })
                .FirstOrDefaultAsync();

            if (userProfile == null)
            {
                return NotFound(new
                {
                    isSuccess = false,
                    message = "پروفایل یافت نشد."
                });
            }

            return Ok(new
            {
                isSuccess = true,
                profile = userProfile
            });
        }

    }

}
