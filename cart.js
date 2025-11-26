let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  cartItemsDiv.innerHTML = '';

  let total = 0;
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-cart">
        🛒 Your cart is empty!
        <span>Total: $0</span>
      </div>
    `;
    cartTotalEl.textContent = '0';
    return;
  }

  cart.forEach(item => {
    const price = 10; // demo price
    const itemTotal = price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>Author: ${item.author}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: $${itemTotal}</p>
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalEl.textContent = total;
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
  const total = cart.reduce((sum, item) => sum + (item.quantity * 10), 0);
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

  // Show payment form
  paymentSection.style.display = 'block';
  statusDiv.innerHTML = `
    <div class="status-card processing">
      💳 Please enter your payment details below.
    </div>
  `;
};

const cardInput = document.getElementById('cardNumber');

cardInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, ''); 
  value = value.substring(0, 16); // limit to 16 digits

  
  let formatted = '';
  for (let i = 0; i < value.length; i += 4) {
    if (i > 0) formatted += ' ';
    formatted += value.substring(i, i + 4);
  }

  e.target.value = formatted;
});

// Pay Now → show success message
document.getElementById('fakePaymentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const total = cart.reduce((sum, item) => sum + (item.quantity * 10), 0);
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

  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();

  // Hide payment form again
  document.getElementById('paymentSection').style.display = 'none';
});
renderCart();