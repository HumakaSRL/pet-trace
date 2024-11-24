let currentUserUid = null;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) currentUserUid = user.uid; // Store the UID in a global variable
});

document.addEventListener("DOMContentLoaded", async () => {
    editButton.addEventListener("click", showEditOptions);
    cancelButton.addEventListener("click", () => {
        const confirmation = confirm("All changes will be lost, are you sure?");
        if (confirmation) hideEditOptions();
    });
    saveButton.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to save the changes?");
        if (confirmation) saveChanges();
    });

    // Extract the "chip" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const microchipId = urlParams.get("chip");

    if (microchipId) {
        // Perform the search using the microchip ID
        const microchipData = await searchMicrochip(microchipId);

        if (microchipData) {
            console.log(microchipData);

            petImage.src = microchipData.image_url;

            // Show the chip information section along with the toolbar
            chipInformation.style.display = "flex";

            if (microchipData.owner_uid === currentUserUid) editSection.style.display = "flex";

            // Populate the data in the respective fields
            chipId.textContent = microchipData.chip_id;
            petName.textContent = microchipData.pet_info.pet_name;
            petDob.textContent = microchipData.pet_info.pet_dob || "Unspecified";

            // If pet_dob is present, calculate the pet's age
            if (microchipData.pet_info.pet_dob) {
                const dob = new Date(microchipData.pet_info.pet_dob);
                const ageInMillis = Date.now() - dob.getTime();
                const ageInYears = Math.floor(ageInMillis / (365.25 * 24 * 60 * 60 * 1000));
                petAge.textContent = `${ageInYears} year(s) old`;
            } else {
                petAge.textContent = "Unspecified";
            }

            // Capitalize the first letter of pet_species and pet_status
            petSpecies.textContent =
                microchipData.pet_info.pet_species.charAt(0).toUpperCase() +
                microchipData.pet_info.pet_species.slice(1);
            petStatus.textContent =
                microchipData.pet_info.pet_status.charAt(0).toUpperCase() +
                microchipData.pet_info.pet_status.slice(1);

            petBreed.textContent = microchipData.pet_info.pet_breed;
            ownerName.textContent = microchipData.owner_info.owner_name;

            // Format the owner's phone number
            ownerPhone.textContent = `+${microchipData.owner_info.owner_phone_country_code} ${microchipData.owner_info.owner_phone_number}`;

            ownerEmail.textContent = microchipData.owner_info.owner_email;

            // Provide default values for missing social media links
            ownerFacebook.textContent = microchipData.owner_info.owner_facebook || "Unspecified";
            ownerInstagram.textContent = microchipData.owner_info.owner_instagram || "Unspecified";

            ownerNote.textContent = microchipData.owner_info.owner_note;

            // Format timestamps into readable dates
            registeredOn.textContent = new Date(microchipData.created_at).toLocaleString();
            lastUpdate.textContent = new Date(microchipData.last_update).toLocaleString();

            // Capitalize the first letter of pet_country and pet_city
            country.textContent =
                microchipData.pet_info.pet_country.charAt(0).toUpperCase() +
                microchipData.pet_info.pet_country.slice(1);
            city.textContent =
                microchipData.pet_info.pet_city.charAt(0).toUpperCase() +
                microchipData.pet_info.pet_city.slice(1);
        } else {
            // If no data found, show the "no match" section
            noMatchSection.style.display = "flex";
            microchipIdSpan.textContent = microchipId;
        }
    }
});

async function searchMicrochip(microchipId) {
    try {
        const snapshot = await firebase
            .database()
            .ref("chips")
            .orderByChild("chip_id")
            .equalTo(microchipId)
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

function showEditOptions() {
    editButton.style.display = "none";
    saveButton.style.display = "block";
    cancelButton.style.display = "block";
}

function hideEditOptions() {
    // TODO: Reset every edit field here
    editButton.style.display = "block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
}

function saveChanges() {
    // TODO: Save the data
    hideEditOptions();
}
