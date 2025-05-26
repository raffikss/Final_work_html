let cart = [];

function toggleNav() {
    const nav = document.querySelector(".nav-container");
    nav.classList.toggle("collapsed");
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        checkLoginStatus();
        setupAuthForms();
        loadCart();
        updateCartUI();
    }, 100);
});

function loadCart() {
    const savedCart = localStorage.getItem('kebab_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('kebab_cart', JSON.stringify(cart));
}

function addToCart(itemId) {
    // Find the item in menu data
    const menuItems = [
        {
            id: "chicken-wrap",
            name: "Chicken Kebab Wrap",
            description: "Strips of delicious cooked chicken wrapped in a lightly toasted tortilla wrap with lettuce, mayo and salsa.",
            price: 6.50
        },
        {
            id: "lamb-wrap",
            name: "Lamb Kebab Wrap",
            description: "The grilled lamb is then wrapped in a soft, warm pita bread and garnished with various vegetables and condiments.",
            price: 7.00
        },
        {
            id: "falafel-wrap",
            name: "Falafel Wrap",
            description: "Crispy chickpea patties wrapped in warm pita with fresh veggies and our signature sauce.",
            price: 6.00
        },
        {
            id: "chicken-plate",
            name: "Chicken Plate",
            description: "Tender grilled chicken served with, fresh salad, and our special sauce.",
            price: 9.00
        },
        {
            id: "mix-grill",
            name: "Mix Grill Plate",
            description: "A hearty combo of grilled chicken, beef, and lamb served with your choice of three delicious sauces.",
            price: 12.00
        },
        {
            id: "veggie-plate",
            name: "Veggie Plate",
            description: "A colorful mix of grilled seasonal vegetables served with your choice of sauce.",
            price: 10.00
        },
        {
            id: "soda",
            name: "Soda 0.5 L",
            description: "Cola / Fanta / Sprite",
            price: 1.50
        },
        {
            id: "water",
            name: "Water 0.3 L",
            description: "Mineral Water",
            price: 1.00
        }
    ];

    const item = menuItems.find(menuItem => menuItem.id === itemId);
    if (!item) {
        alert('Item not found!');
        return;
    }

    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    
    // Show success message
    showCartNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
    updateCartModal();
}

function updateQuantity(itemId, newQuantity) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
            updateCartModal();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
}

function showCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        updateCartModal();
        modal.style.display = 'block';
    }
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('modal-cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
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

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    updateCartModal();
    showCartNotification('Cart cleared!');
}

function showCartNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Checkout Functions
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    closeModal('cartModal');
    showCheckoutModal();
}

function showCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        updateCheckoutSummary();
        modal.style.display = 'block';
        setupCheckoutForm();
    }
}

function updateCheckoutSummary() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (!checkoutItems) return;
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
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

function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ');
            if (formattedValue) {
                e.target.value = formattedValue;
            }
        });
    }
    
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (checkoutForm) {
        checkoutForm.onsubmit = function(e) {
            e.preventDefault();
            handleCheckoutSubmit();
        };
    }
}

function handleCheckoutSubmit() {
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
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Prepare order data
    const orderData = {
        action: 'place_order',
        items: JSON.stringify(cart),
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
            clearCart();
            closeModal('checkoutModal');
            document.getElementById('checkoutForm').reset();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Checkout error:', error);
        alert('Failed to place order. Please try again.');
    });
}

// Order History Functions
function showOrderHistory() {
    const modal = document.getElementById('orderHistoryModal');
    if (modal) {
        modal.style.display = 'block';
        loadOrderHistory();
    }
}

function loadOrderHistory() {
    const orderHistoryList = document.getElementById('order-history-list');
    if (!orderHistoryList) return;
    
    orderHistoryList.innerHTML = '<p class="loading">Loading your orders...</p>';
    
    // Check if user is staff to determine which endpoint to call
    fetch('authorization.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=check_session'
    })
    .then(response => response.json())
    .then(sessionData => {
        if (!sessionData.success || !sessionData.logged_in) {
            orderHistoryList.innerHTML = '<p class="error">Please log in to view orders.</p>';
            return;
        }
        
        // Determine which action to use based on user role
        const action = sessionData.user.role === 'staff' ? 'get_all_orders' : 'get_user_orders';
        
        return fetch('orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${action}`
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayOrderHistory(data.orders);
        } else {
            orderHistoryList.innerHTML = '<p class="error">Failed to load orders: ' + data.message + '</p>';
        }
    })
    .catch(error => {
        console.error('Error loading orders:', error);
        orderHistoryList.innerHTML = '<p class="error">Failed to load orders.</p>';
    });
}

