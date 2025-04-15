/**
 * مدیریت سبد خرید و نمایش محصولات
 * @author v0
 */

// متغیر سراسری برای نگهداری محصول انتخاب شده
let selectedProduct = null

function initializeCart() {
    // تنظیم اطلاعات دکمه افزودن به سبد خرید از مدل
    setupAddToCartButtonFromModel()

    // انتخاب محصول پیش‌فرض
    selectDefaultProduct()

    // تنظیم دکمه‌های افزودن به سبد خرید
    setupAddToCartButtons()

    // اضافه کردن event listener برای اکشن‌های سبد خرید
    document.addEventListener("click", handleCartActions)

    // اضافه کردن event listener به تصاویر محصول
    addProductImageListeners()

    // تنظیم اسکرول نرم برای لینک‌های داخلی
    setupSmoothScrolling()

    // به‌روزرسانی سبد خرید
    updateCart()

    loadFeedBacks()
}
/**
 * انتخاب محصول پیش‌فرض
 */
function selectDefaultProduct() {
    // ابتدا تصویر جلد پیش‌فرض را تنظیم می‌کنیم
    const selectedImg = document.querySelector(".product-image.selected-product")
  
}
// تابع جدید برای پردازش انواع فرمت‌های قیمت
function parsePrice(price) {
    if (typeof price === "number") return price

    // حذف همه کاراکترهای غیرعددی به جز نقطه و منفی
    const cleaned = String(price).replace(/[^\d.-]/g, "")
    const result = Number.parseFloat(cleaned)

    return isNaN(result) ? 0 : result
}

// تابع فرمت‌دهی قیمت (بدون تغییر)
function formatPrice(price) {
    return parsePrice(price).toLocaleString("en-US", {
        maximumFractionDigits: 0,
    })
}

/**
 * تنظیم دکمه‌های افزودن به سبد خرید
 */
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart")

    addToCartButtons.forEach((button) => {
        // ذخیره اتریبیوت‌های اصلی به عنوان data attributes
        button.dataset.originalToggle = button.getAttribute("data-bs-toggle")
        button.dataset.originalTarget = button.getAttribute("data-bs-target")

        // حذف اتریبیوت‌های offcanvas
        button.removeAttribute("data-bs-toggle")
        button.removeAttribute("data-bs-target")

        // اضافه کردن event listener جدید
        button.addEventListener("click", handleAddToCart)
    })
}

/**
 * تنظیم اسکرول نرم برای لینک‌های داخلی
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault()
            const targetId = this.getAttribute("href")

            if (targetId && targetId !== "#") {
                const targetElement = document.querySelector(targetId)

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    })
                }
            }
        })
    })
}

/**
 * مدیریت کلیک روی دکمه افزودن به سبد خرید
 * @param {Event} event - رویداد کلیک
 */
function handleAddToCart(event) {
    event.preventDefault()
    event.stopPropagation()

    if (!selectedProduct) {
        alert("لطفاً ابتدا یک محصول را انتخاب کنید.")
        return
    }

    // اضافه کردن محصول به سبد خرید
    addToCart(selectedProduct.id, selectedProduct.name, selectedProduct.price, selectedProduct.image)

    // باز کردن offcanvas به صورت دستی
    const offcanvasElement = document.getElementById("offcanvasRight")

    if (offcanvasElement) {
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement)
        offcanvas.show()
    }
}

/**
 * اضافه کردن event listener به تصاویر محصول
 */
function addProductImageListeners() {
    // تنظیم تصاویر محصول عادی
    setupProductImages()

    // تنظیم تصاویر داخل اسلایدر Swiper
    setupSwiperImages()

    // اضافه کردن استایل برای تصویر انتخاب شده
    addSelectedImageStyles()
}

/**
 * تنظیم تصاویر محصول عادی
 */
