$(document).ready((doc) => {
    $("#btn_getCode").click(function () {
        getOtpCode();
    });

    $("#btn_newGetCode").click(function () {
        getOtpCode();
    });

    $("#btn_signIn").click(function () {
        signIn();
    });
});

function getOtpCode() {
    $("#btn_getCode").prop("disabled", true);
    $("#btn_getCode").css("opacity", "0.3");

    var entity = {
        mobile: $("#txtMobile").val(),
    }

    $.ajax({
        type: "POST",
        url: "/Account/GetOtp",
        data: entity,
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                $("#mobile-box").hide();
                $("#otp-box").fadeIn();
                $("#btn_getCode").hide();
                $("#btn_signIn").show();
            } else {
                toastr.error(data.message);
            }
            $("#btn_getCode").prop("disabled", false);
            $("#btn_getCode").css("opacity", "1");
        }
    });
}

function signIn() {
    $("#btn_signIn").prop("disabled", true);
    $("#btn_signIn").css("opacity", "0.3");

    var entity = {
        mobile: $("#txtMobile").val(),
        code: $("#txtOtpCode").val(),
    }

    $.ajax({
        type: "POST",
        url: "/Account/SignIn",
        data: entity,
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                setTimeout(function () {
                    window.location.href = "/Home";
                }, 500);
            } else {
                toastr.error(data.message);
                if (data.data == -1) {
                    $("#btn_newGetCode").show();
                    $("#btn_signIn").hide();
                }
            }
            $("#btn_signIn").prop("disabled", false);
            $("#btn_signIn").css("opacity", "1");
        }
    });
}