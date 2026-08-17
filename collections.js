/* =========================================================
   LR HANDLOOMS — COLLECTIONS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE =
        window.HANDLOOM_API_BASE ||
        "https://backend-8zwr.onrender.com/api";

    const track = document.getElementById("collectionsTrack");
    const viewport = document.getElementById("collectionsViewport");

    const prevBtn = document.getElementById("collectionsPrev");
    const nextBtn = document.getElementById("collectionsNext");

    if (!track || !viewport) {
        console.warn("Collections elements not found.");
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let categories = [];

    let currentOffset = 0;

    let maxOffset = 0;

    let isDragging = false;

    let startX = 0;

    let startOffset = 0;

    let lastVersion = null;

    let isReloading = false;


    /* =====================================================
       HELPERS
    ===================================================== */

    const escapeHTML = (value) => {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    const getCategoryImage = (category) => {

        if (category.image && category.image.trim()) {
            return category.image;
        }

        return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=85&w=1000&auto=format&fit=crop";
    };


    const getCategoryDescription = (category) => {

        if (
            category.description &&
            category.description.trim()
        ) {
            return category.description;
        }

        return "Discover our handwoven heritage collection, crafted with timeless artistry.";
    };


    /* =====================================================
       LOAD CATEGORIES
    ===================================================== */

    async function loadCategories() {

        try {

            track.innerHTML = `
                <div class="collections-loading">
                    <div class="collections-loading-line"></div>
                    <span>LOADING COLLECTIONS...</span>
                </div>
            `;


            const response = await fetch(
                `${API_BASE}/categories?t=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );


            if (!response.ok) {
                throw new Error(
                    `Category request failed: ${response.status}`
                );
            }


            const data = await response.json();


            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load collections."
                );
            }


            categories = Array.isArray(data.categories)
                ? data.categories.filter(
                    category => category.isActive !== false
                )
                : [];


            if (!categories.length) {

                renderMessage(
                    "No Collections Yet",
                    "New heritage collections will appear here soon."
                );

                return;
            }


            renderCategories();

        } catch (error) {

            console.error(
                "Collections loading error:",
                error
            );


            renderMessage(
                "Collections Unavailable",
                "We couldn't load the collections right now. Please try again."
            );
        }
    }


    /* =====================================================
       RENDER CATEGORIES
    ===================================================== */

    function renderCategories() {

        track.innerHTML = categories
            .map((category, index) => {

                const categoryId =
                    category._id ||
                    category.id;

                const name =
                    escapeHTML(category.name || "Collection");

                const description =
                    escapeHTML(
                        getCategoryDescription(category)
                    );

                const image =
                    escapeHTML(
                        getCategoryImage(category)
                    );


                return `
                    <a
                        href="./category.html?id=${encodeURIComponent(categoryId)}"
                        class="collection-card"
                        data-category-id="${escapeHTML(categoryId)}"
                    >

                        <div class="collection-card-image-wrap">

                            <img
                                src="${image}"
                                alt="${name}"
                                class="collection-card-image"
                                loading="${index < 2 ? "eager" : "lazy"}"
                                draggable="false"
                            >

                        </div>


                        <div class="collection-card-content">

                            <span class="collection-number">
                                ${String(index + 1).padStart(2, "0")}
                                /
                                ${String(categories.length).padStart(2, "0")}
                            </span>


                            <h3 class="collection-card-title">
                                ${name}
                            </h3>


                            <p class="collection-card-description">
                                ${description}
                            </p>


                            <span class="collection-card-link">

                                EXPLORE COLLECTION

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </a>
                `;

            })
            .join("");


        setupCards();

        requestAnimationFrame(() => {

            calculateBounds();

            updateTrack();

            updateButtons();

            animateCards();

        });
    }


    /* =====================================================
       EMPTY / ERROR MESSAGE
    ===================================================== */

    function renderMessage(title, message) {

        track.innerHTML = `
            <div class="collections-message">

                <h3 class="collections-message-title">
                    ${escapeHTML(title)}
                </h3>

                <p class="collections-message-text">
                    ${escapeHTML(message)}
                </p>

            </div>
        `;

        currentOffset = 0;

        maxOffset = 0;

        updateTrack();

        updateButtons();
    }


    /* =====================================================
       CARD SETUP
    ===================================================== */

    function setupCards() {

        const cards =
            track.querySelectorAll(".collection-card");


        cards.forEach(card => {

            card.addEventListener(
                "click",
                event => {

                    /*
                     * If the user was dragging,
                     * don't open the category.
                     */

                    if (wasDragging) {

                        event.preventDefault();

                        wasDragging = false;

                    }

                }
            );

        });
    }


    /* =====================================================
       GSAP CARD ANIMATION
    ===================================================== */

    function animateCards() {

        const cards =
            track.querySelectorAll(".collection-card");


        if (
            typeof gsap === "undefined" ||
            !cards.length
        ) {
            return;
        }


        gsap.fromTo(
            cards,
            {
                opacity: 0,
                y: 45
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                stagger: 0.08,
                ease: "power3.out"
            }
        );
    }


    /* =====================================================
       CALCULATE SCROLL BOUNDS
    ===================================================== */

    function calculateBounds() {

        const viewportWidth =
            viewport.clientWidth;

        const trackWidth =
            track.scrollWidth;


        maxOffset =
            Math.max(
                0,
                trackWidth - viewportWidth
            );


        /*
         * Prevent current offset from
         * going outside the new bounds.
         */

        currentOffset =
            Math.max(
                0,
                Math.min(
                    currentOffset,
                    maxOffset
                )
            );
    }


    /* =====================================================
       UPDATE TRACK
    ===================================================== */

    function updateTrack(animate = false) {

        if (animate && typeof gsap !== "undefined") {

            gsap.to(
                track,
                {
                    x: -currentOffset,
                    duration: 0.65,
                    ease: "power3.out"
                }
            );

        } else {

            track.style.transform =
                `translate3d(${-currentOffset}px, 0, 0)`;

        }


        updateButtons();
    }


    /* =====================================================
       BUTTON STATES
    ===================================================== */

    function updateButtons() {

        if (!prevBtn || !nextBtn) {
            return;
        }


        prevBtn.disabled =
            currentOffset <= 2;


        nextBtn.disabled =
            currentOffset >= maxOffset - 2;
    }


    /* =====================================================
       ARROW SCROLL
    ===================================================== */

    function moveBy(direction) {

        calculateBounds();


        if (maxOffset <= 0) {
            return;
        }


        const amount =
            Math.max(
                viewport.clientWidth * 0.72,
                300
            );


        currentOffset +=
            direction * amount;


        currentOffset =
            Math.max(
                0,
                Math.min(
                    currentOffset,
                    maxOffset
                )
            );


        updateTrack(true);
    }


    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            () => moveBy(-1)
        );
    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => moveBy(1)
        );
    }


    /* =====================================================
       MOUSE DRAG
    ===================================================== */

    let wasDragging = false;


    viewport.addEventListener(
        "pointerdown",
        event => {

            /*
             * Only left mouse button.
             */

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }


            isDragging = true;

            wasDragging = false;

            startX = event.clientX;

            startOffset = currentOffset;


            viewport.classList.add(
                "is-dragging"
            );


            viewport.setPointerCapture(
                event.pointerId
            );
        }
    );


    viewport.addEventListener(
        "pointermove",
        event => {

            if (!isDragging) {
                return;
            }


            const distance =
                event.clientX - startX;


            if (Math.abs(distance) > 5) {
                wasDragging = true;
            }


            currentOffset =
                startOffset - distance;


            currentOffset =
                Math.max(
                    0,
                    Math.min(
                        currentOffset,
                        maxOffset
                    )
                );


            updateTrack(false);
        }
    );


    const stopDragging = () => {

        if (!isDragging) {
            return;
        }


        isDragging = false;


        viewport.classList.remove(
            "is-dragging"
        );
    };


    viewport.addEventListener(
        "pointerup",
        stopDragging
    );


    viewport.addEventListener(
        "pointercancel",
        stopDragging
    );


    viewport.addEventListener(
        "pointerleave",
        event => {

            if (
                event.pointerType === "mouse"
            ) {
                stopDragging();
            }
        }
    );


    /* =====================================================
       MOUSE WHEEL
       ===================================================== */

    viewport.addEventListener(
        "wheel",
        event => {

            /*
             * On desktop, horizontal wheel navigation.
             */

            if (
                Math.abs(event.deltaY) <=
                Math.abs(event.deltaX)
            ) {
                return;
            }


            if (maxOffset <= 0) {
                return;
            }


            const previousOffset =
                currentOffset;


            currentOffset +=
                event.deltaY;


            currentOffset =
                Math.max(
                    0,
                    Math.min(
                        currentOffset,
                        maxOffset
                    )
                );


            if (
                currentOffset !==
                previousOffset
            ) {
                event.preventDefault();

                updateTrack(false);
            }

        },
        {
            passive: false
        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(resizeTimer);


            resizeTimer =
                setTimeout(() => {

                    calculateBounds();

                    updateTrack(false);

                }, 150);
        }
    );


    /* =====================================================
       WEBSITE VERSION AUTO REFRESH
    ===================================================== */

    async function checkWebsiteVersion() {

        if (isReloading) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/website/version?t=${Date.now()}`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            if (
                !data.success ||
                data.version === undefined
            ) {
                return;
            }


            if (lastVersion === null) {

                lastVersion =
                    data.version;

                return;
            }


            if (
                String(data.version) !==
                String(lastVersion)
            ) {

                isReloading = true;

                console.log(
                    "🌐 Website data changed. Refreshing..."
                );


                window.location.reload();

            }

        } catch (error) {

            /*
             * Don't break the collection page
             * if the version endpoint temporarily
             * fails.
             */

            console.warn(
                "Website version check failed:",
                error.message
            );
        }
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadCategories();

    checkWebsiteVersion();


    /*
     * Check every 3 seconds,
     * same system as the main website.
     */

    setInterval(
        checkWebsiteVersion,
        3000
    );

});