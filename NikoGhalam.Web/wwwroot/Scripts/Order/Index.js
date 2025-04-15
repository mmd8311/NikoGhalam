$(document).ready(function () {

    const invoiceId = $("#InvoiceId").val();  // دریافت InvoiceId از input مخفی
    // بارگذاری آدرس‌ها از دیتابیس
    LoadUserAddresses();

    // بارگذاری اقلام فاکتور
    loadInvoiceItems(invoiceId);

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

    $("body").on("click", ".edit-address", function () {
        let addressId = $(this).data("id");
        LoadAddressForEdit(addressId);
    });

    $('#add-address').on('hidden.bs.modal', function () {
        resetAddressForm();
    });

    $('#edit-address').on('hidden.bs.modal', function () {
        $(".is-invalid").removeClass("is-invalid");
        $(".text-danger").hide();
    });

    $("body").on("click", ".delete-address", function () {
        let addressId = $(this).data("id");
        DeleteAddress(addressId);
    });


    $("#submit-order").on("click", () => {
        const selectedAddress = $("input[name='addressRadio']:checked").val()

        if (!selectedAddress) {
            toastr.error("لطفاً یک آدرس انتخاب کنید")
            return
        }

        $.ajax({
            type: "POST",
            url: "/Order/AddAddressToInvoice",
            data: JSON.stringify({
                invoiceId: invoiceId,
                addressId: selectedAddress,
            }),
            contentType: "application/json",
            success: (response) => {
                if (response.isSuccess) {
                    toastr.success(response.message)
                    // پس از اضافه کردن موفقیت‌آمیز آدرس، فرآیند پرداخت را شروع می‌کن
                    initiatePayment(invoiceId)
                }
                else {
                    toastr.error(response.message)
                }
            },
            error: () => {
                toastr.error("خطا در ارسال آدرس به فاکتور!")
            },
        })
    })
})
async function initiatePayment(invoiceId) {
    try {
        const response = await $.ajax({
            type: "POST",
            url: "/Order/InitiatePayment",
            contentType: "application/json",
            data: JSON.stringify({ invoiceId: invoiceId }),
        });

        if (response.isSuccess) {
            window.location.href = response.paymentUrl;
        } else {
            toastr.error(response.message || "خطا در شروع فرآیند پرداخت");
        }
    } catch (error) {
        console.error("AJAX error:", error);
        toastr.error("خطا در ارتباط با سرور برای شروع فرآیند پرداخت");
    }
}

// هنگامی که کاربر دکمه "ثبت آدرس" را در مودال می‌زند

function SaveAddress() {
    let entity = {
        title: $("#Address_Title").val(),
        postalCode: $("#PostalCode").val(),
        province: $("#Province").val(),
        city: $("#City").val(),
        phoneNumber: $("#PhoneNumber").val(),
        addressText: $("#AddressText").val(),
    };

    $.ajax({
        type: "POST",
        url: "/Dashboard/AddAddress",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: function (data) {
            if (data.isSuccess) {
                toastr.success(data.message);
                LoadUserAddresses();
                clearAddressForm(); // اضافه کردن تابع reset فرم
            } else {
                // نمایش خطاهای خاص از سرور
                if (data.message.includes("آدرسی با این نام ثبت شده است")) {
                    $("#Address_Title").addClass("is-invalid");
                    $("#Address_Title_error").text(data.message).show();
                } else {
                    toastr.error(data.message);
                }
            }
        },
        error: function (jqXHR) {
            toastr.error("خطا در ارسال اطلاعات به سرور!");
            console.error("AJAX Error:", jqXHR.responseText);
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

// تابع مشابه برای UpdateAddress
function resetAddressForm() {
    $("#Address_Title").val("");
    $("#PostalCode").val("");
    $("#Province").val("");
    $("#City").val("");
    $("#PhoneNumber").val("");
    $("#AddressText").val("");

    // حذف کلاس‌های خطا
    $(".is-invalid").removeClass("is-invalid");
    $(".text-danger").hide();
}
function LoadUserAddresses() {
    $.ajax({
        type: "GET",
        url: "/Dashboard/GetUserAddresses",
        success: function (response) {
            if (response.isSuccess) {
                RenderAddresses(response.data);
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("خطا در دریافت آدرس‌ها!");
        }
    });
}

function RenderAddresses(addresses) {
    const container = $(".row.gy-3")
    container.empty()

    if (addresses.length === 0) {
        container.append('<p class="text-center">هیچ آدرسی ثبت نشده است.</p>')
        return
    }

    addresses.forEach((address) => {
        const addressHtml = `
        <div class="col-xxl-4 col-md-6">
            <div class="address-option">
                <label for="address-billing-${address.id}">
                    <span class="delivery-address-box">
                        <span class="form-check">
                            <input class="custom-radio" id="address-billing-${address.id}" type="radio" name="addressRadio" value="${address.id}">
                        </span>
                        <span class="address-detail">
                            <span class="address-title">${address.title}</span>
                            <span class="address-tag"> آدرس: ${address.addressText}</span>
                            <span class="address-tag"> کد پستی: ${address.postalCode}</span>
                            <span class="address-tag"> تلفن: ${address.phoneNumber}</span>
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
function loadInvoiceItems(invoiceId) {
    $.ajax({
        type: "GET",
        url: `/Order/GetInvoiceItems/${invoiceId}`,
        success: function (response) {
            if (response.isSuccess) {
                renderInvoiceItems(response.data);
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("خطا در دریافت اقلام فاکتور!");
        }
    });
}

function renderInvoiceItems(items) {
    const invoiceItemsList = $("#invoice-items");
    const invoiceSummary = $("#invoice-summary");

    // پاک کردن لیست قبلی
    invoiceItemsList.empty();
    invoiceSummary.empty();

    let subtotal = 0;
    const shippingCost = 40000; // هزینه ثابت ارسال


    items.forEach(item => {
        let itemHtml = `
                      <li>
                                   <img src="${item.imageUrl}" width="40" height="40">  <!-- سایز تصویر در HTML تنظیم شد -->
                                   <div>
                                       <span>${item.quantity} x ${item.price.toLocaleString()} تومان</span>
                                   </div>
                                   <p>${(item.quantity * item.price).toLocaleString()} تومان</p>
                               </li>
                           `;
        invoiceItemsList.append(itemHtml);

        subtotal += item.quantity * item.price;
    });

    const tax = subtotal * 0.1; // فرض 10% مالیات
    const total = subtotal + tax + shippingCost;

    let summaryHtml = `
                           <li><p>جمع جزء</p><span>${subtotal.toLocaleString()} تومان</span></li>
                           <li><p>مالیات</p><span>${tax.toLocaleString()} تومان</span></li>
                                   <li><p>هزینه ارسال</p><span>${shippingCost.toLocaleString()} تومان</span></li>

                           <li><p>مجموع</p><span>${total.toLocaleString()} تومان</span></li>
                       `;
    invoiceSummary.append(summaryHtml);
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
        error: function (xhr, status, error) {
            console.error("Error:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            toastr.error("خطا در حذف آدرس!");
        }
    });
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
