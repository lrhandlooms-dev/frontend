// ============================================================
// LR HANDLOOMS — ORDER SUCCESS
// ============================================================

const API_BASE =
  window.HANDLOOM_API_BASE ||
  "https://backend-8zwr.onrender.com/api";

const TOKEN_KEY =
  "lr_handlooms_user_token";


const orderNumberElement =
  document.getElementById(
    "order-number"
  );

const orderStatusElement =
  document.getElementById(
    "order-status"
  );

const orderTotalElement =
  document.getElementById(
    "order-total"
  );


// ============================================================
// GET ORDER NUMBER
// ============================================================

const params =
  new URLSearchParams(
    window.location.search
  );

const orderNumber =
  params.get("order");


// ============================================================
// SAVED ORDER
// ============================================================

function getSavedOrder() {

  try {

    const saved =
      localStorage.getItem(
        "lr_handlooms_last_order"
      );

    if (!saved) {
      return null;
    }

    return JSON.parse(
      saved
    );

  } catch (error) {

    console.error(
      "Saved order error:",
      error
    );

    return null;

  }

}


const savedOrder =
  getSavedOrder();


// ============================================================
// INITIAL DISPLAY
// ============================================================

if (orderNumber) {

  orderNumberElement.textContent =
    orderNumber;

}


if (savedOrder) {

  if (
    savedOrder.orderStatus
  ) {

    orderStatusElement.textContent =
      formatStatus(
        savedOrder.orderStatus
      );

  }


  if (
    typeof savedOrder.total ===
    "number"
  ) {

    orderTotalElement.textContent =
      "₹" +
      savedOrder.total.toLocaleString(
        "en-IN"
      );

  }

}


// ============================================================
// FETCH LATEST ORDER
// ============================================================

async function loadOrder() {

  if (!orderNumber) {
    return;
  }


  const token =
    localStorage.getItem(
      TOKEN_KEY
    );


  if (!token) {
    return;
  }


  try {

    /*
     * The current backend GET /orders/:id
     * expects MongoDB _id, while this page
     * has the public order number.
     *
     * Therefore the saved order is used
     * as the primary display source.
     */

  } catch (error) {

    console.error(
      "Order loading error:",
      error
    );

  }

}


function formatStatus(
  status
) {

  if (!status) {
    return "Pending";
  }


  return status
    .charAt(0)
    .toUpperCase() +
    status
      .slice(1)
      .toLowerCase();

}


loadOrder();