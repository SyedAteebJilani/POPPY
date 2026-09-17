let cart = JSON.parse(localStorage.getItem('poppy_cart')) || [];
const FREE_SHIPPING_THRESHOLD = 2300;

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    const body = document.body;

    if (!sidebar) return;

    if (sidebar.classList.contains('translate-x-full')) {
        // Open Cart
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        body.classList.add('no-scroll');
    } else {
        // Close Cart
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        body.classList.remove('no-scroll');
    }
}

function addToCart(id, title, price, type, iconText) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, title, price, type, iconText, qty: 1 });
    }
    localStorage.setItem('poppy_cart', JSON.stringify(cart));
    updateCartUI();

    // Open cart automatically on add
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar && sidebar.classList.contains('translate-x-full')) {
        toggleCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('poppy_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTitle = document.getElementById('cart-title');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartIconCount = document.getElementById('cart-count');

    if (!cartItemsContainer) return;

    let totalQty = 0;
    let subtotal = 0;

    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalQty += item.qty;
        subtotal += (item.price * item.qty);

        // Determine styling based on product type
        let bgClass = "bg-[#CCFF00]";
        let textClass = "text-black";
        let priceClass = "text-black";
        let iconBg = "bg-black text-white";
        let crossBtn = "bg-black text-white hover:bg-red-500 hover:text-white";

        if (item.type === 'bundle') {
            bgClass = "bg-black";
            textClass = "text-[#CCFF00]";
            priceClass = "text-[#CCFF00]";
            iconBg = "bg-white text-black border border-white/20";
            crossBtn = "bg-white/10 text-white hover:bg-red-500 border border-white/20";
        } else if (item.type === 'gift') {
            bgClass = "bg-[#2E00A6]";
            textClass = "text-white";
            priceClass = "text-[#CCFF00]";
            iconBg = "bg-[#CCFF00] text-black text-lg";
            crossBtn = "bg-black/50 text-white hover:bg-red-500 border border-black";
        } else if (item.type === 'merch') {
            bgClass = "bg-white border-dashed";
            textClass = "text-black";
        }

        cartItemsContainer.innerHTML += `
            <div class="w-full border-[3px] border-black rounded-2xl p-2.5 flex items-center gap-3 ${bgClass} shadow-[3px_3px_0_0_#000] relative animate-[fadeIn_0.3s_ease-out]">
                <div class="${iconBg} min-w-[3.2rem] h-[3.2rem] rounded-xl flex items-center justify-center font-black text-[0.6rem] tracking-tighter shadow-inner">
                    ${item.iconText}
                </div>
                <div class="flex flex-col flex-grow ${textClass} leading-tight pr-6">
                    <span class="font-black text-[0.75rem] uppercase truncate w-[130px] sm:w-[150px]">${item.title}</span>
                    <span class="text-[0.6rem] font-bold opacity-80 mt-1">PKR ${item.price.toLocaleString()} • qty ${item.qty}</span>
                </div>
                <div class="font-black text-[0.8rem] pr-8 ${priceClass} shrink-0">PKR ${(item.price * item.qty).toLocaleString()}</div>
                <button class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 ${crossBtn} rounded-full flex items-center justify-center font-bold text-[0.6rem] transition-colors" onclick="removeFromCart('${item.id}')">✕</button>
            </div>
        `;
    });

    // Add Shipping & Promos if cart isn't empty
    if (cart.length > 0) {
        let away = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        let percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        let shippingText = away > 0 ? `FREE SHIPPING • PKR ${away.toLocaleString()} AWAY` : `FREE SHIPPING UNLOCKED! ⚡`;
        
        cartItemsContainer.innerHTML += `
            <div class="w-full border-[2px] border-dashed border-gray-300 rounded-2xl p-4 mt-2 bg-transparent relative">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[0.65rem] font-black uppercase tracking-widest text-black">${shippingText}</span>
                    <span class="text-[0.65rem] font-black text-black">${percent}%</span>
                </div>
                <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-black/10">
                    <div class="h-full bg-[#CCFF00] transition-all duration-500 ease-out" style="width: ${percent}%"></div>
                </div>
            </div>

            <div class="bg-black text-white rounded-2xl p-3 mt-1 flex justify-between items-center border-[2px] border-black shadow-[3px_3px_0_0_#000]">
                <span class="text-[0.7rem] font-black uppercase tracking-widest pl-2">PREPAID SAVE 10%</span>
                <span class="bg-[#CCFF00] text-black text-[0.6rem] font-black px-3 py-1.5 rounded-full uppercase">SADAPAY / UPI</span>
            </div>
            
            <div class="bg-white border-[2px] border-black rounded-2xl p-3 flex items-center gap-4 mt-1 shadow-[3px_3px_0_0_#000]">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">🛍️</div>
                <span class="text-[0.65rem] font-bold text-black uppercase leading-relaxed tracking-wide pr-2">
                    Custom POPPY bag with lime rope handles — your cart, but make it graffiti ★
                </span>
            </div>
        `;
    } else {
         cartItemsContainer.innerHTML = `
            <div class="flex-grow flex flex-col items-center justify-center text-center h-full opacity-60">
                <div class="text-5xl mb-4 grayscale">🛒</div>
                <h3 class="text-sm font-black text-black uppercase mb-2 tracking-widest">Your cart is empty</h3>
                <p class="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest">Time to sort those cravings.</p>
            </div>
         `;
    }
    
    if (cartTitle) cartTitle.innerText = `YOUR CHAOS CART (${totalQty})`;
    if (cartIconCount) {
        cartIconCount.innerText = totalQty;
        cartIconCount.classList.remove('scale-100');
        cartIconCount.classList.add('scale-150');
        setTimeout(() => {
            cartIconCount.classList.remove('scale-150');
            cartIconCount.classList.add('scale-100');
        }, 200);
    }
    if (cartSubtotal) cartSubtotal.innerText = `PKR ${subtotal.toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', updateCartUI);

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const body = document.body;
    
    if (!menu) return;
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        setTimeout(() => menu.classList.remove('opacity-0', 'translate-y-[-100%]'), 10);
        body.classList.add('no-scroll');
    } else {
        menu.classList.add('opacity-0', 'translate-y-[-100%]');
        setTimeout(() => menu.classList.add('hidden'), 300);
        body.classList.remove('no-scroll');
    }
}