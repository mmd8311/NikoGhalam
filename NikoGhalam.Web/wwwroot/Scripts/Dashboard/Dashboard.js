$(document).ready(() => {
    LoadProfileData();
    LoadUserAddresses();
    loadUserInvoices(userId);

    $("#btn_submit").click(function () {
        SaveProfile();
    });

    // نمایش منو
    $("#btn-menu").click(function () {
        $(".dashboard-left-sidebar").addClass("open");
        $("body").addClass("no-scroll"); // جلوگیری از اسکرول صفحه
    });

    // بستن منو
    $(".dashboard-left-sidebar-close").click(function () {
        $(".dashboard-left-sidebar").removeClass("open");
        $("body").removeClass("no-scroll"); // فعال کردن اسکرول صفحه
    });
    $("#Address_submit").click(function () {
        if (validateAddressForm()) { // اضافه کردن پرانتز
            SaveAddress();
        }
    });

    $("#Edit_Address_submit").click(() => {
        if (validateEditAddressForm()) { // اضافه کردن پرانتز
            UpdateAddress();
        }
    });

    $("body").on("click", ".delete-address", function () {
        let addressId = $(this).data("id");
        DeleteAddress(addressId);
    });

    $("body").on("click", ".edit-address", function () {
        let addressId = $(this).data("id");
        LoadAddressForEdit(addressId);
    });

    $('body').keydown(function (e) {
        if (e.keyCode == 115) { // F4 برای ارسال فرم
            SaveProfile();
        }
    });

    $("#btn_logout").click(function () {
        logout();
    });

    if (!userId) {
        alert("لطفا وارد حساب کاربری خود شوید.");
        return; // پایان تابع اگر userId وجود نداشته باشد
    }
});

