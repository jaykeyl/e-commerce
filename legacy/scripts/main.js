document.addEventListener('DOMContentLoaded', async () => {
  const slides = document.querySelector('.slides');
  const images = document.querySelectorAll('.slides img');
  let currentIndex = 0;

  function showSlide(index) {
    const offset = -index * 100;
    slides.style.transform = `translateX(${offset}%)`;
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
    showSlide(currentIndex);
  }

  setInterval(nextSlide, 5000);

  let products = [];
  let displayedProductsCount = 8;

  try {
    const response = await fetch('http://localhost:3000/products');
    products = await response.json();
    console.log('Products loaded:', products);

    displayProducts(products.slice(0, displayedProductsCount));

    const loadMoreButton = document.getElementById('load-more');
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        displayedProductsCount += 8;
        const nextProducts = products.slice(0, displayedProductsCount);
        displayProducts(nextProducts);

        if (displayedProductsCount >= products.length) {
          loadMoreButton.style.display = 'none';
        }
      });
    }

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput && searchButton) {
      searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = products.filter((product) => {
          return (
              product.album_name.toLowerCase().includes(searchTerm) ||
              product.name_of_artist.toLowerCase().includes(searchTerm)
          );
        });
        displayProducts(filteredProducts);
      });

      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          const searchTerm = searchInput.value.toLowerCase();
          const filteredProducts = products.filter((product) => {
            return (
                product.album_name.toLowerCase().includes(searchTerm) ||
                product.name_of_artist.toLowerCase().includes(searchTerm)
            );
          });
          displayProducts(filteredProducts);
        }
      });
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
});

let currentProductId = null;
let currentProductName = null;
let currentProductPrice = null;
let currentProductStock = 0;

function openModal(title, artist, price, image, stock, productId, productName, productPrice) {
  const gifPath = image.replace('.jpg', '-gif.gif');

  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalArtist').innerText = artist;
  document.getElementById('modalPrice').innerText = price;
  document.getElementById('modalImage').src = gifPath;
  document.getElementById('modalStock').innerText = `Stock: ${stock}`;
  document.getElementById('quantity').value = 1;

  currentProductId = productId;
  currentProductName = productName;
  currentProductPrice = productPrice;
  currentProductStock = parseInt(stock);

  document.getElementById('productModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('productModal').style.display = 'none';
}

function increaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  let quantity = parseInt(quantityInput.value);
  if (quantity < currentProductStock) {
    quantityInput.value = quantity + 1;
  } else {
    alert('No hay suficiente stock disponible.');
  }
}

function decreaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  let quantity = parseInt(quantityInput.value);
  if (quantity > 1) {
    quantityInput.value = quantity - 1;
  }
}

function addToCartFromModal() {
  const quantity = parseInt(document.getElementById('quantity').value);

  if (quantity > currentProductStock) {
    alert('No hay suficiente stock disponible.');
    return;
  }

  const product = {
    id: currentProductId,
    name: currentProductName,
    price: currentProductPrice,
    quantity: quantity,
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingProduct = cart.find((item) => item.id === currentProductId);

  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Carrito actualizado:', cart);

  alert(`${quantity} ${currentProductName}(s) añadido(s) al carrito!`);
  closeModal();
}

function addToCart(productId, productName, productPrice) {
  const product = {
    id: productId,
    name: productName,
    price: productPrice,
    quantity: 1,
  };

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingProduct = cart.find((item) => item.id === productId);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  console.log('Carrito actualizado:', cart);

  alert(`${productName} fue añadido al carrito!`);
}

function displayProducts(products) {
  const albumGrid = document.getElementById('album-grid');
  if (!albumGrid) {
    console.error('Album grid not found!');
    return;
  }

  albumGrid.innerHTML = '';

  products.forEach((product) => {
    const albumCard = document.createElement('div');
    albumCard.className = 'album-card';

    const imageName = product.album_name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const imagePath = `assets/images/${imageName}.jpg`;

    const formattedPrice = `$${product.price}`;

    albumCard.innerHTML = `
            <div class="album-image-container">
                <img src="${imagePath}" alt="${product.album_name}" onclick="openModal('${product.album_name}', '${product.name_of_artist}', '${formattedPrice}', '${imagePath}', '${product.stock}', ${product.ID}, '${product.album_name}', ${product.price})">
            </div>
            <h3>${product.album_name}</h3>
            <p>${product.name_of_artist}</p>
            <p>${formattedPrice}</p>
            <button class="btn" onclick="addToCart(${product.ID}, '${product.album_name}', ${product.price})">Add to Cart</button>
        `;

    albumGrid.appendChild(albumCard);
  });
}