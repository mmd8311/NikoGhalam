$(document).ready(() => {
    $("#btn_logout").click(function () {
        logout();
    });


    // مخفی کردن تب پایین در صفحه لاگین
    if (window.location.pathname === '/Account/Login') {
        $(".mobile-fix-option").remove();
    } else {
        // مدیریت نمایش/مخفی کردن تب پایین در سایر صفحات
        let lastScrollTop = 0;
        const mobileFixOption = document.querySelector('.mobile-fix-option');

        if (mobileFixOption) {
            window.addEventListener('scroll', function () {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > lastScrollTop) {
                    // اسکرول به پایین
                    mobileFixOption.classList.add('hide');
                    mobileFixOption.classList.remove('show');
                } else {
                    // اسکرول به بالا
                    mobileFixOption.classList.add('show');
                    mobileFixOption.classList.remove('hide');
                }

                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            });
        }
    }
});


function logout() {
    $.ajax({
        type: "POST",
        url: "/Account/Logout",
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                setTimeout(function () {
                    window.location.href = "/Account/Login";
                }, 500);
            } else {
                toastr.error(data.message);
            }
        }
    });
}
