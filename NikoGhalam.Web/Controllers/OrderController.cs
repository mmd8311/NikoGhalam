using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using NikoGhalam.Web.Models;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.ViewModels;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers; // جایگزین کنید با فضای نام دیتابیس خود

namespace YourNamespace.Controllers
{
    public class OrderController : Controller
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        [Route("/Order/Checkout/{invoiceId}")]
        public async Task<IActionResult> Checkout(Guid invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.Status == InvoiceStatus.Unpaid);

            if (invoice == null)
            {
                return NotFound("فاکتور پیدا نشد یا وضعیت فاکتور پرداخت شده است.");
            }

            var userAddresses = await _context.UserAddresses
                .Where(a => a.UserId == invoice.UserId)
                .ToListAsync();

            var viewModel = new CheckoutViewModel
            {
                Invoice = invoice,
                UserAddresses = userAddresses
            };

            ViewBag.InvoiceId = invoiceId;  // انتقال invoiceId به ViewBag


            return View(viewModel);
        }

        [HttpGet]
        [Route("/Order/GetInvoiceItems/{invoiceId}")]
        public async Task<IActionResult> GetInvoiceItems(Guid invoiceId)
        {
            var invoiceItems = await _context.InvoiceItems
                .Where(item => item.InvoiceId == invoiceId)
                .Join(
                    _context.Products, // جدول محصولات
                    invoiceItem => invoiceItem.ProductId, // کلید خارجی در InvoiceItem
                    product => product.Id, // کلید اصلی در Product
                    (invoiceItem, product) => new // نتیجه JOIN
                    {
                        invoiceItem.ProductId,
                        invoiceItem.Quantity,
                        invoiceItem.Price,
                        invoiceItem.TotalAmount,
                        product.Name, // نام محصول
                        product.ImageUrl // آدرس تصویر محصول
                    })
                .ToListAsync();

            if (!invoiceItems.Any())
            {
                return NotFound("اقلام فاکتور یافت نشد.");
            }

            return Ok(new { isSuccess = true, data = invoiceItems });
        }

        [HttpPost]
        [Route("/Order/AddAddressToInvoice")]
        public async Task<IActionResult> AddAddressToInvoice([FromBody] AddAddressToInvoiceRequest request)
        {

            var invoice = await _context.Invoices.FindAsync(request.InvoiceId);
            if (invoice == null)
            {
                return NotFound("فاکتور یافت نشد.");
            }

            var address = await _context.UserAddresses.FindAsync(request.AddressId);
            if (address == null)
            {
                return NotFound("آدرس یافت نشد.");
            }

            invoice.DeliveryAddressId = request.AddressId;
            await _context.SaveChangesAsync();

            return Ok(new { isSuccess = true, message = "آدرس با موفقیت به فاکتور اضافه شد." });
        }

        [HttpPost]
        [Route("/Order/Create")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                return BadRequest(new { message = "سبد خرید خالی است." });
            }

            if (request.UserId == Guid.Empty)
            {
                return BadRequest(new { message = "شناسه کاربر نامعتبر است." });
            }
            var random = new Random();
            var invoiceNumber = random.Next(100000, 999999).ToString();


            var invoice = new Invoice
            {
                UserId = request.UserId,
                Status = InvoiceStatus.Unpaid,
                IssueDate = DateTime.UtcNow,
                Items = new List<InvoiceItem>(),
                InvoiceNumber = invoiceNumber // استفاده از تابع برای ایجاد شماره یکتا
            };

            decimal totalAmount = 0;
            foreach (var item in request.Items)
            {
                var invoiceItem = new InvoiceItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    TotalAmount = item.Quantity * item.Price
                };

                totalAmount += invoiceItem.TotalAmount;
                invoice.Items.Add(invoiceItem);
            }

            invoice.TotalAmount = totalAmount;

            await _context.Invoices.AddAsync(invoice);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                IsSuccess = true,
                InvoiceId = invoice.Id,
                invoiceNumber = invoice.InvoiceNumber, // این خط باید وجود داشته باشد
                Message = "فاکتور با موفقیت ایجاد شد."
            });
        }

        [HttpPost]
        [Route("/Order/InitiatePayment")]
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequest request)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.Status == InvoiceStatus.Unpaid);

            if (invoice == null)
            {
                return NotFound("فاکتور پیدا نشد یا وضعیت فاکتور پرداخت شده است.");
            }

            string zarinpalApiUrl = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
            string merchantId = "dbcd3bc2-e9e6-47b3-ba65-7987b241196e";

            var paymentRequest = new
            {
                MerchantID = merchantId,
                Amount = (int)invoice.TotalAmount * 10,
                Description = $"پرداخت فاکتور شماره {invoice.InvoiceNumber}",
                CallbackURL = $"https://localhost:5001/Order/VerifyPayment?invoiceId={invoice.Id}"
            };

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Accept.Clear();
                httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

                var jsonData = JsonConvert.SerializeObject(paymentRequest);
                var content = new StringContent(jsonData, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(zarinpalApiUrl, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (responseString.TrimStart().StartsWith("<"))
                {
                    return BadRequest(new { isSuccess = false, message = "پاسخ دریافتی از زرین‌پال معتبر نیست." });
                }

                var zarinpalResponse = JsonConvert.DeserializeObject<ZarinpalResponse>(responseString);

                if (zarinpalResponse.Status == 100)
                {
                    return Ok(new { IsSuccess = true, PaymentUrl = $"https://sandbox.zarinpal.com/pg/StartPay/{zarinpalResponse.Authority}" });
                }
                else
                {
                    return BadRequest(new { IsSuccess = false, Message = "خطا در ایجاد درخواست پرداخت" });
                }
            }
        }


        [HttpGet]
        [Route("/Order/VerifyPayment")]
        public async Task<IActionResult> VerifyPayment(Guid invoiceId, string Authority, string Status)
        {
            if (Status == "OK")
            {
                // تأیید پرداخت با زرین‌پال
                var verificationResult = await VerifyWithZarinpal(Authority, invoiceId);

                if (verificationResult.IsSuccess)
                {
                    // در اینجا می‌توان در صورت نیاز از verificationResult.RefID استفاده کرد
                    // هدایت به صفحه موفقیت
                    return RedirectToAction("PaymentSuccess", new { invoiceId = invoiceId });
                }
                else
                {
                    // هدایت به صفحه شکست
                    return RedirectToAction("PaymentFailed", new { invoiceId = invoiceId });
                }
            }
            else
            {
                // پرداخت ناموفق بوده یا لغو شده است
                return RedirectToAction("PaymentFailed", new { invoiceId = invoiceId });
            }
        }


        // تغییر امضا به سه بخش: IsSuccess, Message و RefID
        private async Task<(bool IsSuccess, string Message, long? RefID)> VerifyWithZarinpal(string authority, Guid invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null)
            {
                return (false, "فاکتور پیدا نشد.", null);
            }

            string zarinpalApiUrl = "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json";
            string merchantId = "dbcd3bc2-e9e6-47b3-ba65-7987b241196e"; // مرچنت سندباکس

            var verificationRequest = new
            {
                MerchantID = merchantId,
                Authority = authority,
                Amount = (int)invoice.TotalAmount * 10 // تبدیل به ریال
            };

            using (var httpClient = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(verificationRequest), Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(zarinpalApiUrl, content);
                var responseString = await response.Content.ReadAsStringAsync();

                // خروجی را deserialize کن به کلاس ZarinpalVerificationResponse
                var zarinpalVerificationResponse = JsonConvert.DeserializeObject<ZarinpalVerificationResponse>(responseString);

                if (zarinpalVerificationResponse.Status == 100)
                {
                    // ذخیره اطلاعات پرداخت
                    if (invoice != null)
                    {
                        invoice.Status = InvoiceStatus.Paid;
                        invoice.PaymentRefId = zarinpalVerificationResponse.RefID.ToString(); // ثبت شماره پیگیری
                        await _context.SaveChangesAsync();
                    }
                    return (true, "پرداخت با موفقیت تأیید شد.", zarinpalVerificationResponse.RefID);
                }
                else
                {
                    return (false, "خطا در تأیید پرداخت.", null);
                }
            }
        }

        [HttpGet]
        [Route("/Order/GetUserInvoices/{userId}")]
        public async Task<IActionResult> GetUserInvoices(Guid userId)
        {
            // دریافت نقش کاربر
            var user = await _context.Users.FindAsync(userId);
            bool isAdmin = user?.Role == "Admin"; // فرض کنید نقش کاربر در فیلد Role ذخیره شده است

            // دریافت فاکتورها بر اساس نقش کاربر
            var invoicesQuery = _context.Invoices
                .Include(i => i.Items)
                .ThenInclude(item => item.Product)
                .AsQueryable();

            if (!isAdmin)
            {
                // اگر کاربر ادمین نباشد، فقط فاکتورهای خودش را دریافت می‌کند
                invoicesQuery = invoicesQuery.Where(i => i.UserId == userId);
            }
            var invoices = await invoicesQuery
                .OrderByDescending(i => i.CreateDate)
                .Select(i => new
                {
                    i.Id,
                    i.InvoiceNumber,
                    Status = i.Status == InvoiceStatus.Unpaid ? "پرداخت نشده" :
                             i.Status == InvoiceStatus.Paid ? "پرداخت شده" :
                             i.Status == InvoiceStatus.Cancelled ? "کنسل شده" : "نامعلوم",
                    i.IssueDate,
                    i.TotalAmount,
                    UserPhoneNumber = i.User.PhoneNumber, // اضافه کردن نام کاربر
                    Items = i.Items.Select(item => new
                    {
                        item.ProductId,
                        item.Quantity,
                        item.Price,
                        item.TotalAmount,
                        ProductName = item.Product.Name,
                        ProductImageUrl = item.Product.ImageUrl
                    })
                })
                .ToListAsync();

            if (!invoices.Any())
            {

                return Ok(new Result()
                {
                    IsSuccess = true,
                    Message = "هیچ فاکتوری یافت نشد.",
                });
            }

            return Ok(new { isSuccess = true, data = invoices });
        }
        [HttpGet]
        [Route("/Order/PaymentSuccess")]
        public async Task<IActionResult> PaymentSuccess(Guid invoiceId)
        {
            // دریافت اطلاعات فاکتور به همراه اقلام، کاربر و آدرس تحویل
            var invoice = await _context.Invoices
    .Include(i => i.Items)
    .FirstOrDefaultAsync(i => i.Id == invoiceId);
            if (invoice != null)
            {
                // محاسبه جزئیات در صورت نیاز
                decimal shippingCost = 40000; // هزینه ارسال ثابت
                decimal subtotal = invoice.Items.Sum(x => x.TotalAmount);
                decimal tax = subtotal * 0.1m; // 10 درصد مالیات
                decimal grandTotal = subtotal + shippingCost + tax;

                ViewBag.ShippingCost = shippingCost;
                ViewBag.Subtotal = subtotal;
                ViewBag.Tax = tax;
                ViewBag.GrandTotal = grandTotal;
            }
            return View(invoice);
        }

        [HttpGet]
        [Route("/Order/PaymentFailed")]
        public IActionResult PaymentFailed(Guid invoiceId)
        {
            // می‌توانید اطلاعات فاکتور یا پیام خطا را نیز به ویو ارسال کنید.
            ViewBag.InvoiceId = invoiceId;
            return View();
        }


    }
}