function setupProductImages() {
    const productImages = document.querySelectorAll(".product-image")

    productImages.forEach((image, index) => {
        // حذف event listener های قبلی برای جلوگیری از تکرار
        image.removeEventListener("click", displayProductDetails)

        // اضافه کردن event listener جدید
        image.addEventListener("click", (event) => {
            displayProductDetails(event)
        })

        // اضافه کردن استایل برای نشان دادن قابل کلیک بودن
        image.style.cursor = "pointer"
        image.title = "برای مشاهده جزئیات کلیک کنید"

        // بررسی data attributes
        if (!image.dataset.id || !image.dataset.name || !image.dataset.price) {
            console.warn(`تصویر ${index + 1} فاقد data attributes لازم است`)
        }
    })
}

/**
 * تنظیم تصاویر داخل اسلایدر Swiper
 */
function setupSwiperImages() {
    const swiperSlides = document.querySelectorAll(".swiper-slide img")

    swiperSlides.forEach((image) => {
        // اضافه کردن کلاس product-image اگر ندارد
        if (!image.classList.contains("product-image")) {
            image.classList.add("product-image")
        }

        // کپی کردن data attributes از parent به تصویر اگر وجود ندارد
        const slide = image.closest(".swiper-slide")

        if (slide && slide.dataset.id && !image.dataset.id) {
            image.dataset.id = slide.dataset.id
            image.dataset.name = slide.dataset.name
            image.dataset.description = slide.dataset.description
            image.dataset.price = slide.dataset.price
            image.dataset.image = slide.dataset.image
        }

        image.removeEventListener("click", displayProductDetails)

        image.addEventListener("click", (event) => {
            event.stopPropagation() // جلوگیری از انتشار رویداد به parent
            displayProductDetails(event)
        })

        image.style.cursor = "pointer"
    })
}

/**
 * اضافه کردن استایل برای تصویر انتخاب شده
 */
function addSelectedImageStyles() {
    // بررسی می‌کنیم که آیا استایل قبلاً اضافه شده است
    if (!document.getElementById("product-image-styles")) {
        const styleElement = document.createElement("style")
        styleElement.id = "product-image-styles"
        styleElement.textContent = `
            .active-image {
                border: 2px solid #007bff !important;
                box-shadow: 0 0 5px rgba(0, 123, 255, 0.5) !important;
            }
            .product-image {
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            }
            .product-image:hover {
                transform: scale(1.05) !important;
            }
            .swiper-slide img {
                cursor: pointer !important;
            }
        `
        document.head.appendChild(styleElement)
    }
}


function displayProductDetails(event) {
    const target = event.target.closest(".product-image"); // برای مواردی که روی child elements کلیک می‌شود

    if (!target || !target.dataset.id) {
        console.error("هدف نامعتبر یا فاقد شناسه محصول");
        return;
    }

    // ذخیره‌سازی محصول انتخاب‌شده
    selectedProduct = {
        id: target.dataset.id,
        name: target.dataset.name,
        description: target.dataset.description || "",
        price: parsePrice(target.dataset.price),
        formattedPrice: formatPrice(parsePrice(target.dataset.price)),
        image: target.src || target.dataset.image || "",
    };

    // به‌روزرسانی سایر اطلاعات محصول
    displayProductDetailsFromElement(target);
}

/**
 * استخراج و نمایش اطلاعات محصول
 * @param {HTMLElement} element - عنصر حاوی اطلاعات محصول
 */
function displayProductDetailsFromElement(element) {
    const productId = element.dataset.id;
    const productName = element.dataset.name;
    const productDescription = element.dataset.description || "";
    const productPrice = element.dataset.price;
    const productImage = element.src || element.dataset.image || "";

    // اضافه کردن کلاس active به تصویر انتخاب‌شده و حذف از بقیه
    document.querySelectorAll(".product-image").forEach((img) => {
        img.classList.remove("active-image");
    });
    element.classList.add("active-image");

    // به‌روزرسانی اطلاعات محصول در صفحه
    updateProductInfo(productName, productDescription, productPrice);

    // به‌روزرسانی اطلاعات دکمه افزودن به سبد خرید
    updateAddToCartButtons(productId, productName, productPrice, productImage);
}
/**
 * به‌روزرسانی اطلاعات محصول در صفحه
 * @param {string} name - نام محصول
 * @param {string} description - توضیحات محصول
 * @param {string} price - قیمت محصول
 */
