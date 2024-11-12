document.addEventListener("DOMContentLoaded", async () => {
    // Extract the "microchip" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const microchipId = urlParams.get("microchip"); // gets the "microchip" value from URL

    if (microchipId) {
        // Perform the search using the microchip ID
        let microchipData = await searchMicrochip(microchipId);

        if (microchipData) {
            // Handle the data (e.g., display pet details)
            // Add code here to populate data into HTML elements
        } else {
            microchipIdSpan.textContent = microchipId;
            noMatchSection.style.display = "flex";
        }
    }
});

async function searchMicrochip(microchipId) {
    // For now, return null or mock data for testing
    // Later, you could fetch data from an API or database here
    return null;
}
