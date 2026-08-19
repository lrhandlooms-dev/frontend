// ============================================================
// LR HANDLOOMS — PRODUCT DETAIL
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE =
        window.HANDLOOM_API_BASE ||
        "https://backend-8zwr.onrender.com/api";


    // ========================================================
    // ELEMENTS
    // ========================================================

    const loading =
        document.getElementById("product-loading");

    const errorBox =
        document.getElementById("product-error");

    const productDetail =
        document.getElementById("product-detail");

    const makingSection =
        document.getElementById("making-section");


    const mainImage =
        document.getElementById("product-main-image");

    const thumbnails =
        document.getElementById("product-thumbnails");

    const productName =
        document.getElementById("product-name");

    const productCategory =
        document.getElementById("product-category");

    const originalPrice =
        document.getElementById("product-original-price");

    const finalPrice =
        document.getElementById("product-final-price");

    const discount =
        document.getElementById("product-discount");

    const description =
        document.getElementById("product-description");

    const stockText =
        document.getElementById("stock-text");

    const stockContainer =
        document.getElementById("product-stock");

    const quantityValue =
        document.getElementById("quantity-value");

    const addButton =
        document.getElementById("add-to-bag-main");


    // ========================================================
    // PRODUCT ID
    // ========================================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const productId =
        params.get("id");


    if (!productId) {

        showError(
            "No product was selected."
        );

        return;
    }


    // ========================================================
    // STATE
    // ========================================================

    let currentProduct = null;
    let currentPricing = null;

    let quantity = 1;


    // ========================================================
    // HELPERS
    // ========================================================

    function formatPrice(value) {

        return (
            "₹" +
            Number(value || 0)
                .toLocaleString("en-IN")
        );
    }


    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }


    function getImageUrl(image) {

    if (!image) {
        return "";
    }

    // If image is already a URL string
    if (typeof image === "string") {

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {
            return image;
        }

        // Relative backend path
        if (image.startsWith("/")) {
            return `${API_BASE.replace(/\/api\/?$/, "")}${image}`;
        }

        return image;
    }

    // Object-based image
    const url =
        image.secure_url ||
        image.url ||
        image.path ||
        image.src ||
        image.imageUrl ||
        "";

    if (!url) {
        return "";
    }

    // Already absolute
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:")
    ) {
        return url;
    }

    // Relative backend path
    if (url.startsWith("/")) {
        return `${API_BASE.replace(/\/api\/?$/, "")}${url}`;
    }

    return url;
}


    // ========================================================
    // ERROR
    // ========================================================

    function showError(message) {

        if (loading) {
            loading.hidden = true;
        }

        if (productDetail) {
            productDetail.hidden = true;
        }

        if (makingSection) {
            makingSection.hidden = true;
        }

        if (errorBox) {

            errorBox.hidden = false;

            const text =
                errorBox.querySelector("p");

            if (text) {
                text.textContent =
                    message ||
                    "THIS MASTERPIECE COULD NOT BE FOUND.";
            }
        }
    }


    // ========================================================
    // LOAD PRODUCT
    // ========================================================

    async function loadProduct() {

        try {

            const response =
                await fetch(
                    `${API_BASE}/products/${encodeURIComponent(productId)}`,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load product"
                );
            }


            if (
                !data.success ||
                !data.product
            ) {

                throw new Error(
                    "Product not found"
                );
            }


            currentProduct =
                data.product;

            currentPricing =
                data.pricing || {
                    originalPrice:
                        currentProduct.price,

                    finalPrice:
                        currentProduct.price,

                    offerActive: false
                };


            renderProduct();


        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );

            showError(
                error.message ||
                "Unable to load this product."
            );

        }

    }


    // ========================================================
    // RENDER PRODUCT
    // ========================================================

    function renderProduct() {

        if (!currentProduct) {
            return;
        }


        // ----------------------------------------------------
        // Basic information
        // ----------------------------------------------------

        document.title =
            `${currentProduct.name || "Product"} | LR HANDLOOMS`;


        productName.textContent =
            currentProduct.name ||
            "Handloom Masterpiece";


        description.textContent =
            currentProduct.description ||
            "A handcrafted masterpiece created by skilled artisans of Maniabandha.";


        // ----------------------------------------------------
        // Category
        // ----------------------------------------------------

        if (
            currentProduct.category &&
            typeof currentProduct.category === "object"
        ) {

            productCategory.textContent =
                (
                    currentProduct.category.name ||
                    "HERITAGE WEAVE"
                ).toUpperCase();

        } else {

            productCategory.textContent =
                "HERITAGE WEAVE";

        }


        // ----------------------------------------------------
        // Pricing
        // ----------------------------------------------------

        const original =
            Number(
                currentPricing.originalPrice ??
                currentProduct.price ??
                0
            );

        const final =
            Number(
                currentPricing.finalPrice ??
                currentProduct.price ??
                0
            );


        finalPrice.textContent =
            formatPrice(final);


        if (
            currentPricing.offerActive &&
            original > final
        ) {

            originalPrice.textContent =
                formatPrice(original);

            originalPrice.hidden = false;


            const percentage =
                Number(
                    currentPricing.discountPercentage ||
                    0
                );


            discount.textContent =
                `${Math.round(percentage)}% OFF`;

            discount.hidden = false;

        } else {

            originalPrice.hidden = true;

            discount.hidden = true;
        }


        // ----------------------------------------------------
        // Stock
        // ----------------------------------------------------

        const stock =
            Number(
                currentProduct.stock || 0
            );


        if (stock <= 0) {

            stockContainer.classList.add(
                "out-of-stock"
            );

            stockText.textContent =
                "SOLD OUT";

            addButton.disabled = true;

            addButton.textContent =
                "SOLD OUT";

        } else {

            stockContainer.classList.remove(
                "out-of-stock"
            );

            stockText.textContent =
                stock <= 3
                    ? `ONLY ${stock} LEFT`
                    : "IN STOCK";

            addButton.disabled = false;

            addButton.textContent =
                "ADD TO BAG";
        }


        // ----------------------------------------------------
        // Specifications
        // ----------------------------------------------------

        setSpecification(
            "fabric-row",
            "product-fabric",
            currentProduct.fabric
        );


        const colors =
            Array.isArray(
                currentProduct.colors
            )
                ? currentProduct.colors.join(", ")
                : currentProduct.colors;


        setSpecification(
            "color-row",
            "product-colors",
            colors
        );


        setSpecification(
            "length-row",
            "product-length",
            currentProduct.length
        );


        const origin =
            currentProduct.catalog?.origin;


        setSpecification(
            "origin-row",
            "product-origin",
            origin
        );


        // ----------------------------------------------------
        // Gallery
        // ----------------------------------------------------

        renderGallery();


        // ----------------------------------------------------
        // Craft & Story / Catalog
        // ----------------------------------------------------

        renderCatalog();


        // ----------------------------------------------------
        // Making steps
        // ----------------------------------------------------

        renderMakingSteps();


        // ----------------------------------------------------
        // Show page
        // ----------------------------------------------------

        loading.hidden = true;

        errorBox.hidden = true;

        productDetail.hidden = false;

    }


    // ========================================================
    // SPECIFICATION
    // ========================================================

    function setSpecification(
        rowId,
        valueId,
        value
    ) {

        const row =
            document.getElementById(rowId);

        const element =
            document.getElementById(valueId);


        if (!row || !element) {
            return;
        }


        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            row.hidden = true;

            return;
        }


        element.textContent =
            String(value);

        row.hidden = false;
    }


    // ========================================================
    // GALLERY
    // ========================================================

    function renderGallery() {

        thumbnails.innerHTML = "";


        const images =
            Array.isArray(
                currentProduct.images
            )
                ? currentProduct.images
                : [];


        if (!images.length) {

            mainImage.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'%3E%3Crect width='100%25' height='100%25' fill='%23151515'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-family='Arial' font-size='24'%3ELR HANDLOOMS%3C/text%3E%3C/svg%3E";

            mainImage.alt =
                currentProduct.name ||
                "LR Handlooms";

            return;
        }


        let mainIndex =
            images.findIndex(
                image =>
                    image?.isMain === true
            );


        if (mainIndex < 0) {
            mainIndex = 0;
        }


        images.forEach(
            (image, index) => {

                const url =
                    getImageUrl(image);


                if (!url) {
                    return;
                }


                const thumbnail =
                    document.createElement("button");

                thumbnail.type =
                    "button";

                thumbnail.className =
                    "product-thumbnail";


                if (index === mainIndex) {

                    thumbnail.classList.add(
                        "active"
                    );
                }


                thumbnail.innerHTML = `
                    <img
                        src="${escapeHTML(url)}"
                        alt="${escapeHTML(
                    currentProduct.name ||
                    "Product image"
                )}"
                        loading="lazy"
                    >
                `;


                thumbnail.addEventListener(
                    "click",
                    () => {

                        setMainImage(
                            url,
                            index
                        );

                    }
                );


                thumbnails.appendChild(
                    thumbnail
                );

            }
        );


        setMainImage(
            getImageUrl(
                images[mainIndex]
            ),
            mainIndex
        );


        if (currentProduct.featured) {

            const badge =
                document.getElementById(
                    "product-image-badge"
                );

            if (badge) {
                badge.hidden = false;
            }
        }

    }


    // ========================================================
    // MAIN IMAGE
    // ========================================================

    function setMainImage(
        url,
        index
    ) {

        if (!url) {
            return;
        }


        mainImage.src =
            url;

        mainImage.alt =
            currentProduct.name ||
            "LR Handlooms product";


        document
            .querySelectorAll(
                ".product-thumbnail"
            )
            .forEach(
                (item, itemIndex) => {

                    item.classList.toggle(
                        "active",
                        itemIndex === index
                    );

                }
            );

    }



    // ========================================================