function updateProductInfo(name, description, price) {
    const nameElement = document.getElementById("product-name")
    const descriptionElement = document.getElementById("product-description")
    const priceElement = document.getElementById("product-price")

    if (nameElement) {
        nameElement.textContent = name
    } else {
        console.error("عنصر product-name یافت نشد")
    }

    if (descriptionElement) {
        descriptionElement.textContent = description
    } else {
        console.error("عنصر product-description یافت نشد")
    }

    if (priceElement) {
        // استفاده از formattedPrice به جای price خام
        priceElement.textContent = selectedProduct.formattedPrice + " تومان"
    } else {
        console.error("عنصر product-price یافت نشد")
    }
}
/**
 * به‌روزرسانی اطلاعات دکمه افزودن به سبد خرید
 * @param {string} id - شناسه محصول
 * @param {string} name - نام محصول
 * @param {string} price - قیمت محصول
 * @param {string} image - آدرس تصویر محصول
 */
function updateAddToCartButtons(id, name, price, image) {
    const addToCartButtons = document.querySelectorAll(".add-to-cart")

    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach((button) => {
            button.dataset.id = id
            button.dataset.name = name
            button.dataset.price = price
            button.dataset.image = image // اضافه کردن تصویر به دکمه
        })
    } else {
        console.error("هیچ دکمه add-to-cart یافت نشد")
    }
}

/**
 * مدیریت اکشن‌های سبد خرید
 * @param {Event} event - رویداد کلیک
 */
function handleCartActions(event) {
    const target = event.target

    if (target.classList.contains("add-to-cart")) {
        handleAddToCartAction(event, target)
    } else if (target.classList.contains("change-quantity")) {
        event.preventDefault()
        const productId = target.dataset.id
        const delta = Number.parseInt(target.dataset.delta)
        changeQuantity(productId, delta)
    } else if (target.classList.contains("remove-item")) {
        event.preventDefault()
        const productId = target.dataset.id
        removeItem(productId)
    }
}

/**
 * مدیریت اکشن افزودن به سبد خرید
 * @param {Event} event - رویداد کلیک
 * @param {HTMLElement} target - عنصر هدف
 */
/**
 * مدیریت کلیک روی دکمه افزودن به سبد خرید
 * @param {Event} event - رویداد کلیک
 */
function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedProduct) {
        // گرفتن اطلاعات محصول پیش‌فرض (پک طلایی) از DOM
        const defaultProductElement = document.querySelector(".product-image.selected-product");

        if (defaultProductElement) {
            selectedProduct = {
                id: defaultProductElement.dataset.id,
                name: defaultProductElement.dataset.name,
                description: defaultProductElement.dataset.description || "",
                price: parsePrice(defaultProductElement.dataset.price),
                image: defaultProductElement.dataset.image || defaultProductElement.src,
            };

            // افزودن محصول پیش‌فرض به سبد خرید
            addToCart(selectedProduct.id, selectedProduct.name, selectedProduct.price, selectedProduct.image);

            // باز کردن offcanvas
            const offcanvasElement = document.getElementById("offcanvasRight");
            if (offcanvasElement) {
                const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
                offcanvas.show();
            }
        } else {
            console.error("محصول پیش‌فرض یافت نشد!");
        }

        return; // توقف اجرای تابع
    }

    // افزودن محصول انتخاب‌شده به سبد خرید
    addToCart(selectedProduct.id, selectedProduct.name, selectedProduct.price, selectedProduct.image);

    // باز کردن offcanvas
    const offcanvasElement = document.getElementById("offcanvasRight");
    if (offcanvasElement) {
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
        offcanvas.show();
    }
}
/**
 * اضافه کردن محصول به سبد خرید
 * @param {string} productId - شناسه محصول
 * @param {string} productName - نام محصول
 * @param {number} productPrice - قیمت محصول
 * @param {string} productImage - آدرس تصویر محصول
 */
