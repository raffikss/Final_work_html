export let menuItems = [];

async function loadMenu() {
    try {
        const container = document.getElementById("menu-container");
        if (!container) return;
        
        container.innerHTML = '';

        const response = await fetch('get_menu.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        menuItems.length = 0;
        menuItems.push(...data);

        const categories = {
            wraps: [],
            plates: [],
            drinks: []
        };

        data.forEach(item => {
            if (categories[item.food_type]) {
                categories[item.food_type].push(item);
            }
        });

        // Render items by category
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                // Add category header
                const categoryHeader = `
                    <div class="col-12 mb-3">
                        <h3 class="text-capitalize text-center">${category}</h3>
                        <hr class="border-danger border-2">
                    </div>
                `;
                container.insertAdjacentHTML("beforeend", categoryHeader);

                // Add items in this category
                categories[category].forEach(item => {
                    const card = createMenuCard(item);
                    container.insertAdjacentHTML("beforeend", card);
                });
            }
        });

    } catch (error) {
        console.error("Error loading menu:", error);
        showErrorMessage("Failed to load menu. Please try again later.");
    }
}

function createMenuCard(item) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <img
                    src="images/${item.id}.jpg"
                    class="card-img-top"
                    style="height: 200px; object-fit: cover;"
                    alt="${escapeHtml(item.name)}"
                    onerror="this.src='images/default.jpg'"
                />
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${escapeHtml(item.name)}</h5>
                    <p class="card-text flex-grow-1">${escapeHtml(item.description)}</p>
                    <div class="mt-auto">
                        <p
                            onclick="addToCart('${item.id}')"
                            class="fw-bold text-center text-danger price-box border border-danger rounded p-2 mb-0"
                            style="cursor: pointer; user-select: none;"
                            role="button"
                            tabindex="0"
                            onkeypress="if(event.key==='Enter') addToCart('${item.id}')">
                            €${parseFloat(item.price).toFixed(2)} <i class="fa fa-shopping-cart text-black"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>`;
}

function showErrorMessage(message) {
    const container = document.getElementById("menu-container");
    if (container) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center" role="alert">
                    <i class="fa fa-exclamation-triangle"></i> ${message}
                </div>
            </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function getMenuItem(itemId) {
    return menuItems.find(item => item.id === itemId);
}

export function getMenuItemsByCategory(category) {
    return menuItems.filter(item => item.food_type === category);
}

export async function refreshMenu() {
    await loadMenu();
}

function addToCart(itemId) {
    if (window.addToCart && typeof window.addToCart === 'function') {
        window.addToCart(itemId);
    } else {
        const item = getMenuItem(itemId);
        if (item) {
            alert(`${item.name} added to cart!`);
        } else {
            alert(`Item added to cart!`);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === "menu.html" || currentPage === "menu" || document.getElementById("menu-container")) {
        loadMenu();
    }
});

export { loadMenu, createMenuCard, showErrorMessage };