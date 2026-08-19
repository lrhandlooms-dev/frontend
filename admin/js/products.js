const PRODUCTS_API = "https://backend-8zwr.onrender.com/api";

let allProducts = [];
let allCategories = [];

let editingProductId = null;
let selectedImages = [];


// ==========================================
// ELEMENTS
// ==========================================

const productsGrid =
  document.getElementById("productsGrid");

const productsCount =
  document.getElementById("productsCount");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const sortFilter =
  document.getElementById("sortFilter");

const productModal =
  document.getElementById("productModal");

const productForm =
  document.getElementById("productForm");


// ==========================================
// AUTH
// ==========================================

const getAdminToken = () => {
  return localStorage.getItem(
    "handloom_admin_token"
  );
};


const logoutAdmin = () => {

  localStorage.removeItem(
    "handloom_admin_token"
  );

  localStorage.removeItem(
    "handloom_admin"
  );

  window.location.href =
    "./login.html";
};


// ==========================================
// API
// ==========================================

const productsRequest =
  async (endpoint, options = {}) => {

    const token =
      getAdminToken();

    if (!token) {
      window.location.href =
        "./login.html";

      throw new Error(
        "Authentication required"
      );
    }

    const headers = {
      ...(options.headers || {}),
      Authorization:
        `Bearer ${token}`,
    };

    const response =
      await fetch(
        `${PRODUCTS_API}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (
      response.status === 401 ||
      data.message ===
      "Invalid or expired token"
    ) {

      logoutAdmin();

      throw new Error(
        "Session expired"
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
// LOAD PRODUCTS
// ==========================================

const loadProducts =
  async () => {

    try {

      productsGrid.innerHTML = `
        <div class="products-loading">
          Loading products...
        </div>
      `;

      const data =
        await productsRequest(
          "/products"
        );

      allProducts =
        data.products || [];

      renderProducts();

    } catch (error) {

      console.error(
        "Load products error:",
        error
      );

      productsGrid.innerHTML = `
        <div class="no-products">
          ${escapeProductHtml(
        error.message
      )}
        </div>
      `;
    }
  };


// ==========================================
// LOAD CATEGORIES
// ==========================================

const loadCategories =
  async () => {

    try {

      const data =
        await productsRequest(
          "/categories"
        );

      allCategories =
        data.categories || [];

      renderCategoryOptions();

    } catch (error) {

      console.error(
        "Load categories error:",
        error
      );
    }
  };


// ==========================================
// CATEGORY OPTIONS
// ==========================================

const renderCategoryOptions =
  () => {

    const currentFilter =
      categoryFilter.value;

    const select =
      document.getElementById(
        "productCategory"
      );

    categoryFilter.innerHTML = `
      <option value="">
        All Categories
      </option>
    `;

    select.innerHTML = `
      <option value="">
        Select Category
      </option>
    `;

    allCategories.forEach(
      (category) => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          category._id;

        option.textContent =
          category.name;

        categoryFilter.appendChild(
          option.cloneNode(true)
        );

        select.appendChild(
          option
        );
      }
    );

    categoryFilter.value =
      currentFilter;
  };


// ==========================================
// RENDER PRODUCTS
// ==========================================

const renderProducts =
  () => {

    let products =
      [...allProducts];

    const search =
      searchInput.value
        .trim()
        .toLowerCase();

    const category =
      categoryFilter.value;

    const sort =
      sortFilter.value;


    // SEARCH

    if (search) {

      products =
        products.filter(
          (product) => {

            const text = [
              product.name,
              product.slug,
              product.description,
              product.fabric,
              product.category?.name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return text.includes(
              search
            );
          }
        );
    }


    // CATEGORY

    if (category) {

      products =
        products.filter(
          (product) =>
            product.category?._id ===
            category
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

          case "stock_low":
            return (
              Number(a.stock || 0) -
              Number(b.stock || 0)
            );

          case "stock_high":
            return (
              Number(b.stock || 0) -
              Number(a.stock || 0)
            );

          case "newest":
          default:
            return (
              new Date(b.createdAt) -
              new Date(a.createdAt)
            );
        }
      }
    );


    productsCount.textContent =
      products.length;


    if (!products.length) {

      productsGrid.innerHTML = `
        <div class="no-products">
          No products found.
        </div>
      `;

      return;
    }


    productsGrid.innerHTML =
      products
        .map(
          (product) =>
            createProductCard(
              product
            )
        )
        .join("");
  };


// ==========================================
// PRODUCT CARD
// ==========================================

const createProductCard =
  (product) => {

    const mainImage =
  product.images?.find(
    (image) => image.isMain
  ) || product.images?.[0];

const image = mainImage?.url || "";

    const finalPrice =
      product.pricing?.finalPrice ??
      product.price ??
      0;

    const hasOffer =
      product.offer?.enabled;

    return `
      <article
        class="product-card"
      >

        <div
          class="product-card-image"
        >

          ${image
        ? `
                <img
                  src="${escapeProductHtml(
          image
        )}"
                  alt="${escapeProductHtml(
          product.name
        )}"
                />
              `
        : `
                <div
                  class="product-placeholder"
                >
                  HANDLOOM
                </div>
              `
      }

          ${product.featured
        ? `
                <div
                  class="product-badge"
                >
                  FEATURED
                </div>
              `
        : ""
      }

        </div>


        <div
          class="product-card-body"
        >

          <div
            class="product-category"
          >
            ${product.category?.name ||
      "Uncategorized"
      }
          </div>


          <h3>
            ${escapeProductHtml(
        product.name
      )}
          </h3>


          <div
            class="product-meta"
          >

            <div
              class="product-card-price"
            >
              ₹${Number(
        finalPrice
      ).toLocaleString(
        "en-IN"
      )}

              ${hasOffer
        ? `
                    <small>
                      OFFER
                    </small>
                  `
        : ""
      }
            </div>


            <div
              class="stock-info"
            >
              Stock:
              ${product.stock ?? 0}
            </div>

          </div>


          <div
            class="card-actions"
          >

            <button
              class="card-btn"
              onclick="editProduct('${product._id}')"
            >
              EDIT
            </button>

            <button
              class="card-btn delete"
              onclick="deleteProduct('${product._id}')"
            >
              DELETE
            </button>

          </div>

        </div>

      </article>
    `;
  };


// ==========================================
// OPEN ADD MODAL
// ==========================================

const openAddModal =
  () => {

    editingProductId =
      null;

    productForm.reset();

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Add New Saree";

    document.getElementById(
      "productActive"
    ).checked = true;

    document.getElementById(
      "offerFields"
    ).classList.add(
      "hidden"
    );

    selectedImages = [];

    document.getElementById(
      "imagePreview"
    ).innerHTML = "";

    document.getElementById(
      "formMessage"
    ).textContent = "";

    productModal.classList.add(
      "open"
    );
  };


// ==========================================
// CLOSE MODAL
// ==========================================

const closeProductModal =
  () => {

    productModal.classList.remove(
      "open"
    );

    editingProductId =
      null;

    selectedImages = [];
  };


// ==========================================
// EDIT PRODUCT
// ==========================================

const editProduct =
  (id) => {

    const product =
      allProducts.find(
        (item) =>
          item._id === id
      );

    if (!product) {
      return;
    }

    editingProductId =
      id;

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Edit Saree";


    document.getElementById(
      "productName"
    ).value =
      product.name || "";


    document.getElementById(
      "productSlug"
    ).value =
      product.slug || "";


    document.getElementById(
      "productCategory"
    ).value =
      product.category?._id ||
      "";


    document.getElementById(
      "productDescription"
    ).value =
      product.description || "";


    document.getElementById(
      "productPrice"
    ).value =
      product.price ?? "";


    document.getElementById(
      "productStock"
    ).value =
      product.stock ?? 0;


    document.getElementById(
      "productFabric"
    ).value =
      product.fabric || "";


    document.getElementById(
      "productLength"
    ).value =
      product.length || "";


    document.getElementById(
      "productColors"
    ).value =
      (product.colors || []).join(
        ", "
      );


    document.getElementById(
      "offerEnabled"
    ).checked =
      product.offer?.enabled ||
      false;


    document.getElementById(
      "offerType"
    ).value =
      product.offer?.type ||
      "percentage";


    document.getElementById(
      "offerValue"
    ).value =
      product.offer?.value ?? 0;


    document.getElementById(
      "offerStart"
    ).value =
      formatDateForInput(
        product.offer?.startDate
      );


    document.getElementById(
      "offerEnd"
    ).value =
      formatDateForInput(
        product.offer?.endDate
      );


    document.getElementById(
      "materialsUsed"
    ).value =
      product.catalog?.materialsUsed ||
      "";


    document.getElementById(
      "weavingTechnique"
    ).value =
      product.catalog?.weavingTechnique ||
      "";


    document.getElementById(
      "makingProcess"
    ).value =
      product.catalog?.makingProcess ||
      "";


    document.getElementById(
      "timeRequired"
    ).value =
      product.catalog?.timeRequired ||
      "";


    document.getElementById(
      "origin"
    ).value =
      product.catalog?.origin ||
      "";


    document.getElementById(
      "artisanInformation"
    ).value =
      product.catalog?.artisanInformation ||
      "";


    document.getElementById(
      "careInstructions"
    ).value =
      product.catalog?.careInstructions ||
      "";


    document.getElementById(
      "productFeatured"
    ).checked =
      product.featured ||
      false;


    document.getElementById(
      "productActive"
    ).checked =
      product.isActive !== false;


    toggleOfferFields();


    renderExistingImages(
      product.images || []
    );


    productModal.classList.add(
      "open"
    );
  };


// ==========================================
// EXISTING IMAGES
// ==========================================

const renderExistingImages = (images) => {
  const preview = document.getElementById("imagePreview");

  if (!images || !images.length) {
    preview.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:30px;
        text-align:center;
        color:#666;
        border:1px solid var(--border);
      ">
        No images uploaded
      </div>
    `;
    return;
  }

  preview.innerHTML = images.map((image, index) => `
    <div
      class="preview-image"
      style="position:relative;"
    >

      <img
        src="${escapeProductHtml(image.url)}"
        alt="Product image"
      />

      ${image.isMain
      ? `
            <span class="preview-main">
              MAIN
            </span>
          `
      : `
            <button
              type="button"
              class="image-action-btn image-main-btn"
              onclick="setMainProductImage(
                '${editingProductId}',
                '${image._id}'
              )"
            >
              ★ MAIN
            </button>
          `
    }

      <div
        style="
          position:absolute;
          left:8px;
          right:8px;
          bottom:8px;
          display:flex;
          gap:5px;
          justify-content:center;
        "
      >

        <button
          type="button"
          class="image-action-btn"
          onclick="moveProductImageLeft(
            '${editingProductId}',
            ${index}
          )"
          ${index === 0 ? "disabled" : ""}
        >
          ←
        </button>

        <button
          type="button"
          class="image-action-btn"
          onclick="moveProductImageRight(
            '${editingProductId}',
            ${index}
          )"
          ${index === images.length - 1
      ? "disabled"
      : ""
    }
        >
          →
        </button>

        <button
          type="button"
          class="image-action-btn image-delete-btn"
          onclick="deleteProductImage(
            '${editingProductId}',
            '${image._id}'
          )"
        >
          DELETE
        </button>

      </div>

    </div>
  `).join("");
};


