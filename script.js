// ============================================================
// LR HANDLOOMS — MAIN JAVASCRIPT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // 1. PRELOADER ANIMATION
  // ==========================================================

  if (typeof gsap !== "undefined") {

    const tl = gsap.timeline();

    tl.to(".loader-bar", {
      width: "100%",
      duration: 1.2,
      ease: "power2.inOut"
    })

      .to(".preloader", {
        y: "-100%",
        duration: 1,
        ease: "power4.inOut",
        delay: 0.2
      })

      .from(".main-title", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=0.3")

      .from(".sub-title", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=1");


    // ========================================================
    // 2. SCROLL ANIMATIONS
    // ========================================================

    if (typeof ScrollTrigger !== "undefined") {

      gsap.from(".cat-card", {
        scrollTrigger: {
          trigger: ".categories",
          start: "top 75%"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });


      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: ".collections",
          start: "top 75%"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });


      gsap.from(".heritage-container", {
        scrollTrigger: {
          trigger: ".heritage",
          start: "top 70%"
        },
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      });

    }

  }


  // ==========================================================
  // 3. CART DRAWER
  // ==========================================================

  const cartBtn = document.getElementById("cart-btn");
  const closeCartBtn = document.getElementById("close-cart");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");


  // ==========================================================
  // PROCEED TO CHECKOUT
  // ==========================================================

  const checkoutBtn =
    document.querySelector(".checkout-btn");

  if (checkoutBtn) {

    checkoutBtn.addEventListener(
      "click",
      () => {

        const cart =
          JSON.parse(
            localStorage.getItem(
              "lr_handlooms_cart"
            ) || "[]"
          );

        // Empty bag
        if (!cart.length) {

          alert(
            "Your shopping bag is empty."
          );

          return;
        }

        // Check login
        const token =
          localStorage.getItem(
            "lr_handlooms_user_token"
          );

        if (!token) {

          window.location.href =
            "./account.html";

          return;
        }

        // Go to checkout
        window.location.href =
          "./checkout.html";

      }
    );

  }


  // OPEN CART
  function openCart() {

    if (!cartDrawer) return;

    cartDrawer.classList.add("active");

    if (cartOverlay) {
      cartOverlay.style.display = "block";
    }

    document.body.style.overflow = "hidden";
  }


  // CLOSE CART
  function closeCart() {

    if (!cartDrawer) return;

    cartDrawer.classList.remove("active");

    if (cartOverlay) {
      cartOverlay.style.display = "none";
    }

    document.body.style.overflow = "";
  }


  // Make functions available globally
  window.openCart = openCart;
  window.closeCart = closeCart;


  // BAG ICON
  if (cartBtn) {

    cartBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Agar mobile menu open hai to pehle close karo
      if (navCenter && navCenter.classList.contains("active")) {
        navCenter.classList.remove("active");

        if (mobileMenuBtn) {
          mobileMenuBtn.classList.remove("open");
        }
      }

      openCart();
    });

  }


  // CLOSE X
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", (event) => {

      event.preventDefault();
      event.stopPropagation();

      closeCart();

    });
  }


  // CLICK DARK OVERLAY
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }


  // ==========================================================
  // 4. ESC KEY
  // ==========================================================

  document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;


    // Close cart
    if (
      cartDrawer &&
      cartDrawer.classList.contains("active")
    ) {
      closeCart();
      return;
    }


    // Close search
    if (
      searchOverlay &&
      searchOverlay.classList.contains("active")
    ) {
      closeSearch();
      return;
    }


    // Close bridal modal
    if (
      modal &&
      modal.classList.contains("active")
    ) {
      closeBridalModal();
    }

  });


  // ==========================================================
  // 5. FULLSCREEN SEARCH
  // ==========================================================

  const searchBtn =
    document.querySelector(".search-icon-btn");

  const closeSearchBtn =
    document.getElementById("close-search");

  const searchOverlay =
    document.getElementById("search-overlay");

  const searchInput =
    document.getElementById("search-input");


  // OPEN SEARCH
  function openSearch() {

    if (!searchOverlay) return;

    searchOverlay.classList.add("active");

    document.body.style.overflow = "hidden";


    if (searchInput) {

      setTimeout(() => {
        searchInput.focus();
      }, 300);

    }

  }


  // CLOSE SEARCH
  function closeSearch() {

    if (!searchOverlay) return;

    searchOverlay.classList.remove("active");

    if (
      !cartDrawer ||
      !cartDrawer.classList.contains("active")
    ) {
      document.body.style.overflow = "";
    }


    if (searchInput) {
      searchInput.value = "";
    }

  }


  if (searchBtn) {
    searchBtn.addEventListener(
      "click",
      openSearch
    );
  }


  if (closeSearchBtn) {
    closeSearchBtn.addEventListener(
      "click",
      closeSearch
    );
  }


  // Popular search tags
  window.fillSearch = function (text) {

    if (!searchInput) return;

    searchInput.value = text;
    searchInput.focus();

  };


  // ==========================================================
  // 6. MOBILE MENU
  // ==========================================================

  const mobileMenuBtn =
    document.getElementById("mobile-menu-btn");

  const navCenter =
    document.querySelector(".nav-center");


  if (mobileMenuBtn && navCenter) {

    mobileMenuBtn.addEventListener("click", () => {

      navCenter.classList.toggle("active");

      mobileMenuBtn.classList.toggle("open");

    });

  }


  // Close mobile menu when clicking a link
  document
    .querySelectorAll(".nav-item a")
    .forEach((link) => {

      link.addEventListener("click", () => {

        if (
          navCenter &&
          navCenter.classList.contains("active")
        ) {

          navCenter.classList.remove("active");

          if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove("open");
          }

        }

      });

    });


  // ==========================================================
  // 7. LUXURY BRIDAL CONSULTATION MODAL
  // ==========================================================

  const modal =
    document.getElementById("appointmentModal");

  const closeModalBtn =
    document.getElementById("closeModal");

  const modalOverlay =
    document.getElementById("modalOverlay");

  const bridalButton =
    document.querySelector(".btn-primary-dark");


  function openBridalModal() {
    if (!modal) return;

    // Force modal to be the last child of body
    // This prevents any layout/stacking issue.
    document.body.appendChild(modal);

    // Force the modal to viewport center
    modal.style.position = "fixed";
    modal.style.left = "0";
    modal.style.top = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";

    modal.classList.add("active");

    document.body.style.overflow = "hidden";
  }

  // CLOSE MODAL
  function closeBridalModal() {

    if (!modal) return;

    modal.classList.remove("active");

    // Only unlock body if cart/search isn't open
    if (
      !cartDrawer?.classList.contains("active") &&
      !searchOverlay?.classList.contains("active")
    ) {

      document.body.style.overflow = "";

    }

  }


  // Make globally available
  window.openBridalModal = openBridalModal;
  window.closeBridalModal = closeBridalModal;


  // Atelier button
  if (bridalButton) {

    bridalButton.addEventListener(
      "click",
      openBridalModal
    );

  }


  // Modal close button
  if (closeModalBtn) {

    closeModalBtn.addEventListener(
      "click",
      closeBridalModal
    );

  }


  // Modal overlay
  if (modalOverlay) {

    modalOverlay.addEventListener(
      "click",
      closeBridalModal
    );

  }


  // ==========================================================
  // 8. APPOINTMENT FORM
  // ==========================================================

  const appointmentForm =
    document.getElementById("appointmentForm");


  if (appointmentForm) {

    appointmentForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        // Basic validation
        if (!appointmentForm.checkValidity()) {

          appointmentForm.reportValidity();

          return;

        }


        // Current form values
        const fullname =
          document.getElementById("fullname")?.value.trim();

        const email =
          document.getElementById("email")?.value.trim();

        const whatsapp =
          document.getElementById("whatsapp")?.value.trim();

        const occasion =
          document.getElementById("occasion")?.value;


        console.log("Appointment Request:", {
          fullname,
          email,
          whatsapp,
          occasion
        });


        // Temporary success message
        alert(
          "Thank you, " +
          fullname +
          "! Your consultation request has been received."
        );


        // Reset form
        appointmentForm.reset();

        // Close modal
        closeBridalModal();

      }
    );

  }

});


