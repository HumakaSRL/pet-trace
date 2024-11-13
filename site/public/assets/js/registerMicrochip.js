firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //
    } else {
        // Redirect to Login
        window.location = "/login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    petData = constructPetData();
});

function constructPetData() {
    const chip_id = microchipIdInput.value.trim();
    const pet_name = petNameInput.value.trim();
    const pet_dob = petDobInput.value;
    const pet_species = animalTypeInput.value;
    const pet_breed = breedInput.value.trim();
    const pet_country = countrySelect.value;
    const pet_city = cityInput.value.trim();
    const pet_status = statusSelect.value;
    const owner_name = ownerNameInput.value.trim(); // Capitalize here
    const owner_phone_country_code = countryCodeInput.value.trim();
    const owner_phone_number = ownerNameInput.value.trim();
    const owner_facebook = ownerFacebookInput.value.trim();
    const owner_instagram = ownerInstagramInput.vale.trim();
    const owner_note = ownerNoteInput.value.trim();
    // need to restructure all of those into an organized object here.
}
