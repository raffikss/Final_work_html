import { ModalManager } from './modals.js';

export class AuthManager {
    static checkLoginStatus() {
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
                this.updateUIForLoggedInUser(data.user);
            } else {
                this.updateUIForLoggedOutUser();
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            this.updateUIForLoggedOutUser();
        });
    }

    static updateUIForLoggedInUser(user) {
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

        // Only show admin section for admin users
        if (adminSection) {
            if (user.role === 'admin') {
                adminSection.style.display = 'block';
            } else {
                adminSection.style.display = 'none';
            }
        }

        
        if (staffSection) {
            if (user.role === 'staff' || user.role === 'admin') {
                staffSection.style.display = 'block';
            } else {
                staffSection.style.display = 'none';
            }
        }

        
        if (orderHistoryBtn) {
            orderHistoryBtn.style.display = 'inline-block';
        }
    }

    static updateUIForLoggedOutUser() {
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

    static setupAuthForms() {
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
                        ModalManager.closeModal('loginModal');
                        AuthManager.updateUIForLoggedInUser(data.user);
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
                        ModalManager.closeModal('registerModal');
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

    static logout() {
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
                this.updateUIForLoggedOutUser();
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    }

    static switchToRegister() {
        ModalManager.closeModal('loginModal');
        ModalManager.showRegisterModal();
    }

    static switchToLogin() {
        ModalManager.closeModal('registerModal');
        ModalManager.showLoginModal();
    }
}