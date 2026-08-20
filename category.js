// ============================================================
// LR HANDLOOMS — CATEGORY PAGE
// ============================================================

(() => {

    const API_BASE =
        window.HANDLOOM_API_BASE ||
        "https://backend-8zwr.onrender.com/api";


    const params =
        new URLSearchParams(
            window.location.search
        );


    const categoryId =
        params.get("id");


    // =========================================================
    // ELEMENTS
    // =========================================================

    const nameEl =
        document.getElementById(
            "categoryName"
        );


    const descriptionEl =
        document.getElementById(
            "categoryDescription"
        );


    const heroImageEl =
        document.getElementById(
            "categoryHeroImage"
        );


    const countEl =
        document.getElementById(
            "categoryCount"
        );


    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    const numberEl =
        document.getElementById(
            "categoryNumber"
        );


    // =========================================================
    // HELPERS
    // =========================================================

    function escapeHTML(value) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }


    function getImage(category) {

        return (
            category?.image?.url ||
            category?.image?.secure_url ||
            category?.image ||
            category?.imageUrl ||
            category?.imageURL ||
            ""
        );
    }


    function getProductImage(product) {

        const mainImage =
            product?.images?.find(
                image =>
                    image?.isMain
            ) ||
            product?.images?.[0];


        return (
            mainImage?.url ||
            ""
        );
    }


    function formatPrice(price) {

        return (
            "₹" +
            (
                Number(price) || 0
            ).toLocaleString("en-IN")
        );

    }


    // =========================================================
    // API
    // =========================================================

    async function apiGet(endpoint) {

        const response =
            await fetch(
                `${API_BASE}${endpoint}`
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Request failed: ${response.status}`
            );

        }


        return data;
    }


    // =========================================================
    // LOAD CATEGORY
    // =========================================================

    async function loadCategory() {

        if (!categoryId) {

            showError(
                "Collection not found."
            );

            return;
        }


        try {

            // Get all categories
            // and find the requested one.

            const categoryData =
                await apiGet(
                    "/categories"
                );


            const categories =
                categoryData.categories ||
                categoryData.data ||
                (
                    Array.isArray(categoryData)
                        ? categoryData
                        : []
                );


            const category =
                categories.find(
                    item =>
                        String(item._id) ===
                        String(categoryId)
                );


            if (!category) {

                showError(
                    "Collection not found."
                );

                return;
            }


            renderCategory(
                category
            );


            await loadProducts();


        } catch (error) {

            console.error(
                "Category page error:",
                error
            );


            showError(
                "Unable to load this collection."
            );

        }

    }


    // =========================================================
    // RENDER CATEGORY
    // =========================================================

    function renderCategory(
        category
    ) {

        document.title =
            `${category.name} — LR Handlooms`;


        nameEl.textContent =
            category.name ||
            "Collection";


        descriptionEl.textContent =
            category.description ||
            "Discover our handwoven collection.";


        const image =
            getImage(category);


        if (image) {

            heroImageEl.src =
                image;

            heroImageEl.alt =
                category.name ||
                "Handloom Collection";

        }


        const index =
            Array.from(
                document.querySelectorAll(
                    ".category-card"
                )
            );


        numberEl.textContent =
            "COLLECTION";

    }


    // =========================================================
    // LOAD PRODUCTS BY CATEGORY
    // =========================================================

    async function loadProducts() {

        grid.innerHTML = `
            <div class="category-loading">
                Loading collection...
            </div>
        `;


        try {

            const data =
                await apiGet(
                    `/products?category=${encodeURIComponent(
                        categoryId
                    )}&limit=100`
                );


            const products =
                data.products ||
                data.data ||
                (
                    Array.isArray(data)
                        ? data
                        : []
                );


            const activeProducts =
                products.filter(
                    product =>
                        product?.isActive !== false
                );


            countEl.textContent =
                `${activeProducts.length} ${activeProducts.length === 1
                    ? "PIECE"
                    : "PIECES"
                }`;


            if (
                !activeProducts.length
            ) {

                grid.innerHTML = `
                    <div class="category-empty">

                        <h3>
                            Nothing here yet.
                        </h3>

                        <p>
                            New pieces from this collection
                            will be arriving soon.
                        </p>

                    </div>
                `;

                return;
            }


            renderProducts(
                activeProducts
            );


        } catch (error) {

            console.error(
                "Products error:",
                error
            );


            grid.innerHTML = `
                <div class="category-empty">

                    <h3>
                        Collection unavailable
                    </h3>

                    <p>
                        Please try again in a moment.
                    </p>

                </div>
            `;

        }

    }


    // =========================================================
    // RENDER PRODUCTS
    // =========================================================

    function renderProducts(products) {

        grid.innerHTML =
            products
                .map(product => {

                    const image =
                        getProductImage(product);

                    const stock =
                        Number(product.stock) || 0;

                    const outOfStock =
                        stock <= 0;

                    const originalPrice =
                        Number(product.price) || 0;

                    const finalPrice =
                        Number(
                            product.pricing?.finalPrice ??
                            originalPrice
                        );

                    const hasDiscount =
                        finalPrice < originalPrice;

                    let discountPercentage = 0;

                    if (hasDiscount && originalPrice > 0) {
                        discountPercentage =
                            Math.round(
                                ((originalPrice - finalPrice) /
                                    originalPrice) * 100
                            );
                    }

                    return `
                    <article
                        class="product-card"
                        data-product-id="${escapeHTML(
                        product._id || ""
                    )}"
                    >

                        <div class="img-wrapper">

                            <img
                                class="product-img"
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(
                        product.name ||
                        "Handloom Product"
                    )}"
                                loading="lazy"
                            >

                            ${product.featured
                            ? `
                                        <span class="product-badge">
                                            FEATURED
                                        </span>
                                    `
                            : ""
                        }

                            <button
                                type="button"
                                class="quick-add"
                                data-category-add-product="${escapeHTML(
                            product._id || ""
                        )}"
                                ${outOfStock
                            ? "disabled"
                            : ""
                        }
                            >
                                ${outOfStock
                            ? "SOLD OUT"
                            : "ADD TO BAG"
                        }
                            </button>

                        </div>

                        <div class="product-info">

                            <h3>
                                ${escapeHTML(
                            product.name ||
                            "Untitled Product"
                        )}
                            </h3>

                            <div class="price">

                                ${hasDiscount
                            ? `
                                            <span class="original-price">
                                                ${formatPrice(
                                originalPrice
                            )}
                                            </span>

                                            <span class="sale-price">
                                                ${formatPrice(
                                finalPrice
                            )}
                                            </span>

                                            <span class="offer-label">
                                                ${discountPercentage}% OFF
                                            </span>
                                        `
                            : `
                                            <span class="regular-price">
                                                ${formatPrice(
                                originalPrice
                            )}
                                            </span>
                                        `
                        }

                            </div>

                        </div>

                    </article>
                `;

                })
                .join("");

        bindAddButtons();

    }


    // =========================================================
    // ADD TO BAG
    // =========================================================

    function bindAddButtons() {

        document
            .querySelectorAll(
                "[data-category-add-product]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const productId =
                            button.dataset
                                .categoryAddProduct;


                        // Get product from current
                        // rendered collection.

                        apiGet(
                            `/products/${productId}`
                        )
                            .then(data => {

                                const product =
                                    data.product ||
                                    data.data;


                                if (!product) {
                                    return;
                                }


                                if (
                                    Number(
                                        product.stock
                                    ) <= 0
                                ) {

                                    return;
                                }


                                if (
                                    typeof window.addToCart ===
                                    "function"
                                ) {

                                    const finalPrice =
                                        Number(
                                            product.pricing?.finalPrice ??
                                            product.price ??
                                            0
                                        );

                                    window.addToCart(

                                        product.name,

                                        finalPrice,

                                        getProductImage(
                                            product
                                        )

                                    );

                                }

                            })
                            .catch(error => {

                                console.error(
                                    "Add to bag error:",
                                    error
                                );

                            });

                    }
                );

            });

    }


    // =========================================================
    // ERROR
    // =========================================================

    function showError(
        message
    ) {

        nameEl.textContent =
            "Collection unavailable";


        descriptionEl.textContent =
            message;


        grid.innerHTML = `
            <div class="category-empty">

                <h3>
                    ${escapeHTML(message)}
                </h3>

                <p>
                    Please return to our collections.
                </p>

            </div>
        `;

    }


    // =========================================================
    // START
    // =========================================================

    document.addEventListener(
        "DOMContentLoaded",
        loadCategory
    );

})();