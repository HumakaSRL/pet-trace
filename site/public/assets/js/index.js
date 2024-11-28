document.addEventListener("DOMContentLoaded", () => {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();

        // Get the microchip ID input value
        let microchipId = microchipIdInput.value.trim();

        // Validate the microchip ID
        const isValid = /^[a-zA-Z0-9]{9,15}$/.test(microchipId);

        if (!isValid) {
            errorContainer.textContent =
                "Invalid ID. Ensure it has 9-15 characters, only letters and numbers, without dashes.";
            return;
        }

        searchPet(microchipId.toUpperCase());
    });
});

function searchPet(chip) {
    if (chip) window.location.href = `/view.html?chip=${chip}`;
    else alert("Please enter a valid Microchip ID.");
}
