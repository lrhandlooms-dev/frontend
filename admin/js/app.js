const API_BASE = "https://backend-8zwr.onrender.com/api";


// ==========================================
// AUTH HELPERS
// ==========================================

const getToken = () => {
  return localStorage.getItem("handloom_admin_token");
};


const saveToken = (token) => {
  localStorage.setItem(
    "handloom_admin_token",
    token
  );
};


const logout = () => {
  localStorage.removeItem(
    "handloom_admin_token"
  );

  localStorage.removeItem(
    "handloom_admin"
  );

  window.location.href = "./login.html";
};


// ==========================================
// API REQUEST
// ==========================================

const apiRequest = async (
  endpoint,
  options = {}
) => {

  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (
    response.status === 401 ||
    data.message ===
      "Invalid or expired token"
  ) {
    logout();

    throw new Error(
      "Session expired"
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Something went wrong"
    );
  }

  return data;
};


// ==========================================
// LOGIN
// ==========================================

const loginForm =
  document.getElementById(
    "loginForm"
  );


if (loginForm) {

  // Already logged in?
  if (getToken()) {
    window.location.href =
      "./index.html";
  }


  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const email =
        document.getElementById(
          "email"
        ).value.trim();

      const password =
        document.getElementById(
          "password"
        ).value;

      const message =
        document.getElementById(
          "loginMessage"
        );

      const button =
        loginForm.querySelector(
          ".login-btn"
        );

      button.disabled = true;

      button.querySelector(
        "span:first-child"
      ).textContent = "SIGNING IN...";

      message.className =
        "login-message";

      message.textContent = "";

      try {

        const response =
          await fetch(
            `${API_BASE}/admin/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Login failed"
          );
        }

        if (!data.token) {
          throw new Error(
            "No authentication token received"
          );
        }

        saveToken(data.token);

        if (data.admin) {
          localStorage.setItem(
            "handloom_admin",
            JSON.stringify(
              data.admin
            )
          );
        }

        message.className =
          "login-message success";

        message.textContent =
          "Login successful. Opening dashboard...";

        setTimeout(() => {
          window.location.href =
            "./index.html";
        }, 500);

      } catch (error) {

        console.error(
          "Login error:",
          error
        );

        message.className =
          "login-message error";

        message.textContent =
          error.message ||
          "Unable to login.";

        button.disabled = false;

        button.querySelector(
          "span:first-child"
        ).textContent = "LOGIN";
      }
    }
  );
}


// ==========================================
// DASHBOARD PROTECTION
// ==========================================

const isDashboard =
  document.querySelector(
    ".admin-layout"
  );


if (isDashboard) {

  if (!getToken()) {
    window.location.href =
      "./login.html";
  }
}


// ==========================================
// ADMIN PROFILE
// ==========================================

const loadAdminProfile = () => {

  const adminData =
    localStorage.getItem(
      "handloom_admin"
    );

  if (!adminData) {
    return;
  }

  try {

    const admin =
      JSON.parse(adminData);

    const name =
      document.getElementById(
        "adminName"
      );

    const email =
      document.getElementById(
        "adminEmail"
      );

    const avatar =
      document.querySelector(
        ".profile-avatar"
      );

    if (name && admin.name) {
      name.textContent =
        admin.name;
    }

    if (email && admin.email) {
      email.textContent =
        admin.email;
    }

    if (
      avatar &&
      admin.name
    ) {
      avatar.textContent =
        admin.name
          .charAt(0)
          .toUpperCase();
    }

  } catch (error) {
    console.error(
      "Admin profile error:",
      error
    );
  }
};


// ==========================================
// LOAD DASHBOARD
// ==========================================

const loadDashboard =
  async () => {

    try {

      const [
        productsResponse,
        categoriesResponse,
        inventoryResponse,
      ] = await Promise.all([
        apiRequest("/products"),
        apiRequest("/categories"),
        apiRequest("/inventory"),
      ]);


      // ======================================
      // PRODUCTS
      // ======================================

      const products =
        productsResponse.products ||
        [];

      const productCount =
        document.getElementById(
          "productCount"
        );

      if (productCount) {
        productCount.textContent =
          productsResponse.totalProducts ??
          productsResponse.count ??
          products.length;
      }


      // ======================================
      // CATEGORIES
      // ======================================

      const categories =
        categoriesResponse.categories ||
        [];

      const categoryCount =
        document.getElementById(
          "categoryCount"
        );

      if (categoryCount) {
        categoryCount.textContent =
          categoriesResponse.count ??
          categories.length;
      }


      // ======================================
      // INVENTORY
      // ======================================

      const inventory =
        inventoryResponse.inventory ||
        [];

      const inventoryCount =
        document.getElementById(
          "inventoryCount"
        );

      if (inventoryCount) {
        inventoryCount.textContent =
          inventory.length;
      }


      // ======================================
      // OFFERS
      // ======================================

      const activeOffers =
        products.filter(
          (product) => {

            return (
              product.offer &&
              product.offer.enabled
            );
          }
        ).length;

      const offerCount =
        document.getElementById(
          "offerCount"
        );

      if (offerCount) {
        offerCount.textContent =
          activeOffers;
      }


      // ======================================
      // RECENT PRODUCTS
      // ======================================

      renderRecentProducts(
        products
      );


      // ======================================
      // INVENTORY STATUS
      // ======================================

      renderInventory(
        inventory
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    }
  };


// ==========================================
// RENDER PRODUCTS
// ==========================================

const renderRecentProducts =
  (products) => {

    const container =
      document.getElementById(
        "recentProducts"
      );

    if (!container) {
      return;
    }

    if (!products.length) {

      container.innerHTML = `
        <div class="loading">
          No products found.
        </div>
      `;

      return;
    }

    const recent =
      products.slice(0, 6);

    container.innerHTML =
      recent
        .map((product) => {

          const image =
            product.images &&
            product.images.length
              ? product.images[0].url
              : "";

          return `
            <div class="product-row">

              ${
                image
                  ? `
                    <img
                      class="product-image"
                      src="${image}"
                      alt="${escapeHtml(
                        product.name
                      )}"
                    />
                  `
                  : `
                    <div class="product-image"></div>
                  `
              }

              <div class="product-info">

                <strong>
                  ${escapeHtml(
                    product.name
                  )}
                </strong>

                <span>
                  ${
                    product.category?.name ||
                    "Uncategorized"
                  }
                </span>

              </div>

              <div class="product-price">
                ₹${Number(
                  product.pricing
                    ?.finalPrice ??
                    product.price ??
                    0
                ).toLocaleString("en-IN")}
              </div>

            </div>
          `;
        })
        .join("");
  };


// ==========================================
// RENDER INVENTORY
// ==========================================

const renderInventory =
  (inventory) => {

    const container =
      document.getElementById(
        "inventoryStatus"
      );

    if (!container) {
      return;
    }

    if (!inventory.length) {

      container.innerHTML = `
        <div class="loading">
          No inventory records found.
        </div>
      `;

      return;
    }

    const items =
      inventory.slice(0, 6);

    container.innerHTML =
      items
        .map((item) => {

          const name =
            item.product?.name ||
            "Unknown Product";

          const stock =
            item.stock ?? 0;

          const status =
            item.status ||
            "IN_STOCK";

          let statusClass =
            "in-stock";

          if (
            status ===
            "LOW_STOCK"
          ) {
            statusClass =
              "low-stock";
          }

          if (
            status ===
            "OUT_OF_STOCK"
          ) {
            statusClass =
              "out-of-stock";
          }

          return `
            <div class="inventory-row">

              <span class="inventory-name">
                ${escapeHtml(name)}
              </span>

              <span class="inventory-stock">

                ${stock} pcs

                <span
                  class="status ${statusClass}"
                >
                  ${status.replace(
                    /_/g,
                    " "
                  )}
                </span>

              </span>

            </div>
          `;
        })
        .join("");
  };


// ==========================================
// HTML ESCAPE
// ==========================================

const escapeHtml =
  (value) => {

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      value ?? "";

    return div.innerHTML;
  };


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logout
  );
}


// ==========================================
// INIT
// ==========================================

if (isDashboard) {

  loadAdminProfile();

  loadDashboard();
}