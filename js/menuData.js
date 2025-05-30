export const menuItems = [
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

async function loadMenu() {
    try {
        const container = document.getElementById("menu-container");
        container.innerHTML = '';

        const response = await fetch('get_menu.php');
        const data = await response.json();

        this.menuItems = data;

        data.forEach(item => {
            const card = `
                <div class="col-md-4">
                    <div class="card h-auto">
                        <img
                            src="images/${item.id}.jpg"
                            class="w-75 h-75 d-block mx-auto pt-3 object-fit-cover"
                            alt="${item.name}"
                        />
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">${item.description}</p>
                            <p
                                onclick="addToCart('${item.id}')"
                                class="fw-bold text-center text-danger price-box border border-danger rounded">
                                ${parseFloat(item.price).toFixed(2)} € <i class="fa fa-shopping-cart text-black"></i>
                            </p>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML("beforeend", card);
        });
    } catch (error) {
        console.log("Err in menu data:");
        console.log(error);
    }
}

function addToCart(itemId) {
    alert(`${itemId} added to cart!`);
}

if (window.location.pathname.split('/').pop() == "menu") {
    // load menu cards only in menu page
    loadMenu()
}