// ============================================================
// LR HANDLOOMS — PAYMENT
// ============================================================

const CART_STORAGE_KEY =
    "lr_handlooms_checkout_cart";

const ADDRESS_STORAGE_KEY =
    "lr_handlooms_checkout_address";

const TOKEN_KEY =
    "lr_handlooms_user_token";

const API_BASE =
    window.HANDLOOM_API_BASE ||
    "https://backend-8zwr.onrender.com/api";


// ============================================================
// TEST UPI
// ============================================================

const UPI_ID =
    "6370392365@yespop";

const UPI_NAME =
    "LR HANDLOOMS";


// ============================================================
// ELEMENTS
// ============================================================

const totalElement =
    document.getElementById(
        "payment-total"
    );

const qrImage =
    document.getElementById(
        "upi-qr"
    );

const upiElement =
    document.getElementById(
        "upi-id"
    );

const copyButton =
    document.getElementById(
        "copy-upi"
    );

const paymentForm =
    document.getElementById(
        "payment-form"
    );

const utrInput =
    document.getElementById(
        "utr"
    );

const messageElement =
    document.getElementById(
        "payment-message"
    );

const placeOrderButton =
    document.getElementById(
        "place-order-btn"
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

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Payment cart error:",
            error
        );

        return [];

    }

}


const cart =
    getCart();


// ============================================================
// LOAD ADDRESS
// ============================================================

function getAddress() {

    try {

        const saved =
            localStorage.getItem(
                ADDRESS_STORAGE_KEY
            );

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Checkout address error:",
            error
        );

        return null;

    }

}


const address =
    getAddress();


// ============================================================
// TOKEN
// ============================================================

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


// ============================================================
// CALCULATE TOTAL
// ============================================================

function calculateTotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.price
                ) || 0;

            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity
                    ) || 1
                );

            return (
                total +
                price * quantity
            );

        },
        0
    );

}


const total =
    calculateTotal();


// ============================================================
// BASIC CHECKS
// ============================================================

if (!cart.length) {

    window.location.href =
        "./index.html";

}


if (!address) {

    window.location.href =
        "./checkout.html";

}


if (!getToken()) {

    window.location.href =
        "./index.html";

}


// ============================================================
// SHOW TOTAL
// ============================================================

if (totalElement) {

    totalElement.textContent =
        "₹" +
        total.toLocaleString(
            "en-IN"
        );

}


if (upiElement) {

    upiElement.textContent =
        UPI_ID;

}


// ============================================================
// CREATE UPI LINK
// ============================================================

function createUPILink() {

    const params =
        new URLSearchParams({

            pa:
                UPI_ID,

            pn:
                UPI_NAME,

            am:
                total.toFixed(2),

            cu:
                "INR",

            tn:
                "LR Handlooms Order"

        });


    return (
        "upi://pay?" +
        params.toString()
    );

}


// ============================================================
// GENERATE QR
// ============================================================

function generateQR() {

    if (!qrImage) {
        return;
    }


    const upiLink =
        createUPILink();


    const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=600x600&data=" +
        encodeURIComponent(
            upiLink
        );


    qrImage.src =
        qrUrl;

}


generateQR();


// ============================================================
// COPY UPI
// ============================================================

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    UPI_ID
                );


                copyButton.textContent =
                    "COPIED";


                setTimeout(
                    () => {

                        copyButton.textContent =
                            "COPY";

                    },
                    1500
                );


            } catch (error) {

                showMessage(
                    "Unable to copy UPI ID. Please copy it manually.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// PLACE ORDER
// ============================================================

paymentForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        // ----------------------------------------------------
        // TOKEN
        // ----------------------------------------------------

        const token =
            getToken();


        if (!token) {

            showMessage(
                "Your login session has expired. Please login again.",
                "error"
            );

            return;

        }


        // ----------------------------------------------------
        // CART
        // ----------------------------------------------------

        if (!cart.length) {

            showMessage(
                "Your shopping bag is empty.",
                "error"
            );

            return;

        }


        // ----------------------------------------------------
        // ADDRESS
        // ----------------------------------------------------

        if (!address) {

            showMessage(
                "Shipping address is missing. Please go back to checkout.",
                "error"
            );

            return;

        }


        // ----------------------------------------------------
        // UTR
        // ----------------------------------------------------

        const transactionId =
            utrInput.value.trim();


        if (!transactionId) {

            showMessage(
                "Please enter your UTR / transaction ID.",
                "error"
            );

            utrInput.focus();

            return;

        }


        // ----------------------------------------------------
        // BUTTON
        // ----------------------------------------------------

        placeOrderButton.disabled =
            true;


        const buttonText =
            placeOrderButton.querySelector(
                "span"
            );


        if (buttonText) {

            buttonText.textContent =
                "PLACING ORDER...";

        }


        clearMessage();


        try {

            // ------------------------------------------------
            // CREATE ORDER
            // ------------------------------------------------

            const response =
                await fetch(
                    `${API_BASE}/orders`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                items:
                                    cart,

                                shippingAddress:
                                    address,

                                transactionId:
                                    transactionId

                            })

                    }
                );


            const data =
                await response.json();


            // ------------------------------------------------
            // AUTH ERROR
            // ------------------------------------------------

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    TOKEN_KEY
                );


                showMessage(
                    "Your login session has expired. Please login again.",
                    "error"
                );


                placeOrderButton.disabled =
                    false;


                if (buttonText) {

                    buttonText.textContent =
                        "PLACE ORDER";

                }


                return;

            }


            // ------------------------------------------------
            // OTHER ERROR
            // ------------------------------------------------

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to place order"
                );

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            console.log(
                "Order created:",
                data.order
            );


            showMessage(
                `Order received successfully 🎉 Order ${data.order.orderNumber}. Payment is awaiting confirmation.`,
                "success"
            );


            if (buttonText) {

                buttonText.textContent =
                    "ORDER RECEIVED";

            }


            // ------------------------------------------------
            // CLEAR CART
            // ------------------------------------------------

            localStorage.removeItem(
                "lr_handlooms_cart"
            );

            localStorage.removeItem(
                "lr_handlooms_checkout_cart"
            );

            localStorage.removeItem(
                "lr_handlooms_checkout_address"
            );


            // ------------------------------------------------
            // SAVE ORDER RESULT
            // ------------------------------------------------

            localStorage.setItem(
                "lr_handlooms_last_order",
                JSON.stringify(
                    data.order
                )
            );


            // ------------------------------------------------
            // REDIRECT AFTER SUCCESS
            // ------------------------------------------------

            setTimeout(
                () => {

                    window.location.href =
                        `./order-success.html?order=${encodeURIComponent(
                            data.order.orderNumber
                        )}`;

                },
                1200
            );


        } catch (error) {

            console.error(
                "Place order error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to place order. Please try again.",
                "error"
            );


            placeOrderButton.disabled =
                false;


            if (buttonText) {

                buttonText.textContent =
                    "PLACE ORDER";

            }

        }

    }
);


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;


    messageElement.className =
        "payment-message " +
        type;

}


function clearMessage() {

    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        "";


    messageElement.className =
        "payment-message";

}