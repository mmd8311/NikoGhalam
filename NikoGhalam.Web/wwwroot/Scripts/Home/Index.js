// تابع اصلی برای اضافه کردن event listeners

function initializeCart() {
    console.log("تابع initializeCart اجرا شد");
    updateCart();
    document.addEventListener('click', handleCartActions);

    // اضافه کردن event listener به تمام تصاویر محصول با روش متفاوت
    addProductImageListeners();

    // نمایش اطلاعات اولین محصول به صورت پیش‌فرض
    const firstImage = document.querySelector('.product-image');
    if (firstImage) {
        console.log("تصویر اول پیدا شد:", firstImage);
        // استفاده از setTimeout برای اطمینان از اجرای کامل DOM
        setTimeout(() => {
            displayProductDetails({ target: firstImage });
        }, 100);
    } else {
        console.error("هیچ تصویری با کلاس product-image پیدا نشد");
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // جلوگیری از رفتار پیش‌فرض لینک
            const targetId = this.getAttribute('href'); // دریافت آی‌دی بخش مورد نظر
            const targetElement = document.querySelector(targetId); // یافتن عنصر هدف
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth', // اسکرول نرم
                    block: 'start' // موقعیت اسکرول
                });
            }
        });
    });
}

// تابع جدید برای اضافه کردن event listener به تصاویر
function addProductImageListeners() {
    const productImages = document.querySelectorAll('.product-image');
    console.log(`تعداد ${productImages.length} تصویر محصول پیدا شد`);

    productImages.forEach((image, index) => {
        console.log(`اضافه کردن event listener به تصویر ${index + 1}:`, image);

        // حذف event listener های قبلی برای جلوگیری از تکرار
        image.removeEventListener('click', displayProductDetails);

        // اضافه کردن event listener جدید
        image.addEventListener('click', function (event) {
            console.log(`تصویر ${index + 1} کلیک شد`);
            displayProductDetails(event);
        });

        // اضافه کردن استایل برای نشان دادن قابل کلیک بودن
        image.style.cursor = 'pointer';
        image.title = 'برای مشاهده جزئیات کلیک کنید';

        // بررسی data attributes
        if (!image.dataset.id || !image.dataset.name || !image.dataset.price) {
            console.warn(`تصویر ${index + 1} فاقد data attributes لازم است`);
        }
    });

    // اضافه کردن event listener به تصاویر داخل اسلایدر Swiper
    const swiperSlides = document.querySelectorAll('.swiper-slide img');
    console.log(`تعداد ${swiperSlides.length} تصویر در اسلایدر پیدا شد`);

    swiperSlides.forEach((image, index) => {
        // اضافه کردن کلاس product-image اگر ندارد
        if (!image.classList.contains('product-image')) {
            image.classList.add('product-image');
        }

        // کپی کردن data attributes از parent به تصویر اگر وجود ندارد
        const slide = image.closest('.swiper-slide');
        if (slide && slide.dataset.id && !image.dataset.id) {
            image.dataset.id = slide.dataset.id;
            image.dataset.name = slide.dataset.name;
            image.dataset.description = slide.dataset.description;
            image.dataset.price = slide.dataset.price;
        }

        image.removeEventListener('click', displayProductDetails);
        image.addEventListener('click', function (event) {
            console.log(`تصویر اسلایدر ${index + 1} کلیک شد`);
            event.stopPropagation(); // جلوگیری از انتشار رویداد به parent
            displayProductDetails(event);
        });

        image.style.cursor = 'pointer';
    });
}

// تابع برای نمایش جزئیات محصول
function displayProductDetails(event) {
    console.log("تابع displayProductDetails فراخوانی شد");
    const target = event.target;
    console.log("عنصر کلیک شده:", target);

    // بررسی وجود data attributes
    if (!target.dataset.id || !target.dataset.name || !target.dataset.price) {
        console.error('اطلاعات محصول در تصویر وجود ندارد:', target.dataset);

        // تلاش برای یافتن data attributes در parent
        const parent = target.closest('[data-id][data-name][data-price]');
        if (parent) {
            console.log("اطلاعات در parent یافت شد، استفاده از آن");
            displayProductDetailsFromElement(parent);
            return;
        }

        return;
    }

    displayProductDetailsFromElement(target);
}

