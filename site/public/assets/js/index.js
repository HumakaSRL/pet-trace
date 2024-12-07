document.addEventListener("DOMContentLoaded", () => {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";
        microchipIdInput.disabled = true;

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