// ==========================================
// IMAGE MANAGEMENT
// ==========================================

const refreshProductAfterImageChange = async (productId) => {
  await loadProducts();

  if (editingProductId === productId) {
    const product = allProducts.find(
      (item) => item._id === productId
    );

    if (product) {
      renderExistingImages(product.images || []);
    }
  }
};


// ==========================================
// SET MAIN IMAGE
// ==========================================

const setMainProductImage = async (
  productId,
  imageId
) => {
  try {
    await productsRequest(
      `/products/${productId}/images/main`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
        }),
      }
    );

    await refreshProductAfterImageChange(
      productId
    );

  } catch (error) {
    console.error(
      "Set main image error:",
      error
    );

    alert(
      error.message ||
      "Unable to set main image."
    );
  }
};


// ==========================================
// DELETE INDIVIDUAL IMAGE
// ==========================================

const deleteProductImage = async (
  productId,
  imageId
) => {
  const product = allProducts.find(
    (item) => item._id === productId
  );

  if (!product) return;

  if (!confirm("Delete this product image?")) {
    return;
  }

  try {
    await productsRequest(
      `/products/${productId}/images/${imageId}`,
      {
        method: "DELETE",
      }
    );

    await refreshProductAfterImageChange(
      productId
    );

  } catch (error) {
    console.error(
      "Delete product image error:",
      error
    );

    alert(
      error.message ||
      "Unable to delete product image."
    );
  }
};


