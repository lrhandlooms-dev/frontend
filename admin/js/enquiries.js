const API_BASE = "https://backend-8zwr.onrender.com/api";

let currentStatus = "all";
let currentType = "all";
let currentEnquiry = null;

const enquiryList =
  document.getElementById("enquiryList");

const enquirySearch =
  document.getElementById("enquirySearch");

const typeFilter =
  document.getElementById("typeFilter");

const enquiryModal =
  document.getElementById("enquiryModal");


// ==========================================
// AUTH
// ==========================================

const getToken = () =>
  localStorage.getItem("handloom_admin_token");


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
    logoutAdmin();
    throw new Error("Authentication required");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(
    `${API_BASE}${endpoint}`,
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
      data.message ||
      "Request failed"
    );
  }

  return data;
};


// ==========================================
// LOAD ENQUIRIES
// ==========================================

const loadEnquiries = async () => {

  renderLoading();

  try {

    const params =
      new URLSearchParams();


    if (currentStatus !== "all") {
      params.set(
        "status",
        currentStatus
      );
    }


    if (currentType !== "all") {
      params.set(
        "type",
        currentType
      );
    }


    const search =
      enquirySearch.value.trim();


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
        `/enquiries${query}`
      );


    const enquiries =
      data.enquiries || [];


    renderEnquiries(
      enquiries
    );


    updateStats(
      enquiries
    );


  } catch (error) {

    console.error(
      "Load enquiries error:",
      error
    );


    enquiryList.innerHTML = `
      <div class="enquiry-empty">

        <div class="enquiry-empty-icon">
          !
        </div>

        <h3>
          Unable to load enquiries
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

  enquiryList.innerHTML = `
    <div class="enquiry-loading">

      <div class="loading-spinner"></div>

      <span>
        Loading enquiries...
      </span>

    </div>
  `;
};


// ==========================================
// STATS
// ==========================================

const updateStats = async () => {

  try {

    const data =
      await apiRequest(
        "/enquiries"
      );


    const enquiries =
      data.enquiries || [];


    document.getElementById(
      "totalEnquiries"
    ).textContent =
      enquiries.length;


    document.getElementById(
      "newEnquiries"
    ).textContent =
      enquiries.filter(
        item =>
          item.status === "new"
      ).length;


    document.getElementById(
      "readEnquiries"
    ).textContent =
      enquiries.filter(
        item =>
          item.status === "read"
      ).length;


    document.getElementById(
      "repliedEnquiries"
    ).textContent =
      enquiries.filter(
        item =>
          item.status === "replied"
      ).length;

  } catch (error) {

    console.error(
      "Stats error:",
      error
    );
  }
};


// ==========================================
// RENDER
// ==========================================

const renderEnquiries = enquiries => {

  const count =
    enquiries.length;


  document.getElementById(
    "enquiryCountLabel"
  ).textContent =
    `${count} ${
      count === 1
        ? "enquiry"
        : "enquiries"
    }`;


  if (!count) {

    enquiryList.innerHTML = `
      <div class="enquiry-empty">

        <div class="enquiry-empty-icon">
          ✉
        </div>

        <h3>
          No enquiries found
        </h3>

        <p>
          New customer enquiries will appear here.
        </p>

      </div>
    `;

    return;
  }


  enquiryList.innerHTML =
    enquiries
      .map(
        (enquiry, index) =>
          createEnquiryRow(
            enquiry,
            index
          )
      )
      .join("");


  window.currentEnquiries =
    enquiries;
};


// ==========================================
// ROW
// ==========================================

const createEnquiryRow = (
  enquiry,
  index
) => {

  const name =
    enquiry.name ||
    "Unknown Customer";


  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase();


  const status =
    enquiry.status ||
    "new";


  const type =
    formatType(
      enquiry.type
    );


  const subject =
    enquiry.subject ||
    "No subject";


  const message =
    enquiry.message ||
    "";


  return `
    <article
      class="enquiry-row ${
        status === "new"
          ? "unread"
          : ""
      }"
      onclick="openEnquiry(${index})"
    >

      <div class="enquiry-avatar">
        ${escapeHtml(initial)}
      </div>


      <div class="enquiry-customer">

        <strong>
          ${escapeHtml(name)}
        </strong>

        <span>
          ${escapeHtml(
            enquiry.email || "—"
          )}
        </span>

      </div>


      <div class="enquiry-subject">

        <strong>
          ${escapeHtml(subject)}
        </strong>

        <p>
          ${escapeHtml(message)}
        </p>

      </div>


      <span class="enquiry-type">
        ${escapeHtml(type)}
      </span>


      <span class="enquiry-status ${status}">
        ${escapeHtml(status)}
      </span>


      <time class="enquiry-date">
        ${formatDate(
          enquiry.createdAt
        )}
      </time>

    </article>
  `;
};


// ==========================================
// OPEN ENQUIRY
// ==========================================

const openEnquiry = async index => {

  const enquiries =
    window.currentEnquiries || [];


  const enquiry =
    enquiries[index];


  if (!enquiry) {
    return;
  }


  currentEnquiry =
    enquiry;


  fillEnquiryModal(
    enquiry
  );


  enquiryModal.classList.add(
    "open"
  );


  // Automatically mark NEW as READ
  if (enquiry.status === "new") {

    try {

      await updateStatus(
        enquiry._id,
        "read",
        false
      );

      currentEnquiry.status =
        "read";

      await loadEnquiries();

    } catch (error) {

      console.error(
        "Auto read error:",
        error
      );
    }
  }
};


// ==========================================
// FILL MODAL
// ==========================================

const fillEnquiryModal = enquiry => {

  const name =
    enquiry.name ||
    "Unknown Customer";


  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase();


  document.getElementById(
    "customerInitial"
  ).textContent =
    initial;


  document.getElementById(
    "customerName"
  ).textContent =
    name;


  const email =
    document.getElementById(
      "customerEmail"
    );


  email.textContent =
    enquiry.email ||
    "No email";


  email.href =
    enquiry.email
      ? `mailto:${encodeURIComponent(
          enquiry.email
        )}`
      : "#";


  document.getElementById(
    "customerPhone"
  ).textContent =
    enquiry.phone ||
    "No phone number";


  document.getElementById(
    "modalSubject"
  ).textContent =
    enquiry.subject ||
    "Customer Enquiry";


  document.getElementById(
    "enquiryMessage"
  ).textContent =
    enquiry.message ||
    "No message";


  document.getElementById(
    "enquiryDate"
  ).textContent =
    formatFullDate(
      enquiry.createdAt
    );


  const status =
    document.getElementById(
      "modalStatus"
    );


  status.textContent =
    (
      enquiry.status ||
      "new"
    ).toUpperCase();


  status.className =
    `enquiry-status ${
      enquiry.status ||
      "new"
    }`;


  document.getElementById(
    "enquiryType"
  ).textContent =
    formatType(
      enquiry.type
    );


  document.getElementById(
    "adminNote"
  ).value =
    enquiry.adminNote ||
    "";


  setupProduct(
    enquiry.product
  );


  setupContactButtons(
    enquiry
  );


  updateActionButtons(
    enquiry.status
  );
};


// ==========================================
// PRODUCT
// ==========================================

const setupProduct = product => {

  const section =
    document.getElementById(
      "productSection"
    );


  if (!product) {

    section.classList.add(
      "hidden"
    );

    return;
  }


  section.classList.remove(
    "hidden"
  );


  document.getElementById(
    "enquiryProductName"
  ).textContent =
    product.name ||
    "Product";


  document.getElementById(
    "enquiryProductPrice"
  ).textContent =
    product.price !== undefined
      ? `₹${Number(
          product.price
        ).toLocaleString("en-IN")}`
      : "—";


  const image =
    product.images?.find(
      item =>
        item.isMain
    ) ||
    product.images?.[0];


  document.getElementById(
    "enquiryProductImage"
  ).src =
    image?.url ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23181818'/%3E%3C/svg%3E";
};


// ==========================================
// CONTACT BUTTONS
// ==========================================

const setupContactButtons = enquiry => {

  const emailButton =
    document.getElementById(
      "emailCustomerBtn"
    );


  if (enquiry.email) {

    emailButton.href =
      `mailto:${encodeURIComponent(
        enquiry.email
      )}?subject=${encodeURIComponent(
        `Re: ${
          enquiry.subject ||
          "Your enquiry"
        }`
      )}`;

  } else {

    emailButton.href = "#";
  }


  const whatsappButton =
    document.getElementById(
      "whatsappCustomerBtn"
    );


  const phone =
    normalizePhone(
      enquiry.phone
    );


  if (phone) {

    const message =
      `Hello ${enquiry.name || ""}, thank you for contacting Handloom. We received your enquiry${
        enquiry.subject
          ? ` regarding ${enquiry.subject}`
          : ""
      }.`;

    whatsappButton.href =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    whatsappButton.style.pointerEvents =
      "auto";

    whatsappButton.style.opacity =
      "1";

  } else {

    whatsappButton.href =
      "#";

    whatsappButton.style.pointerEvents =
      "none";

    whatsappButton.style.opacity =
      ".35";
  }
};


// ==========================================
// ACTION BUTTONS
// ==========================================

const updateActionButtons = status => {

  const readButton =
    document.getElementById(
      "markReadBtn"
    );


  const repliedButton =
    document.getElementById(
      "markRepliedBtn"
    );


  if (status === "read") {

    readButton.disabled =
      true;

    readButton.textContent =
      "✓ Read";

  } else {

    readButton.disabled =
      false;

    readButton.textContent =
      "Mark as Read";
  }


  if (status === "replied") {

    repliedButton.disabled =
      true;

    repliedButton.textContent =
      "✓ Replied";

  } else {

    repliedButton.disabled =
      false;

    repliedButton.textContent =
      "Mark as Replied";
  }
};


// ==========================================
// STATUS UPDATE
// ==========================================

const updateStatus = async (
  id,
  status,
  showToast = true
) => {

  const data =
    await apiRequest(
      `/enquiries/${id}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            status
          })
      }
    );


  if (
    currentEnquiry &&
    currentEnquiry._id === id
  ) {

    currentEnquiry.status =
      status;

    updateActionButtons(
      status
    );
  }


  if (showToast) {

    showEnquiryToast(
      `Enquiry marked as ${status}`
    );
  }


  await updateStats();
};


