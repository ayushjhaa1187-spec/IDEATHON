/* =========================================
   SENIOR SHOP - ENHANCED ACCESSIBILITY
   ========================================= */

// 1. GLOBAL SETTINGS ON LOAD
window.onload = function() {
    updateCartCount();
    // Restore settings
    if(localStorage.getItem('contrast') === 'high') toggleContrast(true);
    if(localStorage.getItem('text') === 'large') toggleTextSize('large');
    if(localStorage.getItem('text') === 'small') toggleTextSize('small');
    
    // Page specific loads
    if (window.location.pathname.includes('cart.html')) renderCartPage();
    if (window.location.pathname.includes('tracking.html')) loadTrackingInfo();
    if (window.location.pathname.includes('orders.html')) loadOrderHistory();
    if (window.location.pathname.includes('payment.html')) loadPaymentPage();
    
    // Initialize keyboard navigation
    initKeyboardNav();
    
    // Show order tracking button if there's a recent order
    showOrderTrackingButton();
};

/* --- KEYBOARD NAVIGATION --- */
function initKeyboardNav() {
    let focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let allFocusable = document.querySelectorAll(focusableElements);
    
    // Skip to main content with keyboard
    document.addEventListener('keydown', function(e) {
        // Ctrl+M to skip to main content
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            let mainContent = document.getElementById('main-content');
            if (mainContent) mainContent.focus();
        }
    });
}

/* --- PAGE READER FEATURE --- */
let speechSynth = window.speechSynthesis;
let isReading = false;
let currentUtterance = null;

function readPage() {
    if (isReading) {
        speechSynth.cancel();
        isReading = false;
        let btn = document.querySelector('[onclick="readPage()"]');
        if (btn) btn.innerHTML = '<span>🔊</span> Read Page';
        return;
    }
    
    // Get main content
    let content = '';
    let mainContent = document.getElementById('main-content') || document.body;
    
    // Extract text from headings and paragraphs
    let headings = mainContent.querySelectorAll('h1, h2, h3');
    let paragraphs = mainContent.querySelectorAll('p');
    
    headings.forEach(h => content += h.innerText + '. ');
    paragraphs.forEach(p => content += p.innerText + '. ');
    
    if (content.trim() === '') {
        content = 'No readable content found on this page.';
    }
    
    currentUtterance = new SpeechSynthesisUtterance(content);
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    
    currentUtterance.onend = function() {
        isReading = false;
        let btn = document.querySelector('[onclick="readPage()"]');
        if (btn) btn.innerHTML = '<span>🔊</span> Read Page';
    };
    
    speechSynth.speak(currentUtterance);
    isReading = true;
    
    let btn = document.querySelector('[onclick="readPage()"]');
    if (btn) btn.innerHTML = '<span>⏸</span> Stop Reading';
}

/* --- TOP BAR TOOLS --- */
function toggleContrast(force = false) {
    const body = document.body;
    if (force || !body.classList.contains('high-contrast')) {
        body.classList.add('high-contrast');
        localStorage.setItem('contrast', 'high');
    } else {
        body.classList.remove('high-contrast');
        localStorage.setItem('contrast', 'normal');
    }
}

function toggleTextSize(size) {
    const html = document.documentElement;
    if (size === 'reset') {
        html.style.fontSize = '16px';
        localStorage.setItem('text', 'normal');
    } else if (size === 'large') {
        html.style.fontSize = '20px';
        localStorage.setItem('text', 'large');
    } else if (size === 'small') {
        html.style.fontSize = '14px';
        localStorage.setItem('text', 'small');
    }
}

/* --- CART FUNCTIONS (FIXED) --- */
function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    cart.push({ name: name, price: price, img: img });
    localStorage.setItem('seniorCart', JSON.stringify(cart));
    updateCartCount();
    
    announceToScreenReader(name + ' added to cart');
    showNotification(name + ' added to cart!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(el => el.innerText = cart.length);
}