// ==========================================
// REORDER IMAGES
// ==========================================

const reorderProductImages = async (
  productId,
  imageIds
) => {
  try {
    await productsRequest(
      `/products/${productId}/images/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds,
        }),
      }
    );

    await refreshProductAfterImageChange(
      productId
    );

  } catch (error) {
    console.error(
      "Reorder images error:",
      error
    );

    alert(
      error.message ||
      "Unable to reorder images."
    );
  }
};


// ==========================================
// MOVE IMAGE LEFT
// ==========================================

const moveProductImageLeft = async (
  productId,
  index
) => {
  const product = allProducts.find(
    (item) => item._id === productId
  );

  if (!product || index <= 0) {
    return;
  }

  const images = [
    ...(product.images || [])
  ];

  [
    images[index - 1],
    images[index]
  ] = [
      images[index],
      images[index - 1]
    ];

  await reorderProductImages(
    productId,
    images.map(
      (image) => image._id
    )
  );
};


// ==========================================
// MOVE IMAGE RIGHT
// ==========================================

const moveProductImageRight = async (
  productId,
  index
) => {
  const product = allProducts.find(
    (item) => item._id === productId
  );

  if (
    !product ||
    index >=
    product.images.length - 1
  ) {
    return;
  }

  const images = [
    ...(product.images || [])
  ];

  [
    images[index],
    images[index + 1]
  ] = [
      images[index + 1],
      images[index]
    ];

  await reorderProductImages(
    productId,
    images.map(
      (image) => image._id
    )
  );
};

// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct =
  async (id) => {

    const product =
      allProducts.find(
        (item) =>
          item._id === id
      );

    if (!product) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${product.name}"?\n\nThis will also remove its Cloudinary images.`
      );

    if (!confirmed) {
      return;
    }

    try {

      await productsRequest(
        `/products/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadProducts();

    } catch (error) {

      alert(
        error.message
      );
    }
  };


// ==========================================
// IMAGE UPLOAD
// ==========================================

const uploadProductImages =
  async (files) => {

    if (!files.length) {
      return [];
    }

    const formData =
      new FormData();

    Array.from(files).forEach(
      (file) => {

        formData.append(
          "images",
          file
        );
      }
    );


    const token =
      getAdminToken();

    const response =
      await fetch(
        `${PRODUCTS_API}/products/upload-images`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );


    const data =
      await response
        .json()
        .catch(() => ({}));


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Image upload failed"
      );
    }


    return data.images || [];
  };


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const message =
      document.getElementById(
        "formMessage"
      );

    const saveBtn =
      document.getElementById(
        "saveProductBtn"
      );


    message.className =
      "form-message";

    message.textContent =
      "Saving product...";

    saveBtn.disabled = true;


    try {

      // --------------------------------------
      // UPLOAD NEW IMAGES
      // --------------------------------------

      const imageFiles =
        document.getElementById(
          "productImages"
        ).files;


      let uploadedImages =
        [];


      if (imageFiles.length) {

        message.textContent =
          "Uploading images...";

        uploadedImages =
          await uploadProductImages(
            imageFiles
          );
      }


      // --------------------------------------
      // OFFER
      // --------------------------------------

      const offerEnabled =
        document.getElementById(
          "offerEnabled"
        ).checked;


      const offer = {

        enabled:
          offerEnabled,

        type:
          document.getElementById(
            "offerType"
          ).value,

        value:
          Number(
            document.getElementById(
              "offerValue"
            ).value || 0
          ),

        startDate:
          document.getElementById(
            "offerStart"
          ).value || null,

        endDate:
          document.getElementById(
            "offerEnd"
          ).value || null,
      };


      // --------------------------------------
      // PRODUCT DATA
      // --------------------------------------

      const productData = {

        name:
          document.getElementById(
            "productName"
          ).value.trim(),

        slug:
          document.getElementById(
            "productSlug"
          ).value.trim(),

        description:
          document.getElementById(
            "productDescription"
          ).value.trim(),

        category:
          document.getElementById(
            "productCategory"
          ).value,

        price:
          Number(
            document.getElementById(
              "productPrice"
            ).value
          ),

        stock:
          Number(
            document.getElementById(
              "productStock"
            ).value || 0
          ),

        fabric:
          document.getElementById(
            "productFabric"
          ).value.trim(),

        colors:
          document.getElementById(
            "productColors"
          ).value
            .split(",")
            .map(
              (color) =>
                color.trim()
            )
            .filter(Boolean),

        length:
          document.getElementById(
            "productLength"
          ).value.trim(),

        offer,

        catalog: {

          materialsUsed:
            document.getElementById(
              "materialsUsed"
            ).value.trim(),

          weavingTechnique:
            document.getElementById(
              "weavingTechnique"
            ).value.trim(),

          makingProcess:
            document.getElementById(
              "makingProcess"
            ).value.trim(),

          timeRequired:
            document.getElementById(
              "timeRequired"
            ).value.trim(),

          origin:
            document.getElementById(
              "origin"
            ).value.trim(),

          artisanInformation:
            document.getElementById(
              "artisanInformation"
            ).value.trim(),

          careInstructions:
            document.getElementById(
              "careInstructions"
            ).value.trim(),
        },

        featured:
          document.getElementById(
            "productFeatured"
          ).checked,

        isActive:
          document.getElementById(
            "productActive"
          ).checked,
      };


      // --------------------------------------
      // IMAGES
      // --------------------------------------

      if (
        editingProductId === null
      ) {

        productData.images =
          uploadedImages;

      } else if (uploadedImages.length) {

        const currentProduct = allProducts.find(
          (product) => product._id === editingProductId
        );

        const existingImages = currentProduct?.images || [];

        productData.images = [
          ...existingImages,
          ...uploadedImages.map((image, index) => ({
            ...image,
            isMain:
              existingImages.length === 0 && index === 0
          }))
        ];

      }


      // --------------------------------------
      // CREATE / UPDATE
      // --------------------------------------

      message.textContent =
        "Saving product...";


      if (
        editingProductId
      ) {

        await productsRequest(
          `/products/${editingProductId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                productData
              ),
          }
        );

      } else {

        await productsRequest(
          "/products",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                productData
              ),
          }
        );
      }


      message.className =
        "form-message success";

      message.textContent =
        "Product saved successfully.";


      await loadProducts();


      setTimeout(
        () => {
          closeProductModal();
        },
        700
      );

    } catch (error) {

      console.error(
        "Save product error:",
        error
      );

      message.className =
        "form-message error";

      message.textContent =
        error.message ||
        "Unable to save product.";

    } finally {

      saveBtn.disabled = false;
    }

  }
);