function addToCart(productId, productName, productPrice, productImage) {
    // بررسی تصویر محصول انتخاب شده
    const finalImageUrl = selectedProduct.image

    // اگر تصویر وجود ندارد
    if (!finalImageUrl || finalImageUrl === "gold" || finalImageUrl === "@Model.First().ImageUrl") {
        alert("لطفاً ابتدا روی یکی از محصولات کلیک کنید")
        return // توقف اجرای تابع اگر تصویر معتبر نیست
    }

    // استفاده از اطلاعات محصول انتخاب شده به جای پارامترهای تابع
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const product = cart.find((item) => item.id === selectedProduct.id)

    if (product) {
        product.quantity++
    } else {
        cart.push({
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            image: finalImageUrl,
            quantity: 1,
        })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCart()
}

/**
 * به‌روزرسانی سبد خرید در مدال
 */
function updateCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const cartItemsContainer = document.getElementById("cart-items")
    const totalPriceElement = document.getElementById("total-price")

    if (!cartItemsContainer || !totalPriceElement) {
        console.error("عناصر سبد خرید یافت نشد")
        return
    }

    let totalPrice = 0
    cartItemsContainer.innerHTML = ""

    cart.forEach((item) => {
        const listItem = document.createElement("li")
        listItem.classList.add("cart-item")
        listItem.setAttribute("data-id", item.id)
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="product image" class="product-image">
                <div class="cart-item-details ms-3">
                    <h6 class="mb-0">${item.name}</h6>
                    <p> ${item.price.toLocaleString()} ${item.quantity} x</p>
                    <div class="btn-container">
                        <button class="btn btn-outline-secondary btn-sm change-quantity" data-id="${item.id}" data-delta="-1">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn btn-outline-secondary btn-sm change-quantity" data-id="${item.id}" data-delta="1">+</button>
                    </div>
                </div>
                <button class="delete-btn btn btn-sm btn-danger ms-auto remove-item" data-id="${item.id}">حذف</button>
            </div>
        `
        cartItemsContainer.appendChild(listItem)
        totalPrice += item.price * item.quantity
    })

    totalPriceElement.textContent = ` ${totalPrice.toLocaleString()} تومان`
}

/**
 * تغییر تعداد محصول
 * @param {string} productId - شناسه محصول
 * @param {number} delta - مقدار تغییر (مثبت یا منفی)
 */
function changeQuantity(productId, delta) {
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    const product = cart.find((item) => item.id === productId)

    if (product) {
        product.quantity += delta

        if (product.quantity < 1) {
            cart = cart.filter((item) => item.id !== productId)
        }

        localStorage.setItem("cart", JSON.stringify(cart))
        updateCart()
    }
}

/**
 * حذف محصول از سبد خرید
 * @param {string} productId - شناسه محصول
 */
function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    cart = cart.filter((item) => item.id !== productId)

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCart()
}

/**
 * تنظیم اطلاعات دکمه افزودن به سبد خرید از مدل
 * اضافه شده از اسکریپت HTML
 */
function setupAddToCartButtonFromModel() {
    const addToCartButton = document.querySelector(".add-to-cart")

    if (addToCartButton) {
        // اطلاعات از مدل در HTML قرار داده شده است
        // ما فقط مطمئن می‌شویم که تصویر به درستی تنظیم شده است

        const firstProductImage = document.querySelector(".product-image")

        if (firstProductImage && firstProductImage.src) {
            addToCartButton.dataset.image = firstProductImage.src
        } else {
            const mainImage = document.querySelector(".product-slider-thumb img.bg-img")

            if (mainImage && mainImage.src) {
                addToCartButton.dataset.image = mainImage.src
            }
        }
    }
}

function loadFeedBacks() {
    $.ajax({
        type: "GET",
        url: "/FeedBack/GetFeedBacks", // آدرس API برای دریافت بازخوردها
        success: (data) => {
            if (data.isSuccess) {
                renderFeedBacks(data.data) // نمایش بازخوردها
            } else {
                toastr.error(data.message) // نمایش خطا
            }
        },
        error: (xhr, status, error) => {
            console.error("Error:", error)
            console.error("Status:", status)
            console.error("Response:", xhr.responseText)
            toastr.error("خطا در دریافت لیست بازخوردها!")
        },
    })
}

function renderFeedBacks(feedBacks) {
    var feedbacksHtml = ""
    feedBacks.forEach((item) => {
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
                        ${isAdmin ? `<button class="btn btn-sm btn-danger btn-delete" data-id="${item.id}">حذف</button>` : ""}
                    </div>
                    <img class="img-fluid" src="/assets/images/user/Default.jpeg" alt="">
                </div>
            </div>
        `
    })
    $(".feadback-box").html(feedbacksHtml)

    // اگر Swiper قبلاً initialize شده، آن را از بین ببر
    if (window.mySwiper) {
        window.mySwiper.destroy()
    }

    // Initialize Swiper با تنظیمات جدید
    window.mySwiper = new Swiper(".our-testimonials", {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        centeredSlides: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            992: {
                slidesPerView: 2,
                spaceBetween: 40,
            },
        },
    })
}