// ============================================================
// LR HANDLOOMS — CART SYSTEM
// ============================================================

const CART_STORAGE_KEY = "lr_handlooms_cart";

let cart = loadCart();


// ============================================================
// LOAD CART
// ============================================================

function loadCart() {

  try {

    const savedCart =
      localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!savedCart) {
      return [];
    }

    const parsed =
      JSON.parse(savedCart);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(item =>
        item &&
        item.productId &&
        Number(item.price) >= 0
      )
      .map(item => ({
        productId:
          String(item.productId),

        name:
          item.name || "Product",

        price:
          Number(item.price) || 0,

        imgUrl:
          item.imgUrl || "",

        quantity:
          Math.max(
            1,
            Number(item.quantity) || 1
          ),

        stock:
          Math.max(
            0,
            Number(item.stock) || 0
          )
      }));

  } catch (error) {

    console.error(
      "Cart loading error:",
      error
    );

    return [];
  }

}


// ============================================================
// SAVE CART
// ============================================================

function saveCart() {

  try {

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );

  } catch (error) {

    console.error(
      "Cart saving error:",
      error
    );

  }

}


// ============================================================
// ADD PRODUCT TO CART
// ============================================================

function addProductToCart(product) {

  if (!product) {
    return;
  }


  const productId =
    String(product.productId || "");


  if (!productId) {

    console.error(
      "Cannot add product without productId."
    );

    return;
  }


  const price =
    Number(product.price) || 0;


  const quantity =
    Math.max(
      1,
      Number(product.quantity) || 1
    );


  const stock =
    Math.max(
      0,
      Number(product.stock) || 0
    );


  if (stock <= 0) {

    console.warn(
      "Product is out of stock."
    );

    return;
  }


  // ==========================================================
  // CHECK IF PRODUCT ALREADY EXISTS
  // ==========================================================

  const existingItem =
    cart.find(
      item =>
        String(item.productId) ===
        productId
    );


  if (existingItem) {

    const newQuantity =
      existingItem.quantity +
      quantity;


    existingItem.quantity =
      Math.min(
        newQuantity,
        existingItem.stock || stock
      );


    existingItem.price =
      price;

    existingItem.stock =
      stock;

    existingItem.name =
      product.name ||
      existingItem.name;

    existingItem.imgUrl =
      product.imgUrl ||
      existingItem.imgUrl;


  } else {

    cart.push({

      productId,

      name:
        product.name ||
        "Handloom Product",

      price,

      imgUrl:
        product.imgUrl || "",

      quantity,

      stock

    });

  }


  saveCart();

  updateCartUI();


  // Open cart drawer
  if (
    typeof window.openCart ===
    "function"
  ) {

    window.openCart();

  }

}


