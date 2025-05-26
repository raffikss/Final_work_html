import { getStatusClass } from './utils.js';

export class OrderHistoryManager {
    static showOrderHistory() {
        const modal = document.getElementById('orderHistoryModal');
        if (modal) {
            modal.style.display = 'block';
            this.loadOrderHistory();
        }
    }

    static loadOrderHistory() {
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
            
            // Always use get_user_orders for regular order history modal
            // Staff will use the dedicated staff page for managing all orders
            return fetch('orders.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=get_user_orders'
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.displayOrderHistory(data.orders);
            } else {
                orderHistoryList.innerHTML = '<p class="error">Failed to load orders: ' + data.message + '</p>';
            }
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            orderHistoryList.innerHTML = '<p class="error">Failed to load orders.</p>';
        });
    }

    static displayOrderHistory(orders) {
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
            
            // Don't show customer info in regular order history (only for user's own orders)
            ordersHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.id}</span>
                        <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
                    </div>
                    <div class="order-date">${date} at ${time}</div>
                    <div class="order-items">${itemsHTML}</div>
                    <div class="order-total">Total: €${parseFloat(order.total_amount).toFixed(2)}</div>
                    <div class="order-payment">Payment: **** ${order.card_last_four} (${order.payment_method.replace('_', ' ')})</div>
                </div>
            `;
        });
        
        orderHistoryList.innerHTML = ordersHTML;
    }
}