/**
 * مدیریت بازخوردها
 */
function initializeFeedBacks() {
    loadFeedBacks()

    // مدیریت دکمه ثبت بازخورد
    $("#btn_submit")
        .off("click")
        .on("click", () => {
            saveFeedBack()
        })

    // مدیریت دکمه‌های حذف بازخورد
    $(document).on("click", ".btn-delete", function () {
        var id = $(this).data("id")
        if (confirm("آیا از حذف این بازخورد مطمئن هستید؟")) {
            deleteFeedBack(id)
        }
    })

    // بستن مدال افزودن بازخورد
    $("#add_feedBack_close").on("click", () => {
        $("#addfeedback").modal("hide")
    })
}

/**
 * ذخیره بازخورد جدید
 */
/**
 * ذخیره بازخورد جدید
 */
function saveFeedBack() {
    if (!validationFeedBack()) {
        toastr.error("لطفاً اطلاعات را به درستی وارد کنید.")
        return
    }

    const entity = {
        customerName: $("#CustomerName").val(),
        feedBackText: $("#FeedBackText").val(),
    }

    $.ajax({
        type: "POST",
        url: "/FeedBack/AddFeedBack",
        contentType: "application/json",
        data: JSON.stringify(entity),
        success: (data) => {
            if (data.isSuccess) {
                toastr.success(data.message)

                // پاکسازی فیلدهای ورودی به جای بستن مدال
                $("#CustomerName").val("")
                $("#FeedBackText").val("")

                // به‌روزرسانی بازخوردها
                loadFeedBacks()
            } else {
                toastr.error(data.message)
            }
        },
        error: (xhr, status, error) => {
            toastr.error("خطا در ارسال اطلاعات به سرور!")
        },
    })
}
/**
 * حذف بازخورد
 */
function deleteFeedBack(id) {
    if (!id) {
        toastr.error("شناسه بازخورد معتبر نیست.")
        return
    }

    $.ajax({
        type: "POST",
        url: "/FeedBack/DeleteFeedBack",
        contentType: "application/json",
        data: JSON.stringify({ id: id }),
        success: (data) => {
            if (data.isSuccess) {
                toastr.success(data.message)
                loadFeedBacks()
            } else {
                toastr.error(data.message)
            }
        },
        error: (xhr, status, error) => {
            toastr.error("خطا در حذف بازخورد!")
        },
    })
}

/**
 * اعتبارسنجی فرم بازخورد
 */
function validationFeedBack() {
    var name = $("#CustomerName").val()
    var feedbackText = $("#FeedBackText").val()

    var isValid = true

    if (!name) {
        isValid = false
        $("#Name_error").fadeIn()
    } else {
        $("#Name_error").fadeOut()
    }

    if (!feedbackText) {
        isValid = false
        $("#Feedback_error").fadeIn()
    } else {
        $("#Feedback_error").fadeOut()
    }

    return isValid
}

// افزودن به تابع اصلی برای مدیریت بازخوردها
document.addEventListener("DOMContentLoaded", () => {
    initializeCart()
    initializeFeedBacks()
})
