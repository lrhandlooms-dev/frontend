/* =========================================================
   LR HANDLOOMS — ACCOUNT DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE =
        window.HANDLOOM_API_BASE ||
        "https://backend-8zwr.onrender.com/api";

    const TOKEN_KEY =
        "lr_handlooms_user_token";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const userName =
        document.getElementById("user-name");

    const userEmail =
        document.getElementById("user-email");

    const welcomeText =
        document.getElementById("dashboard-welcome");

    const profileName =
        document.getElementById("profile-name");

    const profileEmail =
        document.getElementById("profile-email");

    const profilePhone =
        document.getElementById("profile-phone");

    const profileCreated =
        document.getElementById("profile-created");

    const logoutBtn =
        document.getElementById("logout-btn");

    const settingsLogout =
        document.getElementById("settings-logout");

    const navItems =
        document.querySelectorAll(
            ".dashboard-nav-item"
        );

    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    /* =====================================================
       TOKEN
    ===================================================== */

    const getToken = () => {

        return localStorage.getItem(
            TOKEN_KEY
        );

    };


    const clearToken = () => {

        localStorage.removeItem(
            TOKEN_KEY
        );

    };


    /* =====================================================
       REDIRECT TO LOGIN
    ===================================================== */

    const redirectToLogin = () => {

        window.location.href =
            "./account.html";

    };


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    };


    /* =====================================================
       LOAD USER
    ===================================================== */

    const loadCurrentUser = async () => {

        const token =
            getToken();


        /*
         * No token means the customer
         * isn't logged in.
         */

        if (!token) {

            redirectToLogin();

            return;
        }


        try {

            showDashboardLoading();


            const response =
                await fetch(
                    `${API_BASE}/auth/me?t=${Date.now()}`,
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
                response.status === 401 ||
                response.status === 403
            ) {

                clearToken();

                redirectToLogin();

                return;
            }


            if (!response.ok || !data.success) {

                console.error(
                    "MY ORDERS API ERROR:",
                    response.status,
                    data
                );

                throw new Error(
                    data.message ||
                    `Orders request failed (${response.status})`
                );
            }


            await renderUser(
                data.user
            );


        } catch (error) {

            console.error(
                "Dashboard user error:",
                error
            );


            /*
             * Don't immediately delete a valid token
             * for a temporary network/server problem.
             */

            showDashboardError(
                "Unable to load your account right now. Please refresh the page."
            );

        }

    };


    /* =====================================================
       RENDER USER
    ===================================================== */

    const renderUser = async (user) => {

        const name =
            user.name ||
            "LR Handlooms Client";

        const email =
            user.email ||
            "—";

        const phone =
            user.phone ||
            "Not added";


        if (userName) {

            userName.textContent =
                name;

        }


        if (userEmail) {

            userEmail.textContent =
                email;

        }


        if (welcomeText) {

            welcomeText.textContent =
                `Welcome back, ${name}.`;

        }


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileEmail) {

            profileEmail.textContent =
                email;

        }


        if (profilePhone) {

            profilePhone.textContent =
                phone;

        }


        if (profileCreated) {

            profileCreated.textContent =
                formatDate(
                    user.createdAt
                );

        }


        renderAddresses(
            user.addresses || []
        );

        await loadMyOrders();

        hideDashboardLoading();

    };


    /* =====================================================
   AUTO REFRESH ORDERS
===================================================== */

let ordersRefreshInterval = null;

const startOrdersAutoRefresh = () => {

    if (ordersRefreshInterval) {
        clearInterval(ordersRefreshInterval);
    }

    ordersRefreshInterval = setInterval(() => {

       const ordersSection =
    document.getElementById(
        "orders-section"
    );

        if (
            ordersSection &&
            ordersSection.classList.contains("active")
        ) {
            loadMyOrders(true);
        }

    }, 15000);

};


