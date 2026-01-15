/* =========================================
   SENIOR SHOP - LOGIC RESTORED
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
};

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

/* --- CART FUNCTIONS --- */
function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    cart.push({ name: name, price: price, img: img });
    localStorage.setItem('seniorCart', JSON.stringify(cart));
    updateCartCount();
    alert(name + " added to cart!");
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
                <button onclick="removeItem(${index})" class="text-red-600 font-bold hover:underline">Remove</button>
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

/* --- ORDER & TRACKING --- */
function placeOrder(e) {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('seniorCart')) || [];
    if(cart.length === 0) return alert("Cart is empty");
    
    const order = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        items: cart.length,
        total: document.getElementById('total-price').innerText
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(order));
    let history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    history.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(history));
    localStorage.removeItem('seniorCart');
    window.location.href = 'success.html';
}

function loadTrackingInfo() {
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    if(order) {
        document.getElementById('track-id').innerText = '#' + order.id;
        document.getElementById('track-date').innerText = order.date;
        document.getElementById('track-status').style.display = 'block';
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
                <div class="flex justify-between items-center">
                    <span>${order.items} Items</span>
                    <span class="font-bold text-xl">${order.total}</span>
                </div>
            </div>
        `;
    });
}
