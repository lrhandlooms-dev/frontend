// ==========================================================
// LR HANDLOOMS — CONSULTATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const API_BASE =
            window.HANDLOOM_API_BASE ||
            "https://backend-8zwr.onrender.com/api";


        const form =
            document.getElementById(
                "consultation-form"
            );

        const submitButton =
            document.getElementById(
                "consultation-submit"
            );

        const status =
            document.getElementById(
                "consultation-status"
            );


        if (!form) {
            return;
        }


        // ==================================================
        // GSAP INTRO
        // ==================================================

        if (
            typeof gsap !== "undefined"
        ) {

            gsap.from(
                ".consultation-logo",
                {
                    opacity: 0,
                    y: -15,
                    duration: .8,
                    ease: "power2.out"
                }
            );


            gsap.from(
                ".consultation-back",
                {
                    opacity: 0,
                    y: -15,
                    duration: .8,
                    delay: .1,
                    ease: "power2.out"
                }
            );


            gsap.from(
                ".consultation-intro > *",
                {
                    opacity: 0,
                    y: 35,
                    duration: 1,
                    stagger: .08,
                    delay: .2,
                    ease: "power3.out"
                }
            );


            gsap.from(
                ".consultation-card",
                {
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    delay: .35,
                    ease: "power3.out"
                }
            );

        }


        // ==================================================
        // FORM SUBMIT
        // ==================================================

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "consultation-name"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "consultation-email"
                        )
                        .value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "consultation-phone"
                        )
                        .value
                        .trim();


                const occasion =
                    document
                        .getElementById(
                            "consultation-type"
                        )
                        .value;


                const occasionDate =
                    document
                        .getElementById(
                            "consultation-date"
                        )
                        .value;


                const message =
                    document
                        .getElementById(
                            "consultation-message"
                        )
                        .value
                        .trim();


                // ==========================================
                // VALIDATION
                // ==========================================

                if (
                    !name ||
                    !email ||
                    !phone ||
                    !occasion ||
                    !occasionDate ||
                    !message
                ) {

                    showStatus(
                        "Please complete all fields before submitting.",
                        "error"
                    );

                    return;

                }


                // ==========================================
                // LOADING
                // ==========================================

                submitButton.disabled =
                    true;

                submitButton
                    .querySelector("span")
                    .textContent =
                    "SUBMITTING REQUEST...";


                showStatus(
                    "",
                    ""
                );


                try {

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
                                            "Private Bridal Consultation",

                                        message:
                                            `Occasion: ${occasion}\n\n${message}`,

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
                            "Unable to submit your request."
                        );

                    }


                    // ======================================
                    // SUCCESS
                    // ======================================

                    showStatus(
                        "Your private consultation request has been received. Our atelier will contact you shortly.",
                        "success"
                    );


                    form.reset();


                    if (
                        typeof gsap !== "undefined"
                    ) {

                        gsap.fromTo(
                            ".consultation-status",
                            {
                                opacity: 0,
                                y: 10
                            },
                            {
                                opacity: 1,
                                y: 0,
                                duration: .5
                            }
                        );

                    }


                } catch (error) {

                    console.error(
                        "Consultation submission error:",
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

                    submitButton
                        .querySelector("span")
                        .textContent =
                        "REQUEST PRIVATE CONSULTATION";

                }

            }
        );


        // ==================================================
        // STATUS
        // ==================================================

        function showStatus(
            message,
            type
        ) {

            status.textContent =
                message;

            status.className =
                "consultation-status";


            if (type) {

                status.classList.add(
                    type
                );

            }

        }

    }
);