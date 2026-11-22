
// 1. Product details stored in an array of objects
const products = [
    { id: 1, name: "Headphones", price: 799, image: "🎧" },
    { id: 2, name: "Smart Watch", price: 1499, image: "⌚" },
    { id: 3, name: "Backpack", price: 999, image: "🎒" },
    { id: 4, name: "Sports Shoes", price: 1299, image: "👟" },
    { id: 5, name: "Water Bottle", price: 299, image: "🧴" },
    { id: 6, name: "Table Lamp", price: 599, image: "💡" },
    { id: 7, name: "Notebook", price: 149, image: "📓" },
    { id: 8, name: "Sunglasses", price: 499, image: "🕶️" }
];

// 2. Get HTML elements
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const totalPrice = document.getElementById("totalPrice");

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutDetails = document.getElementById("checkoutDetails");
const checkoutTotal = document.getElementById("checkoutTotal");
const confirmBtn = document.getElementById("confirmBtn");

// 3. Load saved cart from LocalStorage
let cart = {};

try {
    cart = JSON.parse(localStorage.getItem("shopEasyCart")) || {};
} catch (error) {
    cart = {};
}

// 4. Format price in Indian Rupees
function formatPrice(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });
}

// 5. Display products dynamically
function displayProducts() {
    productList.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">${product.image}</div>
            <h3>${product.name}</h3>
            <p>${formatPrice(product.price)}</p>
            <button data-id="${product.id}">Add to Cart</button>
        `;

        productList.appendChild(card);
    });
}

// 6. Save cart in LocalStorage
function saveCart() {
    localStorage.setItem("shopEasyCart", JSON.stringify(cart));
}

// 7. Add product to cart
function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    displayCart();
}

// 8. Change product quantity
function changeQuantity(id, amount) {
    if (!cart[id]) return;

    cart[id] += amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveCart();
    displayCart();
}

// 9. Remove product completely
function removeItem(id) {
    delete cart[id];
    saveCart();
    displayCart();
}

// 10. Calculate cart totals
function calculateTotals() {
    const subtotal = Object.keys(cart).reduce((sum, id) => {
        const product = products.find(p => p.id === Number(id));

        if (!product) return sum;

        return sum + product.price * cart[id];
    }, 0);

    const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;
    const total = subtotal + delivery;

    return { subtotal, delivery, total };
}

// 11. Display shopping cart
function displayCart() {
    cartItems.innerHTML = "";

    const ids = Object.keys(cart).filter(id => cart[id] > 0);

    const itemCount = ids.reduce((sum, id) => sum + cart[id], 0);
    cartCount.textContent = itemCount;

    if (ids.length === 0) {
        cartItems.textContent = "Your cart is empty.";
        totalPrice.textContent = "0";
        return;
    }

    ids.forEach(id => {
        const product = products.find(p => p.id === Number(id));

        if (!product) return;

        const quantity = cart[id];
        const itemTotal = product.price * quantity;

        const item = document.createElement("div");
        item.className = "cart-item";

        item.innerHTML = `
            <div>
                <strong>${product.image} ${product.name}</strong>
                <p>${formatPrice(product.price)} × ${quantity}</p>
            </div>

            <div>
                <button data-action="minus" data-id="${id}">−</button>
                <span>${quantity}</span>
                <button data-action="plus" data-id="${id}">+</button>
                <button data-action="remove" data-id="${id}">Remove</button>
            </div>

            <strong>${formatPrice(itemTotal)}</strong>
        `;

        cartItems.appendChild(item);
    });

    const totals = calculateTotals();

    totalPrice.textContent = formatPrice(totals.total);
}

// 12. Handle Add to Cart buttons
productList.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-id]");

    if (button) {
        addToCart(Number(button.dataset.id));
    }
});

// 13. Handle cart quantity and remove buttons
cartItems.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "plus") {
        changeQuantity(id, 1);
    } else if (action === "minus") {
        changeQuantity(id, -1);
    } else if (action === "remove") {
        removeItem(id);
    }
});

// 14. Open checkout preview
checkoutBtn.addEventListener("click", function() {
    if (Object.keys(cart).length === 0) {
        alert("Your cart is empty! Add some products first.");
        return;
    }

    const totals = calculateTotals();

    let summary = "<h3>Order Summary</h3>";

    Object.keys(cart).forEach(id => {
        const product = products.find(p => p.id === Number(id));

        if (!product) return;

        summary += `
            <p>${product.name} × ${cart[id]}
            — ${formatPrice(product.price * cart[id])}</p>
        `;
    });

    summary += `<hr><p>Subtotal: ${formatPrice(totals.subtotal)}</p>`;
    summary += `<p>Delivery: ${formatPrice(totals.delivery)}</p>`;
    summary += `<p><strong>Total: ${formatPrice(totals.total)}</strong></p>`;
    summary += `<p>This is a demo checkout. No payment will be taken.</p>`;

    checkoutDetails.innerHTML = summary;
    checkoutTotal.textContent = formatPrice(totals.total);

    checkoutModal.classList.add("show");
});

// 15. Close checkout modal
closeModal.addEventListener("click", function() {
    checkoutModal.classList.remove("show");
});

// Close modal when clicking outside
checkoutModal.addEventListener("click", function(event) {
    if (event.target === checkoutModal) {
        checkoutModal.classList.remove("show");
    }
});

// 16. Confirm demo order
confirmBtn.addEventListener("click", function() {
    alert("Your demo order has been placed successfully! 🎉");

    cart = {};
    saveCart();
    displayCart();

    checkoutModal.classList.remove("show");
});

// 17. Start the application
displayProducts();
displayCart();
