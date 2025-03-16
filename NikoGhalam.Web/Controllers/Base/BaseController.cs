using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using NikoGhalam.Web.Models;
using System;

namespace WebUI.Controllers.Base
{
    public class BaseController : Controller
    {


        public Guid UserId { get; set; }


        /// <summary>
        /// For Check Permission User
        /// </summary>
        /// <param name="context"></param>
        public override async void OnActionExecuting(ActionExecutingContext context)
        {
            #region Requesr Info
            var request = context.HttpContext.Request;

            string ActionName = context.RouteData.Values["Action"].ToString();

            var dataToken = context.RouteData.DataTokens;

            string ControllerName = context.RouteData.Values["Controller"].ToString() + "Controller";
            Enums.ActionType ActionType = Enums.ActionType.Http;

            var AllowAnonymousAttribute = context.ActionDescriptor
                .EndpointMetadata.OfType<IAllowAnonymous>().FirstOrDefault();

            #endregion

            if (AllowAnonymousAttribute == null)
            {
                if (User.Claims.FirstOrDefault(p => p.Type == "UserId") != null)
                {


                    UserId = Guid.Parse(HttpContext.User.Claims.FirstOrDefault(p => p.Type == "UserId").Value);

                    base.OnActionExecuting(context);
                }
                else
                {
                    context.Result = new RedirectResult("/Account/Login");
                    base.OnActionExecuting(context);
                }

                //var result = await _authenticationService.CheckPermissionAsync(new RequestDetail()
                //{
                //    ControllerName = ControllerName,
                //    ActionName = ActionName,
                //    UserId = UserId,
                //    ActionType = ActionType,
                //});
            }
            else
            {
                base.OnActionExecuting(context);
            }
        }
    }
}
