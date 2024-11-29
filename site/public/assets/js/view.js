let currentUserUid = null;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) currentUserUid = user.uid; // Store the UID in a global variable
});

document.addEventListener("DOMContentLoaded", async () => {
    await updateUI();

    deleteButton.addEventListener("click", () => {
        const confirmation = confirm(
            "This pet will be permanently deleted from our database, are you sure?"
        );
        if (confirmation) deletePet();
    });

    editButton.addEventListener("click", async () => {
        saveButton.disabled = false;
        await updateEditFields();
        hideInitialFields();
        showEditOptions();
    });

    cancelButton.addEventListener("click", async () => {
        const confirmation = confirm("All changes will be lost, are you sure?");
        if (confirmation) await cancelChanges();
    });

    saveButton.addEventListener("click", async () => {
        const confirmation = confirm("Are you sure you want to save the changes?");
        if (confirmation) await saveChanges();
    });
});

async function getChipData() {
    // Extract the "chip" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const chipId = urlParams.get("chip").toLowerCase();
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

async function updateUI() {
    const chipData = await getChipData();
    if (chipData) {
        console.log(chipData);

        petImage.src = chipData.image_url;

        // Show the chip information section along with the toolbar
        chipInformation.style.display = "flex";

        if (chipData.owner_uid === currentUserUid) editSection.style.display = "flex";

        // Populate the data in the respective fields
        chipId.textContent = chipData.chip_id.toUpperCase();
        petName.textContent = capitalizeFirstLetters(chipData.pet_info.pet_name);
        petDob.textContent = chipData.pet_info.pet_dob || "Unspecified";

        // If pet_dob is present, calculate the pet's age
        if (chipData.pet_info.pet_dob) {
            const dob = new Date(chipData.pet_info.pet_dob);
            const ageInMillis = Date.now() - dob.getTime();
            const ageInYears = Math.floor(ageInMillis / (365.25 * 24 * 60 * 60 * 1000));
            petAge.textContent = `${ageInYears} year(s) old`;
            ageDiv.style.display = "flex";
        } else ageDiv.style.display = "none";

        // Capitalize the first letter of pet_species and pet_status
        petSpecies.textContent = capitalizeFirstLetters(chipData.pet_info.pet_species);
        petStatus.textContent = capitalizeFirstLetters(chipData.pet_info.pet_status);

        petBreed.textContent = chipData.pet_info.pet_breed || "Unspecified";
        ownerName.textContent = capitalizeFirstLetters(chipData.owner_info.owner_name);

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
        country.textContent = capitalizeFirstLetters(chipData.pet_info.pet_country);
        city.textContent = capitalizeFirstLetters(chipData.pet_info.pet_city);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        const chipId = urlParams.get("chip").toUpperCase();
        // If no data found, show the "no match" section
        noMatchSection.style.display = "block";
        microchipIdSpan.textContent = chipId;
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
    ageDiv.style.display = displayStyle;
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

async function saveChanges() {
    try {
        saveButton.disabled = true;
        hideEditOptions();
        await updatePetData();
        await updateUI();
        showInitialFields();
    } catch (error) {
        console.error("Error in saveChanges():", error);
        alert("An error has occurred, please try again later");
        saveButton.disabled = false;
    }
}

async function cancelChanges() {
    hideEditOptions();
    await updateEditFields();
    await updateUI();
    showInitialFields();
}

function deletePet() {
    alert("This pet has been permanently deleted from our database.");
}

async function updateEditFields() {
    const chipData = await getChipData();

    editPetName.value = capitalizeFirstLetters(chipData.pet_info.pet_name);
    editPetDob.value = chipData.pet_info.pet_dob;
    editPetSpecies.value = chipData.pet_info.pet_species;
    editPetBreed.value = capitalizeFirstLetters(chipData.pet_info.pet_breed);
    editPetStatus.value = chipData.pet_info.pet_status;
    editOwnerName.value = capitalizeFirstLetters(chipData.owner_info.owner_name);
    editOwnerPhone.value = chipData.owner_info.owner_phone_number;
    editOwnerEmail.value = chipData.owner_info.owner_email;
    editOwnerFacebook.value = chipData.owner_info.owner_facebook || "";
    editOwnerInstagram.value = chipData.owner_info.owner_instagram || "";
    editOwnerNote.value = chipData.owner_info.owner_note || "";
    editCountry.value = capitalizeFirstLetters(chipData.pet_info.pet_country);
    editCity.value = capitalizeFirstLetters(chipData.pet_info.pet_city);
}

function capitalizeFirstLetters(string) {
    if (typeof string !== "string") {
        console.error("Input must be a string.");
        return "";
    }

    if (string.trim() === "") return "";

    return string
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function updatePetData() {
    try {
        const newPetData = getNewData();
        if (!newPetData || typeof newPetData !== "object")
            throw new Error("Invalid pet data provided.");

        const chipKey = await getChipKey();
        if (!chipKey) throw new Error("Chip key not found. Please check the chip ID.");

        const chipRef = firebase.database().ref(`/chips/${chipKey}/`);
        await chipRef.update(newPetData);

        alert("Pet data updated successfully.");
    } catch (error) {
        console.error("Error in updatePetData():", error);
        throw new Error("Failed to update pet data. Please try again later.");
    }
}

function getNewData() {
    const petName = editPetName.value.trim().toLowerCase();
    const petSpecies = editPetSpecies.value.trim().toLowerCase();
    const petBreed = editPetBreed.value.trim().toLowerCase();
    const petStatus = editPetStatus.value.trim().toLowerCase();
    const petCountry = editCountry.value.trim().toLowerCase();
    const petCity = editCity.value.trim().toLowerCase();
    const petDob = editPetDob.value;
    const ownerName = editOwnerName.value.trim().toLowerCase();
    const ownerPhone = editOwnerPhone.value.trim().toLowerCase();
    const ownerEmail = editOwnerEmail.value.trim().toLowerCase();
    const ownerFacebook = editOwnerFacebook.value.trim().toLowerCase();
    const ownerInstagram = editOwnerInstagram.value.trim().toLowerCase();
    const ownerNote = editOwnerNote.value.trim().toLowerCase();
    const data = {
        pet_info: {
            pet_breed: petBreed,
            pet_city: petCity,
            pet_country: petCountry,
            pet_dob: petDob,
            pet_name: petName,
            pet_species: petSpecies,
            pet_status: petStatus,
        },
        owner_info: {
            owner_email: ownerEmail,
            owner_facebook: ownerFacebook,
            owner_instagram: ownerInstagram,
            owner_name: ownerName,
            owner_note: ownerNote,
            owner_phone_number: ownerPhone,
        },
    };
    return data;
}

async function getChipKey() {
    // Extract the "chip" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const chipId = urlParams.get("chip").toLowerCase();
    try {
        const snapshot = await firebase
            .database()
            .ref("chips")
            .orderByChild("chip_id")
            .equalTo(chipId)
            .once("value");

        // Check if the snapshot exists and extract the first key
        if (snapshot.exists()) {
            const chips = snapshot.val();
            if (chips && typeof chips === "object") {
                const chipKey = Object.keys(chips)[0];
                return chipKey || null;
            }
        } else return null;
    } catch (error) {
        console.error("Error fetching data: ", error);
        return null;
    }
}
