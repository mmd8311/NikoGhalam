using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using System.Diagnostics;
using WebUI.Controllers.Base;

namespace NikoGhalam.Web.Controllers
{
    public class FeedBackController : BaseController
    {
        private readonly AppDbContext _context;

        public FeedBackController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("/FeedBack/GetFeedBacks")]
        public async Task<IActionResult> GetFeedBacks()
        {
            try
            {
                var feedbacks = await _context.FeedBacks.ToListAsync();
                return Ok(new Result<List<FeedBack>>()
                {
                    IsSuccess = true,
                    Data = feedbacks,
                    Message = "لیست بازخوردها با موفقیت دریافت شد."
                });
            }
            catch (Exception ex)
            {
                // لاگ کردن خطا
                return StatusCode(500, new Result<List<FeedBack>>()
                {
                    IsSuccess = false,
                    Data = null,
                    Message = $"خطا در دریافت لیست بازخوردها: {ex.Message}"
                });
            }
        }

        [HttpPost]
        [Route("/FeedBack/AddFeedBack")]
        public async Task<IActionResult> AddFeedBack([FromBody] FeedBack feedBack)
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
                if (await _context.FeedBacks.AnyAsync(p => p.CustomerName == feedBack.CustomerName && p.IsDeleted == false))
                {
                    return Ok(new Result()
                    {
                        IsSuccess = false,
                        Message = "بازخوردی با این نام قبلا ثبت شده است"
                    });
                }

                // ایجاد آدرس جدید
                var newFeedBack = new FeedBack
                {
                    CustomerName = feedBack.CustomerName,
                    FeedBackText = feedBack.FeedBackText,
                };

                await _context.FeedBacks.AddAsync(newFeedBack);
                await _context.SaveChangesAsync();

                return Ok(new Result<Guid>()
                {
                    IsSuccess = true,
                    Data = newFeedBack.Id,
                    Message = "بازخورد با موفقیت افزوده شد."
                });
            }
            catch (Exception ex)
            {
                // لاگ کردن خطا
                return StatusCode(500, new Result<Guid>()
                {
                    IsSuccess = false,
                    Data = Guid.Empty,
                    Message = $"خطا در پردازش درخواست: {ex.Message}"
                });
            }
        }

        [HttpPost]
        [Route("/FeedBack/DeleteFeedBack")]
        public async Task<IActionResult> DeleteFeedBack([FromBody] DeleteFeedBackRequest request)
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
                var feedBack = await _context.FeedBacks.FindAsync(request.Id);
                if (feedBack == null)
                {
                    return NotFound(new Result()
                    {
                        IsSuccess = false,
                        Message = "بازخورد مورد نظر یافت نشد."
                    });
                }

                _context.FeedBacks.Remove(feedBack);
                await _context.SaveChangesAsync();

                return Ok(new Result<Guid>()
                {
                    IsSuccess = true,
                    Data = request.Id,
                    Message = "بازخورد با موفقیت حذف شد."
                });
            }
            catch (Exception ex)
            {
                // لاگ کردن خطا
                return StatusCode(500, new Result<Guid>()
                {
                    IsSuccess = false,
                    Data = Guid.Empty,
                    Message = $"خطا در پردازش درخواست: {ex.Message}"
                });
            }
        }

    }
}
