class DashboardManager {
    constructor() {
        this.menuItems = [];
        this.currentEditingItem = null;
        this.init();
    }

    async init() {
        await this.loadMenuItems();
        this.setupEventListeners();
        this.renderMenuTables();
    }

    async loadMenuItems() {
        try {
            const response = await fetch('get_menu.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.menuItems = await response.json();
        } catch (error) {
            console.error('Error loading menu items:', error);
            this.showAlert('Error loading menu items', 'danger');
        }
    }

    setupEventListeners() {

        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.showAddItemModal());
        }


        const saveItemBtn = document.getElementById('save-item-btn');
        if (saveItemBtn) {
            saveItemBtn.addEventListener('click', () => this.saveItem());
        }

        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.deleteItem());
        }


        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveItem();
            });
        }
    }

    renderMenuTables() {
        const categories = ['wraps', 'plates', 'drinks'];
        
        categories.forEach(category => {
            const tableBody = document.getElementById(`${category}-table-body`);
            if (tableBody) {
                tableBody.innerHTML = '';
                
                const categoryItems = this.menuItems.filter(item => item.food_type === category);
                
                categoryItems.forEach(item => {
                    const row = this.createTableRow(item);
                    tableBody.appendChild(row);
                });
            }
        });
    }

    createTableRow(item) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <img src="images/${item.id}.jpg" 
                     alt="${item.name}" 
                     class="img-thumbnail" 
                     style="width: 50px; height: 50px; object-fit: cover;"
                     onerror="this.src='images/default.jpg'">
            </td>
            <td>${this.escapeHtml(item.name)}</td>
            <td>${this.escapeHtml(item.description)}</td>
            <td>€${parseFloat(item.price).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="dashboardManager.editItem('${item.id}')">
                    <i class="fa fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="dashboardManager.confirmDeleteItem('${item.id}')">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </td>
        `;
        
        return row;
    }

    showAddItemModal() {
        this.currentEditingItem = null;
        this.clearForm();
        
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('modal-title');
        
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fa fa-plus"></i> Add New Menu Item';
        }
        
        if (window.bootstrap) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    async editItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('Item not found', 'danger');
            return;
        }

        this.currentEditingItem = item;
        this.populateForm(item);
        
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('modal-title');
        
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fa fa-edit"></i> Edit Menu Item';
        }
        
        if (window.bootstrap) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    populateForm(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-description').value = item.description;
        document.getElementById('item-price').value = parseFloat(item.price).toFixed(2);
        document.getElementById('item-category').value = item.food_type;
    }

    clearForm() {
        document.getElementById('item-id').value = '';
        document.getElementById('item-name').value = '';
        document.getElementById('item-description').value = '';
        document.getElementById('item-price').value = '';
        document.getElementById('item-category').value = '';
    }

    async saveItem() {
        const form = document.getElementById('itemForm');
        const formData = new FormData(form);
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            let response;
            
            if (this.currentEditingItem) {
                // Update existing item
                const updateData = new URLSearchParams();
                for (let [key, value] of formData.entries()) {
                    updateData.append(key, value);
                }
                
                response = await fetch('get_menu.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: updateData.toString()
                });
            } else {
                response = await fetch('get_menu.php', {
                    method: 'POST',
                    body: formData
                });
            }

            const result = await response.json();
            
            if (result.success) {
                this.showAlert(result.message, 'success');
                await this.loadMenuItems();
                this.renderMenuTables();
                this.hideModal('itemModal');
            } else {
                this.showAlert(result.message, 'danger');
            }
            
        } catch (error) {
            console.error('Error saving item:', error);
            this.showAlert('Error saving item', 'danger');
        }
    }

    validateForm(formData) {
        const name = formData.get('name');
        const description = formData.get('description');
        const price = formData.get('price');
        const category = formData.get('food_type');

        if (!name || name.trim() === '') {
            this.showAlert('Item name is required', 'warning');
            return false;
        }

        if (!description || description.trim() === '') {
            this.showAlert('Description is required', 'warning');
            return false;
        }

        if (!price || parseFloat(price) <= 0) {
            this.showAlert('Valid price is required', 'warning');
            return false;
        }

        if (!category) {
            this.showAlert('Category is required', 'warning');
            return false;
        }

        return true;
    }

    confirmDeleteItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('Item not found', 'danger');
            return;
        }

        this.currentEditingItem = item;
        
        const modal = document.getElementById('deleteModal');
        if (window.bootstrap) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    async deleteItem() {
        if (!this.currentEditingItem) {
            this.showAlert('No item selected for deletion', 'danger');
            return;
        }

        try {
            const response = await fetch(`get_menu.php?id=${encodeURIComponent(this.currentEditingItem.id)}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert(result.message, 'success');
                await this.loadMenuItems();
                this.renderMenuTables();
                this.hideModal('deleteModal');
            } else {
                this.showAlert(result.message, 'danger');
            }
            
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showAlert('Error deleting item', 'danger');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && window.bootstrap) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let dashboardManager;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('menu-container') === null && document.getElementById('wraps-table-body') !== null) {
        dashboardManager = new DashboardManager();
        
        window.dashboardManager = dashboardManager;
    }
});

export { DashboardManager };