
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

// Authentication Functions (existing code)
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
    
    if (userSection) userSection.style.display = 'block';
    if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${user.username}!`;
    if (userRole) userRole.textContent = user.role.toUpperCase();
    
    if (loggedOutButtons) loggedOutButtons.style.display = 'none';
    if (loggedInButtons) loggedInButtons.style.display = 'block';
    
    if (user.role === 'admin' && adminSection) {
        adminSection.style.display = 'block';
    }
}

function updateUIForLoggedOutUser() {
    const userSection = document.getElementById('user-section');
    const loggedOutButtons = document.getElementById('logged-out-buttons');
    const loggedInButtons = document.getElementById('logged-in-buttons');
    const adminSection = document.getElementById('admin-section');
    
    if (userSection) userSection.style.display = 'none';
    if (loggedOutButtons) loggedOutButtons.style.display = 'block';
    if (loggedInButtons) loggedInButtons.style.display = 'none';
    if (adminSection) adminSection.style.display = 'none';
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
    
    if (event.target === loginModal) {
        closeModal('loginModal');
    }
    if (event.target === registerModal) {
        closeModal('registerModal');
    }
    if (event.target === cartModal) {
        closeModal('cartModal');
    }
});