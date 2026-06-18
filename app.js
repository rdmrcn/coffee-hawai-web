const DELIVERY_FEE = 2.99;

const SHOP_LOCATIONS = [
  'Istanbul — Levent',
  'Istanbul — Sariyer',
  'Göcek Marina Sahil',
  'Antalya — Kaleiçi',
  'Izmir — Alsancak',
  'Ankara — Çankaya',
];

const state = {
  products: [],
  filtered: [],
  cart: {},
  currentScreen: 'home',
  previousScreen: 'home',
  selectedProduct: null,
  selectedFilter: 'All',
  searchQuery: '',
};

const screens = {
  home: document.getElementById('homeScreen'),
  list: document.getElementById('listScreen'),
  detail: document.getElementById('detailScreen'),
  cart: document.getElementById('cartScreen'),
};

const pageTitle = document.getElementById('pageTitle');
const topTitleWrap = document.querySelector('.top-title-wrap');
const backBtn = document.getElementById('backBtn');
const cartBadge = document.getElementById('cartBadge');
const cartBadgeHome = document.getElementById('cartBadgeHome');
const cartBtn = document.getElementById('cartBtn');
const cartBtnHome = document.getElementById('cartBtnHome');
const topBar = document.getElementById('topBar');

function parsePrice(price) {
  return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function getProductById(id) {
  return state.products.find((p) => p.id === id);
}

function getFilters() {
  const set = new Set(['All']);
  state.products.forEach((product) => set.add(product.category));
  return [...set];
}

function cartTotal() {
  return Object.values(state.cart).reduce((sum, count) => sum + count, 0);
}

function cartSubtotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const product = getProductById(Number(id));
    return sum + (product ? parsePrice(product.price) * qty : 0);
  }, 0);
}

function cartGrandTotal() {
  return cartTotal() === 0 ? 0 : cartSubtotal() + DELIVERY_FEE;
}

function updateCartUI() {
  const count = cartTotal();
  [cartBadge, cartBadgeHome].forEach((badge) => {
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  });

  if (state.selectedProduct) {
    updateDetailQty();
  }

  if (state.currentScreen === 'cart') {
    renderCartScreen();
  }
}

function showScreen(name) {
  if (name !== 'cart') {
    state.previousScreen = state.currentScreen === 'cart' ? state.previousScreen : state.currentScreen;
  }

  state.currentScreen = name;

  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });

  const isHome = name === 'home';
  topBar.classList.toggle('hidden', isHome);
  backBtn.classList.toggle('hidden', isHome);
  cartBtn.classList.toggle('hidden', name === 'cart');
  topBar.classList.toggle('cart-header', name === 'cart');

  const titles = {
    home: 'Coffee Hawai',
    list: 'Coffee Menu',
    detail: state.selectedProduct?.name ?? 'Drink Details',
    cart: 'Your Cart',
  };
  pageTitle.textContent = titles[name];
  if (topTitleWrap) {
    topTitleWrap.classList.toggle('show-leaf', name === 'home');
  }

  if (name === 'cart') {
    renderCartScreen();
  }
}

function applyFilters() {
  const query = state.searchQuery.trim().toLowerCase();

  state.filtered = state.products.filter((product) => {
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.tagline.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    const matchesFilter =
      state.selectedFilter === 'All' || product.category === state.selectedFilter;

    return matchesSearch && matchesFilter;
  });

  renderProducts();
}