// ==========================================
// MARK READ
// ==========================================

document
  .getElementById(
    "markReadBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!currentEnquiry) {
        return;
      }


      try {

        await updateStatus(
          currentEnquiry._id,
          "read"
        );


        await loadEnquiries();

      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );
      }
    }
  );


// ==========================================
// MARK REPLIED
// ==========================================

document
  .getElementById(
    "markRepliedBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!currentEnquiry) {
        return;
      }


      try {

        await updateStatus(
          currentEnquiry._id,
          "replied"
        );


        await loadEnquiries();

      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );
      }
    }
  );


// ==========================================
// SAVE NOTE
// ==========================================

document
  .getElementById(
    "saveNoteBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!currentEnquiry) {
        return;
      }


      const note =
        document.getElementById(
          "adminNote"
        ).value;


      const button =
        document.getElementById(
          "saveNoteBtn"
        );


      button.disabled =
        true;


      try {

        await apiRequest(
          `/enquiries/${currentEnquiry._id}/note`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                adminNote: note
              })
          }
        );


        currentEnquiry.adminNote =
          note;


        showEnquiryToast(
          "Internal note saved"
        );

      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );

      } finally {

        button.disabled =
          false;
      }
    }
  );


// ==========================================
// DELETE
// ==========================================

document
  .getElementById(
    "deleteEnquiryBtn"
  )
  .addEventListener(
    "click",
    async () => {

      if (!currentEnquiry) {
        return;
      }


      const confirmed =
        confirm(
          `Delete this enquiry permanently?\n\nFrom: ${currentEnquiry.name}\nEmail: ${currentEnquiry.email}`
        );


      if (!confirmed) {
        return;
      }


      try {

        await apiRequest(
          `/enquiries/${currentEnquiry._id}`,
          {
            method: "DELETE"
          }
        );


        closeEnquiryModal();


        showEnquiryToast(
          "Enquiry deleted"
        );


        await loadEnquiries();


      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );
      }
    }
  );


