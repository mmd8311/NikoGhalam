using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;
using NikoGhalam.Web.ViewModels;
using Microsoft.EntityFrameworkCore;


namespace YourNamespace.Controllers
{
    public class OrderController : Controller
    {
        private readonly AppDbContext _context;
        private readonly string merchant = "dbcd3bc2-e9e6-47b3-ba65-7987b241196e";
        private readonly string callbackUrl = "https://localhost:5001/Order/VerifyPayment"; // Update this with your callback URL

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
                return NotFound("فاکتور یافت نشد یا قبلاً پرداخت شده است.");

            // ✅ محاسبه هزینه‌ها
            decimal tax = invoice.TotalAmount * 0.1m;
            decimal shipping = 40000;
            decimal finalAmountToman = invoice.TotalAmount + tax + shipping;

            // ✅ تبدیل به ریال
            int amountInRial = (int)(finalAmountToman * 10);

            string merchantId = "dbcd3bc2-e9e6-47b3-ba65-7987b241196e";
            string callbackUrl = $"https://nikoghalam.ir//Order/VerifyPayment?invoiceId={invoice.Id}";
            string description = $"پرداخت فاکتور شماره {invoice.InvoiceNumber}";

            var payload = new
            {
                merchant_id = merchantId,
                amount = amountInRial,
                callback_url = callbackUrl,
                description = description
            };

            var jsonPayload = JsonConvert.SerializeObject(payload);

            using (var client = new HttpClient())
            {
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://api.zarinpal.com/pg/v4/payment/request.json", content);
                var responseString = await response.Content.ReadAsStringAsync();

                var json = JObject.Parse(responseString);

                if (json["data"] != null && json["data"]["code"]?.ToString() == "100")
                {
                    string authority = json["data"]["authority"]?.ToString();
                    string gatewayUrl = $"https://www.zarinpal.com/pg/StartPay/{authority}";

                    return Ok(new
                    {
                        IsSuccess = true,
                        PaymentUrl = gatewayUrl
                    });
                }
                else
                {
                    string error = json["errors"]?["message"]?.ToString() ?? "خطا در ارتباط با زرین‌پال";
                    return BadRequest(new
                    {
                        IsSuccess = false,
                        Message = error
                    });
                }
            }
        }




        [HttpGet]
        [Route("/Order/VerifyPayment")]
        public async Task<IActionResult> VerifyPayment(Guid invoiceId, string Authority, string Status)
        {
            if (string.IsNullOrEmpty(Status) || Status.ToLower() != "ok")
            {
                return RedirectToAction("PaymentFailed", new { invoiceId = invoiceId });
            }

            if (string.IsNullOrEmpty(Authority))
            {
                return RedirectToAction("PaymentFailed", new { invoiceId = invoiceId });
            }

            var verificationResult = await VerifyWithZarinpal(Authority, invoiceId);

            if (verificationResult.IsSuccess)
            {
                return RedirectToAction("PaymentSuccess", new { invoiceId = invoiceId });
            }
            else
            {
                return RedirectToAction("PaymentFailed", new { invoiceId = invoiceId });
            }
        }


        private async Task<(bool IsSuccess, string Message, long? RefID)> VerifyWithZarinpal(string authority, Guid invoiceId)
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId);
            if (invoice == null)
            {
                return (false, "فاکتور پیدا نشد.", null);
            }
            // ✅ محاسبه هزینه‌ها
            decimal tax = invoice.TotalAmount * 0.1m;
            decimal shipping = 40000;
            decimal finalAmountToman = invoice.TotalAmount + tax + shipping;

            // ✅ تبدیل به ریال
            int amountInRial = (int)(finalAmountToman * 10);

            var parameters = new
            {
                merchant_id = merchant,
                authority = authority,

                amount = amountInRial
            };

            using (var client = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(parameters), Encoding.UTF8, "application/json");
                var response = await client.PostAsync("https://api.zarinpal.com/pg/v4/payment/verify.json", content);
                var responseString = await response.Content.ReadAsStringAsync();
                JObject responseObject = JObject.Parse(responseString);

                if (responseObject["data"] != null && responseObject["data"]["code"]?.ToString() == "100")
                {
                    long? refId = responseObject["data"]["ref_id"]?.Value<long?>();

                    invoice.Status = InvoiceStatus.Paid;
                    invoice.PaymentRefId = refId.ToString();
                    await _context.SaveChangesAsync();

                    return (true, "پرداخت با موفقیت تأیید شد.", refId);
                }
                else
                {
                    string errorMessage = responseObject["errors"]?["message"]?.ToString() ?? "خطا در تأیید پرداخت";
                    return (false, errorMessage, null);
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
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                    .ThenInclude(item => item.Product) // افزودن وابستگی محصولات
                .Include(i => i.DeliveryAddress)      // افزودن وابستگی آدرس
                .FirstOrDefaultAsync(i => i.Id == invoiceId);

            if (invoice == null)
            {
                return NotFound();
            }

            decimal shippingCost = 40000;
            decimal subtotal = invoice.Items.Sum(x => x.TotalAmount);
            decimal tax = subtotal * 0.1m;
            decimal grandTotal = subtotal + shippingCost + tax;

            ViewBag.ShippingCost = shippingCost;
            ViewBag.Subtotal = subtotal;
            ViewBag.Tax = tax;
            ViewBag.GrandTotal = grandTotal;

            return View(invoice);
        }

        [HttpGet]
        [Route("/Order/PaymentFailed")]
        public async Task<IActionResult> PaymentFailed(Guid invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == invoiceId);

            if (invoice == null)
            {
                return NotFound("فاکتور یافت نشد.");
            }

            decimal subtotal = invoice.Items.Sum(i => i.TotalAmount);
            decimal shippingCost = 40000;
            decimal tax = subtotal * 0.1m;
            decimal grandTotal = subtotal + tax + shippingCost;

            ViewBag.GrandTotal = grandTotal;

            return View(invoice);
        }
    }
}