let currentUserUid = null;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        mainContent.style.display = "block";
        currentUserUid = user.uid; // Store the UID in a global variable
    } else {
        // Redirect to Login
        window.location = "/login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    submitPetFormButton.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!currentUserUid) {
            console.error("User not authenticated. Please log in.");
            return;
        }

        if (checkPetData()) {
            try {
                const chipData = await constructPetData(currentUserUid);

                // Create a new entry in the "chips" node and get the key
                const newChipRef = await firebase.database().ref(`chips`).push();
                const newChipKey = newChipRef.key; // Get the generated key

                // Save the data with the generated key
                await newChipRef.set(chipData); //! push this id along with some data into the users info so the user knows what chips/pets he had registered also

                console.log("Pet data has been saved successfully!");
                console.log("New chip ID:", newChipKey); // Log the key
            } catch (error) {
                console.error("Error saving pet data:", error);
                console.error("Failed to save pet data. Please try again.");
            }
        }
    });
});

async function constructPetData(userUid) {
    const chip_id = microchipIdInput.value.trim();
    const pet_name = petNameInput.value.trim();
    const pet_dob = petDobInput.value;
    const pet_species = animalSpeciesInput.value;
    const pet_breed = breedInput.value.trim();
    const pet_country = countrySelect.value;
    const pet_city = cityInput.value.trim();
    const pet_status = statusSelect.value;
    const owner_name = ownerNameInput.value.trim();
    const owner_phone_country_code = countryCodeInput.value.trim();
    const owner_phone_number = phoneNumberInput.value.trim();
    const owner_email = ownerEmailInput.value.trim();
    const owner_facebook = ownerFacebookInput.value.trim();
    const owner_instagram = ownerInstagramInput.value.trim();
    const owner_note = ownerNoteInput.value.trim();

    // Organize the chip data into an object
    const chip_data = {
        chip_id: chip_id,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        created_by: userUid,
        pet_info: {
            pet_name: pet_name,
            pet_dob: pet_dob,
            pet_species: pet_species,
            pet_breed: pet_breed,
            pet_country: pet_country,
            pet_city: pet_city,
            pet_status: pet_status,
        },
        owner_info: {
            owner_name: owner_name,
            owner_phone_country_code: owner_phone_country_code,
            owner_phone_number: owner_phone_number,
            owner_email: owner_email,
            owner_facebook: owner_facebook,
            owner_instagram: owner_instagram,
            owner_note: owner_note,
        },
    };

    return chip_data;
}

function checkPetData() {
    const chip_id = microchipIdInput.value.trim();
    const pet_name = petNameInput.value.trim();
    const pet_dob = petDobInput.value;
    const pet_species = animalSpeciesInput.value;
    const pet_breed = breedInput.value.trim();
    const pet_country = countrySelect.value;
    const pet_city = cityInput.value.trim();
    const pet_status = statusSelect.value;
    const owner_name = ownerNameInput.value.trim();
    const owner_phone_country_code = countryCodeInput.value.trim();
    const owner_phone_number = phoneNumberInput.value.trim();
    const owner_email = ownerEmailInput.value.trim();
    const owner_facebook = ownerFacebookInput.value.trim();
    const owner_instagram = ownerInstagramInput.value.trim();
    const owner_note = ownerNoteInput.value.trim();

    //! make tests here

}