document.addEventListener("DOMContentLoaded", () => {
    petOwnerCard.addEventListener("click", () => {
        showForm("petOwner");
    });

    shelterClinicCard.addEventListener("click", () => {
        showForm("shelterClinic");
    });

    const donateBodyButton = document.getElementById("donateBodyButton");
    if (donateBodyButton)
        donateBodyButton.addEventListener("click", (e) => {
            e.preventDefault();
            firebase.analytics().logEvent("donate_button_click", {
                donationAction: "clicked",
            });

            window.open("https://donate.stripe.com/9AQ9COboD6Yi1C8005", "_blank");
        });

    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";
        microchipIdInput.disabled = true;

        // Log event for search button click
        firebase.analytics().logEvent("search_button_click", {
            microchipId: microchipIdInput.value.trim(),
        });

        // Get the microchip ID input value
        let microchipId = microchipIdInput.value.trim();

        // Validate the microchip ID
        const isValid = /^[a-zA-Z0-9]{9,15}$/.test(microchipId);

        if (!isValid) {
            errorContainer.textContent =
                "Invalid ID. Ensure it has 9-15 characters, only letters and numbers, without dashes.";
            errorContainer.style.display = "flex";
            searchButton.disabled = false;
            searchButton.textContent = "Search";
            microchipIdInput.disabled = false;
            return;
        }

        checkChip(microchipId);
    });
});

async function checkChip(chip) {
    errorContainer.textContent = "";
    errorContainer.style.display = "none";
    microchipIdInput.disabled = true;
    await sleep(1000);
    const chipId = chip.toLowerCase();

    try {
        const snapshot = await firebase
            .database()
            .ref("chips")
            .orderByChild("chip_id")
            .equalTo(chipId)
            .once("value");

        if (snapshot.exists()) window.location.href = `/view.html?chip=${chipId.toUpperCase()}`;
        else {
            errorContainer.innerHTML = `<p>This chip is not registered in our database, register it now <a href="/register-microchip.html?chip=${chipId.toUpperCase()}">here</a></p>`;
            errorContainer.style.display = "flex";
            searchButton.disabled = false;
            searchButton.textContent = "Search";
            microchipIdInput.disabled = false;
        }
    } catch (error) {
        console.error("An error occurred while fetching chip data: ", error);
        errorContainer.textContent = "An unknown error occurred, please try again later";
        searchButton.disabled = false;
        searchButton.textContent = "Search";
        microchipIdInput.disabled = false;
        return null;
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function showForm(formType) {
    const petOwnerCard = document.getElementById("petOwnerCard");
    const shelterClinicCard = document.getElementById("shelterClinicCard");
    const petOwnerAction = document.getElementById("petOwnerAction");
    const shelterClinicAction = document.getElementById("shelterClinicAction");
    const actionContainer = document.querySelector(".action-container");
    const currentActiveCard = document.querySelector(".option-card.active");

    // Hide all action contents first
    petOwnerAction.style.display = "none";
    shelterClinicAction.style.display = "none";

    // Check if clicking the already active card
    if (
        (formType === "petOwner" && currentActiveCard === petOwnerCard) ||
        (formType === "shelterClinic" && currentActiveCard === shelterClinicCard)
    ) {
        currentActiveCard.classList.remove("active");
        actionContainer.classList.remove("active");
        return;
    }

    // Remove active class from all cards
    document.querySelectorAll(".option-card").forEach((card) => card.classList.remove("active"));
    actionContainer.classList.remove("active");

    // Show and measure the target content
    const targetContent = formType === "petOwner" ? petOwnerAction : shelterClinicAction;
    targetContent.style.display = "block";
    const targetHeight = targetContent.scrollHeight + 25; // + padding
    targetContent.style.display = "none"; // Hide it again for animation

    // Set container height and make visible
    actionContainer.style.setProperty("--current-height", `${targetHeight}px`);
    actionContainer.classList.add("active");

    // Show the correct content
    targetContent.style.display = "block";

    // Activate with slight delay
    setTimeout(() => {
        if (formType === "petOwner") {
            petOwnerCard.classList.add("active");
            petOwnerAction.classList.add("active");
        } else {
            shelterClinicCard.classList.add("active");
            shelterClinicAction.classList.add("active");
        }
    }, 10);
}
