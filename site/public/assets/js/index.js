document.addEventListener("DOMContentLoaded", () => {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        searchPet(microchipIdInput);
    });
});

function searchPet(inputElement) {
    const microchipId = inputElement.value.trim();
    if (microchipId) window.location.href = `/pet-details.html?microchip=${microchipId}`;
    else alert("Please enter a valid Microchip ID.");
}