// ==========================================
// OFFER TOGGLE
// ==========================================

const toggleOfferFields =
  () => {

    const enabled =
      document.getElementById(
        "offerEnabled"
      ).checked;

    document
      .getElementById(
        "offerFields"
      )
      .classList.toggle(
        "hidden",
        !enabled
      );
  };


// ==========================================
// IMAGE PREVIEW
// ==========================================

document
  .getElementById(
    "productImages"
  )
  .addEventListener(
    "change",
    (event) => {

      selectedImages =
        Array.from(
          event.target.files
        );

      const preview =
        document.getElementById(
          "imagePreview"
        );

      preview.innerHTML = "";


      selectedImages.forEach(
        (file, index) => {

          const url =
            URL.createObjectURL(
              file
            );

          preview.innerHTML += `
            <div
              class="preview-image"
            >

              <img
                src="${url}"
                alt="Preview"
              />

              ${index === 0
              ? `
                    <span
                      class="preview-main"
                    >
                      MAIN
                    </span>
                  `
              : ""
            }

            </div>
          `;
        }
      );
    }
  );


// ==========================================
// AUTO SLUG
// ==========================================

document
  .getElementById(
    "productName"
  )
  .addEventListener(
    "input",
    (event) => {

      if (
        editingProductId
      ) {
        return;
      }

      const slug =
        event.target.value
          .toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

      document.getElementById(
        "productSlug"
      ).value = slug;
    }
  );