/* Start automatic order refresh */
startOrdersAutoRefresh();


    /* =====================================================
       ADDRESSES
    ===================================================== */

    const renderAddresses = (
        addresses
    ) => {

        const container =
            document.getElementById(
                "addresses-container"
            );


        if (!container) {
            return;
        }


        if (
            !Array.isArray(addresses) ||
            addresses.length === 0
        ) {

            container.innerHTML = `
                <div class="dashboard-empty-state">

                    <span class="empty-number">
                        03
                    </span>

                    <h3>
                        No saved addresses.
                    </h3>

                    <p>
                        Your delivery addresses will appear
                        here once you add them during checkout.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML =
            addresses
                .map(
                    (address) => {

                        return `
                            <div class="address-card">

                                <div class="address-card-header">

                                    <strong>
                                        ${escapeHTML(
                            address.fullName ||
                            "Delivery Address"
                        )}
                                    </strong>

                                    ${address.isDefault
                                ? `
                                                <span class="default-address">
                                                    DEFAULT
                                                </span>
                                            `
                                : ""
                            }

                                </div>


                                <p>
                                    ${escapeHTML(
                                address.addressLine1 ||
                                ""
                            )}
                                </p>


                                ${address.addressLine2
                                ? `
                                            <p>
                                                ${escapeHTML(
                                    address.addressLine2
                                )}
                                            </p>
                                        `
                                : ""
                            }


                                <p>
                                    ${escapeHTML(
                                address.city || ""
                            )},
                                    ${escapeHTML(
                                address.state || ""
                            )}
                                    -
                                    ${escapeHTML(
                                address.postalCode || ""
                            )}
                                </p>


                                <p>
                                    ${escapeHTML(
                                address.country ||
                                "India"
                            )}
                                </p>


                                <p>
                                    ${escapeHTML(
                                address.phone ||
                                ""
                            )}
                                </p>

                            </div>
                        `;

                    }
                )
                .join("");

    };


    /* =====================================================
   LOAD MY ORDERS
===================================================== */

    const loadMyOrders = async (silent = false) => {

        const container =
            document.getElementById(
                "orders-container"
            );

        if (!container) {
            return;
        }

        const token =
            getToken();

        if (!token) {
            return;
        }

       if (!silent) {
    container.innerHTML = `
        <div class="dashboard-loading">

            <div class="dashboard-loading-line"></div>

            LOADING YOUR ORDERS...

        </div>
    `;
}


        try {

            const response =
                await fetch(
                    `${API_BASE}/orders/my-orders?t=${Date.now()}`,
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
                response.status === 401 ||
                response.status === 403
            ) {

                clearToken();

                redirectToLogin();

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load your orders."
                );

            }


            const orders =
                Array.isArray(data.orders)
                    ? data.orders
                    : [];


            renderMyOrders(
                orders
            );


        } catch (error) {

            console.error(
                "My orders error:",
                error
            );


            container.innerHTML = `
                <div class="dashboard-empty-state">

                    <span class="empty-number">
                        !
                    </span>

                    <h3>
                        Unable to load orders.
                    </h3>

                    <p>
                        ${escapeHTML(
                error.message ||
                "Please try again."
            )}
                    </p>

                    <button
                        type="button"
                        class="dashboard-action-link"
                        id="retry-orders"
                        style="
                            border:0;
                            border-bottom:1px solid currentColor;
                            background:transparent;
                            cursor:pointer;
                        "
                    >
                        TRY AGAIN
                        <span>→</span>
                    </button>

                </div>
            `;


            const retry =
                document.getElementById(
                    "retry-orders"
                );


            if (retry) {

                retry.addEventListener(
                    "click",
                    loadMyOrders
                );

            }

        }

    };



    /* =====================================================
   RENDER MY ORDERS
===================================================== */

    const renderMyOrders = (orders) => {

        const container =
            document.getElementById(
                "orders-container"
            );


        if (!container) {
            return;
        }


        if (!orders.length) {

            container.innerHTML = `
                <div class="dashboard-empty-state">

                    <span class="empty-number">
                        01
                    </span>

                    <h3>
                        No orders yet.
                    </h3>

                    <p>
                        Your orders will appear here
                        once you place your first order.
                    </p>

                    <a
                        href="./index.html"
                        class="dashboard-action-link"
                    >
                        EXPLORE COLLECTION
                        <span>→</span>
                    </a>

                </div>
            `;

            return;
        }


        container.innerHTML =
            orders
                .map(
                    (order) => {

                        const orderDate =
                            formatDate(
                                order.createdAt
                            );


                        const paymentStatus =
                            order.paymentStatus ||
                            "awaiting";


                        const orderStatus =
                            order.orderStatus ||
                            "pending";


                        const items =
                            Array.isArray(
                                order.items
                            )
                                ? order.items
                                : [];


                        const itemsHTML =
                            items
                                .map(
                                    (item) => {

                                        return `
                                            <div class="customer-order-item">

                                                <div class="customer-order-image">

                                                    ${item.image
                                                ? `
                                                                <img
                                                                    src="${escapeHTML(
                                                    item.image
                                                )}"
                                                                    alt="${escapeHTML(
                                                    item.name ||
                                                    "Handloom Product"
                                                )}"
                                                                    loading="lazy"
                                                                >
                                                            `
                                                : `
                                                                <span>
                                                                    LR
                                                                </span>
                                                            `
                                            }

                                                </div>


                                                <div class="customer-order-item-info">

                                                    <strong>
                                                        ${escapeHTML(
                                                item.name ||
                                                "Handloom Product"
                                            )}
                                                    </strong>

                                                    <span>
                                                        Qty ${Number(
                                                item.quantity
                                            ) || 1
                                            }
                                                    </span>

                                                </div>


                                                <strong>
                                                    ₹${Number(
                                                item.total ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                                </strong>

                                            </div>
                                        `;

                                    }
                                )
                                .join("");


                        return `
                            <article class="customer-order-card">

                                <div class="customer-order-header">

                                    <div>

                                        <span class="customer-order-label">
                                            ORDER
                                        </span>

                                        <h3>
                                            ${escapeHTML(
                            order.orderNumber ||
                            "—"
                        )}
                                        </h3>

                                        <p>
                                            ${escapeHTML(
                            orderDate
                        )}
                                        </p>

                                    </div>


                                    <div class="customer-order-statuses">

                                        <span class="customer-payment-status">
                                            ${paymentStatus === "paid"
                                ? "Payment Confirmed"
                                : paymentStatus === "rejected"
                                    ? "Payment Rejected"
                                    : "Awaiting Confirmation"
                            }
                                        </span>


                                        <span class="customer-order-status">
                                            ${orderStatus
                                .charAt(0)
                                .toUpperCase() +
                            orderStatus.slice(1)
                            }
                                        </span>

                                    </div>

                                </div>


                                <div class="customer-order-items">

                                    ${itemsHTML}

                                </div>


                                <div class="customer-order-footer">

                                    <div>

                                        <span>
                                            TOTAL
                                        </span>

                                        <strong>
                                            ₹${Number(
                                order.total ||
                                0
                            ).toLocaleString(
                                "en-IN"
                            )}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            PAYMENT
                                        </span>

                                        <strong>
                                            ${paymentStatus === "paid"
                                ? "Confirmed"
                                : paymentStatus === "rejected"
                                    ? "Rejected"
                                    : "Awaiting Confirmation"
                            }
                                        </strong>

                                    </div>

                                </div>

                            </article>
                        `;

                    }
                )
                .join("");

    };


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    const escapeHTML = (
        value
    ) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
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

    };


    /* =====================================================
       DASHBOARD NAVIGATION
    ===================================================== */

    navItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    const target =
                        item.dataset.section;


                    if (!target) {
                        return;
                    }


                    /*
                     * Remove active state
                     * from navigation.
                     */

                    navItems.forEach(
                        (nav) => {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Hide all sections.
                     */

                    sections.forEach(
                        (section) => {

                            section.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Activate selected item.
                     */

                    item.classList.add(
                        "active"
                    );


                    const targetSection =
                        document.getElementById(
                            `${target}-section`
                        );


                    if (targetSection) {

                        targetSection.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logout = () => {

        clearToken();


        /*
         * Optional cart cleanup can be added later.
         * For now only the authentication session
         * is removed.
         */

        window.location.href =
            "./account.html";

    };


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    if (settingsLogout) {

        settingsLogout.addEventListener(
            "click",
            logout
        );

    }


    /* =====================================================
       LOADING
    ===================================================== */

    const showDashboardLoading = () => {

        const containers =
            document.querySelectorAll(
                ".orders-container, .addresses-container"
            );


        containers.forEach(
            (container) => {

                if (
                    container.id ===
                    "addresses-container"
                ) {
                    return;
                }


                container.innerHTML = `
                    <div class="dashboard-loading">

                        <div class="dashboard-loading-line"></div>

                        LOADING YOUR ACCOUNT...

                    </div>
                `;

            }
        );

    };


    const hideDashboardLoading = () => {

        /*
         * Orders will later be populated by
         * the Order API.
         *
         * For now the empty order state remains.
         */

    };


    const showDashboardError = (
        message
    ) => {

        const orders =
            document.getElementById(
                "orders-container"
            );


        if (!orders) {
            return;
        }


        orders.innerHTML = `
            <div class="dashboard-empty-state">

                <span class="empty-number">
                    !
                </span>

                <h3>
                    Something went wrong.
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

                <button
                    type="button"
                    class="dashboard-action-link"
                    id="retry-account"
                    style="
                        border:0;
                        border-bottom:1px solid currentColor;
                        background:transparent;
                        cursor:pointer;
                    "
                >
                    TRY AGAIN
                    <span>→</span>
                </button>

            </div>
        `;


        const retry =
            document.getElementById(
                "retry-account"
            );


        if (retry) {

            retry.addEventListener(
                "click",
                () => {

                    window.location.reload();

                }
            );

        }

    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadCurrentUser();

});