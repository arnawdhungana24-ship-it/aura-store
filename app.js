/**
 * AURA — E-Commerce Core Application Logic
 * Powered by Vanilla JavaScript (ES6+) & LocalStorage Persistence
 */

const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    NPR: { symbol: 'रु', rate: 134.50 }
};

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        title: "AeroSound Pro Wireless Headphones",
        category: "tech",
        price: 299.00,
        rating: 4.9,
        reviewsCount: 128,
        stock: 18,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        description: "Studio-grade wireless audio featuring active noise cancellation, custom acoustic drivers, 40-hour battery life, and ultra-soft memory foam ear cushions."
    },
    {
        id: 2,
        title: "Minimalist Chronograph Watch",
        category: "accessories",
        price: 185.00,
        rating: 4.8,
        reviewsCount: 94,
        stock: 12,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        description: "Precision Swiss quartz movement encapsulated in a sapphire glass casing with an interchangeable full-grain Italian leather strap."
    },
    {
        id: 3,
        title: "Crafted Ceramic Pour-Over Set",
        category: "home",
        price: 64.00,
        rating: 4.7,
        reviewsCount: 52,
        stock: 30,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        description: "Handcrafted matte ceramic coffee dripper and glass carafe engineered for perfect thermal extraction and minimalist countertop elegance."
    },
    {
        id: 4,
        title: "Ultra-Light Organic Cotton Hoodie",
        category: "apparel",
        price: 98.00,
        rating: 4.9,
        reviewsCount: 210,
        stock: 25,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        description: "Sustainably harvested 100% heavy organic cotton fleece. Tailored relaxed fit designed for versatile daily wear."
    },
    {
        id: 5,
        title: "Ergonomic Mechanical Keyboard",
        category: "tech",
        price: 220.00,
        rating: 5.0,
        reviewsCount: 76,
        stock: 8,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        description: "Anodized aluminum body with custom hot-swappable tactile switches, frosted RGB backlighting, and bluetooth multi-device pairing."
    },
    {
        id: 6,
        title: "Leather Executive Weekender Bag",
        category: "accessories",
        price: 340.00,
        rating: 4.8,
        reviewsCount: 41,
        stock: 5,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        description: "Full-grain vegetable-tanned leather weekender with dedicated padded laptop compartment, brass hardware, and waterproof base."
    },
    {
        id: 7,
        title: "Smart Ambient Sunset Lamp",
        category: "home",
        price: 75.00,
        rating: 4.6,
        reviewsCount: 88,
        stock: 20,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        description: "Optical crystal glass lens generating atmospheric sunset gradients controlled via smartphone or touch sensor."
    },
    {
        id: 8,
        title: "Merino Wool Everyday Blazer",
        category: "apparel",
        price: 280.00,
        rating: 4.7,
        reviewsCount: 35,
        stock: 10,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
        description: "Wrinkle-resistant breathable Australian Merino wool structure. Unstructured design suited for both formal and casual settings."
    }
];

class AuraApp {
    constructor() {
        this.products = this.loadData('aura_products', DEFAULT_PRODUCTS);
        this.cart = this.loadData('aura_cart', []);
        this.wishlist = this.loadData('aura_wishlist', []);
        this.orders = this.loadData('aura_orders', [
            {
                id: "ORD-9281",
                customer: "Arnaw Dhungana",
                items: "AeroSound Pro Wireless Headphones (x1)",
                total: 322.92,
                date: "2026-10-20",
                status: "Shipped"
            }
        ]);
        
        this.currency = 'USD';
        this.activeCategory = 'all';
        this.searchTerm = '';
        this.sortMode = 'featured';
        this.promoDiscount = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCatalog();
        this.updateCartUI();
        this.updateWishlistUI();
        this.renderAdminOverview();
        this.renderAdminProducts();
        this.renderAdminOrders();
    }

    bindEvents() {
        document.getElementById('currency-select').addEventListener('change', (e) => {
            this.currency = e.target.value;
            this.renderCatalog();
            this.updateCartUI();
            this.updateWishlistUI();
            this.showToast(`Currency updated to ${this.currency}`);
        });
    }

    loadData(key, fallback) {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    }

    saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    formatPrice(usdAmount) {
        const curr = CURRENCIES[this.currency];
        const converted = usdAmount * curr.rate;
        return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    navigateTo(viewName) {
        document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
        if (viewName === 'store') {
            document.getElementById('view-storefront').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (viewName === 'admin') {
            document.getElementById('view-admin').classList.remove('hidden');
            this.renderAdminOverview();
            this.renderAdminProducts();
            this.renderAdminOrders();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    scrollToCatalog() {
        document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        const icon = document.querySelector('#theme-btn .btn-icon');
        if (icon) icon.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
        this.showToast(`Switched to ${nextTheme} mode`);
    }

    filterCategory(category, element = null) {
        this.activeCategory = category;
        if (element) {
            document.querySelectorAll('#category-pills .pill-btn').forEach(btn => btn.classList.remove('active'));
            element.classList.add('active');
        }
        this.renderCatalog();
    }

    handleSearch(query) {
        this.searchTerm = query.trim().toLowerCase();
        const clearBtn = document.getElementById('search-clear-btn');
        if (this.searchTerm.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        this.renderCatalog();
    }

    clearSearch() {
        const input = document.getElementById('global-search');
        input.value = '';
        this.searchTerm = '';
        document.getElementById('search-clear-btn').classList.add('hidden');
        this.renderCatalog();
    }

    handleSort(mode) {
        this.sortMode = mode;
        this.renderCatalog();
    }

    getFilteredProducts() {
        let list = [...this.products];

        if (this.activeCategory !== 'all') {
            list = list.filter(p => p.category === this.activeCategory);
        }

        if (this.searchTerm) {
            list = list.filter(p => 
                p.title.toLowerCase().includes(this.searchTerm) || 
                p.description.toLowerCase().includes(this.searchTerm)
            );
        }

        if (this.sortMode === 'price-low') {
            list.sort((a, b) => a.price - b.price);
        } else if (this.sortMode === 'price-high') {
            list.sort((a, b) => b.price - a.price);
        } else if (this.sortMode === 'rating') {
            list.sort((a, b) => b.rating - a.rating);
        }

        return list;
    }

    renderCatalog() {
        const grid = document.getElementById('product-grid');
        const items = this.getFilteredProducts();

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-muted);">
                    <p style="font-size: 2rem; margin-bottom: 12px;">🔍</p>
                    <h3>No products found matching your search.</h3>
                    <p>Try clearing filters or searching for something else.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(p => {
            const isWishlist = this.wishlist.includes(p.id);
            return `
                <div class="product-card">
                    <div class="product-thumb-container" onclick="app.openProductModal(${p.id})">
                        <img class="product-thumb" src="${p.image}" alt="${p.title}" loading="lazy">
                        <button class="wishlist-toggle-btn ${isWishlist ? 'active' : ''}" 
                                onclick="event.stopPropagation(); app.toggleWishlist(${p.id})" 
                                title="Add to Wishlist">
                            ${isWishlist ? '♥' : '♡'}
                        </button>
                    </div>
                    <div class="product-card-body">
                        <span class="product-cat-tag">${p.category}</span>
                        <h3 class="product-title" onclick="app.openProductModal(${p.id})">${p.title}</h3>
                        <div class="rating-stars">
                            ★ ${p.rating.toFixed(1)} <span class="rating-count">(${p.reviewsCount})</span>
                        </div>
                        <div class="product-card-footer">
                            <span class="product-price">${this.formatPrice(p.price)}</span>
                            <button class="btn btn-primary btn-sm" onclick="app.addToCart(${p.id})">+ Cart</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openProductModal(productId) {
        const p = this.products.find(x => x.id === productId);
        if (!p) return;

        const body = document.getElementById('product-modal-body');
        body.innerHTML = `
            <div class="product-modal-gallery">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="product-modal-info">
                <span class="product-cat-tag">${p.category.toUpperCase()}</span>
                <h2 style="font-size: 1.8rem; margin: 8px 0;">${p.title}</h2>
                <div class="rating-stars" style="margin-bottom: 16px;">
                    ★ ${p.rating} • ${p.reviewsCount} Customer Reviews • <span style="color: #34c759; font-weight:600;">In Stock (${p.stock} units)</span>
                </div>
                <div style="font-size: 2rem; font-weight: 800; color: var(--accent); margin-bottom: 16px;">
                    ${this.formatPrice(p.price)}
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">${p.description}</p>
                <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                    <input type="number" id="modal-qty" value="1" min="1" max="${p.stock}" style="width: 70px; padding: 10px; border-radius: var(--radius-md); border:1px solid var(--border-color); text-align: center;">
                    <button class="btn btn-primary btn-lg" style="flex:1;" onclick="app.addToCartFromModal(${p.id})">Add to Shopping Cart</button>
                </div>
                <div style="border-top: 1px solid var(--border-color); padding-top: 16px; font-size: 0.85rem; color: var(--text-muted);">
                    ✔ Authenticity Guaranteed &nbsp;&nbsp; ✔ 30-Day Risk Free Returns
                </div>
            </div>
        `;

        document.getElementById('product-modal-overlay').classList.add('active');
    }

    closeProductModal() {
        document.getElementById('product-modal-overlay').classList.remove('active');
    }

    addToCartFromModal(productId) {
        const qty = parseInt(document.getElementById('modal-qty').value) || 1;
        this.addToCart(productId, qty);
        this.closeProductModal();
    }

    toggleWishlist(productId) {
        const idx = this.wishlist.indexOf(productId);
        if (idx > -1) {
            this.wishlist.splice(idx, 1);
            this.showToast('Removed from Wishlist');
        } else {
            this.wishlist.push(productId);
            this.showToast('Saved to Wishlist ♥');
        }
        this.saveData('aura_wishlist', this.wishlist);
        this.updateWishlistUI();
        this.renderCatalog();
        this.renderWishlistDrawerItems();
    }

    updateWishlistUI() {
        document.getElementById('wishlist-badge').textContent = this.wishlist.length;
        document.getElementById('wishlist-drawer-count').textContent = this.wishlist.length;
        this.renderWishlistDrawerItems();
    }

    renderWishlistDrawerItems() {
        const container = document.getElementById('wishlist-items-container');
        if (!container) return;

        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                    <p style="font-size: 2.5rem; margin-bottom: 8px;">♥</p>
                    <p>Your wishlist is currently empty.</p>
                </div>
            `;
            return;
        }

        const wishlistProducts = this.products.filter(p => this.wishlist.includes(p.id));
        container.innerHTML = wishlistProducts.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <button class="btn btn-sm btn-primary" onclick="app.addToCart(${item.id}); app.toggleWishlist(${item.id});">Move to Cart</button>
                        <button class="btn btn-sm btn-secondary" onclick="app.toggleWishlist(${item.id})">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openWishlistDrawer() {
        const drawer = document.getElementById('wishlist-drawer');
        const overlay = document.getElementById('wishlist-drawer-overlay');
        this.renderWishlistDrawerItems();
        drawer.classList.add('active');
        overlay.classList.add('active');
    }

    toggleWishlistDrawer() {
        const drawer = document.getElementById('wishlist-drawer');
        const overlay = document.getElementById('wishlist-drawer-overlay');
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    addAllWishlistToCart() {
        if (this.wishlist.length === 0) {
            this.showToast('Your wishlist is empty.');
            return;
        }
        this.wishlist.forEach(id => this.addToCart(id));
        this.wishlist = [];
        this.saveData('aura_wishlist', this.wishlist);
        this.updateWishlistUI();
        this.renderCatalog();
        this.toggleWishlistDrawer();
        this.toggleCartDrawer(true);
        this.showToast('All wishlist items moved to cart!');
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        this.saveData('aura_cart', this.cart);
        this.updateCartUI();
        this.showToast(`Added "${product.title}" to cart!`);
    }

    quickAdd(productId) {
        this.addToCart(productId);
        this.toggleCartDrawer(true);
    }

    updateCartQuantity(productId, delta) {
        const item = this.cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter(i => i.id !== productId);
        }

        this.saveData('aura_cart', this.cart);
        this.updateCartUI();
    }

    toggleCartDrawer(forceOpen = false) {
        const drawer = document.getElementById('cart-drawer');
        const overlay = document.getElementById('cart-drawer-overlay');
        if (forceOpen || !drawer.classList.contains('active')) {
            drawer.classList.add('active');
            overlay.classList.add('active');
        } else {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    applyPromoCode() {
        const input = document.getElementById('promo-input');
        const code = input.value.trim().toUpperCase();
        if (code === 'AURA20') {
            this.promoDiscount = 0.20;
            document.getElementById('promo-discount-row').style.display = 'flex';
            this.showToast('Promo Code AURA20 Applied (20% OFF)!');
        } else if (code === '') {
            this.promoDiscount = 0;
            document.getElementById('promo-discount-row').style.display = 'none';
        } else {
            this.showToast('Invalid Promo Code');
        }
        this.updateCartUI();
    }

    updateCartUI() {
        const totalItemsCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-badge').textContent = totalItemsCount;
        document.getElementById('cart-drawer-count').textContent = totalItemsCount;

        const container = document.getElementById('cart-items-container');
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                    <p style="font-size: 2.5rem; margin-bottom: 8px;">🛒</p>
                    <p>Your shopping cart is empty.</p>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img class="cart-item-img" src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                        <div class="cart-qty-ctrl">
                            <button class="cart-qty-btn" onclick="app.updateCartQuantity(${item.id}, -1)">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="app.updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        const rawSubtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = rawSubtotal * this.promoDiscount;
        const discountedSubtotal = rawSubtotal - discountAmount;
        const tax = discountedSubtotal * 0.08;
        
        const freeShippingThreshold = 150.0;
        let shipping = 0;
        if (discountedSubtotal < freeShippingThreshold && rawSubtotal > 0) {
            shipping = 15.0;
            const remaining = freeShippingThreshold - discountedSubtotal;
            document.getElementById('shipping-progress-text').textContent = `Add ${this.formatPrice(remaining)} more for FREE Express Shipping!`;
            const pct = Math.min(100, (discountedSubtotal / freeShippingThreshold) * 100);
            document.getElementById('shipping-progress-fill').style.width = `${pct}%`;
        } else if (rawSubtotal > 0) {
            document.getElementById('shipping-progress-text').textContent = `🎉 You unlocked FREE Express Shipping!`;
            document.getElementById('shipping-progress-fill').style.width = `100%`;
        } else {
            document.getElementById('shipping-progress-text').textContent = `Add $150.00 more to unlock Free Express Shipping!`;
            document.getElementById('shipping-progress-fill').style.width = `0%`;
        }

        const grandTotal = discountedSubtotal + tax + (rawSubtotal > 0 ? shipping : 0);

        document.getElementById('cart-subtotal').textContent = this.formatPrice(rawSubtotal);
        if (this.promoDiscount > 0) {
            document.getElementById('cart-discount').textContent = `-${this.formatPrice(discountAmount)}`;
        }
        document.getElementById('cart-tax').textContent = this.formatPrice(tax);
        document.getElementById('cart-shipping').textContent = rawSubtotal === 0 ? '$0.00' : (shipping === 0 ? 'FREE' : this.formatPrice(shipping));
        document.getElementById('cart-total').textContent = this.formatPrice(grandTotal);
        document.getElementById('checkout-final-total').textContent = this.formatPrice(grandTotal);
    }

    openCheckout() {
        if (this.cart.length === 0) {
            this.showToast('Please add items to your cart before checkout.');
            return;
        }
        this.toggleCartDrawer(false);
        document.getElementById('checkout-modal-overlay').classList.add('active');
    }

    closeCheckoutModal() {
        document.getElementById('checkout-modal-overlay').classList.remove('active');
    }

    processCheckout(event) {
        event.preventDefault();
        const name = document.getElementById('chk-name').value;
        const email = document.getElementById('chk-email').value;

        const rawSubtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = rawSubtotal * this.promoDiscount;
        const discountedSubtotal = rawSubtotal - discountAmount;
        const tax = discountedSubtotal * 0.08;
        const shipping = discountedSubtotal >= 150.0 ? 0 : 15.0;
        const grandTotalUSD = discountedSubtotal + tax + shipping;

        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderItemsSummary = this.cart.map(i => `${i.title} (x${i.quantity})`).join(', ');

        const newOrder = {
            id: orderId,
            customer: name,
            email: email,
            items: orderItemsSummary,
            total: grandTotalUSD,
            date: new Date().toISOString().split('T')[0],
            status: "Processing"
        };

        this.orders.unshift(newOrder);
        this.saveData('aura_orders', this.orders);

        const receiptBox = document.getElementById('receipt-details');
        receiptBox.innerHTML = `
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Recipient:</strong> ${name} (${email})</p>
            <p><strong>Total Paid:</strong> ${this.formatPrice(grandTotalUSD)}</p>
            <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">A confirmation receipt has been dispatched to your email address.</p>
        `;

        this.cart = [];
        this.saveData('aura_cart', this.cart);
        this.updateCartUI();

        this.closeCheckoutModal();
        document.getElementById('receipt-modal-overlay').classList.add('active');
    }

    closeReceiptModal() {
        document.getElementById('receipt-modal-overlay').classList.remove('active');
    }

    switchAdminTab(tabName, element) {
        document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
        element.classList.add('active');

        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    }

    renderAdminOverview() {
        const totalRevUSD = this.orders.reduce((sum, o) => sum + o.total, 0);
        document.getElementById('admin-revenue').textContent = this.formatPrice(totalRevUSD);
        document.getElementById('admin-order-count').textContent = this.orders.length;
        document.getElementById('admin-catalog-count').textContent = this.products.length;
        const aov = this.orders.length > 0 ? (totalRevUSD / this.orders.length) : 0;
        document.getElementById('admin-aov').textContent = this.formatPrice(aov);
    }

    renderAdminProducts() {
        const tbody = document.getElementById('admin-products-table-body');
        tbody.innerHTML = this.products.map(p => `
            <tr>
                <td><img class="admin-thumb" src="${p.image}" alt="${p.title}"></td>
                <td><strong>${p.title}</strong></td>
                <td><span class="product-cat-tag">${p.category}</span></td>
                <td>${this.formatPrice(p.price)}</td>
                <td>${p.stock} units</td>
                <td>★ ${p.rating}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="app.editAdminProduct(${p.id})">Edit</button>
                    <button class="btn btn-sm btn-secondary" style="color:#ff3b30;" onclick="app.deleteAdminProduct(${p.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderAdminOrders() {
        const tbody = document.getElementById('admin-orders-table-body');
        tbody.innerHTML = this.orders.map(o => `
            <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.customer}</td>
                <td style="max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${o.items}</td>
                <td>${this.formatPrice(o.total)}</td>
                <td>${o.date}</td>
                <td><span class="badge" style="background:#34c759;">${o.status}</span></td>
            </tr>
        `).join('');
    }

    openAddProductModal() {
        document.getElementById('admin-modal-title').textContent = "Add New Product";
        document.getElementById('admin-p-id').value = '';
        document.getElementById('admin-product-form').reset();
        document.getElementById('admin-product-modal').classList.add('active');
    }

    editAdminProduct(productId) {
        const p = this.products.find(x => x.id === productId);
        if (!p) return;

        document.getElementById('admin-modal-title').textContent = "Edit Product";
        document.getElementById('admin-p-id').value = p.id;
        document.getElementById('admin-p-title').value = p.title;
        document.getElementById('admin-p-category').value = p.category;
        document.getElementById('admin-p-price').value = p.price;
        document.getElementById('admin-p-stock').value = p.stock;
        document.getElementById('admin-p-rating').value = p.rating;
        document.getElementById('admin-p-image').value = p.image;
        document.getElementById('admin-p-desc').value = p.description;

        document.getElementById('admin-product-modal').classList.add('active');
    }

    closeAdminProductModal() {
        document.getElementById('admin-product-modal').classList.remove('active');
    }

    saveAdminProduct(event) {
        event.preventDefault();
        const idVal = document.getElementById('admin-p-id').value;
        const title = document.getElementById('admin-p-title').value;
        const category = document.getElementById('admin-p-category').value;
        const price = parseFloat(document.getElementById('admin-p-price').value);
        const stock = parseInt(document.getElementById('admin-p-stock').value);
        const rating = parseFloat(document.getElementById('admin-p-rating').value);
        const image = document.getElementById('admin-p-image').value;
        const description = document.getElementById('admin-p-desc').value;

        if (idVal) {
            const p = this.products.find(x => x.id === parseInt(idVal));
            if (p) {
                p.title = title;
                p.category = category;
                p.price = price;
                p.stock = stock;
                p.rating = rating;
                p.image = image;
                p.description = description;
            }
            this.showToast('Product updated successfully!');
        } else {
            const newId = Date.now();
            this.products.push({
                id: newId,
                title,
                category,
                price,
                stock,
                rating,
                reviewsCount: 1,
                image,
                description
            });
            this.showToast('New product added to catalog!');
        }

        this.saveData('aura_products', this.products);
        this.renderCatalog();
        this.renderAdminProducts();
        this.renderAdminOverview();
        this.closeAdminProductModal();
    }

    deleteAdminProduct(productId) {
        if (confirm("Are you sure you want to remove this product from the store catalog?")) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveData('aura_products', this.products);
            this.renderCatalog();
            this.renderAdminProducts();
            this.renderAdminOverview();
            this.showToast('Product deleted.');
        }
    }

    clearOrderHistory() {
        if (confirm("Clear all simulated customer orders?")) {
            this.orders = [];
            this.saveData('aura_orders', this.orders);
            this.renderAdminOrders();
            this.renderAdminOverview();
            this.showToast('Order history cleared.');
        }
    }

    subscribeNewsletter() {
        this.showToast('Thank you for subscribing to AURA previews!');
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

const app = new AuraApp();
