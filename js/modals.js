export class ModalManager {
    static showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    static showRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    static setupModalEventListeners() {
        // Modal click outside to close
        window.addEventListener('click', function(event) {
            const loginModal = document.getElementById('loginModal');
            const registerModal = document.getElementById('registerModal');
            const cartModal = document.getElementById('cartModal');
            const checkoutModal = document.getElementById('checkoutModal');
            const orderHistoryModal = document.getElementById('orderHistoryModal');
            
            if (event.target === loginModal) {
                ModalManager.closeModal('loginModal');
            }
            if (event.target === registerModal) {
                ModalManager.closeModal('registerModal');
            }
            if (event.target === cartModal) {
                ModalManager.closeModal('cartModal');
            }
            if (event.target === checkoutModal) {
                ModalManager.closeModal('checkoutModal');
            }
            if (event.target === orderHistoryModal) {
                ModalManager.closeModal('orderHistoryModal');
            }
        });
    }
}