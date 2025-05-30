﻿$(document).ready(() => {

    loadCartItems();
    updateCartSummary();

    $("#clearAllButton").click(() => clearCart());

    $("body").on("click", ".minus", function () {
        changeQuantity($(this).closest("tr").data("id"), -1);
    });

    $("body").on("click", ".plus", function () {
        changeQuantity($(this).closest("tr").data("id"), 1);
    });

    $("body").on("click", ".remove-button", function () {
        removeItem($(this).closest("tr").data("id"));
    });

    if (!userId) {
        // استفاده از toastr به جای alert
        toastr.warning("لطفا وارد حساب کاربری خود شوید.")
        return
    }
    $("#checkoutButton").click(function () {
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

        // بررسی اینکه سبد خرید خالی است یا نه
        if (cartItems.length === 0) {
            // استفاده از toastr به جای alert
            toastr.info("سبد خرید شما خالی است.")
            return
        }

        // ساخت داده‌هایی که باید به سرور ارسال شود
        const requestData = {
            userId: userId,  // مطمئن شوید که userId به درستی مقداردهی شده باشد
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        console.log("Sending request:", JSON.stringify(requestData));

        $.ajax({
            url: '/Order/Create',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function (data) {
                if (data.isSuccess) {
                    // استفاده از toastr به جای alert
                    toastr.success(`فاکتور با موفقیت ایجاد شد. شناسه فاکتور: ${data.invoiceNumber}`)
                    // پاک کردن سبد خرید
                    localStorage.removeItem("cart")
                    // هدایت کاربر به صفحه پرداخت
                    setTimeout(() => {
                        window.location.href = `/Order/CheckOut/${data.invoiceId}`
                    }, 1500) // تاخیر کوتاه برای نمایش پیام
                } else {
                    toastr.error(data.message || "خطای نامشخص در ایجاد فاکتور")
                }
            },
            error: (jqXHR, textStatus, errorThrown) => {
                toastr.error(`خطا در ایجاد فاکتور: ${errorThrown}`)
            },
        });
    });
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const cartItemsBody = $("#cart-items-body")
    const cartTitle = $("#cartTitle")
    const dataShow = $("#data-show")
    const cartTable = $(".cart-table .table-responsive")

    if (cart.length === 0) {
        dataShow.show()
        cartTable.hide()
    } else {
        dataShow.hide()
        cartTable.show()
        cartItemsBody.empty()

        let totalPrice = 0
        cart.forEach((item) => {
            const row = `<tr data-id="${item.id}">
                <td>
                    <div class="product-detail">
                        <img src="${item.image}" alt="${item.name}">
                        <h4>${item.name}</h4>
                    </div>
                </td>
                <td><h5>تومان ${item.price.toLocaleString()}</h5></td>
                <td>
                    <div class="quantity-box">
                        <button class="minus">-</button>
                        <input type="number" value="${item.quantity}" readonly>
                        <button class="plus">+</button>
                    </div>
                </td>
                <td><h5>تومان ${(item.price * item.quantity).toLocaleString()}</h5></td>
                <td><button class="remove-button">حذف</button></td>
            </tr>`
            cartItemsBody.append(row)
            totalPrice += item.price * item.quantity
        })

        cartTitle.text(`(${cart.length})`)
    }
}


function changeQuantity(productId, delta) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let product = cart.find(item => item.id === productId);

    if (product) {
        product.quantity += delta;
        if (product.quantity < 1) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCartItems();
        updateCartSummary();
    }
}

function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();
    updateCartSummary();
}

function clearCart() {
    localStorage.removeItem("cart");
    loadCartItems();
    updateCartSummary();
}
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    let subtotal = 0
    let itemCount = 0
    // حذف اعمال خودکار تخفیف
    const discountPercentage = 0 // تغییر از 0.1 به 0

    cart.forEach((item) => {
        subtotal += item.price * item.quantity
        itemCount += item.quantity
    })

    const discount = subtotal * discountPercentage
    const total = subtotal - discount 
    const freeShippingThreshold = 500
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

    $(".progress-bar").css("width", `${(subtotal / freeShippingThreshold) * 100}%`)
    $(".cart-progress p").html(
        remainingForFreeShipping > 0
            ? `تقریبا به هدف رسیدید، فقط <span>${remainingForFreeShipping.toLocaleString()} تومان</span> بیشتر اضافه کنید تا <span>ارسال رایگان!!</span> دریافت کنید`
            : `شما واجد شرایط <span>ارسال رایگان</span> هستید!`,
    )

    $(".cart-body h6").text(`جزئیات قیمت (${itemCount} آیتم)`)
    $(".cart-body ul li:nth-child(1) span").text(`${subtotal.toLocaleString()} تومان`)

    // اگر تخفیف صفر است، نمایش ندهیم
    if (discount > 0) {
        // اطمینان از وجود عنصر تخفیف
        if ($(".cart-body ul li:nth-child(2)").length === 0) {
            $(".cart-body ul").append(`<li><p>تخفیف</p><span>${discount.toLocaleString()} تومان</span></li>`)
        } else {
            $(".cart-body ul li:nth-child(2) span").text(`${discount.toLocaleString()} تومان`)
        }
    } else {
        // حذف عنصر تخفیف اگر وجود دارد
        $(".cart-body ul li").each(function () {
            if ($(this).find("p").text() === "تخفیف") {
                $(this).remove()
            }
        })
    }

    $(".cart-bottom h6 span").text(`${total.toLocaleString()} تومان`)
}
