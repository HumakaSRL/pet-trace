document.addEventListener("DOMContentLoaded", () => {
    searchButton.addEventListener("click", (e) => {
        e.preventDefault();
        searchPet(microchipIdInput);
    });
});

function searchPet(inputElement) {
    const chip = inputElement.value.trim();
    if (chip) window.location.href = `/view.html?chip=${chip}`;
    else alert("Please enter a valid Microchip ID.");
}