// ==========================================
// CLOSE MODAL
// ==========================================

const closeEnquiryModal = () => {

  enquiryModal.classList.remove(
    "open"
  );

  currentEnquiry =
    null;
};


document
  .getElementById(
    "closeEnquiryModal"
  )
  .addEventListener(
    "click",
    closeEnquiryModal
  );


enquiryModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      enquiryModal
    ) {

      closeEnquiryModal();
    }
  }
);


// ==========================================
// STATUS TABS
// ==========================================

document
  .querySelectorAll(
    ".enquiry-tab"
  )
  .forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".enquiry-tab"
          )
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );


        tab.classList.add(
          "active"
        );


        currentStatus =
          tab.dataset.status ||
          "all";


        loadEnquiries();
      }
    );
  });


// ==========================================
// TYPE FILTER
// ==========================================

typeFilter.addEventListener(
  "change",
  () => {

    currentType =
      typeFilter.value ||
      "all";


    loadEnquiries();
  }
);


// ==========================================
// SEARCH
// ==========================================

let searchTimer;


enquirySearch.addEventListener(
  "input",
  () => {

    clearTimeout(
      searchTimer
    );


    searchTimer =
      setTimeout(
        () => {
          loadEnquiries();
        },
        350
      );
  }
);


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
// TOAST
// ==========================================

