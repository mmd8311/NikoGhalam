using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using NikoGhalam.Web.Models;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.ViewModels;
using Newtonsoft.Json;
using System.Text; // جایگزین کنید با فضای نام دیتابیس خود

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

            // آدرس API زرین‌پال در حالت sandbox
            string zarinpalApiUrl = "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json";

            // شناسه مرچنت زرین‌پال شما (برای تست از شناسه sandbox استفاده کنید)
            string merchantId = "49b064b2-4e3e-4add-9021-0f2b8672d203"; // مرچنت سندباکس

            // آماده‌سازی اطلاعات درخواست
            var paymentRequest = new
            {
                MerchantID = merchantId,
                Amount = (int)invoice.TotalAmount * 10, // تبدیل به ریال
                Description = $"پرداخت فاکتور شماره {invoice.InvoiceNumber}",
                CallbackURL = $"https://localhost:5001/Order/VerifyPayment?invoiceId={invoice.Id}"
            };

            using (var httpClient = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(paymentRequest), Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(zarinpalApiUrl, content);

                var responseString = await response.Content.ReadAsStringAsync();

                Console.WriteLine("Zarinpal Response: " + responseString);  // بررسی پاسخ

                // حالا چک کن که پاسخ واقعاً JSON باشه
                if (responseString.TrimStart().StartsWith("<"))
                {
                    return BadRequest(new { isSuccess = false, message = "پاسخ دریافتی از زرین‌پال معتبر نیست." });
                }

                var zarinpalResponse = JsonConvert.DeserializeObject<ZarinpalResponse>(responseString);

                if (zarinpalResponse.Status == 100)
                {
                    // هدایت به صفحه پرداخت زرین‌پال
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
                var verificationResponse = await VerifyWithZarinpal(Authority, invoiceId);

                if (verificationResponse.IsSuccess)
                {
                    // به‌روزرسانی وضعیت فاکتور به Paid
                    var invoice = await _context.Invoices.FindAsync(invoiceId);
                    if (invoice != null)
                    {
                        invoice.Status = InvoiceStatus.Paid;
                        await _context.SaveChangesAsync();
                    }

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

        private async Task<(bool IsSuccess, string Message)> VerifyWithZarinpal(string authority, Guid invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null)
            {
                return (false, "فاکتور پیدا نشد.");
            }

            string zarinpalApiUrl = "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json";
            string merchantId = "49b064b2-4e3e-4add-9021-0f2b8672d203"; // مرچنت سندباکس

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

                var verificationResponse = JsonConvert.DeserializeObject<ZarinpalVerificationResponse>(responseString);

                if (verificationResponse.Status == 100)
                {
                    return (true, "پرداخت با موفقیت تأیید شد.");
                }
                else
                {
                    return (false, "خطا در تأیید پرداخت.");
                }
            }
        }


    }
}