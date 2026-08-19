document.addEventListener("DOMContentLoaded", () => {    

  // ==========================================
  // CONFIG
  // ==========================================

  const API_BASE = "https://backend-8zwr.onrender.com/api";

  let categories = [];
  let editingCategoryId = null;


  // ==========================================
  // ELEMENTS
  // ==========================================

  const grid =
    document.getElementById(
      "categoryGrid"
    );

  const modal =
    document.getElementById(
      "categoryModal"
    );

  const form =
    document.getElementById(
      "categoryForm"
    );

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const imageInput =
    document.getElementById(
      "categoryImage"
    );

  const previewBox =
    document.getElementById(
      "imagePreview"
    );

  const previewImage =
    document.getElementById(
      "previewImage"
    );


  // ==========================================
  // TOKEN
  // ==========================================

  const getToken = () => {
  return localStorage.getItem("handloom_admin_token");
};


  // ==========================================
  // API
  // ==========================================

  const api = async (
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

    let data;

    try {
      data = await response.json();
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
  // LOAD CATEGORIES
  // ==========================================

  const loadCategories = async () => {

    try {

      const data =
        await api("/categories");

      categories =
        data.categories || [];

      renderCategories();

      updateStats();

    } catch (error) {

      console.error(
        "Load categories error:",
        error
      );

      grid.innerHTML = `
        <div class="empty">
          Failed to load categories.
          <br><br>
          ${escapeHtml(error.message)}
        </div>
      `;
    }
  };


  // ==========================================
  // STATS
  // ==========================================

  const updateStats = () => {

    const active =
      categories.filter(
        (category) =>
          category.isActive !== false
      ).length;

    document.getElementById(
      "totalCategories"
    ).textContent =
      categories.length;

    document.getElementById(
      "activeCategories"
    ).textContent =
      active;

    document.getElementById(
      "inactiveCategories"
    ).textContent =
      categories.length - active;
  };


  // ==========================================
  // RENDER
  // ==========================================

  const renderCategories = () => {

    const search =
      searchInput.value
        .trim()
        .toLowerCase();

    const filtered =
      categories.filter(
        (category) => {

          return (
            category.name
              ?.toLowerCase()
              .includes(search) ||

            category.slug
              ?.toLowerCase()
              .includes(search)
          );
        }
      );

    if (!filtered.length) {

      grid.innerHTML = `
        <div class="empty">
          No categories found.
        </div>
      `;

      return;
    }


    grid.innerHTML =
      filtered
        .map((category) => {

          const image =
            category.image ||
            "https://placehold.co/800x600/151515/888?text=No+Image";

          const active =
            category.isActive !== false;

          return `
            <article class="category-card">

              <img
                class="category-image"
                src="${escapeHtml(image)}"
                alt="${escapeHtml(category.name)}"
              />

              <div class="category-content">

                <h3 class="category-title">
                  ${escapeHtml(category.name)}
                </h3>

                <div class="category-slug">
                  /${escapeHtml(category.slug)}
                </div>

                <p class="category-description">
                  ${
                    escapeHtml(
                      category.description ||
                      "No description"
                    )
                  }
                </p>

                <div class="category-meta">

                  <span
                    class="status ${
                      active
                        ? "active"
                        : "inactive"
                    }"
                  >
                    ${
                      active
                        ? "Active"
                        : "Inactive"
                    }
                  </span>

                  <div class="card-actions">

                    <button
                      class="small-btn"
                      data-edit="${category._id}"
                    >
                      EDIT
                    </button>

                    <button
                      class="small-btn delete"
                      data-delete="${category._id}"
                    >
                      DELETE
                    </button>

                  </div>

                </div>

              </div>

            </article>
          `;
        })
        .join("");


    bindCardActions();
  };


  // ==========================================
  // CARD ACTIONS
  // ==========================================

  const bindCardActions = () => {

    document
      .querySelectorAll("[data-edit]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.edit;

            openEditCategory(id);
          }
        );
      });


    document
      .querySelectorAll("[data-delete]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.delete;

            deleteCategory(id);
          }
        );
      });
  };


  // ==========================================
  // OPEN ADD
  // ==========================================

  const openAddCategory = () => {

    editingCategoryId = null;

    form.reset();

    document.getElementById(
      "categoryActive"
    ).checked = true;

    document.getElementById(
      "categorySortOrder"
    ).value = 0;

    document.getElementById(
      "modalTitle"
    ).textContent =
      "Add Category";

    previewBox.classList.add(
      "hidden"
    );

    previewImage.src = "";

    modal.classList.remove(
      "hidden"
    );
  };


  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEditCategory = (
    categoryId
  ) => {

    const category =
      categories.find(
        (item) =>
          item._id === categoryId
      );

    if (!category) return;

    editingCategoryId =
      categoryId;

    document.getElementById(
      "categoryName"
    ).value =
      category.name || "";

    document.getElementById(
      "categorySlug"
    ).value =
      category.slug || "";

    document.getElementById(
      "categoryDescription"
    ).value =
      category.description || "";

    document.getElementById(
      "categorySortOrder"
    ).value =
      category.sortOrder ?? 0;

    document.getElementById(
      "categoryActive"
    ).checked =
      category.isActive !== false;


    if (category.image) {

      previewImage.src =
        category.image;

      previewBox.classList.remove(
        "hidden"
      );

    } else {

      previewBox.classList.add(
        "hidden"
      );

    }


    document.getElementById(
      "modalTitle"
    ).textContent =
      "Edit Category";

    modal.classList.remove(
      "hidden"
    );
  };


  // ==========================================
  // IMAGE PREVIEW
  // ==========================================

  imageInput.addEventListener(
    "change",
    () => {

      const file =
        imageInput.files?.[0];

      if (!file) return;

      previewImage.src =
        URL.createObjectURL(file);

      previewBox.classList.remove(
        "hidden"
      );
    }
  );


  // ==========================================
  // SAVE
  // ==========================================

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const saveButton =
        document.getElementById(
          "saveBtn"
        );

      saveButton.disabled = true;
      saveButton.textContent =
        "Saving...";


      try {

        let uploadedImage = null;


        // ------------------------------
        // Upload new image first
        // ------------------------------

        const file =
          imageInput.files?.[0];

        if (file) {

          const formData =
            new FormData();

          formData.append(
            "image",
            file
          );

          const token =
            getToken();

          const uploadResponse =
            await fetch(
              `${API_BASE}/categories/upload-image`,
              {
                method: "POST",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                body: formData,
              }
            );

          const uploadData =
            await uploadResponse.json();

          if (!uploadResponse.ok) {

            throw new Error(
              uploadData.message ||
              "Image upload failed"
            );
          }

          uploadedImage = {
            image:
              uploadData.image,

            imagePublicId:
              uploadData.publicId,
          };
        }


        const payload = {

          name:
            document.getElementById(
              "categoryName"
            ).value.trim(),

          slug:
            document.getElementById(
              "categorySlug"
            ).value.trim(),

          description:
            document.getElementById(
              "categoryDescription"
            ).value.trim(),

          sortOrder:
            Number(
              document.getElementById(
                "categorySortOrder"
              ).value || 0
            ),

          isActive:
            document.getElementById(
              "categoryActive"
            ).checked,
        };


        if (uploadedImage) {

          payload.image =
            uploadedImage.image;

          payload.imagePublicId =
            uploadedImage.imagePublicId;
        }


        let response;


        // CREATE
        if (!editingCategoryId) {

          response =
            await api(
              "/categories",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(payload),
              }
            );

        }

        // UPDATE
        else {

          response =
            await api(
              `/categories/${editingCategoryId}`,
              {
                method: "PUT",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(payload),
              }
            );
        }


        console.log(
          "Category saved:",
          response
        );


        closeModal();

        await loadCategories();

        alert(
          "Category saved successfully!"
        );


      } catch (error) {

        console.error(
          "Save category error:",
          error
        );

        alert(
          error.message ||
          "Unable to save category."
        );

      } finally {

        saveButton.disabled = false;

        saveButton.textContent =
          "Save Category";
      }
    }
  );


  // ==========================================
  // DELETE
  // ==========================================

  const deleteCategory = async (
    categoryId
  ) => {

    const category =
      categories.find(
        (item) =>
          item._id === categoryId
      );

    if (!category) return;


    const confirmed =
      confirm(
        `Delete "${category.name}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) return;


    try {

      await api(
        `/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      await loadCategories();

      alert(
        "Category deleted successfully!"
      );

    } catch (error) {

      console.error(
        "Delete category error:",
        error
      );

      alert(
        error.message ||
        "Unable to delete category."
      );
    }
  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {

    modal.classList.add(
      "hidden"
    );

    editingCategoryId = null;

    form.reset();

    previewBox.classList.add(
      "hidden"
    );

    previewImage.src = "";
  };


  document
    .getElementById(
      "addCategoryBtn"
    )
    .addEventListener(
      "click",
      openAddCategory
    );


  document
    .getElementById(
      "closeModal"
    )
    .addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "cancelBtn"
    )
    .addEventListener(
      "click",
      closeModal
    );


  modal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === modal
      ) {
        closeModal();
      }
    }
  );


  searchInput.addEventListener(
    "input",
    renderCategories
  );


  // ==========================================
  // AUTO SLUG
  // ==========================================

  document
    .getElementById(
      "categoryName"
    )
    .addEventListener(
      "input",
      (event) => {

        if (editingCategoryId) {
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
          "categorySlug"
        ).value = slug;
      }
    );


  // ==========================================
  // ESCAPE HTML
  // ==========================================

  function escapeHtml(value) {

    return String(value ?? "")
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

  loadCategories();

});