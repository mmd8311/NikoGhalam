$(document).ready(() => {
    $("#btn-logout").click(function () {
        logout();
    });

});

document.addEventListener('DOMContentLoaded', function () {
    let lastScrollTop = 0;
    const mobileFixOption = document.querySelector('.mobile-fix-option');

    window.addEventListener('scroll', function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // اسکرول به پایین => آرام مخفی شود
            mobileFixOption.classList.add('hide');
            mobileFixOption.classList.remove('show');
        } else {
            // اسکرول به بالا => آرام نمایش داده شود
            mobileFixOption.classList.add('show');
            mobileFixOption.classList.remove('hide');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // جلوگیری از مقدار منفی
    });
});

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname === '/Account/Login') {
        $(".skeleton_body").css("background-color", "#a37b73");
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
