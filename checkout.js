// ============================================================
// LR HANDLOOMS — CHECKOUT
// ============================================================

const CART_STORAGE_KEY =
  "lr_handlooms_cart";

const TOKEN_KEY =
  "lr_handlooms_user_token";

const API_BASE =
  window.HANDLOOM_API_BASE ||
  "https://backend-8zwr.onrender.com/api";


const checkoutItems =
  document.getElementById(
    "checkout-items"
  );

const subtotalElement =
  document.getElementById(
    "checkout-subtotal"
  );

const totalElement =
  document.getElementById(
    "checkout-total"
  );

const checkoutForm =
  document.getElementById(
    "checkout-form"
  );

const messageElement =
  document.getElementById(
    "checkout-message"
  );


// ============================================================
// LOAD CART
// ============================================================

function getCart() {

  try {

    const saved =
      localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!saved) {
      return [];
    }

    const cart =
      JSON.parse(saved);

    return Array.isArray(cart)
      ? cart
      : [];

  } catch (error) {

    console.error(
      "Checkout cart error:",
      error
    );

    return [];

  }

}


const cart = getCart();


// ============================================================
// RENDER ORDER SUMMARY
// ============================================================

function renderOrderSummary() {

  if (!cart.length) {

    window.location.href =
      "./index.html";

    return;

  }


  let subtotal = 0;


  checkoutItems.innerHTML =
    "";


  cart.forEach(item => {

    const price =
      Number(item.price) || 0;

    const quantity =
      Math.max(
        1,
        Number(item.quantity) || 1
      );

    const itemTotal =
      price * quantity;

    subtotal +=
      itemTotal;


    const element =
      document.createElement(
        "div"
      );

    element.className =
      "checkout-item";


    element.innerHTML = `

      <img
        src="${item.imgUrl || ""}"
        alt=""
      >

      <div>

        <h3 class="checkout-item-name">
          ${escapeHTML(
            item.name ||
            "Handloom Product"
          )}
        </h3>

        <p class="checkout-item-meta">
          QTY ${quantity}
        </p>

      </div>

      <span class="checkout-item-price">
        ₹${itemTotal.toLocaleString(
          "en-IN"
        )}
      </span>

    `;


    checkoutItems.appendChild(
      element
    );

  });


  subtotalElement.textContent =
    "₹" +
    subtotal.toLocaleString(
      "en-IN"
    );


  totalElement.textContent =
    "₹" +
    subtotal.toLocaleString(
      "en-IN"
    );

}


function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


// ============================================================
// LOAD LOGGED-IN USER
// ============================================================

async function loadUser() {

  const token =
    localStorage.getItem(
      TOKEN_KEY
    );


  if (!token) {

    showMessage(
      "Please login before continuing to checkout."
    );

    return;

  }


  try {

    const response =
      await fetch(
        `${API_BASE}/auth/me`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`
          },

          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success ||
      !data.user
    ) {

      localStorage.removeItem(
        TOKEN_KEY
      );

      showMessage(
        "Your login session has expired. Please login again."
      );

      return;

    }


    const user =
      data.user;


    document.getElementById(
      "fullName"
    ).value =
      user.name || "";


    document.getElementById(
      "email"
    ).value =
      user.email || "";


    document.getElementById(
      "phone"
    ).value =
      user.phone || "";

  } catch (error) {

    console.error(
      "User loading error:",
      error
    );

  }

}


// ============================================================
// FORM SUBMIT
// ============================================================

checkoutForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const token =
      localStorage.getItem(
        TOKEN_KEY
      );


    if (!token) {

      showMessage(
        "Please login before continuing to checkout."
      );

      return;

    }


    if (!cart.length) {

      showMessage(
        "Your shopping bag is empty."
      );

      return;

    }


    const formData =
      new FormData(
        checkoutForm
      );


    const address = {

      fullName:
        formData.get(
          "fullName"
        ),

      email:
        formData.get(
          "email"
        ),

      phone:
        formData.get(
          "phone"
        ),

      address:
        formData.get(
          "address"
        ),

      city:
        formData.get(
          "city"
        ),

      state:
        formData.get(
          "state"
        ),

      pincode:
        formData.get(
          "pincode"
        ),

      country:
        formData.get(
          "country"
        )

    };


    /*
     * FOR NOW:
     * We are only collecting the
     * delivery details.
     *
     * Next step:
     * Send this to backend and
     * create the actual order.
     */

    localStorage.setItem(
      "lr_handlooms_checkout_address",
      JSON.stringify(
        address
      )
    );


    localStorage.setItem(
      "lr_handlooms_checkout_cart",
      JSON.stringify(
        cart
      )
    );


    window.location.href =
      "./payment.html";

  }
);


// ============================================================
// MESSAGE
// ============================================================

function showMessage(message) {

  if (!messageElement) {
    return;
  }

  messageElement.textContent =
    message;

}


// ============================================================
// INIT
// ============================================================

renderOrderSummary();

loadUser();