const showEnquiryToast = message => {

  const existing =
    document.querySelector(
      ".enquiry-toast"
    );


  if (existing) {
    existing.remove();
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "enquiry-toast";


  toast.textContent =
    message;


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
// HELPERS
// ==========================================

const formatType = type => {

  const types = {
    general: "General",
    product: "Product",
    "custom-order":
      "Custom Order",
    wholesale:
      "Wholesale",
    collaboration:
      "Collaboration"
  };


  return (
    types[type] ||
    "General"
  );
};


const formatDate = date => {

  if (!date) {
    return "—";
  }


  const value =
    new Date(date);


  if (Number.isNaN(
    value.getTime()
  )) {
    return "—";
  }


  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};


const formatFullDate = date => {

  if (!date) {
    return "—";
  }


  const value =
    new Date(date);


  if (Number.isNaN(
    value.getTime()
  )) {
    return "—";
  }


  return value.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
};


const normalizePhone = phone => {

  if (!phone) {
    return "";
  }


  let value =
    String(phone)
      .replace(
        /[^\d+]/g,
        ""
      );


  if (
    value.startsWith("+")
  ) {

    return value.substring(1);
  }


  if (
    value.startsWith("0")
  ) {

    value =
      value.substring(1);
  }


  /*
    India default.
    If your customers are international,
    save phone numbers with country code.
  */

  if (
    value.length === 10
  ) {

    value =
      `91${value}`;
  }


  return value;
};


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
// ESCAPE KEY
// ==========================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeEnquiryModal();
    }
  }
);


// ==========================================
// GLOBAL
// ==========================================

window.openEnquiry =
  openEnquiry;


// ==========================================
// INIT
// ==========================================

const initEnquiries = async () => {

  if (!getToken()) {

    window.location.href =
      "./login.html";

    return;
  }


  loadAdminProfile();

  await loadEnquiries();
};


initEnquiries();