// تابع جدید برای استخراج و نمایش اطلاعات از یک عنصر
function displayProductDetailsFromElement(element) {
    const productId = element.dataset.id;
    const productName = element.dataset.name;
    const productDescription = element.dataset.description || '';
    const productPrice = element.dataset.price;

    console.log("اطلاعات محصول:", {
        id: productId,
        name: productName,
        description: productDescription,
        price: productPrice
    });

    // اضافه کردن کلاس active به تصویر انتخاب شده و حذف از بقیه
    document.querySelectorAll('.product-image').forEach(img => {
        img.classList.remove('active-image');
    });
    element.classList.add('active-image');

    // به‌روزرسانی اطلاعات محصول در صفحه
    const nameElement = document.getElementById('product-name');
    const descriptionElement = document.getElementById('product-description');
    const priceElement = document.getElementById('product-price');

    if (nameElement) {
        console.log("به‌روزرسانی نام محصول:", productName);
        nameElement.textContent = productName;
    } else {
        console.error("عنصر product-name یافت نشد");
    }

    if (descriptionElement) {
        console.log("به‌روزرسانی توضیحات محصول");
        descriptionElement.textContent = productDescription;
    } else {
        console.error("عنصر product-description یافت نشد");
    }

    if (priceElement) {
        console.log("به‌روزرسانی قیمت محصول:", productPrice);
        priceElement.textContent = productPrice + ' تومان';
    } else {
        console.error("عنصر product-price یافت نشد");
    }

    // به‌روزرسانی اطلاعات دکمه افزودن به سبد خرید
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        console.log("به‌روزرسانی دکمه‌های افزودن به سبد خرید");
        addToCartButtons.forEach(button => {
            button.dataset.id = productId;
            button.dataset.name = productName;
            button.dataset.price = productPrice;
        });
    } else {
        console.error("هیچ دکمه add-to-cart یافت نشد");
    }

    // به‌روزرسانی تصویر بزرگ محصول (اگر وجود داشته باشد)
    const mainProductImage = document.querySelector('.product-slider-thumb img.bg-img');
    if (mainProductImage && element.src) {
        console.log("به‌روزرسانی تصویر اصلی محصول");
        mainProductImage.src = element.src;
    }
}

// اضافه کردن استایل برای تصویر انتخاب شده
document.head.insertAdjacentHTML('beforeend', `
    <style>
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
    </style>
`);

// تابع برای مدیریت اکشن‌های سبد خرید
function handleCartActions(event) {
    const target = event.target;

    if (target.classList.contains('add-to-cart')) {
        event.preventDefault();
        const productId = target.dataset.id;
        const productName = target.dataset.name;
        const productPrice = parseFloat(target.dataset.price);
        const productImage = target.dataset.image;
        addToCart(productId, productName, productPrice, productImage);
    } else if (target.classList.contains('change-quantity')) {
        event.preventDefault();
        const productId = target.dataset.id;
        const delta = parseInt(target.dataset.delta);
        changeQuantity(productId, delta);
    } else if (target.classList.contains('remove-item')) {
        event.preventDefault();
        const productId = target.dataset.id;
        removeItem(productId);
    }
}
// اضافه کردن محصول به سبد خرید
function addToCart(productId, productName, productPrice, productImage) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let product = cart.find(item => item.id === productId);

    if (product) {
        product.quantity++;
    } else {
        cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// به‌روزرسانی سبد خرید در مدال

function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('cart-item');
        listItem.setAttribute('data-id', item.id);
        listItem.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="product image" class="product-image">
                <div class="cart-item-details ms-3">
                    <h6 class="mb-0">${item.name}</h6>
                    <p>تومان ${item.price.toLocaleString()} x ${item.quantity}</p>
                    <div class="btn-container">
                        <button class="btn btn-outline-secondary btn-sm change-quantity" data-id="${item.id}" data-delta="-1">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn btn-outline-secondary btn-sm change-quantity" data-id="${item.id}" data-delta="1">+</button>
                    </div>
                </div>
                <button class="delete-btn btn btn-sm btn-danger ms-auto remove-item" data-id="${item.id}">حذف</button>
            </div>
        `;
        cartItemsContainer.appendChild(listItem);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = `تومان ${totalPrice.toLocaleString()}`;
}

// تغییر تعداد محصول
function changeQuantity(productId, delta) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let product = cart.find(item => item.id === productId);

    if (product) {
        product.quantity += delta;

        if (product.quantity < 1) {
            cart = cart.filter(item => item.id !== productId);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
}

// حذف محصول از سبد خرید
function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// اجرای تابع اصلی هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', initializeCart);