function renderCartPage() {
    const container = document.getElementById('cart-items');
    const empty = document.getElementById('cart-empty');
    const summary = document.getElementById('cart-summary');
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    
    if(cart.length === 0) {
        if(empty) empty.style.display = 'block';
        if(container) container.style.display = 'none';
        if(summary) summary.style.display = 'none';
        return;
    }
    
    if(empty) empty.style.display = 'none';
    if(container) container.style.display = 'block';
    if(summary) summary.style.display = 'block';
    
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        total += parseFloat(item.price);
        container.innerHTML += `
        <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow mb-4 border border-gray-200">
            <div class="flex items-center gap-4">
                <div class="h-16 w-16 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-500">IMG</div>
                <div>
                    <h3 class="font-bold text-xl">${item.name}</h3>
                    <p class="text-gray-600">$${item.price}</p>
                </div>
            </div>
            <button onclick="removeItem(${index})" class="text-red-600 font-bold hover:underline" aria-label="Remove ${item.name}">Remove</button>
        </div>
        `;
    });
    
    document.getElementById('total-price').innerText = '$' + total.toFixed(2);
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('seniorCart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

/* --- CHECKOUT WITH PAYMENT PAGE --- */
function proceedToPayment(e) {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    if(cart.length === 0) return alert('Cart is empty');
    
    const name = document.getElementById('name')?.value;
    const address = document.getElementById('address')?.value;
    const phone = document.getElementById('phone')?.value;
    
    if (!name || !address || !phone) {
        alert('Please fill all fields');
        return;
    }
    
    const checkoutData = { name, address, phone };
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    window.location.href = 'payment.html';
}

function loadPaymentPage() {
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
    
    if (!checkoutData) {
        window.location.href = 'cart.html';
        return;
    }
    
    let total = 0;
    cart.forEach(item => total += parseFloat(item.price));
    
    if (document.getElementById('payment-total')) {
        document.getElementById('payment-total').innerText = '$' + total.toFixed(2);
    }
}

function processPayment(method) {
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
    
    let total = 0;
    cart.forEach(item => total += parseFloat(item.price));
    
    const order = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        items: cart.length,
        total: '$' + total.toFixed(2),
        status: 'Order Placed',
        estimatedDelivery: getEstimatedDelivery(),
        customerInfo: checkoutData,
        paymentMethod: method
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(order));
    let history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    history.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(history));
    localStorage.removeItem('seniorCart');
    localStorage.removeItem('checkoutData');
    window.location.href = 'success.html';
}

function getEstimatedDelivery() {
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(delivery.getDate() + 3);
    return delivery.toLocaleDateString();
}

/* --- ORDER TRACKING --- */
function showOrderTrackingButton() {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder && !document.getElementById('track-order-btn')) {
        const header = document.querySelector('header .flex');
        if (header) {
            const trackBtn = document.createElement('a');
            trackBtn.id = 'track-order-btn';
            trackBtn.href = 'tracking.html';
            trackBtn.className = 'hover:text-yellow-400 font-bold underline';
            trackBtn.innerHTML = '📦 Track Order';
            trackBtn.setAttribute('aria-label', 'Track your recent order');
            
            const voiceBtn = header.querySelector('button');
            if (voiceBtn && voiceBtn.parentNode) {
                voiceBtn.parentNode.insertBefore(trackBtn, voiceBtn);
            }
        }
    }
}

function loadTrackingInfo() {
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    if(order) {
        if (document.getElementById('track-id')) {
            document.getElementById('track-id').innerText = '#' + order.id;
        }
        if (document.getElementById('track-date')) {
            document.getElementById('track-date').innerText = order.date;
        }
        if (document.getElementById('track-status')) {
            document.getElementById('track-status').style.display = 'block';
        }
        if (document.getElementById('estimated-delivery') && order.estimatedDelivery) {
            document.getElementById('estimated-delivery').innerText = 'Estimated Delivery: ' + order.estimatedDelivery;
        }
    }
}

function loadOrderHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const container = document.getElementById('history-container');
    if(!container) return;
    
    if(history.length === 0) {
        container.innerHTML = '<p class="text-center text-xl text-gray-500 mt-10">No past orders.</p>';
        return;
    }
    
    container.innerHTML = '';
    history.forEach(order => {
        container.innerHTML += `
        <div class="bg-white p-6 rounded-xl shadow mb-4 border border-gray-200">
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-[#208090]">Order #${order.id}</span>
                <span class="text-gray-500">${order.date}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
                <span>${order.items} Items</span>
                <span class="font-bold text-xl">${order.total}</span>
            </div>
            <div class="mt-2">
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">${order.status}</span>
            </div>
        </div>
        `;
    });
}

/* --- UTILITY FUNCTIONS --- */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