// ============================================================
// OLD addToCart SUPPORT
// ============================================================

function addToCart(
  name,
  price,
  imgUrl
) {

  /*
   * This keeps your existing
   * homepage buttons working.
   *
   * Product-detail page uses
   * addProductToCart().
   */

  console.warn(
    "Legacy addToCart() used. Product ID is recommended."
  );


  const legacyId =
    `legacy-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;


  addProductToCart({

    productId:
      legacyId,

    name,

    price,

    imgUrl,

    quantity: 1,

    stock: 999999

  });

}


window.addToCart =
  addToCart;


window.addProductToCart =
  addProductToCart;


// ============================================================
// REMOVE PRODUCT
// ============================================================

function removeFromCart(index) {

  if (
    index < 0 ||
    index >= cart.length
  ) {

    return;
  }


  cart.splice(
    index,
    1
  );


  saveCart();

  updateCartUI();

}


window.removeFromCart =
  removeFromCart;


// ============================================================
// CHANGE QUANTITY
// ============================================================

function changeCartQuantity(
  index,
  change
) {

  const item =
    cart[index];


  if (!item) {
    return;
  }


  const currentQuantity =
    Number(item.quantity) || 1;


  let newQuantity =
    currentQuantity +
    Number(change);


  newQuantity =
    Math.max(
      1,
      newQuantity
    );


  // Respect stock
  if (item.stock > 0) {

    newQuantity =
      Math.min(
        newQuantity,
        item.stock
      );

  }


  item.quantity =
    newQuantity;


  saveCart();

  updateCartUI();

}


window.changeCartQuantity =
  changeCartQuantity;


// ============================================================
// UPDATE CART UI
// ============================================================

function updateCartUI() {

  const cartCount =
    document.getElementById(
      "cart-count"
    );


  const cartItemsContainer =
    document.getElementById(
      "cart-items"
    );


  const emptyMsg =
    document.getElementById(
      "empty-msg"
    );


  const cartTotal =
    document.getElementById(
      "cart-total"
    );


  if (
    !cartCount ||
    !cartItemsContainer ||
    !emptyMsg ||
    !cartTotal
  ) {

    return;
  }


  // ==========================================================
  // TOTAL QUANTITY
  // ==========================================================

  const totalQuantity =
    cart.reduce(
      (total, item) =>
        total +
        (
          Number(item.quantity) || 1
        ),
      0
    );


  cartCount.innerText =
    totalQuantity;


  // Clear existing
  cartItemsContainer.innerHTML =
    "";


  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (!cart.length) {

    emptyMsg.style.display =
      "block";

    cartTotal.innerText =
      "₹0";

    return;
  }


  emptyMsg.style.display =
    "none";


  // ==========================================================
  // TOTAL
  // ==========================================================

  let totalAmount =
    0;


  // ==========================================================
  // ITEMS
  // ==========================================================

  cart.forEach(
    (item, index) => {

      const price =
        Number(item.price) || 0;


      const quantity =
        Math.max(
          1,
          Number(item.quantity) || 1
        );


      const itemTotal =
        price * quantity;


      totalAmount +=
        itemTotal;


      const safeName =
        String(
          item.name ||
          "Product"
        )
          .replace(
            /[&<>"']/g,
            char => ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;"
            })[char]
          );


      const safeImage =
        String(
          item.imgUrl || ""
        )
          .replace(
            /"/g,
            "&quot;"
          );


      const itemHTML = `

        <div
          class="cart-item"
          data-cart-index="${index}"
        >

          <img
            src="${safeImage}"
            alt="${safeName}"
            class="cart-item-img"
          >


          <div class="cart-item-details">

            <h4 class="cart-item-title">
              ${safeName}
            </h4>


            <p class="cart-item-price">
              ₹${price.toLocaleString("en-IN")}
            </p>


            <div class="cart-item-bottom">

              <div class="cart-quantity">

                <button
                  type="button"
                  onclick="changeCartQuantity(${index}, -1)"
                  aria-label="Decrease quantity"
                >
                  −
                </button>


                <span>
                  ${quantity}
                </span>


                <button
                  type="button"
                  onclick="changeCartQuantity(${index}, 1)"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>


              <span class="cart-item-total">
                ₹${itemTotal.toLocaleString("en-IN")}
              </span>

            </div>


            <button
              type="button"
              class="remove-item"
              onclick="removeFromCart(${index})"
            >
              REMOVE
            </button>

          </div>

        </div>

      `;


      cartItemsContainer.insertAdjacentHTML(
        "beforeend",
        itemHTML
      );

    }
  );


  // ==========================================================
  // TOTAL
  // ==========================================================

  cartTotal.innerText =
    "₹" +
    totalAmount.toLocaleString(
      "en-IN"
    );

}


// ============================================================
// INITIAL CART STATE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateCartUI();

  }
);


// ============================================================
// LR HANDLOOMS — BACKEND API INTEGRATION
// ============================================================

(() => {

  const API_BASE =
    window.HANDLOOM_API_BASE ||
    "https://backend-8zwr.onrender.com/api";


  let allProducts = [];
  let allCategories = [];


  // ==========================================================
  // API GET
  // ==========================================================

  async function apiGet(endpoint) {

    const response =
      await fetch(`${API_BASE}${endpoint}`);

    const data =
      await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Request failed: ${response.status}`
      );
    }

    return data;
  }


  // ==========================================================
  // SAFE HTML
  // ==========================================================

  function escapeHTML(value) {

    const div =
      document.createElement("div");

    div.textContent =
      value ?? "";

    return div.innerHTML;
  }


  // ==========================================================
  // FALLBACK IMAGE
  // ==========================================================

  const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'%3E%3Crect width='100%25' height='100%25' fill='%23151515'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-family='Arial' font-size='24'%3ELR Handlooms%3C/text%3E%3C/svg%3E";


  // ==========================================================
  // PRODUCT IMAGE
  // ==========================================================

  function getProductImage(product) {

    const mainImage =
      product?.images?.find(
        image => image?.isMain
      ) ||
      product?.images?.[0];

    return (
      mainImage?.url ||
      FALLBACK_IMAGE
    );
  }


  // ==========================================================
  // PRICE
  // ==========================================================

  function formatPrice(price) {

    return (
      "₹" +
      (Number(price) || 0)
        .toLocaleString("en-IN")
    );
  }


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  async function loadCategories() {

    const grid =
      document.getElementById(
        "categoryGrid"
      );

    if (!grid) return;


    grid.innerHTML = `
      <div class="api-loading">
        Loading collections...
      </div>
    `;


    try {

      const data =
        await apiGet(
          "/categories"
        );


      allCategories =
        data.categories ||
        data.data ||
        (
          Array.isArray(data)
            ? data
            : []
        );


      const categories =
        allCategories
          .filter(
            category =>
              category?.isActive !== false
          )
          .sort(
            (a, b) =>
              Number(a.sortOrder || 0) -
              Number(b.sortOrder || 0)
          );


      if (!categories.length) {

        grid.innerHTML = `
          <div class="api-empty">
            No collections available yet.
          </div>
        `;

        return;
      }


      grid.innerHTML =
        categories
          .map((category, index) => {

            const image =
              category?.image?.url ||
              category?.image?.secure_url ||
              category?.image ||
              category?.imageUrl ||
              category?.imageURL ||
              FALLBACK_IMAGE;

            return `
        <a
          href="#collections"
          class="cat-card"
          data-category-id="${escapeHTML(
              category._id || ""
            )}"
        >

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
              category.name ||
              "Handloom Collection"
            )}"
            loading="lazy"
            onerror="
              this.onerror=null;
              this.src='${FALLBACK_IMAGE}'
            "
          >

          <div class="cat-overlay">

            <span>
              ${String(index + 1).padStart(2, "0")}
            </span>

            <h3>
              ${escapeHTML(
              category.name ||
              "Collection"
            )}
            </h3>

            <span>
              BROWSE COLLECTION
            </span>

          </div>

        </a>
      `;

          })
          .join("");


      bindCategoryCards();

      // ==========================================================
      // COLLECTION CAROUSEL
      // ==========================================================

      function setupCollectionCarousel() {

        const grid =
          document.getElementById(
            "categoryGrid"
          );

        const prev =
          document.getElementById(
            "collectionPrev"
          );

        const next =
          document.getElementById(
            "collectionNext"
          );


        if (!grid || !prev || !next) {
          return;
        }


        prev.onclick = () => {

          grid.scrollBy({
            left: -(
              grid.clientWidth * 0.85
            ),

            behavior: "smooth"
          });

        };


        next.onclick = () => {

          grid.scrollBy({
            left:
              grid.clientWidth * 0.85,

            behavior: "smooth"
          });

        };

      }

      setupCollectionCarousel();

      animateDynamicCards();


    } catch (error) {

      console.error(
        "Categories API error:",
        error
      );


      grid.innerHTML = `
        <div class="api-empty">
          Unable to load collections.
          <small>
            Please make sure the backend is running.
          </small>
        </div>
      `;
    }
  }


  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  async function loadProducts() {

    const grid =
      document.getElementById(
        "productGrid"
      );

    if (!grid) return;


    grid.innerHTML = `
      <div class="api-loading">
        Loading collection...
      </div>
    `;


    try {

      const data =
        await apiGet(
          "/products"
        );


      allProducts =
        data.products ||
        data.data ||
        (
          Array.isArray(data)
            ? data
            : []
        );


      allProducts =
        allProducts.filter(
          product =>
            product?.isActive !== false
        );


      if (!allProducts.length) {

        grid.innerHTML = `
          <div class="api-empty">
            No products available yet.
          </div>
        `;

        return;
      }


      renderProducts(
        allProducts
      );


    } catch (error) {

      console.error(
        "Products API error:",
        error
      );


      grid.innerHTML = `
        <div class="api-empty">
          Unable to load products.
          <small>
            Please make sure the backend is running.
          </small>
        </div>
      `;
    }
  }


  // ==========================================================
  // RENDER PRODUCTS
  // ==========================================================

  function renderProducts(products) {

    const grid =
      document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML =
      products.map((product) => {

        const image =
          getProductImage(product);

        // ======================================================
        // OFFER / PRICING
        // Backend already sends calculated pricing
        // ======================================================

        const pricing =
          product?.pricing || {};

        const originalPrice =
          Number(
            pricing.originalPrice ??
            product.price ??
            0
          );

        const finalPrice =
          Number(
            pricing.finalPrice ??
            product.price ??
            0
          );

        const offerActive =
          pricing.offerActive === true &&
          finalPrice < originalPrice;

        const discountPercentage =
          Number(
            pricing.discountPercentage || 0
          );

        const stock =
          Number(product.stock) || 0;

        const outOfStock =
          stock <= 0;


        return `
        <article
          class="product-card"
          data-product-id="${escapeHTML(
          product._id || ""
        )}"
        >

          <div class="img-wrapper">

            <img
              class="product-img"
              src="${escapeHTML(image)}"
              alt="${escapeHTML(
          product.name ||
          "Handloom Product"
        )}"
              loading="lazy"
              onerror="
                this.onerror=null;
                this.src='${FALLBACK_IMAGE}'
              "
            >


            ${offerActive
            ? `
                  <span class="product-badge offer-badge">
                    ${discountPercentage}% OFF
                  </span>
                `
            : ""
          }


            ${product.featured
            ? `
                  <span class="product-badge">
                    FEATURED
                  </span>
                `
            : ""
          }


            <button
              type="button"
              class="quick-add"
              data-add-product="${escapeHTML(
            product._id || ""
          )}"
              ${outOfStock ? "disabled" : ""}
            >
              ${outOfStock
            ? "SOLD OUT"
            : "ADD TO BAG"
          }
            </button>

          </div>


          <div class="product-info">

            <h3>
              ${escapeHTML(
            product.name ||
            "Untitled Product"
          )}
            </h3>


            <div class="price">

              ${offerActive
            ? `
                    <span class="original-price">
                      ${formatPrice(originalPrice)}
                    </span>

                    <span class="sale-price">
                      ${formatPrice(finalPrice)}
                    </span>
                  `
            : `
                    ${formatPrice(originalPrice)}
                  `
          }

            </div>

          </div>

        </article>
      `;

      }).join("");


    bindProductButtons();


    // ==========================================================
    // PRODUCT CARD → PRODUCT DETAIL
    // ==========================================================

    function bindProductCards() {

      document
        .querySelectorAll(".product-card")
        .forEach(card => {

          card.addEventListener("click", event => {

            // Don't open product page when Add to Bag clicked
            if (
              event.target.closest(
                "[data-add-product]"
              )
            ) {
              return;
            }

            const productId =
              card.dataset.productId;

            if (!productId) {
              return;
            }

            window.location.href =
              `./product.html?id=${encodeURIComponent(
                productId
              )}`;

          });

        });

    }


    bindProductCards();

    animateDynamicCards();
  }


  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function bindProductButtons() {

    document
      .querySelectorAll(
        "[data-add-product]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          event => {

            event.preventDefault();
            event.stopPropagation();


            const productId =
              button.dataset.addProduct;


            const product =
              allProducts.find(
                item =>
                  String(item._id) ===
                  String(productId)
              );


            if (!product) return;


            if (
              Number(product.stock || 0) <= 0
            ) {

              return;
            }


            if (
              typeof window.addToCart ===
              "function"
            ) {

              window.addProductToCart({

                productId:
                  product._id,

                name:
                  product.name ||
                  "Product",

                price:
                  Number(
                    product?.pricing?.finalPrice ??
                    product.price ??
                    0
                  ),

                imgUrl:
                  getProductImage(product),

                quantity:
                  1,

                stock:
                  Number(product.stock) ||
                  0

              });

            } else {

              console.error(
                "addToCart function not found."
              );
            }

          }
        );

      });
  }


  // ==========================================================
  // CATEGORY → SEPARATE CATEGORY PAGE
  // ==========================================================

  function bindCategoryCards() {

    document
      .querySelectorAll("[data-category-id]")
      .forEach(card => {

        card.addEventListener(
          "click",
          event => {

            event.preventDefault();

            const categoryId =
              card.dataset.categoryId;

            if (!categoryId) {
              return;
            }

            window.location.href =
              `./category.html?id=${encodeURIComponent(
                categoryId
              )}`;

          }
        );

      });
  }

  // ==========================================================
  // GSAP DYNAMIC CARDS
  // ==========================================================

  function animateDynamicCards() {

    if (
      typeof gsap === "undefined" ||
      typeof ScrollTrigger === "undefined"
    ) {

      return;
    }


    const categoryCards =
      document.querySelectorAll(
        "#categoryGrid .cat-card"
      );


    if (categoryCards.length) {

      gsap.fromTo(
        categoryCards,

        {
          y: 40,
          opacity: 0
        },

        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",

          scrollTrigger: {
            trigger:
              "#categoryGrid",

            start:
              "top 80%",

            once: true
          }
        }
      );

    }


    const productCards =
      document.querySelectorAll(
        "#productGrid .product-card"
      );


    if (productCards.length) {

      gsap.fromTo(
        productCards,

        {
          y: 40,
          opacity: 0
        },

        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",

          scrollTrigger: {
            trigger:
              "#productGrid",

            start:
              "top 80%",

            once: true
          }
        }
      );

    }

  }


  // ==========================================================
  // START API
  // ==========================================================

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      await Promise.all([
        loadCategories(),
        loadProducts()
      ]);

    }
  );


  // ==========================================================
  // GLOBAL ACCESS
  // ==========================================================

  window.handloomAPI = {

    loadCategories,

    loadProducts,

    renderProducts,

    getProducts:
      () => allProducts,

    getCategories:
      () => allCategories

  };

})();