// CRAFT & STORY / PRODUCT CATALOG
// ========================================================

function renderCatalog() {

    const section =
        document.getElementById("craft-story-section");

    if (!section || !currentProduct) {
        return;
    }


    const catalog =
        currentProduct.catalog || {};


    const fields = [

        {
            card: "materials-card",
            element: "catalog-materials",
            value: catalog.materialsUsed
        },

        {
            card: "weaving-card",
            element: "catalog-weaving",
            value: catalog.weavingTechnique
        },

        {
            card: "making-process-card",
            element: "catalog-making",
            value: catalog.makingProcess
        },

        {
            card: "time-card",
            element: "catalog-time",
            value: catalog.timeRequired
        },

        {
            card: "catalog-origin-card",
            element: "catalog-origin",
            value: catalog.origin
        },

        {
            card: "artisan-card",
            element: "catalog-artisan",
            value: catalog.artisanInformation
        },

        {
            card: "care-card",
            element: "catalog-care",
            value: catalog.careInstructions
        }

    ];


    let hasCatalogData = false;


    fields.forEach(field => {

        const card =
            document.getElementById(field.card);

        const element =
            document.getElementById(field.element);


        if (!card || !element) {
            return;
        }


        const value =
            typeof field.value === "string"
                ? field.value.trim()
                : field.value;


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            element.textContent =
                String(value);

            card.hidden = false;

            hasCatalogData = true;

        } else {

            card.hidden = true;

        }

    });


    section.hidden = !hasCatalogData;

}


    // ========================================================
    // MAKING STEPS
    // ========================================================

    function renderMakingSteps() {

        const grid =
            document.getElementById(
                "making-grid"
            );


        const steps =
            currentProduct.catalog?.makingSteps;


        if (
            !grid ||
            !Array.isArray(steps) ||
            !steps.length
        ) {

            makingSection.hidden =
                true;

            return;
        }


        makingSection.hidden =
            false;


        grid.innerHTML =
            steps
                .sort(
                    (a, b) =>
                        Number(a.step || 0) -
                        Number(b.step || 0)
                )
                .map(
                    (step, index) => {

                        const image =
                            getImageUrl(
                                step.image
                            );


                        return `
                            <article
                                class="making-card"
                            >

                                <div
                                    class="making-image"
                                >

                                    ${image
                                ? `
                                                <img
                                                    src="${escapeHTML(image)}"
                                                    alt="${escapeHTML(
                                    step.title ||
                                    "Making process"
                                )}"
                                                    loading="lazy"
                                                >
                                              `
                                : `
                                                <div class="making-image-placeholder">
                                                    ${String(
                                    index + 1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                                                </div>
                                              `
                            }

                                    <span class="making-number">
                                        ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}
                                    </span>

                                </div>


                                <div
                                    class="making-content"
                                >

                                    <h3>
                                        ${escapeHTML(
                                step.title ||
                                "The Craft"
                            )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                step.description ||
                                ""
                            )}
                                    </p>

                                </div>

                            </article>
                        `;

                    }
                )
                .join("");

    }


    // ========================================================
    // QUANTITY
    // ========================================================

    function updateQuantity() {

        if (!currentProduct) {
            return;
        }


        const stock =
            Number(
                currentProduct.stock || 0
            );


        quantity =
            Math.max(
                1,
                Math.min(
                    quantity,
                    stock || 1
                )
            );


        quantityValue.textContent =
            quantity;

    }


    document
        .getElementById("quantity-minus")
        ?.addEventListener(
            "click",
            () => {

                quantity--;

                updateQuantity();

            }
        );


    document
        .getElementById("quantity-plus")
        ?.addEventListener(
            "click",
            () => {

                quantity++;

                updateQuantity();

            }
        );


    // ========================================================
    // ADD TO BAG
    // ========================================================

    addButton?.addEventListener(
        "click",
        () => {

            if (!currentProduct) {
                return;
            }

            const stock =
                Number(
                    currentProduct.stock || 0
                );

            if (stock <= 0) {
                return;
            }

            const finalPrice =
                Number(
                    currentPricing?.finalPrice ??
                    currentProduct.price ??
                    0
                );

            const mainImage =
                getImageUrl(
                    currentProduct.images?.find(
                        image =>
                            image?.isMain
                    ) ||
                    currentProduct.images?.[0]
                );


            // ====================================================
            // PROPER CART ITEM
            // ====================================================

            const cartItem = {

                productId:
                    currentProduct._id,

                name:
                    currentProduct.name ||
                    "Handloom Product",

                price:
                    finalPrice,

                imgUrl:
                    mainImage,

                quantity:
                    quantity,

                stock:
                    stock

            };


            // ====================================================
            // USE GLOBAL CART FUNCTION
            // ====================================================

            if (
                typeof window.addProductToCart ===
                "function"
            ) {

                window.addProductToCart(
                    cartItem
                );

            } else {

                console.error(
                    "addProductToCart() not found."
                );

                return;
            }


            // ====================================================
            // BUTTON FEEDBACK
            // ====================================================

            addButton.textContent =
                "ADDED TO BAG ✓";


            setTimeout(
                () => {

                    if (stock > 0) {

                        addButton.textContent =
                            "ADD TO BAG";

                    }

                },
                1800
            );

        }
    );


    // ========================================================
    // INITIALIZE
    // ========================================================

    loadProduct();

});