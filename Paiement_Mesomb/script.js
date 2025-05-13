// Configuration pour l'API MeSomb
// Ces valeurs seront remplacées par vos clés réelles
const MESOMB_CONFIG = {
  // Remplacez ces valeurs par vos clés réelles
  ACCESS_KEY: "YOUR_ACCESS_KEY_HERE",
  SECRET_KEY: "YOUR_SECRET_KEY_HERE",
  SERVICE_KEY: "YOUR_SERVICE_KEY_HERE",
  API_URL: "https://mesomb.hachther.com/api/v1.1/payment/online",
}

// Données des produits
const products = [
  {
    id: 1,
    name: "Smartphone Premium",
    price: 150000,
    description: "Smartphone haut de gamme avec appareil photo professionnel et grande autonomie.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Ordinateur Portable",
    price: 350000,
    description: "Ordinateur portable léger et puissant pour tous vos besoins professionnels.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Écouteurs Sans Fil",
    price: 25000,
    description: "Écouteurs bluetooth avec réduction de bruit active et longue autonomie.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Montre Connectée",
    price: 45000,
    description: "Montre intelligente avec suivi d'activité, notifications et paiement sans contact.",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Tablette Tactile",
    price: 120000,
    description: "Tablette performante avec grand écran pour le travail et les loisirs.",
    image: "/placeholder.svg?height=200&width=300",
  },
]

// Éléments DOM
const productsContainer = document.getElementById("products-container")
const cartIcon = document.getElementById("cart-icon")
const cartSection = document.getElementById("cart-section")
const closeCart = document.getElementById("close-cart")
const cartItems = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const cartCount = document.getElementById("cart-count")
const checkoutBtn = document.getElementById("checkout-btn")
const checkoutSection = document.getElementById("checkout-section")
const closeCheckout = document.getElementById("close-checkout")
const checkoutForm = document.getElementById("checkout-form")
const sortSelect = document.getElementById("sort")
const notification = document.getElementById("notification")
const notificationMessage = document.getElementById("notification-message")
const paymentModal = document.getElementById("payment-modal")
const paymentStatus = document.getElementById("payment-status")
const closeModal = document.querySelector(".close-modal")

// Panier
let cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialisation
function init() {
  displayProducts(products)
  updateCart()

  // Événements
  cartIcon.addEventListener("click", toggleCart)
  closeCart.addEventListener("click", toggleCart)
  checkoutBtn.addEventListener("click", toggleCheckout)
  closeCheckout.addEventListener("click", toggleCheckout)
  checkoutForm.addEventListener("submit", processCheckout)
  sortSelect.addEventListener("change", sortProducts)
  closeModal.addEventListener("click", () => paymentModal.classList.remove("show"))

  // Charger le panier depuis localStorage
  if (cart.length > 0) {
    updateCart()
  }
}

// Afficher les produits
function displayProducts(productsToDisplay) {
  productsContainer.innerHTML = ""

  productsToDisplay.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = "product-card"

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)} FCFA</p>
        <p class="product-description">${product.description}</p>
        <button class="add-to-cart" data-id="${product.id}">Ajouter au panier</button>
      </div>
    `

    productsContainer.appendChild(productCard)

    // Ajouter l'événement au bouton
    const addToCartBtn = productCard.querySelector(".add-to-cart")
    addToCartBtn.addEventListener("click", () => addToCart(product))
  })
}

// Ajouter au panier
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
    })
  }

  updateCart()
  saveCart()
  showNotification(`${product.name} ajouté au panier`)
}

// Mettre à jour l'affichage du panier
function updateCart() {
  cartItems.innerHTML = ""
  let total = 0
  let count = 0

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity
    total += itemTotal
    count += item.quantity

    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-price">${formatPrice(item.price)} FCFA</p>
        <div class="cart-item-actions">
          <button class="quantity-btn decrease" data-id="${item.id}">-</button>
          <span class="cart-item-quantity">${item.quantity}</span>
          <button class="quantity-btn increase" data-id="${item.id}">+</button>
          <button class="remove-item" data-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `

    cartItems.appendChild(cartItem)

    // Ajouter les événements
    const decreaseBtn = cartItem.querySelector(".decrease")
    const increaseBtn = cartItem.querySelector(".increase")
    const removeBtn = cartItem.querySelector(".remove-item")

    decreaseBtn.addEventListener("click", () => updateQuantity(item.id, -1))
    increaseBtn.addEventListener("click", () => updateQuantity(item.id, 1))
    removeBtn.addEventListener("click", () => removeFromCart(item.id))
  })

  cartTotal.textContent = formatPrice(total)
  cartCount.textContent = count

  // Désactiver le bouton de paiement si le panier est vide
  checkoutBtn.disabled = cart.length === 0
  if (cart.length === 0) {
    checkoutBtn.classList.add("disabled")
  } else {
    checkoutBtn.classList.remove("disabled")
  }
}

