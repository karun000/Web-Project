// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const buyBtn = document.getElementById('buyNowBtn');
  cartItemsDiv.innerHTML = '';

  let total = 0;

  // If cart is empty
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        🛒 Your cart is empty!
        <span>Total: $0</span>
      </div>
    `;
    cartTotalEl.textContent = '0';
    if (buyBtn) buyBtn.disabled = true;
    return;
  }

  // Show each item
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>Author: ${item.author}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Unit Price: $${item.price}</p>
      <p>Total: $${itemTotal}</p>
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalEl.textContent = total;
  if (buyBtn) buyBtn.disabled = (total <= 0);
}

// Remove item
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const id = e.target.dataset.id;
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// Buy Now → show payment form
document.getElementById('buyNowBtn').onclick = () => {
  const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const statusDiv = document.getElementById('checkoutStatus');
  const paymentSection = document.getElementById('paymentSection');

  if (total <= 0) {
    statusDiv.innerHTML = `
      <div class="status-card error">
        🛒 Your cart is empty. Please add items before proceeding.
      </div>
    `;
    return;
  }

  paymentSection.style.display = 'block';
  statusDiv.innerHTML = `
    <div class="status-card processing">
      💳 Please enter your payment details below.
    </div>
  `;
};



// Pay Now → success message
document.getElementById('fakePaymentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const total = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const statusDiv = document.getElementById('checkoutStatus');

  setTimeout(() => {
    statusDiv.innerHTML = `
      <div class="status-card success">
        ✅ Payment successful! You bought items worth $${total}.
        <br>
        <button class="continue-btn" onclick="window.location.href='index.html'">
          Continue Shopping
        </button>
      </div>
    `;
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    document.getElementById('paymentSection').style.display = 'none';
  }, 2000);
});

renderCart();
