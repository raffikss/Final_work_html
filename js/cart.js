import { getMenuItem } from './menuData.js';
import { showNotification } from './utils.js';

export class CartManager {
    static cart = [];
    static menuItemsCache = new Map();

    static async loadCart() {
        const savedCart = localStorage.getItem('kebab_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            await this.validateCartItems();
        }
    }

    static async validateCartItems() {
        const validCart = [];
        
        for (const cartItem of this.cart) {
            const menuItem = await this.getMenuItemById(cartItem.id);
            if (menuItem) {
                validCart.push({
                    ...cartItem,
                    name: menuItem.name,
                    price: parseFloat(menuItem.price) || 0
                });
            }
        }
        
        if (validCart.length !== this.cart.length) {
            this.cart = validCart;
            this.saveCart();
            if (this.cart.length < JSON.parse(localStorage.getItem('kebab_cart') || '[]').length) {
                showNotification('Some items were removed from cart as they are no longer available');
            }
        }
    }

    static async getMenuItemById(itemId) {
        if (this.menuItemsCache.has(itemId)) {
            return this.menuItemsCache.get(itemId);
        }

        let item = getMenuItem(itemId);
        if (item) {
            this.menuItemsCache.set(itemId, item);
            return item;
        }

        try {
            const response = await fetch(`get_menu.php?id=${itemId}`);
            if (response.ok) {
                item = await response.json();
                this.menuItemsCache.set(itemId, item);
                return item;
            }
        } catch (error) {
            console.error('Error fetching menu item:', error);
        }

        return null;
    }

    static saveCart() {
        localStorage.setItem('kebab_cart', JSON.stringify(this.cart));
    }

    static async addToCart(itemId) {
        const item = await this.getMenuItemById(itemId);
        if (!item) {
            showNotification('Item not found!');
            return;
        }

        const existingItem = this.cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        
        showNotification(`${item.name} added to cart!`);
    }

    static removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
        this.updateCartModal();
    }

    static updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartUI();
                this.updateCartModal();
            }
        }
    }

    static updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
        
        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                return sum + (price * item.quantity);
            }, 0);
            cartTotal.textContent = total.toFixed(2);
        }
    }

    static showCartModal() {
        console.log('showCartModal called');
        const modal = document.getElementById('cartModal');
        if (modal) {
            this.updateCartModal();
            modal.style.display = 'block';
        }
    }

    static updateCartModal() {
        console.log('updateCartModal called');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('modal-cart-total');
        
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '0.00';
            return;
        }
        
        let cartHTML = '';
        let total = 0;
        
        this.cart.forEach(item => {
           try {
            const price = parseFloat(item.price) || 0;
            const itemTotal = price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${this.escapeHtml(item.name)}</h4>
                        <p class="cart-item-price">€${price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                    <div class="cart-item-total">€${itemTotal.toFixed(2)}</div>
                </div>
            `;
           } catch (err) {
            console.error('Cart item render error:', item, err);
           }
        });
        
        cartItems.innerHTML = cartHTML;
        if (cartTotal) cartTotal.textContent = total.toFixed(2);
    }

    static clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.updateCartModal();
        showNotification('Cart cleared!');
    }

    static getCart() {
        return this.cart;
    }

    static getCartTotal() {
        return this.cart.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            return sum + (price * item.quantity);
        }, 0);
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static async refreshCart() {
        this.menuItemsCache.clear();
        await this.validateCartItems();
        this.updateCartUI();
        this.updateCartModal();
    }
}