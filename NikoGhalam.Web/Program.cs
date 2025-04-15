using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Context;
using NikoGhalam.Web.Models;



var builder = WebApplication.CreateBuilder(args);

// ????? ????????? ???? ???? ??? ?? ????? ????

builder.Logging.ClearProviders();
builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddHttpContextAccessor();


builder.Services.AddControllersWithViews();


// افزودن سرویس Response Compression (اصلاح شده)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>(); // توجه: Gzip نه Gzp
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "text/html",
        "text/plain",
        "text/css",
        "application/javascript",
        "text/javascript"
    });
});

#region  CorsPolicy

builder.Services.AddCors(option =>
{
    option.AddPolicy("*",
    item =>
    {
        //item.WithOrigins("https://127.0.0.1:5001")
        item.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});


#endregion

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// ??? ???????????? ???? ?? ????? ????
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
// سایر سرویس‌ها...

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseResponseCompression();

app.Run();