// ==========================================
// FILTER EVENTS
// ==========================================

searchInput.addEventListener(
  "input",
  renderProducts
);

categoryFilter.addEventListener(
  "change",
  renderProducts
);

sortFilter.addEventListener(
  "change",
  renderProducts
);


// ==========================================
// BUTTONS
// ==========================================

document
  .getElementById(
    "addProductBtn"
  )
  .addEventListener(
    "click",
    openAddModal
  );


document
  .getElementById(
    "closeModalBtn"
  )
  .addEventListener(
    "click",
    closeProductModal
  );


document
  .getElementById(
    "cancelBtn"
  )
  .addEventListener(
    "click",
    closeProductModal
  );


document
  .getElementById(
    "offerEnabled"
  )
  .addEventListener(
    "change",
    toggleOfferFields
  );


document
  .getElementById(
    "logoutBtn"
  )
  .addEventListener(
    "click",
    logoutAdmin
  );


// Close modal by clicking outside

productModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      productModal
    ) {
      closeProductModal();
    }
  }
);


// ==========================================
// ESCAPE HTML
// ==========================================

const escapeProductHtml =
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
// DATE FORMAT
// ==========================================

const formatDateForInput =
  (date) => {

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
      (num) =>
        String(num).padStart(
          2,
          "0"
        );

    return (
      `${d.getFullYear()}-` +
      `${pad(d.getMonth() + 1)}-` +
      `${pad(d.getDate())}T` +
      `${pad(d.getHours())}:` +
      `${pad(d.getMinutes())}`
    );
  };

// ==========================================
// EXPOSE IMAGE MANAGEMENT FUNCTIONS
// ==========================================

window.setMainProductImage = setMainProductImage;
window.deleteProductImage = deleteProductImage;
window.moveProductImageLeft = moveProductImageLeft;
window.moveProductImageRight = moveProductImageRight;


// ==========================================
// INIT
// ==========================================

const initProducts =
  async () => {

    if (!getAdminToken()) {

      window.location.href =
        "./login.html";

      return;
    }

    await Promise.all([
      loadCategories(),
      loadProducts(),
    ]);
  };


initProducts();

