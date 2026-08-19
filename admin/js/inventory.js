document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // CONFIG
  // ==========================================

  const API_BASE = "https://backend-8zwr.onrender.com/api";


  // ==========================================
  // STATE
  // ==========================================

  let inventory = [];
  let filteredInventory = [];

  let currentProduct = null;
  let currentAction = "set";


  // ==========================================
  // ELEMENTS
  // ==========================================

  const tableBody =
    document.getElementById(
      "inventoryTableBody"
    );

  const mobileContainer =
    document.getElementById(
      "inventoryMobile"
    );

  const searchInput =
    document.getElementById(
      "inventorySearch"
    );

  const stockFilter =
    document.getElementById(
      "stockFilter"
    );

  const categoryFilter =
    document.getElementById(
      "categoryFilter"
    );

  const resultCount =
    document.getElementById(
      "resultCount"
    );

  const stockModal =
    document.getElementById(
      "stockModal"
    );

  const stockValue =
    document.getElementById(
      "stockValue"
    );


  // ==========================================
  // TOKEN
  // ==========================================

  const getToken = () => {

    return localStorage.getItem(
      "handloom_admin_token"
    );

  };


  // ==========================================
  // API
  // ==========================================

  const api = async (
    endpoint,
    options = {}
  ) => {

    const token =
      getToken();

    const headers = {
      ...(options.headers || {})
    };


    if (token) {

      headers.Authorization =
        `Bearer ${token}`;

    }


    const response =
      await fetch(
        `${API_BASE}${endpoint}`,
        {
          ...options,
          headers
        }
      );


    let data;

    try {

      data =
        await response.json();

    } catch {

      throw new Error(
        "Invalid server response"
      );

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Request failed"
      );

    }


    return data;

  };


  // ==========================================
  // LOAD INVENTORY
  // ==========================================

  const loadInventory = async () => {

    try {

      tableBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="table-loading"
          >
            Loading inventory...
          </td>
        </tr>
      `;


      const data =
        await api("/inventory");


      inventory =
        data.inventory || [];


      buildCategoryFilter();

      applyFilters();

      updateStats();


    } catch (error) {

      console.error(
        "Inventory load error:",
        error
      );


      tableBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="table-loading"
          >
            ${escapeHtml(
              error.message
            )}
          </td>
        </tr>
      `;

    }

  };


  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  const buildCategoryFilter = () => {

    const categories =
      new Map();


    inventory.forEach(
      (item) => {

        const product =
          item.product;

        if (!product) return;


        const category =
          product.category;


        if (
          category &&
          typeof category === "object"
        ) {

          categories.set(
            category._id,
            category.name
          );

        }

      }
    );


    categoryFilter.innerHTML = `
      <option value="ALL">
        All categories
      </option>
    `;


    categories.forEach(
      (name, id) => {

        const option =
          document.createElement(
            "option"
          );

        option.value = id;
        option.textContent = name;

        categoryFilter.appendChild(
          option
        );

      }
    );

  };


  // ==========================================
  // STATUS
  // ==========================================

  const getStatus = (item) => {

    const stock =
      Number(item.stock) || 0;

    const threshold =
      Number(
        item.lowStockThreshold
      ) || 0;


    if (stock === 0) {

      return "OUT_OF_STOCK";

    }


    if (stock <= threshold) {

      return "LOW_STOCK";

    }


    return "IN_STOCK";

  };


  const statusLabel = (
    status
  ) => {

    if (
      status === "OUT_OF_STOCK"
    ) {

      return "OUT OF STOCK";

    }


    if (
      status === "LOW_STOCK"
    ) {

      return "LOW STOCK";

    }


    return "IN STOCK";

  };


  // ==========================================
  // FILTERS
  // ==========================================

  const applyFilters = () => {

    const search =
      searchInput.value
        .trim()
        .toLowerCase();


    const stockStatus =
      stockFilter.value;


    const category =
      categoryFilter.value;


    filteredInventory =
      inventory.filter(
        (item) => {

          const product =
            item.product;


          if (!product) {
            return false;
          }


          const matchesSearch =
            !search ||
            product.name
              ?.toLowerCase()
              .includes(search);


          const status =
            getStatus(item);


          const matchesStock =
            stockStatus === "ALL" ||
            status === stockStatus;


          let matchesCategory =
            true;


          if (
            category !== "ALL"
          ) {

            const productCategory =
              product.category;


            matchesCategory =
              productCategory &&
              typeof productCategory === "object" &&
              productCategory._id === category;

          }


          return (
            matchesSearch &&
            matchesStock &&
            matchesCategory
          );

        }
      );


    renderInventory();

  };


  // ==========================================
  // RENDER
  // ==========================================

  const renderInventory = () => {

    resultCount.textContent =
      `${filteredInventory.length} ${
        filteredInventory.length === 1
          ? "product"
          : "products"
      }`;


    if (
      !filteredInventory.length
    ) {

      tableBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="table-loading"
          >
            No inventory found.
          </td>
        </tr>
      `;


      mobileContainer.innerHTML = `
        <div class="table-loading">
          No inventory found.
        </div>
      `;

      return;

    }


    tableBody.innerHTML =
      filteredInventory
        .map(
          (item) =>
            renderRow(item)
        )
        .join("");


    mobileContainer.innerHTML =
      filteredInventory
        .map(
          (item) =>
            renderMobileCard(item)
        )
        .join("");


    bindActions();

  };


  // ==========================================
  // TABLE ROW
  // ==========================================

  const renderRow = (
    item
  ) => {

    const product =
      item.product;


    const status =
      getStatus(item);


    const image =
      product.images?.find(
        (img) =>
          img.isMain
      )?.url ||
      product.images?.[0]?.url ||
      "https://placehold.co/100x120/151515/777?text=No+Image";


    const categoryName =
      product.category &&
      typeof product.category === "object"
        ? product.category.name
        : "Uncategorized";


    const price =
      Number(
        product.price || 0
      ).toLocaleString(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
        }
      );


    return `
      <tr>

        <td>

          <div class="product-cell">

            <img
              class="product-thumb"
              src="${escapeHtml(image)}"
              alt="${escapeHtml(
                product.name
              )}"
            />

            <div class="product-info">

              <strong>
                ${escapeHtml(
                  product.name
                )}
              </strong>

              <span>
                /${escapeHtml(
                  product.slug || ""
                )}
              </span>

            </div>

          </div>

        </td>


        <td>

          <span class="table-category">
            ${escapeHtml(
              categoryName
            )}
          </span>

        </td>


        <td>

          <span class="table-price">
            ${price}
          </span>

        </td>


        <td>

          <span class="stock-number">
            ${item.stock}
          </span>

          <button
            class="stock-edit"
            data-manage="${item.product._id}"
          >
            EDIT
          </button>

        </td>


        <td>

          <span
            class="stock-status ${
              status === "IN_STOCK"
                ? "in-stock"
                : status === "LOW_STOCK"
                  ? "low-stock"
                  : "out-of-stock"
            }"
          >
            ${statusLabel(status)}
          </span>

        </td>


        <td>

          <button
            class="manage-btn"
            data-manage="${item.product._id}"
          >
            Manage
          </button>

        </td>

      </tr>
    `;

  };


  // ==========================================
  // MOBILE CARD
  // ==========================================

  const renderMobileCard = (
    item
  ) => {

    const product =
      item.product;


    const status =
      getStatus(item);


    const image =
      product.images?.find(
        (img) =>
          img.isMain
      )?.url ||
      product.images?.[0]?.url ||
      "https://placehold.co/100x120/151515/777?text=No+Image";


    return `
      <div class="mobile-inventory-card">

        <div class="product-cell">

          <img
            class="product-thumb"
            src="${escapeHtml(image)}"
            alt=""
          />

          <div class="product-info">

            <strong>
              ${escapeHtml(
                product.name
              )}
            </strong>

            <span>
              Stock: ${item.stock}
            </span>

          </div>

        </div>


        <span
          class="stock-status ${
            status === "IN_STOCK"
              ? "in-stock"
              : status === "LOW_STOCK"
                ? "low-stock"
                : "out-of-stock"
          }"
        >
          ${statusLabel(status)}
        </span>


        <button
          class="manage-btn"
          data-manage="${product._id}"
        >
          Manage Stock
        </button>

      </div>
    `;

  };


  // ==========================================
  // STATS
  // ==========================================

  const updateStats = () => {

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;


    inventory.forEach(
      (item) => {

        const status =
          getStatus(item);


        if (
          status === "IN_STOCK"
        ) {

          inStock++;

        } else if (
          status === "LOW_STOCK"
        ) {

          lowStock++;

        } else {

          outOfStock++;

        }

      }
    );


    document.getElementById(
      "totalProducts"
    ).textContent =
      inventory.length;


    document.getElementById(
      "inStockCount"
    ).textContent =
      inStock;


    document.getElementById(
      "lowStockCount"
    ).textContent =
      lowStock;


    document.getElementById(
      "outStockCount"
    ).textContent =
      outOfStock;

  };


  // ==========================================
  // OPEN MODAL
  // ==========================================

  const openStockModal = (
    productId
  ) => {

    const item =
      inventory.find(
        (entry) =>
          entry.product?._id ===
          productId
      );


    if (!item) {

      alert(
        "Inventory record not found."
      );

      return;

    }


    currentProduct =
      item;


    currentAction =
      "set";


    document.getElementById(
      "modalProduct"
    ).textContent =
      item.product.name;


    document.getElementById(
      "modalCurrentStock"
    ).textContent =
      item.stock;


    stockValue.value =
      item.stock;


    document
      .querySelectorAll(
        ".stock-action"
      )
      .forEach(
        (button) => {

          button.classList.toggle(
            "active",
            button.dataset.action ===
              "set"
          );

        }
      );


    updatePreview();


    stockModal.classList.remove(
      "hidden"
    );

  };


  // ==========================================
  // PREVIEW
  // ==========================================

  const updatePreview = () => {

    if (!currentProduct) return;


    const value =
      Number(
        stockValue.value
      ) || 0;


    const current =
      Number(
        currentProduct.stock
      ) || 0;


    let result =
      value;


    if (
      currentAction === "add"
    ) {

      result =
        current + value;

    }


    if (
      currentAction === "remove"
    ) {

      result =
        Math.max(
          0,
          current - value
        );

    }


    document.getElementById(
      "stockPreview"
    ).textContent =
      `New stock: ${result}`;

  };


  // ==========================================
  // SAVE STOCK
  // ==========================================

  const saveStock = async () => {

    if (!currentProduct) {
      return;
    }


    const value =
      Number(
        stockValue.value
      );


    if (
      !Number.isFinite(value) ||
      value < 0
    ) {

      alert(
        "Please enter a valid quantity."
      );

      return;

    }


    const productId =
      currentProduct.product._id;


    const button =
      document.getElementById(
        "saveStock"
      );


    button.disabled = true;

    button.textContent =
      "Updating...";


    try {

      let response;


      if (
        currentAction === "set"
      ) {

        response =
          await api(
            `/inventory/product/${productId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  stock: value
                })
            }
          );

      }


      if (
        currentAction === "add"
      ) {

        response =
          await api(
            `/inventory/product/${productId}/add`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  quantity: value
                })
            }
          );

      }


      if (
        currentAction === "remove"
      ) {

        response =
          await api(
            `/inventory/product/${productId}/remove`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  quantity: value
                })
            }
          );

      }


      if (!response) {
        throw new Error(
          "Unable to update stock."
        );
      }


      closeStockModal();

      await loadInventory();

      alert(
        "Stock updated successfully!"
      );


    } catch (error) {

      console.error(
        "Stock update error:",
        error
      );


      alert(
        error.message ||
        "Unable to update stock."
      );


    } finally {

      button.disabled = false;

      button.textContent =
        "Update Stock";

    }

  };


  // ==========================================
  // ACTION BINDINGS
  // ==========================================

  const bindActions = () => {

    document
      .querySelectorAll(
        "[data-manage]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              openStockModal(
                button.dataset.manage
              );

            }
          );

        }
      );

  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeStockModal = () => {

    stockModal.classList.add(
      "hidden"
    );

    currentProduct = null;

  };


  // ==========================================
  // EVENTS
  // ==========================================

  searchInput.addEventListener(
    "input",
    applyFilters
  );


  stockFilter.addEventListener(
    "change",
    applyFilters
  );


  categoryFilter.addEventListener(
    "change",
    applyFilters
  );


  document
    .getElementById(
      "refreshInventory"
    )
    .addEventListener(
      "click",
      loadInventory
    );


  document
    .querySelectorAll(
      ".stock-action"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            currentAction =
              button.dataset.action;


            document
              .querySelectorAll(
                ".stock-action"
              )
              .forEach(
                (item) => {

                  item.classList.toggle(
                    "active",
                    item === button
                  );

                }
              );


            if (
              currentProduct
            ) {

              stockValue.value =
                currentAction === "set"
                  ? currentProduct.stock
                  : 0;

            }


            updatePreview();

          }
        );

      }
    );


  stockValue.addEventListener(
    "input",
    updatePreview
  );


  document
    .getElementById(
      "saveStock"
    )
    .addEventListener(
      "click",
      saveStock
    );


  document
    .getElementById(
      "closeStockModal"
    )
    .addEventListener(
      "click",
      closeStockModal
    );


  document
    .getElementById(
      "cancelStock"
    )
    .addEventListener(
      "click",
      closeStockModal
    );


  stockModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        stockModal
      ) {

        closeStockModal();

      }

    }
  );


  // ==========================================
  // ESC
  // ==========================================

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeStockModal();

      }

    }
  );


  // ==========================================
  // ESCAPE HTML
  // ==========================================

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  // ==========================================
  // INIT
  // ==========================================

  loadInventory();

});