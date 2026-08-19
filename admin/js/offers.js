const API_BASE = "https://backend-8zwr.onrender.com/api";
const OFFERS_API = API_BASE;

let allProducts = [];
let selectedProduct = null;
let selectedOfferType = "percentage";


// ==========================================
// AUTH
// ==========================================

const getAdminToken = () => {
  return localStorage.getItem("handloom_admin_token");
};


const logoutAdmin = () => {

  localStorage.removeItem("handloom_admin_token");
  localStorage.removeItem("handloom_admin");

  window.location.href = "./login.html";
};


// ==========================================
// API
// ==========================================

const offersRequest = async (endpoint, options = {}) => {

  const token = getAdminToken();

  if (!token) {
    window.location.href = "./login.html";
    throw new Error("Authentication required");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(
    `${OFFERS_API}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (
    response.status === 401 ||
    data.message === "Invalid or expired token"
  ) {
    logoutAdmin();
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
};


// ==========================================
// ELEMENTS
// ==========================================

const offersGrid =
  document.getElementById("offersGrid");

const searchInput =
  document.getElementById("searchInput");

const statusFilter =
  document.getElementById("statusFilter");

const sortFilter =
  document.getElementById("sortFilter");

const resultCount =
  document.getElementById("resultCount");

const offerModal =
  document.getElementById("offerModal");

const offerForm =
  document.getElementById("offerForm");

const offerEnabled =
  document.getElementById("offerEnabled");

const offerFields =
  document.getElementById("offerFields");

const offerValue =
  document.getElementById("offerValue");

const offerStart =
  document.getElementById("offerStart");

const offerEnd =
  document.getElementById("offerEnd");

const originalPrice =
  document.getElementById("originalPrice");

const salePrice =
  document.getElementById("salePrice");

const offerMessage =
  document.getElementById("offerMessage");


// ==========================================
// LOAD PRODUCTS
// ==========================================

const loadProducts = async () => {

  try {

    offersGrid.innerHTML = `
      <div class="offers-loading">
        <div class="loading-spinner"></div>
        <span>Loading offers...</span>
      </div>
    `;

    const data =
      await offersRequest("/products");

    allProducts =
      data.products || [];

    updateStats();

    renderOffers();

  } catch (error) {

    console.error(
      "Load offers error:",
      error
    );

    offersGrid.innerHTML = `
      <div class="offer-empty">
        <strong>Unable to load offers</strong>
        ${escapeHtml(error.message)}
      </div>
    `;
  }
};


// ==========================================
// OFFER STATUS
// ==========================================

const getOfferStatus = (product) => {

  const offer = product.offer;

  if (!offer?.enabled) {
    return "none";
  }

  const now = new Date();

  const start =
    offer.startDate
      ? new Date(offer.startDate)
      : null;

  const end =
    offer.endDate
      ? new Date(offer.endDate)
      : null;


  if (start && now < start) {
    return "scheduled";
  }

  if (end && now > end) {
    return "expired";
  }

  return "active";
};


// ==========================================
// DISCOUNT
// ==========================================

const calculateDiscount = (product) => {

  const offer = product.offer;

  if (!offer?.enabled) {
    return 0;
  }

  const price =
    Number(product.price || 0);

  const value =
    Number(offer.value || 0);


  if (offer.type === "fixed") {
    return Math.min(value, price);
  }


  return Math.min(
    price * value / 100,
    price
  );
};


const getFinalPrice = (product) => {

  const price =
    Number(product.price || 0);

  const discount =
    calculateDiscount(product);

  return Math.max(
    0,
    price - discount
  );
};


// ==========================================
// STATS
// ==========================================

const updateStats = () => {

  const active =
    allProducts.filter(
      p => getOfferStatus(p) === "active"
    ).length;

  const scheduled =
    allProducts.filter(
      p => getOfferStatus(p) === "scheduled"
    ).length;

  const expired =
    allProducts.filter(
      p => getOfferStatus(p) === "expired"
    ).length;


  document.getElementById(
    "activeCount"
  ).textContent = active;


  document.getElementById(
    "scheduledCount"
  ).textContent = scheduled;


  document.getElementById(
    "expiredCount"
  ).textContent = expired;


  document.getElementById(
    "productCount"
  ).textContent =
    allProducts.length;
};


// ==========================================
// FILTER
// ==========================================

const renderOffers = () => {

  let products =
    [...allProducts];


  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const status =
    statusFilter.value;


  const sort =
    sortFilter.value;


  // SEARCH

  if (search) {

    products =
      products.filter(
        product => {

          const text = [
            product.name,
            product.slug,
            product.category?.name,
            product.fabric
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(search);
        }
      );
  }


  // STATUS

  if (status !== "all") {

    products =
      products.filter(
        product =>
          getOfferStatus(product) === status
      );
  }


  // SORT

  products.sort(
    (a, b) => {

      switch (sort) {

        case "oldest":
          return (
            new Date(a.createdAt) -
            new Date(b.createdAt)
          );


        case "price_low":
          return (
            Number(a.price || 0) -
            Number(b.price || 0)
          );


        case "price_high":
          return (
            Number(b.price || 0) -
            Number(a.price || 0)
          );


        case "discount_high":
          return (
            calculateDiscount(b) -
            calculateDiscount(a)
          );


        default:
          return (
            new Date(b.createdAt) -
            new Date(a.createdAt)
          );
      }
    }
  );


  resultCount.textContent =
    `${products.length} product${products.length === 1 ? "" : "s"}`;


  if (!products.length) {

    offersGrid.innerHTML = `
      <div class="offer-empty">
        <strong>No products found</strong>
        Try changing your search or filter.
      </div>
    `;

    return;
  }


  offersGrid.innerHTML =
    products
      .map(createOfferCard)
      .join("");
};


// ==========================================
// OFFER CARD
// ==========================================

const createOfferCard = (product) => {

  const mainImage =
    product.images?.find(
      image => image.isMain
    ) ||
    product.images?.[0];


  const image =
    mainImage?.url || "";


  const status =
    getOfferStatus(product);


  const discount =
    calculateDiscount(product);


  const finalPrice =
    getFinalPrice(product);


  const hasOffer =
    product.offer?.enabled;


  let statusLabel =
    "NO OFFER";


  if (status === "active") {
    statusLabel = "ACTIVE";
  }

  if (status === "scheduled") {
    statusLabel = "SCHEDULED";
  }

  if (status === "expired") {
    statusLabel = "EXPIRED";
  }


  const discountText =
    hasOffer
      ? product.offer.type === "percentage"
        ? `${product.offer.value}% OFF`
        : `₹${Number(product.offer.value).toLocaleString("en-IN")} OFF`
      : "";


  const dateText =
    hasOffer
      ? getOfferDateText(product.offer)
      : "No promotion";


  return `
    <article class="offer-card">

      <div class="offer-card-image">

        ${
          image
            ? `
              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(product.name)}"
              />
            `
            : `
              <div class="offer-image-placeholder">
                HANDLOOM
              </div>
            `
        }


        <span class="offer-status ${status}">
          ${statusLabel}
        </span>


        ${
          discount
            ? `
              <span class="discount-badge">
                ${escapeHtml(discountText)}
              </span>
            `
            : ""
        }

      </div>


      <div class="offer-card-body">

        <div class="offer-category">
          ${escapeHtml(
            product.category?.name ||
            "UNCATEGORIZED"
          )}
        </div>


        <h3>
          ${escapeHtml(product.name)}
        </h3>


        <div class="price-row">

          ${
            hasOffer
              ? `
                <span class="original-price">
                  ₹${Number(
                    product.price || 0
                  ).toLocaleString("en-IN")}
                </span>

                <span class="offer-price">
                  ₹${Number(
                    finalPrice
                  ).toLocaleString("en-IN")}
                </span>
              `
              : `
                <span class="final-price">
                  ₹${Number(
                    product.price || 0
                  ).toLocaleString("en-IN")}
                </span>
              `
          }

        </div>


        <div class="offer-info">

          <div class="offer-info-item">

            <span>DISCOUNT</span>

            <strong>
              ${
                discount
                  ? escapeHtml(discountText)
                  : "—"
              }
            </strong>

          </div>


          <div class="offer-info-item">

            <span>VALIDITY</span>

            <strong>
              ${escapeHtml(dateText)}
            </strong>

          </div>

        </div>


        <div class="offer-card-actions">

          <button
            class="offer-edit-btn"
            onclick="openOfferModal('${product._id}')"
          >
            ${hasOffer ? "EDIT OFFER" : "CREATE OFFER"}
          </button>


          ${
            hasOffer
              ? `
                <button
                  class="offer-toggle-btn"
                  title="Toggle offer"
                  onclick="toggleOffer('${product._id}')"
                >
                  ${product.offer.enabled ? "●" : "○"}
                </button>
              `
              : ""
          }

        </div>

      </div>

    </article>
  `;
};


// ==========================================
// DATE TEXT
// ==========================================

const getOfferDateText = (offer) => {

  if (!offer) {
    return "—";
  }

  const start =
    offer.startDate
      ? formatShortDate(offer.startDate)
      : "Now";


  const end =
    offer.endDate
      ? formatShortDate(offer.endDate)
      : "No end";


  return `${start} → ${end}`;
};


const formatShortDate = (date) => {

  const d =
    new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};


// ==========================================
// OPEN MODAL
// ==========================================

const openOfferModal = (productId) => {

  const product =
    allProducts.find(
      p => p._id === productId
    );


  if (!product) {
    return;
  }


  selectedProduct =
    product;


  const offer =
    product.offer || {};


  document.getElementById(
    "modalProductName"
  ).textContent =
    product.name;


  originalPrice.textContent =
    `₹${Number(
      product.price || 0
    ).toLocaleString("en-IN")}`;


  offerEnabled.checked =
    offer.enabled || false;


  selectedOfferType =
    offer.type || "percentage";


  offerValue.value =
    offer.value ?? 0;


  offerStart.value =
    formatDateTimeLocal(
      offer.startDate
    );


  offerEnd.value =
    formatDateTimeLocal(
      offer.endDate
    );


  updateTypeButtons();


  toggleOfferFields();


  updatePricePreview();


  offerMessage.textContent =
    "";


  offerModal.classList.add(
    "open"
  );
};


// ==========================================
// CLOSE MODAL
// ==========================================

const closeOfferModal = () => {

  offerModal.classList.remove(
    "open"
  );

  selectedProduct =
    null;
};


// ==========================================
// TYPE BUTTONS
// ==========================================

const updateTypeButtons = () => {

  document
    .querySelectorAll(".type-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.type ===
          selectedOfferType
      );

    });


  document.getElementById(
    "valueSuffix"
  ).textContent =
    selectedOfferType ===
      "percentage"
      ? "%"
      : "₹";
};


document
  .querySelectorAll(".type-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectedOfferType =
          button.dataset.type;

        updateTypeButtons();

        updatePricePreview();
      }
    );
  });


// ==========================================
// TOGGLE FIELDS
// ==========================================

const toggleOfferFields = () => {

  offerFields.classList.toggle(
    "hidden",
    !offerEnabled.checked
  );
};


offerEnabled.addEventListener(
  "change",
  () => {

    toggleOfferFields();

    updatePricePreview();
  }
);


// ==========================================
// PRICE PREVIEW
// ==========================================

const updatePricePreview = () => {

  if (!selectedProduct) {
    return;
  }


  const price =
    Number(
      selectedProduct.price || 0
    );


  const value =
    Number(
      offerValue.value || 0
    );


  let final =
    price;


  if (offerEnabled.checked) {

    if (
      selectedOfferType ===
      "percentage"
    ) {

      final =
        price -
        (
          price *
          Math.min(value, 100) /
          100
        );

    } else {

      final =
        price -
        Math.min(
          value,
          price
        );
    }
  }


  final =
    Math.max(0, final);


  salePrice.textContent =
    `₹${Math.round(
      final
    ).toLocaleString("en-IN")}`;
};


offerValue.addEventListener(
  "input",
  updatePricePreview
);


// ==========================================
// SAVE OFFER
// ==========================================

offerForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (!selectedProduct) {
      return;
    }


    offerMessage.textContent =
      "Saving offer...";


    const value =
      Number(
        offerValue.value || 0
      );


    if (
      offerEnabled.checked &&
      value <= 0
    ) {

      offerMessage.textContent =
        "Discount value must be greater than 0.";

      return;
    }


    if (
      selectedOfferType ===
        "percentage" &&
      value > 100
    ) {

      offerMessage.textContent =
        "Percentage discount cannot exceed 100%.";

      return;
    }


    if (
      offerStart.value &&
      offerEnd.value &&
      new Date(offerEnd.value) <=
        new Date(offerStart.value)
    ) {

      offerMessage.textContent =
        "End date must be after start date.";

      return;
    }


    const offer = {

      enabled:
        offerEnabled.checked,

      type:
        selectedOfferType,

      value,

      startDate:
        offerStart.value ||
        null,

      endDate:
        offerEnd.value ||
        null
    };


    const saveBtn =
      document.getElementById(
        "saveOfferBtn"
      );


    saveBtn.disabled = true;


    try {

      await offersRequest(
        `/products/${selectedProduct._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              offer
            })
        }
      );


      closeOfferModal();

      await loadProducts();


    } catch (error) {

      console.error(
        "Save offer error:",
        error
      );

      offerMessage.textContent =
        error.message ||
        "Unable to save offer.";

    } finally {

      saveBtn.disabled =
        false;
    }
  }
);