function renderFilters() {
  const filterBar = document.getElementById('filterBar');
  filterBar.innerHTML = '';

  getFilters().forEach((filter) => {
    const chip = document.createElement('button');
    chip.className = `chip${filter === state.selectedFilter ? ' active' : ''}`;
    chip.textContent = filter;
    chip.addEventListener('click', () => {
      state.selectedFilter = filter;
      renderFilters();
      applyFilters();
    });
    filterBar.appendChild(chip);
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  grid.innerHTML = '';

  if (state.filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  state.filtered.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="img-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="img-overlay"></div>
        <span class="emoji-badge">${product.emoji}</span>
        <span class="cat-label">${product.category}</span>
      </div>
      <div class="meta">
        <h3>${product.name}</h3>
        <p class="sub">${product.tagline}</p>
        <p class="price">${product.price}</p>
      </div>
    `;
    card.addEventListener('click', () => openDetail(product));
    grid.appendChild(card);
  });
}

function openDetail(product) {
  state.selectedProduct = product;
  document.getElementById('detailImage').src = product.image;
  document.getElementById('detailImage').alt = product.name;
  document.getElementById('detailEmoji').textContent = product.emoji;
  document.getElementById('detailCategory').textContent = product.category;
  document.getElementById('detailName').textContent = product.name;
  document.getElementById('detailTagline').textContent = product.tagline;
  document.getElementById('detailPrice').textContent = product.price;
  document.getElementById('detailDescription').textContent = product.description;

  const specs = document.getElementById('detailSpecs');
  specs.innerHTML = '';
  Object.entries(product.specs || {}).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${key}</strong>${value}`;
    specs.appendChild(li);
  });

  updateDetailQty();
  showScreen('detail');
}

function updateDetailQty() {
  const product = state.selectedProduct;
  if (!product) return;

  const count = state.cart[product.id] || 0;
  const qtyControl = document.getElementById('qtyControl');
  document.getElementById('qtyValue').textContent = String(count);
  qtyControl.classList.toggle('hidden', count === 0);
}

function addToCart(product) {
  state.cart[product.id] = (state.cart[product.id] || 0) + 1;
  updateCartUI();
}

function removeFromCart(product) {
  if (!state.cart[product.id]) return;
  state.cart[product.id] -= 1;
  if (state.cart[product.id] <= 0) delete state.cart[product.id];
  updateCartUI();
}

function deleteFromCart(productId) {
  delete state.cart[productId];
  updateCartUI();
}

function renderCartScreen() {
  const cartEmpty = document.getElementById('cartEmpty');
  const cartContent = document.getElementById('cartContent');
  const cartItems = document.getElementById('cartItems');
  const count = cartTotal();

  if (count === 0) {
    cartEmpty.classList.remove('hidden');
    cartContent.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartContent.classList.remove('hidden');
  cartItems.innerHTML = '';

  Object.entries(state.cart).forEach(([id, qty]) => {
    const product = getProductById(Number(id));
    if (!product) return;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p class="cart-item-price">${product.price}</p>
      </div>
      <div class="cart-qty">
        <button class="qty-btn" data-action="minus" data-id="${product.id}">-</button>
        <span>${qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${product.id}">+</button>
      </div>
      <button class="delete-btn" data-id="${product.id}" aria-label="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    `;
    cartItems.appendChild(row);
  });

  cartItems.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = getProductById(Number(btn.dataset.id));
      if (!product) return;
      if (btn.dataset.action === 'plus') addToCart(product);
      else removeFromCart(product);
    });
  });

  cartItems.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteFromCart(Number(btn.dataset.id)));
  });

  document.getElementById('subtotalValue').textContent = formatPrice(cartSubtotal());
  document.getElementById('totalValue').textContent = formatPrice(cartGrandTotal());
}

function goToList(filter) {
  if (filter) {
    state.selectedFilter = filter;
    renderFilters();
    applyFilters();
  }
  showScreen('list');
}

async function loadProducts() {
  const response = await fetch('assets/products.json');
  const payload = await response.json();
  state.products = payload.data;
  state.filtered = payload.data;
  renderFilters();
  renderProducts();
}

document.getElementById('goCatalogBtn').addEventListener('click', () => goToList());
document.getElementById('exploreBtn').addEventListener('click', () => goToList());
document.getElementById('browseFromCartBtn').addEventListener('click', () => goToList());

backBtn.addEventListener('click', () => {
  if (state.currentScreen === 'cart') {
    showScreen(state.previousScreen || 'home');
  } else if (state.currentScreen === 'detail') {
    showScreen('list');
  } else if (state.currentScreen === 'list') {
    showScreen('home');
  } else {
    showScreen('home');
  }
});

document.getElementById('searchInput').addEventListener('input', (event) => {
  state.searchQuery = event.target.value;
  applyFilters();
});

document.getElementById('addToCartBtn').addEventListener('click', () => {
  if (!state.selectedProduct) return;
  addToCart(state.selectedProduct);
});

document.getElementById('qtyPlus').addEventListener('click', () => {
  if (state.selectedProduct) addToCart(state.selectedProduct);
});

document.getElementById('qtyMinus').addEventListener('click', () => {
  if (state.selectedProduct) removeFromCart(state.selectedProduct);
});

cartBtn.addEventListener('click', () => showScreen('cart'));
if (cartBtnHome) cartBtnHome.addEventListener('click', () => showScreen('cart'));

document.getElementById('completeOrderBtn').addEventListener('click', () => {
  const total = formatPrice(cartGrandTotal());
  alert(`Order placed! Total: ${total} ☕`);
  state.cart = {};
  updateCartUI();
  showScreen('home');
});

loadProducts().catch((error) => {
  document.getElementById('productGrid').innerHTML =
    `<p class="empty-state">Failed to load menu: ${error.message}</p>`;
});

const locationsOverlay = document.getElementById('locationsOverlay');
const locationsList = document.getElementById('locationsList');

function openLocations() {
  locationsList.innerHTML = SHOP_LOCATIONS.map(
    (loc) => `<li>${loc}</li>`,
  ).join('');
  locationsOverlay.classList.remove('hidden');
}

function closeLocations() {
  locationsOverlay.classList.add('hidden');
}

document.getElementById('locationsBtnHome').addEventListener('click', openLocations);
document.getElementById('locationsBtnMenu').addEventListener('click', openLocations);
document.getElementById('closeLocationsBtn').addEventListener('click', closeLocations);
locationsOverlay.addEventListener('click', (event) => {
  if (event.target === locationsOverlay) {
    closeLocations();
  }
});