function displayOrderHistory(orders) {
    const orderHistoryList = document.getElementById('order-history-list');
    if (!orderHistoryList) return;
    
    if (orders.length === 0) {
        orderHistoryList.innerHTML = '<p class="no-orders">No orders found.</p>';
        return;
    }
    
    let ordersHTML = '';
    orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString();
        const time = new Date(order.created_at).toLocaleTimeString();
        
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `<div class="order-item">${item.name} x${item.quantity}</div>`;
        });
        
        const statusClass = getStatusClass(order.status);
        
        // Show customer info for staff, hide for regular customers
        const customerInfo = order.customer_name ? 
            `<div class="order-customer">Customer: ${order.customer_name} | Phone: ${order.guest_phone}</div>` : '';
        
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
                </div>
                ${customerInfo}
                <div class="order-date">${date} at ${time}</div>
                <div class="order-items">${itemsHTML}</div>
                <div class="order-total">Total: €${parseFloat(order.total_amount).toFixed(2)}</div>
                <div class="order-payment">Payment: **** ${order.card_last_four} (${order.payment_method.replace('_', ' ')})</div>
            </div>
        `;
    });
    
    orderHistoryList.innerHTML = ordersHTML;
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'in_progress': return 'status-in-progress';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return '';
    }
}

// Authentication Functions
function checkLoginStatus() {
    fetch('authorization.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=check_session'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.logged_in) {
            updateUIForLoggedInUser(data.user);
        } else {
            updateUIForLoggedOutUser();
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
        updateUIForLoggedOutUser();
    });
}

function updateUIForLoggedInUser(user) {
    const userSection = document.getElementById('user-section');
    const welcomeMessage = document.getElementById('welcome-message');
    const userRole = document.getElementById('user-role');
    const loggedOutButtons = document.getElementById('logged-out-buttons');
    const loggedInButtons = document.getElementById('logged-in-buttons');
    const adminSection = document.getElementById('admin-section');
    const staffSection = document.getElementById('staff-section');
    const orderHistoryBtn = document.getElementById('order-history-btn');

    if (userSection) userSection.style.display = 'block';
    if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${user.username}!`;
    if (userRole) userRole.textContent = user.role.toUpperCase();

    if (loggedOutButtons) loggedOutButtons.style.display = 'none';
    if (loggedInButtons) loggedInButtons.style.display = 'block';

    if (user.role === 'admin' && adminSection) {
        adminSection.style.display = 'block';
    }

    if ((user.role === 'staff' || user.role === 'admin') && staffSection) {
        staffSection.style.display = 'block';
    }

    if (orderHistoryBtn && (user.role === 'customer' || user.role === 'staff')) {
        orderHistoryBtn.style.display = 'inline-block';
    }
}

function updateUIForLoggedOutUser() {
    const userSection = document.getElementById('user-section');
    const loggedOutButtons = document.getElementById('logged-out-buttons');
    const loggedInButtons = document.getElementById('logged-in-buttons');
    const adminSection = document.getElementById('admin-section');
    const staffSection = document.getElementById('staff-section');
    const orderHistoryBtn = document.getElementById('order-history-btn');

    if (userSection) userSection.style.display = 'none';
    if (loggedOutButtons) loggedOutButtons.style.display = 'block';
    if (loggedInButtons) loggedInButtons.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';
    if (staffSection) staffSection.style.display = 'none';
    if (orderHistoryBtn) orderHistoryBtn.style.display = 'none';
}
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchToRegister() {
    closeModal('loginModal');
    showRegisterModal();
}

function switchToLogin() {
    closeModal('registerModal');
    showLoginModal();
}

function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            fetch('authorization.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    closeModal('loginModal');
                    updateUIForLoggedInUser(data.user);
                    loginForm.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            });
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            fetch('authorization.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=register&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&confirm_password=${encodeURIComponent(confirmPassword)}`
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    closeModal('registerModal');
                    registerForm.reset();
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            });
        });
    }
}

function logout() {
    fetch('authorization.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=logout'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            updateUIForLoggedOutUser();
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

// Modal click outside to close
window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const orderHistoryModal = document.getElementById('orderHistoryModal');
    
    if (event.target === loginModal) {
        closeModal('loginModal');
    }
    if (event.target === registerModal) {
        closeModal('registerModal');
    }
    if (event.target === cartModal) {
        closeModal('cartModal');
    }
    if (event.target === checkoutModal) {
        closeModal('checkoutModal');
    }
    if (event.target === orderHistoryModal) {
        closeModal('orderHistoryModal');
    }
});