/* =========================================================
   LR HANDLOOMS — ACCOUNT AUTH
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE =
        window.HANDLOOM_API_BASE ||
        "https://backend-8zwr.onrender.com/api";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loginPanel =
        document.getElementById("login-panel");

    const registerPanel =
        document.getElementById("register-panel");

    const loginForm =
        document.getElementById("login-form");

    const registerForm =
        document.getElementById("register-form");

    const showRegister =
        document.getElementById("show-register");

    const showLogin =
        document.getElementById("show-login");

    const loginMessage =
        document.getElementById("login-message");

    const registerMessage =
        document.getElementById("register-message");

    const loginSubmit =
        document.getElementById("login-submit");

    const registerSubmit =
        document.getElementById("register-submit");


    /* =====================================================
       TOKEN STORAGE
    ===================================================== */

    const TOKEN_KEY =
        "lr_handlooms_user_token";


    const getToken = () => {
        return localStorage.getItem(TOKEN_KEY);
    };


    const saveToken = (token) => {

        if (!token) {
            return;
        }

        localStorage.setItem(
            TOKEN_KEY,
            token
        );
    };


    const removeToken = () => {

        localStorage.removeItem(
            TOKEN_KEY
        );
    };


    /* =====================================================
       MESSAGE HELPERS
    ===================================================== */

    const showMessage = (
        element,
        message,
        type = "error"
    ) => {

        if (!element) {
            return;
        }

        element.textContent =
            message || "";

        element.className =
            `auth-message ${type}`;
    };


    const clearMessage = (element) => {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.className =
            "auth-message";
    };


    /* =====================================================
       BUTTON LOADING
    ===================================================== */

    const setButtonLoading = (
        button,
        loading,
        normalText
    ) => {

        if (!button) {
            return;
        }

        button.disabled =
            loading;

        button.classList.toggle(
            "loading",
            loading
        );

        if (loading) {

            button.innerHTML =
                "PLEASE WAIT...";

        } else {

            button.innerHTML =
                `${normalText} <span>→</span>`;
        }
    };


    /* =====================================================
       SWITCH LOGIN / REGISTER
    ===================================================== */

    const openLogin = () => {

        if (!loginPanel || !registerPanel) {
            return;
        }

        registerPanel.classList.remove(
            "active"
        );

        loginPanel.classList.add(
            "active"
        );

        clearMessage(
            registerMessage
        );

        clearMessage(
            loginMessage
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    const openRegister = () => {

        if (!loginPanel || !registerPanel) {
            return;
        }

        loginPanel.classList.remove(
            "active"
        );

        registerPanel.classList.add(
            "active"
        );

        clearMessage(
            loginMessage
        );

        clearMessage(
            registerMessage
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    if (showRegister) {

        showRegister.addEventListener(
            "click",
            openRegister
        );
    }


    if (showLogin) {

        showLogin.addEventListener(
            "click",
            openLogin
        );
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                clearMessage(
                    registerMessage
                );


                const name =
                    document
                        .getElementById(
                            "register-name"
                        )
                        ?.value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "register-email"
                        )
                        ?.value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "register-phone"
                        )
                        ?.value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "register-password"
                        )
                        ?.value;


                if (!name || !email || !password) {

                    showMessage(
                        registerMessage,
                        "Please fill in all required fields.",
                        "error"
                    );

                    return;
                }


                if (password.length < 6) {

                    showMessage(
                        registerMessage,
                        "Password must be at least 6 characters.",
                        "error"
                    );

                    return;
                }


                setButtonLoading(
                    registerSubmit,
                    true,
                    "CREATE ACCOUNT"
                );


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/auth/register`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name,
                                    email,
                                    phone,
                                    password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok || !data.success) {

                        throw new Error(
                            data.message ||
                            "Unable to create account."
                        );
                    }


                    if (!data.token) {

                        throw new Error(
                            "Account created, but login token was not received."
                        );
                    }


                    saveToken(
                        data.token
                    );


                    showMessage(
                        registerMessage,
                        "Account created successfully. Welcome to LR Handlooms.",
                        "success"
                    );


                    /*
                     * Give the user a short confirmation
                     * before opening the account dashboard.
                     */

                    setTimeout(() => {

                        window.location.href =
                            "./account-dashboard.html";

                    }, 900);


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showMessage(
                        registerMessage,
                        error.message ||
                        "Something went wrong. Please try again.",
                        "error"
                    );

                } finally {

                    setButtonLoading(
                        registerSubmit,
                        false,
                        "CREATE ACCOUNT"
                    );
                }

            }
        );
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                clearMessage(
                    loginMessage
                );


                const email =
                    document
                        .getElementById(
                            "login-email"
                        )
                        ?.value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "login-password"
                        )
                        ?.value;


                if (!email || !password) {

                    showMessage(
                        loginMessage,
                        "Please enter your email and password.",
                        "error"
                    );

                    return;
                }


                setButtonLoading(
                    loginSubmit,
                    true,
                    "SIGN IN"
                );


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/auth/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email,
                                    password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok || !data.success) {

                        throw new Error(
                            data.message ||
                            "Invalid email or password."
                        );
                    }


                    if (!data.token) {

                        throw new Error(
                            "Login succeeded, but no authentication token was received."
                        );
                    }


                    saveToken(
                        data.token
                    );


                    showMessage(
                        loginMessage,
                        `Welcome back, ${data.user?.name || "to LR Handlooms"}.`,
                        "success"
                    );


                    setTimeout(() => {

                        window.location.href =
                            "./account-dashboard.html";

                    }, 700);


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        loginMessage,
                        error.message ||
                        "Unable to sign in. Please try again.",
                        "error"
                    );

                } finally {

                    setButtonLoading(
                        loginSubmit,
                        false,
                        "SIGN IN"
                    );
                }

            }
        );
    }


    /* =====================================================
       CHECK EXISTING LOGIN
    ===================================================== */

    const checkExistingLogin = async () => {

        const token =
            getToken();


        if (!token) {
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
                response.ok &&
                data.success
            ) {

                /*
                 * User is already logged in.
                 * Don't force redirect automatically
                 * so they can still access login/register.
                 */

                console.log(
                    "👤 User already authenticated:",
                    data.user?.email
                );

            } else {

                removeToken();
            }

        } catch (error) {

            console.warn(
                "Existing session check failed:",
                error.message
            );
        }
    };


    /* =====================================================
       INIT
    ===================================================== */

    checkExistingLogin();

});