// ============================================================
// LR HANDLOOMS — ADMIN ORDERS
// ============================================================

const API_BASE =
  "https://backend-8zwr.onrender.com/api";


// ============================================================
// ELEMENTS
// ============================================================

const ordersList =
  document.getElementById(
    "ordersList"
  );

const ordersCount =
  document.getElementById(
    "ordersCount"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const paymentFilter =
  document.getElementById(
    "paymentFilter"
  );

const statusFilter =
  document.getElementById(
    "statusFilter"
  );

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


// ============================================================
// AUTH
// ============================================================

const TOKEN_KEY =
  "handloom_admin_token";


function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  );

}


function logout() {

  localStorage.removeItem(
    "handloom_admin_token"
  );

  localStorage.removeItem(
    "handloom_admin"
  );

  window.location.href =
    "./login.html";

}


if (!getToken()) {

  window.location.href =
    "./login.html";

}


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logout
  );

}


// ============================================================
// ADMIN PROFILE
// ============================================================

function loadAdminProfile() {

  const saved =
    localStorage.getItem(
      "handloom_admin"
    );

  if (!saved) {
    return;
  }


  try {

    const admin =
      JSON.parse(
        saved
      );


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


    if (
      name &&
      admin.name
    ) {

      name.textContent =
        admin.name;

    }


    if (
      email &&
      admin.email
    ) {

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

}


// ============================================================
// API REQUEST
// ============================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  const token =
    getToken();


  if (!token) {

    logout();

    throw new Error(
      "Authentication required"
    );

  }


  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,

        headers: {

          ...(options.headers || {}),

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",

        },

      }
    );


  const data =
    await response
      .json()
      .catch(
        () => ({})
      );


  if (
    response.status === 401
  ) {

    logout();

    throw new Error(
      "Admin session expired"
    );

  }


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Request failed"
    );

  }


  return data;

}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders() {

  try {

    ordersList.innerHTML = `
      <div class="orders-loading">
        Loading orders...
      </div>
    `;


    const params =
      new URLSearchParams();


    const search =
      searchInput.value.trim();

    const payment =
      paymentFilter.value;

    const status =
      statusFilter.value;


    if (search) {

      params.set(
        "search",
        search
      );

    }


    if (
      payment &&
      payment !== "all"
    ) {

      params.set(
        "paymentStatus",
        payment
      );

    }


    if (
      status &&
      status !== "all"
    ) {

      params.set(
        "orderStatus",
        status
      );

    }


    const query =
      params.toString()
        ? `?${params.toString()}`
        : "";


    const data =
      await apiRequest(
        `/orders${query}`
      );


    const orders =
      data.orders || [];


    ordersCount.textContent =
      orders.length;


    renderOrders(
      orders
    );


  } catch (error) {

    console.error(
      "Load orders error:",
      error
    );


    ordersList.innerHTML = `
      <div class="orders-empty">
        <strong>
          Unable to load orders
        </strong>

        <small>
          ${escapeHTML(
            error.message
          )}
        </small>
      </div>
    `;

  }

}


// ============================================================
// RENDER ORDERS
// ============================================================

function renderOrders(
  orders
) {

  if (!orders.length) {

    ordersList.innerHTML = `
      <div class="orders-empty">

        <strong>
          No orders found
        </strong>

        <small>
          New customer orders will appear here.
        </small>

      </div>
    `;

    return;

  }


  ordersList.innerHTML =
    orders
      .map(
        order =>
          createOrderCard(
            order
          )
      )
      .join("");


  document
    .querySelectorAll(
      "[data-confirm-payment]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            confirmPayment(
              button.dataset
                .confirmPayment
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-reject-payment]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            rejectPayment(
              button.dataset
                .rejectPayment
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-status]"
    )
    .forEach(
      select => {

        select.addEventListener(
          "change",
          () => {

            updateOrderStatus(
              select.dataset
                .status,
              select.value
            );

          }
        );

      }
    );

}


// ============================================================
// ORDER CARD
// ============================================================