// ============================================================
// LR HANDLOOMS — AUTO WEBSITE REFRESH
// ============================================================

(() => {

  const API_BASE =
    window.HANDLOOM_API_BASE ||
    "https://backend-8zwr.onrender.com/api";


  let lastWebsiteVersion = null;

  let checking = false;


  async function checkWebsiteVersion() {

    // Prevent overlapping requests
    if (checking) return;

    checking = true;


    try {

      const response = await fetch(
        `${API_BASE}/website/version?t=${Date.now()}`,
        {
          method: "GET",

          cache: "no-store",

          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        }
      );


      if (!response.ok) {
        return;
      }


      const data =
        await response.json();


      if (
        !data.success ||
        !data.version
      ) {
        return;
      }


      // First check:
      // just remember current version.
      if (
        lastWebsiteVersion === null
      ) {

        lastWebsiteVersion =
          data.version;

        return;
      }


      // Something changed
      if (
        String(data.version) !==
        String(lastWebsiteVersion)
      ) {

        console.log(
          "🌐 Website data changed. Refreshing..."
        );


        // Update before reload
        lastWebsiteVersion =
          data.version;


        window.location.reload();

      }


    } catch (error) {

      // Don't break the website
      console.warn(
        "Auto refresh check failed:",
        error
      );

    } finally {

      checking = false;

    }

  }


  // Initial check
  checkWebsiteVersion();


  // Check every 3 seconds
  setInterval(
    checkWebsiteVersion,
    3000
  );


})();

