const API_BASE = "https://backend-8zwr.onrender.com/api";
const CATALOG_API = API_BASE;

let allProducts = [];
let selectedProduct = null;


// ==========================================
// AUTH
// ==========================================

const getToken = () => {
  return localStorage.getItem("handloom_admin_token");
};


const logoutAdmin = () => {

  localStorage.removeItem("handloom_admin_token");
  localStorage.removeItem("handloom_admin");

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

  if (!token) {
    window.location.href = "./login.html";
    throw new Error("Authentication required");
  }


  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };


  const response = await fetch(
    `${CATALOG_API}${endpoint}`,
    {
      ...options,
      headers
    }
  );


  const data =
    await response
      .json()
      .catch(() => ({}));


  if (
    response.status === 401
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
// ELEMENTS
// ==========================================

const productSelect =
  document.getElementById(
    "productSelect"
  );

const catalogEmpty =
  document.getElementById(
    "catalogEmpty"
  );

const catalogEditor =
  document.getElementById(
    "catalogEditor"
  );

const makingSteps =
  document.getElementById(
    "makingSteps"
  );

const stepModal =
  document.getElementById(
    "stepModal"
  );


// ==========================================
// LOAD PRODUCTS
// ==========================================

const loadProducts = async () => {

  try {

    const data =
      await apiRequest(
        "/products?limit=100&sort=name_asc"
      );


    allProducts =
      data.products || [];


    productSelect.innerHTML = `
      <option value="">
        Select a product...
      </option>

      ${allProducts
        .map(
          product => `
            <option value="${product._id}">
              ${escapeHtml(product.name)}
            </option>
          `
        )
        .join("")}
    `;


  } catch (error) {

    console.error(
      "Load products error:",
      error
    );


    productSelect.innerHTML = `
      <option value="">
        Unable to load products
      </option>
    `;

    alert(
      error.message ||
      "Unable to load products"
    );
  }
};


// ==========================================
// SELECT PRODUCT
// ==========================================

productSelect.addEventListener(
  "change",
  async () => {

    const productId =
      productSelect.value;


    if (!productId) {

      selectedProduct = null;

      catalogEmpty.classList.remove(
        "hidden"
      );

      catalogEditor.classList.add(
        "hidden"
      );

      return;
    }


    await loadSelectedProduct(
      productId
    );
  }
);


// ==========================================
// LOAD SINGLE PRODUCT
// ==========================================

const loadSelectedProduct = async (
  productId
) => {

  try {

    const data =
      await apiRequest(
        `/products/${productId}`
      );


    selectedProduct =
      data.product;


    renderProduct();


    fillCatalogForm();


    renderMakingSteps();


    catalogEmpty.classList.add(
      "hidden"
    );

    catalogEditor.classList.remove(
      "hidden"
    );


  } catch (error) {

    console.error(
      "Load product error:",
      error
    );

    alert(
      error.message ||
      "Unable to load product"
    );
  }
};


// ==========================================
// PRODUCT HEADER
// ==========================================

const renderProduct = () => {

  if (!selectedProduct) {
    return;
  }


  document.getElementById(
    "productName"
  ).textContent =
    selectedProduct.name || "—";


  document.getElementById(
    "productDescription"
  ).textContent =
    selectedProduct.description ||
    "No description available.";


  document.getElementById(
    "productFabric"
  ).textContent =
    selectedProduct.fabric ||
    "Fabric not specified";


  document.getElementById(
    "productOrigin"
  ).textContent =
    selectedProduct.catalog?.origin ||
    "Origin not specified";


  document.getElementById(
    "productPrice"
  ).textContent =
    `₹${Number(
      selectedProduct.price || 0
    ).toLocaleString("en-IN")}`;


  const imageContainer =
    document.getElementById(
      "productImage"
    );


  const mainImage =
    selectedProduct.images?.find(
      image => image.isMain
    ) ||
    selectedProduct.images?.[0];


  if (mainImage?.url) {

    imageContainer.innerHTML = `
      <img
        src="${escapeHtml(mainImage.url)}"
        alt="${escapeHtml(
          selectedProduct.name
        )}"
      />
    `;

  } else {

    imageContainer.innerHTML = `
      <div class="step-image-empty">
        NO IMAGE
      </div>
    `;
  }
};


// ==========================================
// FILL CATALOG FORM
// ==========================================

const fillCatalogForm = () => {

  const catalog =
    selectedProduct.catalog || {};


  document.getElementById(
    "materialsUsed"
  ).value =
    catalog.materialsUsed || "";


  document.getElementById(
    "weavingTechnique"
  ).value =
    catalog.weavingTechnique || "";


  document.getElementById(
    "makingProcess"
  ).value =
    catalog.makingProcess || "";


  document.getElementById(
    "timeRequired"
  ).value =
    catalog.timeRequired || "";


  document.getElementById(
    "origin"
  ).value =
    catalog.origin || "";


  document.getElementById(
    "artisanInformation"
  ).value =
    catalog.artisanInformation || "";


  document.getElementById(
    "careInstructions"
  ).value =
    catalog.careInstructions || "";
};


// ==========================================
// SAVE CRAFT STORY
// ==========================================

document
  .getElementById("catalogForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!selectedProduct) {
        return;
      }


      const button =
        document.getElementById(
          "saveCatalogBtn"
        );


      const status =
        document.getElementById(
          "catalogStatus"
        );


      button.disabled = true;

      status.textContent =
        "Saving...";


      const catalog =
        selectedProduct.catalog || {};


      catalog.materialsUsed =
        document.getElementById(
          "materialsUsed"
        ).value.trim();


      catalog.weavingTechnique =
        document.getElementById(
          "weavingTechnique"
        ).value.trim();


      catalog.makingProcess =
        document.getElementById(
          "makingProcess"
        ).value.trim();


      catalog.timeRequired =
        document.getElementById(
          "timeRequired"
        ).value.trim();


      catalog.origin =
        document.getElementById(
          "origin"
        ).value.trim();


      catalog.artisanInformation =
        document.getElementById(
          "artisanInformation"
        ).value.trim();


      catalog.careInstructions =
        document.getElementById(
          "careInstructions"
        ).value.trim();


      try {

        const data =
          await apiRequest(
            `/products/${selectedProduct._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  catalog
                })
            }
          );


        selectedProduct =
          data.product;


        status.textContent =
          "✓ Craft story saved";


        renderProduct();


        setTimeout(() => {
          status.textContent = "";
        }, 2500);


      } catch (error) {

        console.error(
          "Save catalog error:",
          error
        );

        status.textContent =
          error.message ||
          "Unable to save";

      } finally {

        button.disabled =
          false;
      }
    }
  );


// ==========================================
// RENDER MAKING STEPS
// ==========================================

const renderMakingSteps = () => {

  const steps =
    selectedProduct?.catalog
      ?.makingSteps || [];


  const sortedSteps =
    [...steps].sort(
      (a, b) =>
        Number(a.step) -
        Number(b.step)
    );


  if (!sortedSteps.length) {

    makingSteps.innerHTML = `
      <div class="steps-empty">
        No making steps added yet.
        Click "+ Add Step" to create the
        first step.
      </div>
    `;

    return;
  }


  makingSteps.innerHTML =
    sortedSteps
      .map(createStepCard)
      .join("");
};


// ==========================================
// STEP CARD
// ==========================================

const createStepCard = step => {

  const image =
    step.image?.url || "";


  return `
    <article class="making-step">

      <div class="step-number">
        ${Number(step.step)}
      </div>


      <div class="step-image">

        ${
          image
            ? `
              <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(
                  step.title
                )}"
              />
            `
            : `
              <div class="step-image-empty">
                NO IMAGE
              </div>
            `
        }

      </div>


      <div class="step-content">

        <h3>
          ${escapeHtml(
            step.title || "Untitled Step"
          )}
        </h3>

        <p>
          ${escapeHtml(
            step.description ||
            "No description added."
          )}
        </p>

      </div>


      <div class="step-actions">

        <button
          class="step-action"
          onclick="editStep('${step._id}')"
        >
          Edit
        </button>

        <button
          class="step-action delete"
          onclick="deleteStep('${step._id}')"
        >
          Delete
        </button>

      </div>

    </article>
  `;
};


// ==========================================
// OPEN ADD STEP
// ==========================================

document
  .getElementById("addStepBtn")
  .addEventListener(
    "click",
    () => {

      if (!selectedProduct) {
        return;
      }


      document.getElementById(
        "stepModalTitle"
      ).textContent =
        "Add Making Step";


      document.getElementById(
        "editingStepId"
      ).value = "";


      document.getElementById(
        "stepNumber"
      ).value =
        (
          selectedProduct.catalog
            ?.makingSteps?.length || 0
        ) + 1;


      document.getElementById(
        "stepTitle"
      ).value = "";


      document.getElementById(
        "stepDescription"
      ).value = "";


      document.getElementById(
        "stepImage"
      ).value = "";


      document.getElementById(
        "stepImagePreview"
      ).classList.add(
        "hidden"
      );


      document.getElementById(
        "stepMessage"
      ).textContent = "";


      stepModal.classList.add(
        "open"
      );
    }
  );


// ==========================================
// EDIT STEP
// ==========================================

const editStep = stepId => {

  if (!selectedProduct) {
    return;
  }


  const step =
    selectedProduct.catalog
      ?.makingSteps
      ?.find(
        item =>
          item._id === stepId
      );


  if (!step) {
    return;
  }


  document.getElementById(
    "stepModalTitle"
  ).textContent =
    "Edit Making Step";


  document.getElementById(
    "editingStepId"
  ).value =
    step._id;


  document.getElementById(
    "stepNumber"
  ).value =
    step.step;


  document.getElementById(
    "stepTitle"
  ).value =
    step.title || "";


  document.getElementById(
    "stepDescription"
  ).value =
    step.description || "";


  document.getElementById(
    "stepImage"
  ).value = "";


  const preview =
    document.getElementById(
      "stepImagePreview"
    );


  if (step.image?.url) {

    document.getElementById(
      "stepPreview"
    ).src =
      step.image.url;

    preview.classList.remove(
      "hidden"
    );

  } else {

    preview.classList.add(
      "hidden"
    );
  }


  document.getElementById(
    "stepMessage"
  ).textContent = "";


  stepModal.classList.add(
    "open"
  );
};


// ==========================================
// IMAGE PREVIEW
// ==========================================

document
  .getElementById("stepImage")
  .addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload = e => {

        document.getElementById(
          "stepPreview"
        ).src =
          e.target.result;


        document.getElementById(
          "stepImagePreview"
        ).classList.remove(
          "hidden"
        );
      };


      reader.readAsDataURL(file);
    }
  );


// ==========================================
// UPLOAD STEP IMAGE
// ==========================================

const uploadStepImage = async file => {

  const formData =
    new FormData();


  formData.append(
    "image",
    file
  );


  const data =
    await apiRequest(
      "/products/upload-making-step-image",
      {
        method: "POST",
        body: formData
      }
    );


  return data.image;
};


// ==========================================
// SAVE STEP
// ==========================================

document
  .getElementById("stepForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!selectedProduct) {
        return;
      }


      const message =
        document.getElementById(
          "stepMessage"
        );


      const button =
        document.getElementById(
          "saveStepBtn"
        );


      const editingId =
        document.getElementById(
          "editingStepId"
        ).value;


      const step =
        Number(
          document.getElementById(
            "stepNumber"
          ).value
        );


      const title =
        document.getElementById(
          "stepTitle"
        ).value.trim();


      const description =
        document.getElementById(
          "stepDescription"
        ).value.trim();


      if (!title) {

        message.textContent =
          "Step title is required.";

        return;
      }


      button.disabled = true;

      message.textContent =
        "Saving step...";


      try {

        let image = null;


        const file =
          document.getElementById(
            "stepImage"
          ).files?.[0];


        // Upload new image only if selected

        if (file) {

          message.textContent =
            "Uploading image...";


          image =
            await uploadStepImage(
              file
            );
        }


        const payload = {

          step,
          title,
          description
        };


        if (image) {
          payload.image =
            image;
        }


        let data;


        // EDIT

        if (editingId) {

          data =
            await apiRequest(
              `/products/${selectedProduct._id}/making-steps/${editingId}`,
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify(
                    payload
                  )
              }
            );

        }

        // CREATE

        else {

          data =
            await apiRequest(
              `/products/${selectedProduct._id}/making-steps`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify(
                    payload
                  )
              }
            );
        }


        selectedProduct.catalog =
          selectedProduct.catalog ||
          {};


        selectedProduct.catalog.makingSteps =
          data.makingSteps || [];


        renderMakingSteps();


        closeStepModal();


      } catch (error) {

        console.error(
          "Save step error:",
          error
        );


        message.textContent =
          error.message ||
          "Unable to save step.";

      } finally {

        button.disabled =
          false;
      }
    }
  );


// ==========================================
// DELETE STEP
// ==========================================

const deleteStep = async stepId => {

  if (!selectedProduct) {
    return;
  }


  const step =
    selectedProduct.catalog
      ?.makingSteps
      ?.find(
        item =>
          item._id === stepId
      );


  if (!step) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${step.title}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    const data =
      await apiRequest(
        `/products/${selectedProduct._id}/making-steps/${stepId}`,
        {
          method: "DELETE"
        }
      );


    selectedProduct.catalog =
      selectedProduct.catalog ||
      {};


    selectedProduct.catalog.makingSteps =
      data.makingSteps || [];


    renderMakingSteps();


  } catch (error) {

    console.error(
      "Delete step error:",
      error
    );


    alert(
      error.message ||
      "Unable to delete step."
    );
  }
};


// ==========================================
// CLOSE MODAL
// ==========================================

const closeStepModal = () => {

  stepModal.classList.remove(
    "open"
  );
};


document
  .getElementById(
    "closeStepModal"
  )
  .addEventListener(
    "click",
    closeStepModal
  );


document
  .getElementById(
    "cancelStepBtn"
  )
  .addEventListener(
    "click",
    closeStepModal
  );


stepModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      stepModal
    ) {
      closeStepModal();
    }
  }
);


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      stepModal.classList.contains(
        "open"
      )
    ) {
      closeStepModal();
    }
  }
);


// ==========================================
// ESCAPE HTML
// ==========================================

const escapeHtml = value => {

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

document
  .getElementById(
    "logoutBtn"
  )
  .addEventListener(
    "click",
    logoutAdmin
);


// ==========================================
// ADMIN PROFILE
// ==========================================

const loadAdminProfile = () => {

  try {

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

  } catch (error) {

    console.error(
      "Admin profile error:",
      error
    );
  }
};


// ==========================================
// EXPOSE
// ==========================================

window.editStep =
  editStep;

window.deleteStep =
  deleteStep;


// ==========================================
// INIT
// ==========================================

const initCatalog = async () => {

  if (!getToken()) {

    window.location.href =
      "./login.html";

    return;
  }


  loadAdminProfile();

  await loadProducts();
};


initCatalog();