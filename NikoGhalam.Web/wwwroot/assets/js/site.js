$(document).ready(() => {
    $("#btn_submit").click(function () {
        Save();
    });
    $("#btn-logout").click(function () {
        logout();
    });

});

function Save() {
    if (Validation()) {
        $("#btn_submit").css("pointer-events", "none").css("opacity", "0.3");

        // استفاده از FormData برای ارسال فایل
        var formData = new FormData();
        formData.append("Name", $("#Name").val());
        formData.append("Description", $("#Description").val());
        formData.append("Price", $("#Price").val());

        // بررسی فایل و اضافه کردن آن به FormData
        var imageFile = $("#ImageFile")[0].files[0];
        if (imageFile) {
            // بررسی نوع فایل تصویری
            var validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
            if ($.inArray(imageFile.type, validExtensions) == -1) {
                toastr.error("فقط فایل‌های تصویری با فرمت JPG، JPEG، PNG مجاز هستند.");
                $("#btn_submit").css("pointer-events", "auto").css("opacity", "1");
                return;
            }
            formData.append("ImageFile", imageFile);
        }

        $.ajax({
            type: "POST",
            url: "/Product/AddProduct",
            data: formData,
            processData: false,  // برای جلوگیری از پردازش داده‌ها به صورت پیش‌فرض
            contentType: false,  // برای تنظیم خودکار Content-Type به multipart/form-data
            success: function (data) {
                if (data.isSuccess) {
                    toastr.success(data.message);
                    setTimeout(function () {
                        location.reload();  // رفرش صفحه بعد از موفقیت
                    }, 500);
                } else {
                    toastr.error(data.message);
                }
                $("#btn_submit").css("pointer-events", "auto").css("opacity", "1");
            }
        });
    }
}

function Validation() {
    var name = $("#Name").val();
    var price = $("#Price").val();

    var isValid = true;

    // بررسی نام محصول
    if (name === '') {
        isValid = false;
        $("#Name_error").fadeIn();
    } else {
        $("#Name_error").fadeOut();
    }

    // بررسی قیمت
    if (price === '' || price <= 0) {
        isValid = false;
        $("#Price_error").fadeIn();
    } else {
        $("#Price_error").fadeOut();
    }

    return isValid;
}

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