// ==========================================
// TOGGLE OFFER
// ==========================================

const toggleOffer = async (productId) => {

  const product =
    allProducts.find(
      p => p._id === productId
    );


  if (!product) {
    return;
  }


  const current =
    product.offer || {};


  try {

    await offersRequest(
      `/products/${productId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            offer: {
              ...current,
              enabled:
                !current.enabled
            }
          })
      }
    );


    await loadProducts();


  } catch (error) {

    console.error(
      "Toggle offer error:",
      error
    );

    alert(
      error.message ||
      "Unable to update offer."
    );
  }
};


// ==========================================
// REMOVE OFFER
// ==========================================

document
  .getElementById(
    "removeOfferBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!selectedProduct) {
        return;
      }


      const confirmed =
        confirm(
          `Remove offer from "${selectedProduct.name}"?`
        );


      if (!confirmed) {
        return;
      }


      try {

        await offersRequest(
          `/products/${selectedProduct._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                offer: {
                  enabled: false,
                  type: "percentage",
                  value: 0,
                  startDate: null,
                  endDate: null
                }
              })
          }
        );


        closeOfferModal();

        await loadProducts();


      } catch (error) {

        console.error(
          "Remove offer error:",
          error
        );

        alert(
          error.message ||
          "Unable to remove offer."
        );
      }
    }
  );