function loadUserInvoices(userId) {
    $.ajax({
        type: "GET",
        url: `/Order/GetUserInvoices/${userId}`,
        success: function (response) {
            if (response.isSuccess) {
                renderInvoices(response.data); // ارسال response.data به تابع renderInvoices
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("خطا در دریافت فاکتورها!");
        }
    });
}

function renderInvoices(invoices) {
    const invoiceList = $("#invoice-list");
    invoiceList.empty();

    if (!invoices || !Array.isArray(invoices)) {
        invoiceList.append('<div class="col-12 text-center">خطا در دریافت فاکتورها!</div>');
        return;
    }

    if (invoices.length === 0) {
        invoiceList.append('<div class="col-12 text-center">هیچ فاکتوری یافت نشد.</div>');
        return;
    }

    invoices.forEach(invoice => {
        if (!invoice.items || !Array.isArray(invoice.items)) {
            console.error("Items is undefined or not an array for invoice:", invoice);
            return;
        }

        let itemsHtml = '';
        invoice.items.forEach(item => {
            itemsHtml += `
                <div class="product-box">
                    <a href="/product/${item.productId}">
                        <img src="${item.productImageUrl}" alt="${item.productName}">
                    </a>
                    <div class="order-wrap">
                        <h5>${item.productName}</h5>
                        <ul>
                            <li>
                                <p>قیمت : </p><span>${item.price.toLocaleString()} تومان</span>
                            </li>
                            <li>
                                <p>تعداد : </p><span>${item.quantity}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        });

        let invoiceHtml = `
            <div class="col-12">
                <div class="order-box">
                    <div class="order-container">
                        <div class="order-icon">
                            <i class="iconsax" data-icon="box"></i>
                            <div class="couplet"><i class="fa-solid fa-check"></i></div>
                        </div>
                        <div class="order-detail">
                            <h5>${invoice.status}</h5>
                            <p>${new Date(invoice.issueDate).toLocaleDateString('fa-IR')}</p>
                        </div>
                    </div>
                    <div class="product-order-detail">
                        ${itemsHtml}
                       <div class="order-summary">
    <ul>
        <li>
            <p>شناسه فاکتور :</p> <span> ${invoice.invoiceNumber}</span>
        </li>
        <li>
            <p>مبلغ کل :</p> <span> ${invoice.totalAmount.toLocaleString()} تومان</span>
        </li>
        ${isAdmin ? `<li><p>کاربر :</p><span> ${invoice.userPhoneNumber}</span></li>` : ''}
    </ul>
</div>
 <div class="payment-action">
                    ${invoice.status === "پرداخت نشده" ?
                `<a href="/Order/Checkout/${invoice.id}" class="btn btn-solid">
                            <i class="fa-solid fa-credit-card me-2"></i>پرداخت فاکتور
                        </a>` :
                ''}
                </div>
                    </div>
                </div>
            </div>
        `;
        invoiceList.append(invoiceHtml);
    });
}

function SaveAddress() {
    if (!validateAddressForm()) {
        return;
    }

    let entity = {
        userId: userId,
        title: $("#Address_Title").val(),
        postalCode: $("#PostalCode").val(),
        province: $("#Province").val(),
        city: $("#City").val(),
        phoneNumber: $("#PhoneNumber").val(),
        addressText: $("#AddressText").val(),
    };

    $("#Address_submit").prop("disabled", true).text("در حال ثبت...");

    $.ajax({
        type: "POST",
        url: "/Dashboard/AddAddress",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                // پاک کردن فرم
                clearAddressForm();
                // بارگذاری مجدد آدرس‌ها
                LoadUserAddresses();
                // عدم بستن مدال
                // $("#add-address").modal("hide");
            } else {
                toastr.error(data.message);
            }
            $("#Address_submit").prop("disabled", false).text("ثبت");
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            toastr.error("خطا در ارسال اطلاعات به سرور!");
            $("#Address_submit").prop("disabled", false).text("ثبت");
        }
    });
}

// تابع جدید برای پاک کردن فرم
function clearAddressForm() {
    $("#Address_Title").val("");
    $("#PostalCode").val("");
    $("#Province").val("");
    $("#City").val("");
    $("#PhoneNumber").val("");
    $("#AddressText").val("");

    // حذف وضعیت invalid از فیلدها
    $(".is-invalid").removeClass("is-invalid");
}
function LoadProfileData() {
    $.ajax({
        type: "GET",
        url: "/Dashboard/GetUserProfile",
        success: function (data) {
            if (data.isSuccess) {
                UpdateProfileView(data.profile);
            } else {
                console.error("خطا در دریافت اطلاعات پروفایل:", data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
        }
    });
}

function UpdateProfileView(entity) {
    $(".User-phone").next("p").text(entity.phone || "-");

    $(".profile-information li:eq(0) p").text(entity.name);
    $(".profile-information li:eq(1) p").text(entity.phone);
    $(".profile-information li:eq(2) p").text(entity.address);
    $(".profile-name h4").text(entity.name);
    $(".profile-name h6").text(entity.phone);
    $(".dashboard-user-name b").text(entity.name);

    $("#Name").val(entity.name);
    $("#Phone").val(entity.phone).prop('readonly', true);
    $("#Address").val(entity.address);
}

function ValidateProfile() {
    if ($("#Name").val().trim() === "" || $("#Phone").val().trim() === "") {
        toastr.error("نام و شماره تلفن اجباری است!");
        return false;
    }
    return true;
}


function LoadUserAddresses() {
    $.ajax({
        type: "GET",
        url: "/Dashboard/GetUserAddresses",
        success: function (data) {
            if (data.isSuccess) {
                RenderAddresses(data.data);
            } else {
                toastr.error(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            toastr.error("خطا در دریافت اطلاعات آدرس‌ها!");
        }
    });
}

function RenderAddresses(addresses) {
    let container = $(".row.gy-3");
    container.empty();

    if (addresses.length === 0) {
        container.append('<p class="text-center">هیچ آدرسی ثبت نشده است.</p>');
        return;
    }

    addresses.forEach((address, index) => {
        let addressHtml = `
            <div class="col-xxl-4 col-md-6">
                <div class="address-option">
                    <label for="address-billing-${index}">
                        <span class="delivery-address-box">
                            <span class="address-detail">
                                <span class="address-title">${address.title}</span>
                                <span class="address-tag"> آدرس: ${address.addressText}</span>
                                <span class="address-tag"> کد پستی: ${address.postalCode}</span>
                            </span>
                        </span>
                          <span class="buttons">
                        <a class="btn btn_outline sm edit-address" href="#" data-id="${address.id}" data-bs-toggle="modal" data-bs-target="#edit-address" title="ویرایش" tabindex="0">ویرایش</a>
                        <a class="btn btn_outline sm delete-address" href="#" data-id="${address.id}" title="حذف" tabindex="0">حذف</a>
                    </span>
                    </label>
                </div>
            </div>
        `;
        container.append(addressHtml);
    });
}

function LoadAddressForEdit(addressId) {
    $.ajax({
        type: "GET",
        url: `/Dashboard/GetUserAddresses`,
        success: function (data) {
            if (data.isSuccess) {
                let address = data.data.find(a => a.id === addressId);
                if (address) {
                    $("#Edit_Address_Id").val(address.id);
                    $("#Edit_Address_Title").val(address.title);
                    $("#Edit_PostalCode").val(address.postalCode);
                    $("#Edit_Province").val(address.province);
                    $("#Edit_City").val(address.city);
                    $("#Edit_PhoneNumber").val(address.phoneNumber);
                    $("#Edit_AddressText").val(address.addressText);
                }
            } else {
                toastr.error(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", xhr.responseText);
            toastr.error("خطا در دریافت اطلاعات آدرس!");
        }
    });
}

function UpdateAddress() {
    let entity = {
        id: $("#Edit_Address_Id").val(),
        title: $("#Edit_Address_Title").val(),
        postalCode: $("#Edit_PostalCode").val(),
        province: $("#Edit_Province").val(),
        city: $("#Edit_City").val(),
        phoneNumber: $("#Edit_PhoneNumber").val(),
        addressText: $("#Edit_AddressText").val(),
    };
    console.log("Updating address:", entity); // برای دیباگ

    $.ajax({
        type: "POST",
        url: "/Dashboard/UpdateAddress",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                LoadUserAddresses();
                $("#edit-address").modal("hide");
            } else {
                toastr.error(data.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            toastr.error("خطا در ویرایش آدرس!");
        }
    });
}

function DeleteAddress(addressId) {
    $.ajax({
        type: "POST",
        url: "/Dashboard/DeleteAddress",
        contentType: "application/json",
        data: JSON.stringify({ id: addressId }),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                LoadUserAddresses();
            } else {
                toastr.error(data.message);
            }
        },
        error: function () {

            toastr.error("خطا در حذف آدرس!");
        }
    });
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
function SaveProfile() {
    if (!ValidateProfile()) {
        return;
    }

    $("#btn_submit").prop("disabled", true).text("در حال ذخیره...");

    var entity = {
        userId: userId,
        name: $("#Name").val(),
        phone: $("#Phone").val(),
        address: $("#Address").val()
    };

    $.ajax({
        type: "POST",
        url: "/Dashboard/Upsert",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                LoadProfileData();
                $("#add-dashboard").modal("hide");
            } else {
                toastr.error(data.message);
            }
            $("#btn_submit").prop("disabled", false).text("ارسال");
        },
        error: function (xhr) {
            toastr.error("خطا در ذخیره اطلاعات: " + xhr.responseJSON.message);
            $("#btn_submit").prop("disabled", false).text("ارسال");
        }
    });
}

function ValidateProfile() {
    let isValid = true;

    // اعتبارسنجی فیلد نام
    if ($("#Name").val().trim() === "") {
        $("#Name_error").show();
        $("#Name").addClass("is-invalid");
        isValid = false;
    } else {
        $("#Name_error").hide();
        $("#Name").removeClass("is-invalid");
    }

    return isValid;
}
// تابع اعتبارسنجی فرم افزودن آدرس
function validateAddressForm() {
    let isValid = true


    // بررسی عنوان
    if ($("#Address_Title").val().trim() === "") {
        $("#Address_Title_error").show()
        $("#Address_Title").addClass("is-invalid")
        isValid = false
    } else {
        $("#Address_Title_error").hide()
        $("#Address_Title").removeClass("is-invalid")
    }

    // بررسی استان
    if ($("#Province").val().trim() === "") {
        $("#Province_error").show()
        $("#Province").addClass("is-invalid")
        isValid = false
    } else {
        $("#Province_error").hide()
        $("#Province").removeClass("is-invalid")
    }

    // بررسی شهر
    if ($("#City").val().trim() === "") {
        $("#City_error").show()
        $("#City").addClass("is-invalid")
        isValid = false
    } else {
        $("#City_error").hide()
        $("#City").removeClass("is-invalid")
    }

    // بررسی آدرس
    if ($("#AddressText").val().trim() === "") {
        $("#AddressText_error").show()
        $("#AddressText").addClass("is-invalid")
        isValid = false
    } else {
        $("#AddressText_error").hide()
        $("#AddressText").removeClass("is-invalid")
    }

    // بررسی کد پستی
    if ($("#PostalCode").val().trim() === "") {
        $("#PostalCode_error").show()
        $("#PostalCode").addClass("is-invalid")
        isValid = false
    } else {
        $("#PostalCode_error").hide()
        $("#PostalCode").removeClass("is-invalid")
    }
    return isValid
}

// تابع اعتبارسنجی فرم ویرایش آدرس
function validateEditAddressForm() {
    let isValid = true

    // بررسی عنوان
    if ($("#Edit_Address_Title").val().trim() === "") {
        $("#Edit_Address_Title_error").show()
        $("#Edit_Address_Title").addClass("is-invalid")
        isValid = false
    } else {
        $("#Edit_Address_Title_error").hide()
        $("#Edit_Address_Title").removeClass("is-invalid")
    }

    // بررسی استان
    if ($("#Edit_Province").val().trim() === "") {
        $("#Edit_Province_error").show()
        $("#Edit_Province").addClass("is-invalid")
        isValid = false
    } else {
        $("#Edit_Province_error").hide()
        $("#Edit_Province").removeClass("is-invalid")
    }

    // بررسی شهر
    if ($("#Edit_City").val().trim() === "") {
        $("#Edit_City_error").show()
        $("#Edit_City").addClass("is-invalid")
        isValid = false
    } else {
        $("#Edit_City_error").hide()
        $("#Edit_City").removeClass("is-invalid")
    }
    // بررسی آدرس
    if ($("#Edit_AddressText").val().trim() === "") {
        $("#Edit_AddressText_error").show()
        $("#Edit_AddressText").addClass("is-invalid")
        isValid = false
    } else {
        $("#Edit_AddressText_error").hide()
        $("#Edit_AddressText").removeClass("is-invalid")
    }

    // بررسی کد پستی
    if ($("#Edit_PostalCode").val().trim() === "") {
        $("#Edit_PostalCode_error").show()
        $("#Edit_PostalCode").addClass("is-invalid")
        isValid = false
    } else {
        $("#Edit_PostalCode_error").hide()
        $("#Edit_PostalCode").removeClass("is-invalid")
    }
    return isValid
}