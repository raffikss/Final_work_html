function toggleNav() {
    const nav = document.querySelector(".nav-container");
    nav.classList.toggle("collapsed");
}

document.addEventListener('DOMContentLoaded', function() {
  
    setTimeout(() => {
        checkLoginStatus();
        setupAuthForms();
    }, 100);
});

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
                    // Clear form
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


window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
        closeModal('loginModal');
    }
    if (event.target === registerModal) {
        closeModal('registerModal');
    }
});