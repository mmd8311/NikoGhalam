$(document).ready(() => {
    loadFeedBacks();
    $("#btn_submit").off('click').on('click', function () { // از ثبت چندباره جلوگیری کنید
        Save();
    });

    // Event Delegation برای دکمه‌های حذف
    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');
        if (confirm("آیا از حذف این بازخورد مطمئن هستید؟")) {
            deleteFeedBack(id);
        }
    });

    $("#add_feedBack_close").on('click', function () {
        $("#addfeedback").modal("hide");
    });

});

function Save() {
    if (!Validation()) {
        toastr.error("لطفاً اطلاعات را به درستی وارد کنید.");
        return;
    }

    let entity = {
        customerName: $("#CustomerName").val(),
        feedBackText: $("#FeedBackText").val()
    };

    $.ajax({
        type: "POST",
        url: "/FeedBack/AddFeedBack",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                $("#addfeedback").modal("hide");
                loadFeedBacks();
            } else {
                toastr.error(data.message);
            }
        },
        error: function (xhr, status, error) {
            toastr.error("خطا در ارسال اطلاعات به سرور!");
        }
    });

}

function deleteFeedBack(id) {
    if (!id) {
        toastr.error("شناسه بازخورد معتبر نیست.");
        return;
    }

    console.log("Deleting feedback with ID:", id); // برای دیباگ

    $.ajax({
        type: "POST",
        url: "/FeedBack/DeleteFeedBack",
        contentType: "application/json",
        data: JSON.stringify({ id: id }),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                loadFeedBacks();
            } else {
                toastr.error(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            toastr.error("خطا در حذف بازخورد!");
        }
    });
}
function loadFeedBacks() {
    $.ajax({
        type: "GET",
        url: "/FeedBack/GetFeedBacks", // آدرس API برای دریافت بازخوردها
        success: function (data) {
            if (data.isSuccess) {
                renderFeedBacks(data.data); // نمایش بازخوردها
            } else {
                toastr.error(data.message); // نمایش خطا
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            toastr.error("خطا در دریافت لیست بازخوردها!");
        }
    });
}

function renderFeedBacks(feedBacks) {
    var feedbacksHtml = '';
    feedBacks.forEach(function (item) {
        feedbacksHtml += `
            <div class="swiper-slide testimonials-box">
                <div class="customer-item">
                    <div class="customer-box">
                        <p>${item.feedBackText}</p>
                    </div>
                </div>
                <div class="customer-img">
                    <div>
                        <h5>${item.customerName}</h5>
                        ${isAdmin ? `<button class="btn btn-sm btn-danger btn-delete" data-id="${item.id}">حذف</button>` : ''}
                    </div>
                    <img class="img-fluid" src="/assets/images/user/Default.jpeg" alt="">
                </div>
            </div>
        `;
    });
    $(".swiper-wrapper").html(feedbacksHtml);

    // اگر Swiper قبلاً initialize شده، آن را از بین ببر
    if (window.mySwiper) {
        window.mySwiper.destroy();
    }

    // Initialize Swiper با تنظیمات جدید
    window.mySwiper = new Swiper('.our-testimonials', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 40
            }
        }
    });
}
function Validation() {
    var name = $("#CustomerName").val();
    var feedbackText = $("#FeedBackText").val();

    var isValid = true;

    if (name === '') {
        isValid = false;
        $("#Name_error").fadeIn();
    } else {
        $("#Name_error").fadeOut();
    }

    if (feedbackText === '') {
        isValid = false;
        $("#Feedback_error").fadeIn();
    } else {
        $("#Feedback_error").fadeOut();
    }

    return isValid;
}