/* =========================================================
   LR HANDLOOMS — USER AUTH NAVBAR
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  const API_BASE =
    window.HANDLOOM_API_BASE ||
    "https://backend-8zwr.onrender.com/api";

  const TOKEN_KEY =
    "lr_handlooms_user_token";

  const accountLink =
    document.getElementById("account-nav-link");

  if (!accountLink) {
    return;
  }

  const token =
    localStorage.getItem(TOKEN_KEY);

  /*
   * No login
   */
  if (!token) {

    accountLink.textContent =
      "ACCOUNT";

    accountLink.href =
      "./account.html";

    return;
  }


  try {

    const response =
      await fetch(
        `${API_BASE}/auth/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          cache: "no-store"
        }
      );


    const data =
      await response.json();


    /*
     * Token invalid / expired
     */
    if (
      response.status === 401 ||
      response.status === 403 ||
      !data.success ||
      !data.user
    ) {

      localStorage.removeItem(
        TOKEN_KEY
      );

      accountLink.textContent =
        "ACCOUNT";

      accountLink.href =
        "./account.html";

      return;
    }


    /*
     * USER IS LOGGED IN
     */

    const name =
      data.user.name ||
      "MY ACCOUNT";


    /*
     * Get first name only
     */
    const firstName =
      name
        .trim()
        .split(/\s+/)[0];


    accountLink.textContent =
      `HI, ${firstName.toUpperCase()}`;


    accountLink.href =
      "./account-dashboard.html";


    accountLink.classList.add(
      "user-logged-in"
    );


  } catch (error) {

    console.warn(
      "Navbar auth check failed:",
      error
    );

    /*
     * Don't delete the token on
     * temporary network/server errors.
     */

    accountLink.textContent =
      "ACCOUNT";

    accountLink.href =
      "./account.html";
  }

});