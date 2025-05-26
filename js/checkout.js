import { CartManager } from './cart.js';
import { ModalManager } from './modals.js';
import { formatCardNumber, formatCardExpiry } from './utils.js';

export class CheckoutManager {
    static proceedToCheckout() {
        if (CartManager.getCart().length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        ModalManager.closeModal('cartModal');
        this.showCheckoutModal();
    }

    static showCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            this.updateCheckoutSummary();
            modal.style.display = 'block';
            this.setupCheckoutForm();
        }
    }

    static updateCheckoutSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        const checkoutTotal = document.getElementById('checkout-total');
        
        if (!checkoutItems) return;
        
        let itemsHTML = '';
        let total = 0;
        
        CartManager.getCart().forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHTML += `
                <div class="checkout-item">
                    <div class="checkout-item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">x${item.quantity}</span>
                    </div>
                    <span class="item-total">€${itemTotal.toFixed(2)}</span>
                </div>
            `;
        });
        
        checkoutItems.innerHTML = itemsHTML;
        if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);
    }

    static setupCheckoutForm() {
        const checkoutForm = document.getElementById('checkoutForm');
        const cardNumberInput = document.getElementById('card-number');
        const cardExpiryInput = document.getElementById('card-expiry');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                formatCardNumber(e.target);
            });
        }
        
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', function(e) {
                formatCardExpiry(e.target);
            });
        }
        
        if (checkoutForm) {
            checkoutForm.onsubmit = function(e) {
                e.preventDefault();
                CheckoutManager.handleCheckoutSubmit();
            };
        }
    }

    static handleCheckoutSubmit() {
        const name = document.getElementById('checkout-name').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCVV = document.getElementById('card-cvv').value;
        
        // Validation
        if (!name || !phone || !paymentMethod || !cardNumber || !cardExpiry || !cardCVV) {
            alert('Please fill in all fields');
            return;
        }
        
        if (cardNumber.length !== 16) {
            alert('Please enter a valid 16-digit card number');
            return;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            alert('Please enter expiry date in MM/YY format');
            return;
        }
        
        if (cardCVV.length !== 3) {
            alert('Please enter a valid 3-digit CVV');
            return;
        }
        
        // Calculate total
        const total = CartManager.getCartTotal();
        
        // Prepare order data
        const orderData = {
            action: 'place_order',
            items: JSON.stringify(CartManager.getCart()),
            total: total,
            phone: phone,
            name: name,
            payment_method: paymentMethod,
            card_number: cardNumber
        };
        
        // Submit order
        const formData = new FormData();
        Object.keys(orderData).forEach(key => {
            formData.append(key, orderData[key]);
        });
        
        fetch('orders.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Order placed successfully! Order ID: ' + data.order_id);
                CartManager.clearCart();
                ModalManager.closeModal('checkoutModal');
                document.getElementById('checkoutForm').reset();
                window.location.href = window.location.href.split("/")[0] + "payment_result_good.html"
            } else {
                alert('Error: ' + data.message);
                window.location.href = window.location.href.split("/")[0] + "payment_result_bad.html"
            }
        })
        .catch(error => {
            console.error('Checkout error:', error);
            alert('Failed to place order. Please try again.');
            window.location.href = window.location.href.split("/")[0] + "payment_result_bad.html"
        });
    }
}