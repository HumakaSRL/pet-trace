let currentUserUid = null;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) currentUserUid = user.uid; // Store the UID in a global variable
});

document.addEventListener("DOMContentLoaded", async () => {
    deleteButton.addEventListener("click", () => {
        const confirmation = confirm(
            "This pet will be permanently deleted from our database, are you sure?"
        );
        if (confirmation) deletePet();
    });

    editButton.addEventListener("click", async () => {
        hideInitialFields();
        await updateEditFields();
        showEditOptions();
    });

    cancelButton.addEventListener("click", () => {
        const confirmation = confirm("All changes will be lost, are you sure?");
        if (confirmation) cancelChanges();
    });

    saveButton.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to save the changes?");
        if (confirmation) saveChanges();
    });

    const chipData = await getChipData();

    updateUI(chipData);
});

async function getChipData() {
    // Extract the "chip" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const chipId = urlParams.get("chip");
    try {
        const snapshot = await firebase
            .database()
            .ref("chips")
            .orderByChild("chip_id")
            .equalTo(chipId)
            .once("value");

        if (snapshot.exists()) {
            // Extract the first child of the snapshot
            const data = Object.values(snapshot.val())[0];
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
}

function updateUI(chipData) {
    if (chipData) {
        console.log(chipData);

        petImage.src = chipData.image_url;

        // Show the chip information section along with the toolbar
        chipInformation.style.display = "flex";

        if (chipData.owner_uid === currentUserUid) editSection.style.display = "flex";

        // Populate the data in the respective fields
        chipId.textContent = chipData.chip_id;
        petName.textContent = chipData.pet_info.pet_name;
        petDob.textContent = chipData.pet_info.pet_dob || "Unspecified";

        // If pet_dob is present, calculate the pet's age
        if (chipData.pet_info.pet_dob) {
            const dob = new Date(chipData.pet_info.pet_dob);
            const ageInMillis = Date.now() - dob.getTime();
            const ageInYears = Math.floor(ageInMillis / (365.25 * 24 * 60 * 60 * 1000));
            petAge.textContent = `${ageInYears} year(s) old`;
        } else ageDiv.style.display = "none";

        // Capitalize the first letter of pet_species and pet_status
        petSpecies.textContent =
            chipData.pet_info.pet_species.charAt(0).toUpperCase() +
            chipData.pet_info.pet_species.slice(1);
        petStatus.textContent =
            chipData.pet_info.pet_status.charAt(0).toUpperCase() +
            chipData.pet_info.pet_status.slice(1);

        petBreed.textContent = chipData.pet_info.pet_breed || "Unspecified";
        ownerName.textContent = chipData.owner_info.owner_name;

        // Format the owner's phone number
        ownerPhone.textContent = chipData.owner_info.owner_phone_number;

        ownerEmail.textContent = chipData.owner_info.owner_email;

        // Provide default values for missing social media links
        ownerFacebook.textContent = chipData.owner_info.owner_facebook || "Unspecified";
        ownerInstagram.textContent = chipData.owner_info.owner_instagram || "Unspecified";

        ownerNote.textContent =
            chipData.owner_info.owner_note ||
            "No additional information about this pet has been provided by the owner.";

        // Format timestamps into readable dates
        registeredOn.textContent = new Date(chipData.created_at).toLocaleString();
        lastUpdate.textContent = new Date(chipData.last_update).toLocaleString();

        // Capitalize the first letter of pet_country and pet_city
        country.textContent =
            chipData.pet_info.pet_country.charAt(0).toUpperCase() +
            chipData.pet_info.pet_country.slice(1);
        city.textContent =
            chipData.pet_info.pet_city.charAt(0).toUpperCase() +
            chipData.pet_info.pet_city.slice(1);
    } else {
        // If no data found, show the "no match" section
        noMatchSection.style.display = "flex";
        microchipIdSpan.textContent = microchipId;
    }
}

function showEditOptions() {
    editButton.style.display = "none";
    saveButton.style.display = "block";
    cancelButton.style.display = "block";

    showEditFields();
}

function hideEditOptions() {
    editButton.style.display = "block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

    hideEditFields();
}

function showEditFields() {
    const displayStyle = "flex";
    editPetName.style.display = displayStyle;
    editPetDob.style.display = displayStyle;
    editPetSpecies.style.display = displayStyle;
    editPetBreed.style.display = displayStyle;
    editPetStatus.style.display = displayStyle;
    editOwnerName.style.display = displayStyle;
    editOwnerPhone.style.display = displayStyle;
    editOwnerEmail.style.display = displayStyle;
    editOwnerFacebook.style.display = displayStyle;
    editOwnerInstagram.style.display = displayStyle;
    editOwnerNote.style.display = displayStyle;
    editCountry.style.display = displayStyle;
    editCity.style.display = displayStyle;
}

function hideEditFields() {
    const displayStyle = "none";
    editPetName.style.display = displayStyle;
    editPetDob.style.display = displayStyle;
    editPetSpecies.style.display = displayStyle;
    editPetBreed.style.display = displayStyle;
    editPetStatus.style.display = displayStyle;
    editOwnerName.style.display = displayStyle;
    editOwnerPhone.style.display = displayStyle;
    editOwnerEmail.style.display = displayStyle;
    editOwnerFacebook.style.display = displayStyle;
    editOwnerInstagram.style.display = displayStyle;
    editOwnerNote.style.display = displayStyle;
    editCountry.style.display = displayStyle;
    editCity.style.display = displayStyle;
}

function hideInitialFields() {
    const displayStyle = "none";
    petName.style.display = displayStyle;
    petDob.style.display = displayStyle;
    petSpecies.style.display = displayStyle;
    petBreed.style.display = displayStyle;
    petStatus.style.display = displayStyle;
    ownerName.style.display = displayStyle;
    ownerPhone.style.display = displayStyle;
    ownerEmail.style.display = displayStyle;
    ownerFacebook.style.display = displayStyle;
    ownerInstagram.style.display = displayStyle;
    ownerNote.style.display = displayStyle;
    country.style.display = displayStyle;
    city.style.display = displayStyle;
}

function showInitialFields() {
    const displayStyle = "flex";
    petName.style.display = displayStyle;
    petDob.style.display = displayStyle;
    petSpecies.style.display = displayStyle;
    petBreed.style.display = displayStyle;
    petStatus.style.display = displayStyle;
    ownerName.style.display = displayStyle;
    ownerPhone.style.display = displayStyle;
    ownerEmail.style.display = displayStyle;
    ownerFacebook.style.display = displayStyle;
    ownerInstagram.style.display = displayStyle;
    ownerNote.style.display = displayStyle;
    country.style.display = displayStyle;
    city.style.display = displayStyle;
}

function saveChanges() {
    // TODO: Save the data
    hideEditOptions();
}

function cancelChanges() {
    hideEditOptions();
    showInitialFields();
    // TODO: Reset every edit field here
    // fetchPetData();
}

function deletePet() {
    alert("This pet has been permanently deleted from our database.");
}

async function updateEditFields() {
    const chipData = await getChipData();

    editPetName.value = capitalizeFirstLetters(chipData.pet_info.pet_name);
    editPetDob.value = chipData.pet_info.pet_dob;
    editPetSpecies.value = capitalizeFirstLetters(chipData.pet_info.pet_species);
    editPetBreed.value = capitalizeFirstLetters(chipData.pet_info.pet_breed);
    editPetStatus.value = capitalizeFirstLetters(chipData.pet_info.pet_status);
    editOwnerName.value = capitalizeFirstLetters(chipData.owner_info.owner_name);
    editOwnerPhone.value = chipData.owner_info.owner_phone_number;
    editOwnerEmail.value = chipData.owner_info.owner_email;
    editOwnerFacebook.value = chipData.owner_info.owner_facebook || "";
    editOwnerInstagram.value = chipData.owner_info.owner_instagram || "";
    editOwnerNote.value = chipData.owner_info.owner_note || "";
    editCountry.value = capitalizeFirstLetters(chipData.pet_info.pet_country);
    editCity.value = capitalizeFirstLetters(chipData.pet_info.pet_city);
}

function capitalizeFirstLetters(text) {
    if (typeof text !== "string") {
        console.error("Input must be a string.");
        return "";
    }

    if (text.trim() === "") return "";

    return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