// Mettre à jour la quantité
function updateQuantity(id, change) {
  const item = cart.find((item) => item.id === id)

  if (item) {
    item.quantity += change

    if (item.quantity <= 0) {
      removeFromCart(id)
    } else {
      updateCart()
      saveCart()
    }
  }
}

// Supprimer du panier
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id)
  updateCart()
  saveCart()
}

// Sauvegarder le panier dans localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

// Formater le prix
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Afficher/masquer le panier
function toggleCart() {
  cartSection.classList.toggle("active")
  if (checkoutSection.classList.contains("active")) {
    checkoutSection.classList.remove("active")
  }
}

// Afficher/masquer le formulaire de commande
function toggleCheckout() {
  checkoutSection.classList.toggle("active")
  if (cartSection.classList.contains("active")) {
    cartSection.classList.remove("active")
  }
}

// Traiter la commande
function processCheckout(e) {
  e.preventDefault()

  // Récupérer les données du formulaire
  const name = document.getElementById("name").value
  const phone = document.getElementById("phone").value
  const address = document.getElementById("address").value

  // Calculer le total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Afficher le modal de paiement
  paymentModal.classList.add("show")
  paymentStatus.innerHTML = `
    <div class="loader"></div>
    <p>Traitement du paiement en cours...</p>
  `

  // Préparer les données pour l'API MeSomb
  const orderData = {
    amount: total,
    service: "MTN", // ou "ORANGE", "AIRTEL" selon le service mobile money
    payer: phone,
    message: `Paiement pour commande de ${name}`,
    redirect: window.location.href, // URL de redirection après paiement
    customer: {
      name: name,
      phone: phone,
      address: address,
    },
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  }

  // Appel à l'API MeSomb
  processMeSombPayment(orderData)
}

// Fonction pour traiter le paiement avec MeSomb
function processMeSombPayment(orderData) {
  // Générer un nonce (nombre aléatoire pour la sécurité)
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // Préparer les en-têtes pour l'API MeSomb
  const headers = {
    "Content-Type": "application/json",
    "X-MeSomb-Application": MESOMB_CONFIG.SERVICE_KEY,
    "X-MeSomb-AccessKey": MESOMB_CONFIG.ACCESS_KEY,
    "X-MeSomb-Nonce": nonce,
    "X-MeSomb-Timestamp": timestamp,
    // La signature serait normalement générée côté serveur pour des raisons de sécurité
    // Ceci est une implémentation simplifiée pour démonstration
    "X-MeSomb-Signature": "SIGNATURE_WILL_BE_GENERATED_SERVER_SIDE",
  }

  // Appel à l'API MeSomb
  fetch(MESOMB_CONFIG.API_URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Simuler un délai pour démonstration
      setTimeout(() => {
        if (data.success || Math.random() > 0.3) {
          // Simulation de succès pour démo
          paymentStatus.innerHTML = `
          <i class="fas fa-check-circle fa-3x success"></i>
          <h3 class="success">Paiement réussi!</h3>
          <p>Votre commande a été confirmée.</p>
          <p>Référence: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <button id="continue-shopping" class="btn checkout-btn">Continuer vos achats</button>
        `

          // Vider le panier après paiement réussi
          cart = []
          saveCart()
          updateCart()

          // Fermer le checkout
          checkoutSection.classList.remove("active")

          // Ajouter l'événement pour continuer les achats
          document.getElementById("continue-shopping").addEventListener("click", () => {
            paymentModal.classList.remove("show")
          })
        } else {
          paymentStatus.innerHTML = `
          <i class="fas fa-times-circle fa-3x error"></i>
          <h3 class="error">Échec du paiement</h3>
          <p>Une erreur s'est produite lors du traitement de votre paiement.</p>
          <p>Veuillez réessayer ou contacter le support.</p>
          <button id="try-again" class="btn checkout-btn">Réessayer</button>
        `

          // Ajouter l'événement pour réessayer
          document.getElementById("try-again").addEventListener("click", () => {
            paymentModal.classList.remove("show")
          })
        }
      }, 2000)
    })
    .catch((error) => {
      console.error("Erreur lors du paiement:", error)
      paymentStatus.innerHTML = `
      <i class="fas fa-exclamation-triangle fa-3x error"></i>
      <h3 class="error">Erreur de connexion</h3>
      <p>Impossible de se connecter au service de paiement.</p>
      <p>Veuillez vérifier votre connexion et réessayer.</p>
      <button id="try-again" class="btn checkout-btn">Réessayer</button>
    `

      // Ajouter l'événement pour réessayer
      document.getElementById("try-again").addEventListener("click", () => {
        paymentModal.classList.remove("show")
      })
    })
}

// Afficher une notification
function showNotification(message) {
  notificationMessage.textContent = message
  notification.classList.add("show")

  // Masquer après 3 secondes
  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

// Trier les produits
function sortProducts() {
  const sortValue = sortSelect.value
  const sortedProducts = [...products]

  if (sortValue === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price)
  } else if (sortValue === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price)
  }

  displayProducts(sortedProducts)
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", init)
