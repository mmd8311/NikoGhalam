using Microsoft.EntityFrameworkCore;
using NikoGhalam.Web.Context;
using System.Text.RegularExpressions;

namespace NikoGhalam.Web.Helpers
{
    public static class Helper
    {
        public static bool IsPhoneNumber(string number)
        {
            return Regex.Match(number, "^(\\+98|0)?9\\d{9}$").Success;
        }

        public static int GenerateRandomNo()
        {
            int _min = 1000;
            int _max = 9999;
            Random _rdm = new Random();
            return _rdm.Next(_min, _max);
        }

        public static int GenerateLicenseCode()
        {
            int _min = 100000;
            int _max = 999999;
            Random _rdm = new Random();
            return _rdm.Next(_min, _max);
        }
    }

    public class LicenseHelper(AppDbContext context)
    {
        public async Task<Tuple<bool, string>> CheckLicense(Guid userId)
        {
            var user = await context.Users
                         .Where(p => p.Id == userId)
                         .Where(p => !p.IsDeleted)
                         .FirstOrDefaultAsync();

            if (user == null)
            {
                return Tuple.Create(false, "/Account/Login");
            }

            return Tuple.Create(true, "");
        }
    }
}
