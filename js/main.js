
import { toggleNav } from './js/navigation.js';
import { AuthManager } from './js/auth.js';
import { CartManager } from './js/cart.js';
import { CheckoutManager } from './js/checkout.js';
import { OrderHistoryManager } from './js/orderHistory.js';
import { ModalManager } from './js/modals.js';

// Make functions globally available for HTML onclick handlers
window.toggleNav = toggleNav;
window.addToCart = (itemId) => CartManager.addToCart(itemId);
window.removeFromCart = (itemId) => CartManager.removeFromCart(itemId);
window.updateQuantity = (itemId, quantity) => CartManager.updateQuantity(itemId, quantity);
window.showCartModal = () => CartManager.showCartModal();
window.clearCart = () => CartManager.clearCart();
window.proceedToCheckout = () => CheckoutManager.proceedToCheckout();
window.showOrderHistory = () => OrderHistoryManager.showOrderHistory();
window.showLoginModal = () => ModalManager.showLoginModal();
window.showRegisterModal = () => ModalManager.showRegisterModal();
window.closeModal = (modalId) => ModalManager.closeModal(modalId);
window.switchToRegister = () => AuthManager.switchToRegister();
window.switchToLogin = () => AuthManager.switchToLogin();
window.logout = () => AuthManager.logout();

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        AuthManager.checkLoginStatus();
        AuthManager.setupAuthForms();
        CartManager.loadCart();
        CartManager.updateCartUI();
        ModalManager.setupModalEventListeners();
    }, 100);
});