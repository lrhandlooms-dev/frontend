// ==========================================================
// LR HANDLOOMS — BESPOKE ATELIER ENQUIRY
// ==========================================================

const API_BASE =
    window.HANDLOOM_API_BASE ||
    "https://backend-8zwr.onrender.com/api";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "consultation-form"
            );

        const submitButton =
            document.getElementById(
                "consultation-submit"
            );

        const statusElement =
            document.getElementById(
                "consultation-message-status"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "consultation-name"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "consultation-email"
                    ).value.trim();


                const phone =
                    document.getElementById(
                        "consultation-phone"
                    ).value.trim();


                const occasionDate =
                    document.getElementById(
                        "consultation-date"
                    ).value;


                const message =
                    document.getElementById(
                        "consultation-message"
                    ).value.trim();


                // ==========================================
                // VALIDATION
                // ==========================================

                if (
                    !name ||
                    !email ||
                    !message ||
                    !occasionDate
                ) {

                    showStatus(
                        "Please fill in all required fields.",
                        "error"
                    );

                    return;
                }


                // ==========================================
                // LOADING
                // ==========================================

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "SUBMITTING...";


                hideStatus();


                try {

                    // ======================================
                    // SEND ENQUIRY
                    // ======================================

                    const response =
                        await fetch(
                            `${API_BASE}/enquiries`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        name,

                                        email,

                                        phone,

                                        subject:
                                            "Bespoke Atelier Consultation",

                                        message,

                                        type:
                                            "custom-order",

                                        occasionDate

                                    })
                            }
                        );


                    const data =
                        await response
                            .json()
                            .catch(
                                () => ({})
                            );


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to submit your consultation request."
                        );

                    }


                    // ======================================
                    // SUCCESS
                    // ======================================

                    showStatus(
                        "Thank you. Your consultation request has been received. Our concierge will contact you within 24 hours.",
                        "success"
                    );


                    form.reset();


                    // Close modal after a short delay
                    setTimeout(
                        () => {

                            if (
                                typeof window.closeBridalModal ===
                                "function"
                            ) {

                                window.closeBridalModal();

                            }

                        },
                        2200
                    );


                } catch (error) {

                    console.error(
                        "Atelier enquiry error:",
                        error
                    );


                    showStatus(
                        error.message ||
                        "Something went wrong. Please try again.",
                        "error"
                    );

                } finally {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "SUBMIT CONSULTATION REQUEST";

                }

            }
        );


        // ==============================================
        // STATUS MESSAGE
        // ==============================================

        function showStatus(
            message,
            type
        ) {

            statusElement.textContent =
                message;

            statusElement.style.display =
                "block";


            if (type === "success") {

                statusElement.style.color =
                    "#55724f";

            } else {

                statusElement.style.color =
                    "#a33d32";

            }

        }


        function hideStatus() {

            statusElement.textContent =
                "";

            statusElement.style.display =
                "none";

        }

    }
);