// ==========================================
// EVENTS
// ==========================================

searchInput.addEventListener(
  "input",
  renderOffers
);

statusFilter.addEventListener(
  "change",
  renderOffers
);

sortFilter.addEventListener(
  "change",
  renderOffers
);


document
  .getElementById("closeModal")
  .addEventListener(
    "click",
    closeOfferModal
  );


document
  .getElementById("cancelBtn")
  .addEventListener(
    "click",
    closeOfferModal
  );


offerModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      offerModal
    ) {
      closeOfferModal();
    }
  }
);


document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    logoutAdmin
);


// ==========================================
// ESCAPE HTML
// ==========================================

const escapeHtml = (value) => {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;
};


// ==========================================
// DATE INPUT
// ==========================================

const formatDateTimeLocal = (
  date
) => {

  if (!date) {
    return "";
  }


  const d =
    new Date(date);


  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return "";
  }


  const pad =
    number =>
      String(number)
        .padStart(2, "0");


  return (
    `${d.getFullYear()}-` +
    `${pad(d.getMonth() + 1)}-` +
    `${pad(d.getDate())}T` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}`
  );
};


// ==========================================
// EXPOSE FUNCTIONS
// ==========================================

window.openOfferModal =
  openOfferModal;

window.toggleOffer =
  toggleOffer;


// ==========================================
// INIT
// ==========================================

const initOffers = async () => {

  if (!getAdminToken()) {

    window.location.href =
      "./login.html";

    return;
  }


  const admin =
    JSON.parse(
      localStorage.getItem(
        "handloom_admin"
      ) || "{}"
    );


  if (admin.name) {
    document.getElementById(
      "adminName"
    ).textContent =
      admin.name;
  }


  if (admin.email) {
    document.getElementById(
      "adminEmail"
    ).textContent =
      admin.email;
  }


  await loadProducts();
};


initOffers();