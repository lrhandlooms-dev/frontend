const API_BASE = "https://backend-8zwr.onrender.com/api";
const IMAGE_API = API_BASE;

let allImages = [];
let currentFilter = "all";
let selectedImage = null;


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
// API
// ==========================================

const apiRequest = async (endpoint, options = {}) => {

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
    `${IMAGE_API}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (response.status === 401) {
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

const imageGrid =
  document.getElementById("imageGrid");

const imageSearch =
  document.getElementById("imageSearch");

const uploadModal =
  document.getElementById("uploadModal");

const previewModal =
  document.getElementById("previewModal");

const uploadForm =
  document.getElementById("uploadForm");

const imageFile =
  document.getElementById("imageFile");


// ==========================================
// LOAD IMAGES
// ==========================================

const loadImages = async () => {

  renderLoading();

  try {

    const params = new URLSearchParams();

    if (currentFilter !== "all") {
      params.set(
        "type",
        currentFilter
      );
    }

    const search =
      imageSearch.value.trim();

    if (search) {
      params.set(
        "search",
        search
      );
    }

    const query =
      params.toString()
        ? `?${params.toString()}`
        : "";


    const data =
      await apiRequest(
        `/images${query}`
      );


    allImages =
      data.images || [];


    updateStats();


    renderImages();


  } catch (error) {

    console.error(
      "Load images error:",
      error
    );


    imageGrid.innerHTML = `
      <div class="image-empty">

        <div class="image-empty-icon">
          !
        </div>

        <h3>
          Unable to load images
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>
    `;
  }
};


// ==========================================
// LOADING
// ==========================================

const renderLoading = () => {

  imageGrid.innerHTML = `
    <div class="image-loading">

      <div class="loading-spinner"></div>

      <span>
        Loading image library...
      </span>

    </div>
  `;
};


// ==========================================
// STATS
// ==========================================

const updateStats = async () => {

  try {

    /*
      Load all images separately so the
      statistics remain correct even when
      a filter is active.
    */

    const data =
      await apiRequest(
        "/images"
      );


    const images =
      data.images || [];


    document.getElementById(
      "totalImages"
    ).textContent =
      images.length;


    document.getElementById(
      "productImages"
    ).textContent =
      images.filter(
        image =>
          image.type === "products"
      ).length;


    document.getElementById(
      "categoryImages"
    ).textContent =
      images.filter(
        image =>
          image.type === "categories"
      ).length;


    document.getElementById(
      "makingStepImages"
    ).textContent =
      images.filter(
        image =>
          image.type === "making-steps"
      ).length;

  } catch (error) {

    console.error(
      "Stats error:",
      error
    );
  }
};


// ==========================================
// RENDER IMAGES
// ==========================================

const renderImages = () => {

  if (!allImages.length) {

    imageGrid.innerHTML = `
      <div class="image-empty">

        <div class="image-empty-icon">
          ◇
        </div>

        <h3>
          No images found
        </h3>

        <p>
          Upload an image or change your
          search/filter.
        </p>

      </div>
    `;

    updateCountLabel(0);

    return;
  }


  imageGrid.innerHTML =
    allImages
      .map(createImageCard)
      .join("");


  updateCountLabel(
    allImages.length
  );
};


// ==========================================
// IMAGE CARD
// ==========================================

const createImageCard = (image, index) => {

  const dimensions =
    image.width && image.height
      ? `${image.width} × ${image.height}`
      : "—";


  const size =
    formatBytes(
      image.bytes
    );


  const typeLabel =
    image.type === "making-steps"
      ? "Making Step"
      : image.type === "products"
      ? "Product"
      : "Category";


  return `
    <article class="image-card">

      <div class="image-card-media">

        <img
          src="${escapeHtml(image.url)}"
          alt="${escapeHtml(image.publicId)}"
          loading="lazy"
          onerror="this.style.opacity='.2'"
        />


        <div class="image-card-overlay">

          <button
            type="button"
            class="image-overlay-btn"
            onclick="openImagePreview(${index})"
            title="Preview"
          >
            ◉
          </button>


          <button
            type="button"
            class="image-overlay-btn"
            onclick="copyImageUrl(${index})"
            title="Copy URL"
          >
            ⧉
          </button>


          <button
            type="button"
            class="image-overlay-btn delete"
            onclick="deleteImage(${index})"
            title="Delete"
          >
            ×
          </button>

        </div>

      </div>


      <div class="image-card-content">

        <div class="image-card-top">

          <span class="image-type">
            ${typeLabel}
          </span>

          <span class="image-format">
            ${escapeHtml(
              image.format || "IMAGE"
            )}
          </span>

        </div>


        <div
          class="image-public-id"
          title="${escapeHtml(
            image.publicId
          )}"
        >
          ${escapeHtml(
            image.publicId
          )}
        </div>


        <div class="image-card-meta">

          <span>
            ${dimensions}
          </span>

          <span>
            ${size}
          </span>

        </div>

      </div>

    </article>
  `;
};


// ==========================================
// COUNT
// ==========================================

const updateCountLabel = count => {

  document.getElementById(
    "imageCountLabel"
  ).textContent =
    `${count} ${
      count === 1
        ? "image"
        : "images"
    }`;
};


// ==========================================
// FILTER
// ==========================================

document
  .querySelectorAll(".image-filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".image-filter"
          )
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );


        button.classList.add(
          "active"
        );


        currentFilter =
          button.dataset.filter ||
          "all";


        loadImages();
      }
    );
  });


// ==========================================
// SEARCH
// ==========================================

let searchTimer;

imageSearch.addEventListener(
  "input",
  () => {

    clearTimeout(
      searchTimer
    );


    searchTimer =
      setTimeout(
        () => {
          loadImages();
        },
        350
      );
  }
);


// ==========================================
// OPEN UPLOAD MODAL
// ==========================================

document
  .getElementById("uploadImageBtn")
  .addEventListener(
    "click",
    () => {

      resetUploadForm();

      uploadModal.classList.add(
        "open"
      );
    }
  );


// ==========================================
// CLOSE UPLOAD
// ==========================================

const closeUploadModal = () => {

  uploadModal.classList.remove(
    "open"
  );
};


document
  .getElementById("closeUploadModal")
  .addEventListener(
    "click",
    closeUploadModal
  );


document
  .getElementById("cancelUploadBtn")
  .addEventListener(
    "click",
    closeUploadModal
  );


uploadModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      uploadModal
    ) {
      closeUploadModal();
    }
  }
);


// ==========================================
// FILE SELECT
// ==========================================

imageFile.addEventListener(
  "change",
  () => {

    const file =
      imageFile.files?.[0];


    if (!file) {
      return;
    }


    showUploadPreview(
      file
    );
  }
);


// ==========================================
// UPLOAD PREVIEW
// ==========================================

const showUploadPreview = file => {

  const preview =
    document.getElementById(
      "uploadPreview"
    );


  const previewImage =
    document.getElementById(
      "uploadPreviewImage"
    );


  const fileName =
    document.getElementById(
      "uploadFileName"
    );


  const fileSize =
    document.getElementById(
      "uploadFileSize"
    );


  fileName.textContent =
    file.name;


  fileSize.textContent =
    formatBytes(
      file.size
    );


  const reader =
    new FileReader();


  reader.onload = event => {

    previewImage.src =
      event.target.result;

  };


  reader.readAsDataURL(
    file
  );


  preview.classList.remove(
    "hidden"
  );
};


// ==========================================
// DRAG & DROP
// ==========================================

const dropZone =
  document.getElementById(
    "dropZone"
  );


[
  "dragenter",
  "dragover"
].forEach(eventName => {

  dropZone.addEventListener(
    eventName,
    event => {

      event.preventDefault();

      dropZone.classList.add(
        "dragging"
      );
    }
  );
});


[
  "dragleave",
  "drop"
].forEach(eventName => {

  dropZone.addEventListener(
    eventName,
    event => {

      event.preventDefault();

      dropZone.classList.remove(
        "dragging"
      );
    }
  );
});


dropZone.addEventListener(
  "drop",
  event => {

    const files =
      event.dataTransfer.files;


    if (!files.length) {
      return;
    }


    const file =
      files[0];


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showUploadMessage(
        "Please select an image file."
      );

      return;
    }


    /*
      DataTransfer lets us place the dropped
      file into the actual file input.
    */

    const transfer =
      new DataTransfer();

    transfer.items.add(file);

    imageFile.files =
      transfer.files;


    showUploadPreview(
      file
    );
  }
);


// ==========================================
// UPLOAD IMAGE
// ==========================================

uploadForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const file =
      imageFile.files?.[0];


    if (!file) {

      showUploadMessage(
        "Please select an image."
      );

      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showUploadMessage(
        "Only image files are allowed."
      );

      return;
    }


    if (
      file.size >
      20 * 1024 * 1024
    ) {

      showUploadMessage(
        "Image must be smaller than 20MB."
      );

      return;
    }


    const type =
      document.getElementById(
        "uploadType"
      ).value;


    const button =
      document.getElementById(
        "uploadSubmitBtn"
      );


    button.disabled = true;

    showUploadMessage(
      "Uploading to Cloudinary..."
    );


    try {

      const formData =
        new FormData();


      formData.append(
        "image",
        file
      );


      formData.append(
        "type",
        type
      );


      await apiRequest(
        "/images/upload",
        {
          method: "POST",
          body: formData
        }
      );


      showUploadMessage(
        "✓ Image uploaded successfully.",
        true
      );


      await loadImages();


      setTimeout(
        () => {
          closeUploadModal();
          resetUploadForm();
        },
        700
      );


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );


      showUploadMessage(
        error.message ||
        "Image upload failed."
      );

    } finally {

      button.disabled =
        false;
    }
  }
);


// ==========================================
// UPLOAD MESSAGE
// ==========================================

const showUploadMessage = (
  message,
  success = false
) => {

  const element =
    document.getElementById(
      "uploadMessage"
    );


  element.textContent =
    message;


  element.classList.toggle(
    "success",
    success
  );
};


// ==========================================
// RESET UPLOAD
// ==========================================

const resetUploadForm = () => {

  uploadForm.reset();


  document.getElementById(
    "uploadPreview"
  ).classList.add(
    "hidden"
  );


  document.getElementById(
    "uploadPreviewImage"
  ).src = "";


  document.getElementById(
    "uploadMessage"
  ).textContent = "";


  document.getElementById(
    "uploadMessage"
  ).classList.remove(
    "success"
  );
};


// ==========================================
// OPEN PREVIEW
// ==========================================

const openImagePreview = index => {

  const image =
    allImages[index];


  if (!image) {
    return;
  }


  selectedImage =
    image;


  document.getElementById(
    "fullPreviewImage"
  ).src =
    image.url;


  document.getElementById(
    "previewType"
  ).textContent =
    image.type === "making-steps"
      ? "Making Step"
      : image.type === "products"
      ? "Product"
      : "Category";


  document.getElementById(
    "previewPublicId"
  ).textContent =
    image.publicId;


  document.getElementById(
    "previewDimensions"
  ).textContent =
    image.width &&
    image.height
      ? `${image.width} × ${image.height}`
      : "—";


  document.getElementById(
    "previewFormat"
  ).textContent =
    image.format ||
    "—";


  document.getElementById(
    "previewSize"
  ).textContent =
    formatBytes(
      image.bytes
    );


  document.getElementById(
    "previewUrl"
  ).value =
    image.url;


  previewModal.classList.add(
    "open"
  );
};


// ==========================================
// CLOSE PREVIEW
// ==========================================

const closePreviewModal = () => {

  previewModal.classList.remove(
    "open"
  );

  selectedImage =
    null;
};


document
  .getElementById(
    "closePreviewModal"
  )
  .addEventListener(
    "click",
    closePreviewModal
  );


previewModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      previewModal
    ) {

      closePreviewModal();
    }
  }
);


// ==========================================
// COPY URL
// ==========================================

const copyImageUrl = async index => {

  const image =
    allImages[index];


  if (!image?.url) {
    return;
  }


  try {

    await navigator.clipboard.writeText(
      image.url
    );


    showToast(
      "Image URL copied"
    );

  } catch (error) {

    console.error(
      "Copy error:",
      error
    );


    /*
      Fallback for browsers where
      clipboard API is unavailable.
    */

    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value =
      image.url;

    document.body.appendChild(
      textarea
    );

    textarea.select();

    document.execCommand(
      "copy"
    );

    textarea.remove();


    showToast(
      "Image URL copied"
    );
  }
};


document
  .getElementById(
    "copyUrlBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!selectedImage?.url) {
        return;
      }


      try {

        await navigator.clipboard.writeText(
          selectedImage.url
        );


        const button =
          document.getElementById(
            "copyUrlBtn"
          );


        const original =
          button.textContent;


        button.textContent =
          "Copied";


        setTimeout(
          () => {
            button.textContent =
              original;
          },
          1200
        );

      } catch (error) {

        console.error(
          "Copy error:",
          error
        );
      }
    }
  );


// ==========================================
// DELETE IMAGE
// ==========================================

const deleteImage = async index => {

  const image =
    allImages[index];


  if (!image) {
    return;
  }


  const confirmed =
    confirm(
      `Delete this image permanently?\n\n${image.publicId}\n\nThis will remove the image from Cloudinary.`
    );


  if (!confirmed) {
    return;
  }


  try {

    await apiRequest(
      "/images",
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            publicId:
              image.publicId
          })
      }
    );


    if (
      selectedImage?.publicId ===
      image.publicId
    ) {

      closePreviewModal();
    }


    showToast(
      "Image deleted"
    );


    await loadImages();


  } catch (error) {

    console.error(
      "Delete image error:",
      error
    );


    alert(
      error.message ||
      "Unable to delete image."
    );
  }
};


// ==========================================
// DELETE FROM PREVIEW
// ==========================================

document
  .getElementById(
    "deletePreviewBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!selectedImage) {
        return;
      }


      const confirmed =
        confirm(
          `Delete this image permanently?\n\n${selectedImage.publicId}`
        );


      if (!confirmed) {
        return;
      }


      try {

        await apiRequest(
          "/images",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                publicId:
                  selectedImage.publicId
              })
          }
        );


        closePreviewModal();

        showToast(
          "Image deleted"
        );


        await loadImages();


      } catch (error) {

        console.error(
          "Delete preview error:",
          error
        );


        alert(
          error.message ||
          "Unable to delete image."
        );
      }
    }
  );


// ==========================================
// TOAST
// ==========================================

const showToast = message => {

  const existing =
    document.querySelector(
      ".image-toast"
    );


  if (existing) {
    existing.remove();
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "image-toast";


  toast.textContent =
    message;


  Object.assign(
    toast.style,
    {
      position: "fixed",
      left: "50%",
      bottom: "30px",
      transform:
        "translateX(-50%)",
      zIndex: "10000",
      padding:
        "11px 18px",
      border:
        "1px solid rgba(216,180,122,.35)",
      borderRadius:
        "4px",
      background:
        "#151515",
      color:
        "#d8b47a",
      fontSize:
        "10px",
      boxShadow:
        "0 15px 40px rgba(0,0,0,.5)"
    }
  );


  document.body.appendChild(
    toast
  );


  setTimeout(
    () => {
      toast.remove();
    },
    1800
  );
};


// ==========================================
// FORMAT BYTES
// ==========================================

const formatBytes = bytes => {

  if (!bytes || bytes <= 0) {
    return "—";
  }


  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];


  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  const safeIndex =
    Math.min(
      index,
      units.length - 1
    );


  const value =
    bytes /
    Math.pow(
      1024,
      safeIndex
    );


  return `${value.toFixed(
    safeIndex === 0
      ? 0
      : 1
  )} ${units[safeIndex]}`;
};


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
// ESC KEY
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    if (
      uploadModal.classList.contains(
        "open"
      )
    ) {

      closeUploadModal();
    }


    if (
      previewModal.classList.contains(
        "open"
      )
    ) {

      closePreviewModal();
    }
  }
);


// ==========================================
// EXPOSE FUNCTIONS
// ==========================================

window.openImagePreview =
  openImagePreview;

window.copyImageUrl =
  copyImageUrl;

window.deleteImage =
  deleteImage;


// ==========================================
// INIT
// ==========================================

const initImageManager = async () => {

  if (!getToken()) {

    window.location.href =
      "./login.html";

    return;
  }


  loadAdminProfile();

  await loadImages();
};


initImageManager();