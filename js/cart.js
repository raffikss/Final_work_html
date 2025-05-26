import { menuItems } from './menuData.js';
import { showNotification } from './utils.js';

export class CartManager {
    static cart = [];

    static loadCart() {
        const savedCart = localStorage.getItem('kebab_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    static saveCart() {
        localStorage.setItem('kebab_cart', JSON.stringify(this.cart));
    }

    static addToCart(itemId) {
        const item = menuItems.find(menuItem => menuItem.id === itemId);
        if (!item) {
            alert('Item not found!');
            return;
        }

        // Check if item already exists in cart
        const existingItem = this.cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartUI();
        
        // Show success message
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
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2);
        }
    }

    static showCartModal() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            this.updateCartModal();
            modal.style.display = 'block';
        }
    }

    static updateCartModal() {
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
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">€${item.price.toFixed(2)} each</p>
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
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
}