function createOrderCard(
  order
) {

  const paymentStatus =
    order.paymentStatus ||
    "awaiting";


  const orderStatus =
    order.orderStatus ||
    "pending";


  const customer =
    order.customer || {};


  const items =
    order.items || [];


  const date =
    order.createdAt
      ? new Date(
          order.createdAt
        ).toLocaleString(
          "en-IN",
          {
            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        )
      : "—";


  const paymentLabel =
    paymentStatus === "paid"
      ? "PAID"
      : paymentStatus ===
        "rejected"
      ? "REJECTED"
      : "AWAITING";


  const itemHTML =
    items
      .map(
        item => `

          <div class="order-item">

            <div class="order-item-image">

              ${
                item.image
                  ? `
                    <img
                      src="${escapeHTML(
                        item.image
                      )}"
                      alt=""
                    >
                  `
                  : `
                    <span>
                      H
                    </span>
                  `
              }

            </div>


            <div class="order-item-info">

              <strong>
                ${escapeHTML(
                  item.name ||
                  "Product"
                )}
              </strong>

              <span>
                Qty ${
                  Number(
                    item.quantity
                  ) || 1
                }
              </span>

            </div>


            <strong>
              ₹${Number(
                item.total || 0
              ).toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

        `
      )
      .join("");


  return `

    <article
      class="order-card"
      data-order-id="${escapeHTML(
        order._id
      )}"
    >


      <div class="order-header">


        <div>

          <span class="order-eyebrow">
            ORDER
          </span>

          <h2>
            ${escapeHTML(
              order.orderNumber ||
              "—"
            )}
          </h2>

          <p>
            ${escapeHTML(
              date
            )}
          </p>

        </div>


        <div class="order-badges">

          <span
            class="
              payment-badge
              payment-${paymentStatus}
            "
          >
            ${paymentLabel}
          </span>


          <span
            class="
              status-badge
              status-${orderStatus}
            "
          >
            ${escapeHTML(
              orderStatus
                .toUpperCase()
            )}
          </span>

        </div>

      </div>



      <div class="order-body">


        <div class="order-section">

          <span class="section-label">
            CUSTOMER
          </span>

          <strong>
            ${escapeHTML(
              customer.name ||
              "—"
            )}
          </strong>

          <span>
            ${escapeHTML(
              customer.email ||
              "—"
            )}
          </span>

          <span>
            ${escapeHTML(
              customer.phone ||
              "—"
            )}
          </span>

        </div>



        <div class="order-section">

          <span class="section-label">
            SHIPPING
          </span>

          <span>
            ${escapeHTML(
              order.shippingAddress
                ?.address ||
              "—"
            )}
          </span>

          <span>
            ${escapeHTML(
              order.shippingAddress
                ?.city ||
              ""
            )},
            ${escapeHTML(
              order.shippingAddress
                ?.state ||
              ""
            )}
          </span>

          <span>
            PIN:
            ${escapeHTML(
              order.shippingAddress
                ?.pincode ||
              "—"
            )}
          </span>

        </div>



        <div class="order-section">

          <span class="section-label">
            PAYMENT
          </span>

          <span>
            UPI
          </span>

          <strong class="utr">
            UTR:
            ${escapeHTML(
              order.transactionId ||
              "Not provided"
            )}
          </strong>

        </div>


      </div>



      <div class="order-items">

        <span class="section-label">
          ITEMS
        </span>

        ${itemHTML}

      </div>



      <div class="order-footer">


        <div>

          <span class="section-label">
            TOTAL
          </span>

          <strong class="order-total">
            ₹${Number(
              order.total || 0
            ).toLocaleString(
              "en-IN"
            )}
          </strong>

        </div>



        <div class="order-controls">


          ${
            paymentStatus ===
            "awaiting"
              ? `

                <button
                  class="confirm-btn"
                  data-confirm-payment="${escapeHTML(
                    order._id
                  )}"
                >
                  ✓ CONFIRM PAYMENT
                </button>

                <button
                  class="reject-btn"
                  data-reject-payment="${escapeHTML(
                    order._id
                  )}"
                >
                  REJECT
                </button>

              `
              : ""
          }



          <select
            class="status-select"
            data-status="${escapeHTML(
              order._id
            )}"
          >

            <option
              value="pending"
              ${
                orderStatus ===
                "pending"
                  ? "selected"
                  : ""
              }
            >
              Pending
            </option>

            <option
              value="confirmed"
              ${
                orderStatus ===
                "confirmed"
                  ? "selected"
                  : ""
              }
            >
              Confirmed
            </option>

            <option
              value="processing"
              ${
                orderStatus ===
                "processing"
                  ? "selected"
                  : ""
              }
            >
              Processing
            </option>

            <option
              value="shipped"
              ${
                orderStatus ===
                "shipped"
                  ? "selected"
                  : ""
              }
            >
              Shipped
            </option>

            <option
              value="delivered"
              ${
                orderStatus ===
                "delivered"
                  ? "selected"
                  : ""
              }
            >
              Delivered
            </option>

            <option
              value="cancelled"
              ${
                orderStatus ===
                "cancelled"
                  ? "selected"
                  : ""
              }
            >
              Cancelled
            </option>

          </select>


        </div>

      </div>

    </article>

  `;

}


// ============================================================
// CONFIRM PAYMENT
// ============================================================

async function confirmPayment(
  orderId
) {

  const confirmed =
    window.confirm(
      "Confirm that you have verified this UPI payment?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await apiRequest(
      `/orders/${orderId}/confirm-payment`,
      {
        method: "PUT",
      }
    );


    await loadOrders();


  } catch (error) {

    alert(
      error.message ||
      "Unable to confirm payment"
    );

  }

}


// ============================================================
// REJECT PAYMENT
// ============================================================

async function rejectPayment(
  orderId
) {

  const confirmed =
    window.confirm(
      "Reject this payment and cancel the order?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await apiRequest(
      `/orders/${orderId}/reject-payment`,
      {
        method: "PUT",
      }
    );


    await loadOrders();


  } catch (error) {

    alert(
      error.message ||
      "Unable to reject payment"
    );

  }

}


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

async function updateOrderStatus(
  orderId,
  status
) {

  try {

    await apiRequest(
      `/orders/${orderId}/status`,
      {
        method: "PUT",

        body:
          JSON.stringify({
            status,
          }),
      }
    );


    await loadOrders();


  } catch (error) {

    alert(
      error.message ||
      "Unable to update order status"
    );

    await loadOrders();

  }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


// ============================================================
// FILTER EVENTS
// ============================================================

paymentFilter.addEventListener(
  "change",
  loadOrders
);

statusFilter.addEventListener(
  "change",
  loadOrders
);


let searchTimer;

searchInput.addEventListener(
  "input",
  () => {

    clearTimeout(
      searchTimer
    );


    searchTimer =
      setTimeout(
        loadOrders,
        300
      );

  }
);


// ============================================================
// INIT
// ============================================================

loadAdminProfile();

loadOrders();