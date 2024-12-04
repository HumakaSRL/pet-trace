let currentUserUid = null;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) currentUserUid = user.uid; // Store the UID in a global variable
});

document.addEventListener("DOMContentLoaded", async () => {
    await updateUI();

    deleteButton.addEventListener("click", async () => {
        const confirmation = confirm(
            "This pet will be permanently deleted from our database, are you sure?"
        );
        if (confirmation) {
            await deletePet();
            window.location = "dashboard.html";
        }
    });

    editButton.addEventListener("click", async () => {
        cancelButton.disabled = false;
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
        if (confirmation && checkFields()) await saveChanges();
    });

    // Add an event listener for file input change
    petImageInput.addEventListener("change", (event) => {
        const file = event.target.files[0]; // Get the selected file

        if (file) {
            const reader = new FileReader();

            // When the file is loaded, set it as the image source
            reader.onload = (e) => {
                petImage.src = e.target.result; // Set the image source to the loaded file
                petImage.style.display = "block"; // Ensure the image is visible
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        }
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
            petAge.textContent = `${ageInYears} year(s) old`; // TODO: calculate months also, and use better format
            ageDiv.style.display = "flex";
        } else ageDiv.style.display = "none";

        // Capitalize the first letter of pet_species and pet_status
        petSpecies.textContent = capitalizeFirstLetters(chipData.pet_info.pet_species);
        petStatus.textContent = capitalizeFirstLetters(chipData.pet_info.pet_status);

        petBreed.textContent = capitalizeFirstLetters(chipData.pet_info.pet_breed) || "Unspecified";
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
    imageOverlay.style.display = displayStyle;
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
    imageOverlay.style.display = displayStyle;
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
        cancelButton.disabled = true;
        saveButton.disabled = true;
        await updatePetData();
        await updateUI();
        hideEditOptions();
        showInitialFields();
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
    } catch (error) {
        console.error("Error in saveChanges():", error);
        alert("An error has occurred, please try again later");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
    }
}

async function cancelChanges() {
    await updateEditFields();
    await updateUI();
    hideEditOptions();
    showInitialFields();
}

async function deletePet() {
    try {
        // Get the chip key and pet ID
        const chipKey = await getChipKey();
        const petKey = await getPetKey();
        const currentImageURL = await getCurrentImagePath(chipKey);
        const currentImagePath = convertURLtoPath(currentImageURL);

        // References to the database paths
        const chipRef = firebase.database().ref(`chips/${chipKey}`);
        const userPetRef = firebase.database().ref(`users/${currentUserUid}/pets/${petKey}`);

        // Delete the data from the Realtime Database
        await chipRef.remove();
        await userPetRef.remove();

        // Delete the pet image
        await deleteFile(currentImagePath);

        alert("This pet has been permanently deleted from our database.");
    } catch (error) {
        console.error("Error deleting the pet:", error);
        alert("An error occurred while deleting the pet. Please try again.");
    }
}

async function getPetKey() {
    try {
        const chipKey = await getChipKey();
        const petsRef = firebase.database().ref(`users/${currentUserUid}/pets/`);
        const snapshot = await petsRef.once("value");
        let petId = null;

        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val() === chipKey) petId = childSnapshot.key; // Get the pet's Key
        });

        if (!petId) throw new Error("Pet ID not found for the given chip key.");

        return petId;
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
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
    petImageInput.value = null;
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

        await updatePetImage();

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
    const ownerNote = editOwnerNote.value.trim();

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
        last_update: firebase.database.ServerValue.TIMESTAMP,
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

function compressImage(imageFile) {
    return new Promise((resolve, reject) => {
        const maxWidth = 400;
        const quality = 0.97;

        if (!imageFile) {
            alert("No file provided.");
            reject("No file provided.");
            return;
        }

        let reader = new FileReader();
        reader.readAsDataURL(imageFile);

        reader.onload = (event) => {
            let image_url = event.target.result;
            let image = new Image();
            image.src = image_url;

            image.onload = () => {
                let canvas = document.createElement("canvas");
                let ratio = maxWidth / image.width;
                canvas.width = maxWidth;
                canvas.height = image.height * ratio;

                let context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob); // Resolve with the compressed image Blob
                    },
                    "image/jpeg",
                    quality
                );
            };

            image.onerror = (error) => {
                alert("Error loading image", error);
                console.error("Error loading image", error);
                reject("Error loading image");
            };
        };

        reader.onerror = (error) => {
            alert("Error reading file");
            console.error("Error reading file", error);
            reject("Error reading file");
        };
    });
}

function checkImage(file) {
    // Check if a file is provided
    if (!file) return null;

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Please select a PNG, JPG, or GIF image");
        return null;
    }

    // Check file size (5 MB limit)
    const maxSizeInBytes = 25 * 1024 * 1024; // 25 MB in bytes
    if (file.size > maxSizeInBytes) {
        alert("Image size exceeds the limit (25 MB)");
        return null;
    }

    return file;
}

function checkFormat(file) {
    if (file.type === "image/jpeg") return ".jpg";
    else if (file.type === "image/png") return ".png";
    else if (file.type === "image/gif") return ".gif";
    return null; // Return null for unsupported formats
}

async function uploadFileToStorage(file, filePath) {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(filePath);

    // Upload the file
    await fileRef.put(file);

    // Get and return the download URL
    return fileRef.getDownloadURL();
}

async function updateImageURL(chipKey, imageURL) {
    const dbRef = firebase.database().ref(`chips/${chipKey}`);

    // Update the image_url field for the specific chip
    await dbRef.update({
        image_url: imageURL,
    });
}

function checkFields() {
    displayLoadingSpinner();
    cancelButton.disabled = true;
    saveButton.disabled = true;
    const pet_name = editPetName.value.trim().toLowerCase();
    const pet_dob = editPetDob.value;
    const pet_species = editPetSpecies.value.toLowerCase();
    const pet_breed = editPetBreed.value.trim().toLowerCase();
    const pet_status = editPetStatus.value.toLowerCase();
    const owner_name = editOwnerName.value.trim().toLowerCase();
    const owner_phone_number = editOwnerPhone.value.trim();
    const owner_email = editOwnerEmail.value.trim().toLowerCase();
    const owner_facebook = editOwnerFacebook.value.trim().toLowerCase();
    const owner_instagram = editOwnerInstagram.value.trim().toLowerCase();
    const owner_note = editOwnerNote.value.trim();
    const pet_country = editCountry.value.toLowerCase();
    const pet_city = editCity.value.trim().toLowerCase();

    // Pet Name Validation
    if (!/^[a-zA-Z\s]+$/.test(pet_name) || pet_name.length < 2 || pet_name.length > 25) {
        alert("Please enter a valid name for your pet! Names can only contain letters and spaces.");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Date of Birth Validation
    if (pet_dob) {
        const petDob = new Date(pet_dob); // Parse the date input
        const currentDate = new Date();

        if (isNaN(petDob)) {
            alert("Invalid date of birth. Please enter a valid date!");
            cancelButton.disabled = false;
            saveButton.disabled = false;
            hideLoadingSpinner();
            return false;
        }

        const ageInYears = (currentDate - petDob) / (1000 * 60 * 60 * 24 * 365.25);

        if (ageInYears > 40 || petDob > currentDate) {
            alert(
                ageInYears > 40
                    ? "Your pet cannot be older than 40 years old. Please check the date of birth!"
                    : "Your pet cannot be born in the future. Please check the date of birth!"
            );
            cancelButton.disabled = false;
            saveButton.disabled = false;
            hideLoadingSpinner();
            return false;
        }
    }

    // Species Validation
    if (!pet_species) {
        alert("Please choose your pet species!");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Pet Breed Validation
    if (
        pet_breed &&
        (!/^[a-zA-Z\s]+$/.test(pet_breed) || pet_breed.length < 3 || pet_breed.length > 25)
    ) {
        alert(
            "Please enter a valid pet breed. Only letters and spaces are allowed, and the length must be between 3 and 25 characters."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Country Validation
    if (!pet_country) {
        alert("Please select your pet's current country.");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // City Validation
    if (!/^[a-zA-Z\s]+$/.test(pet_city) || pet_city.length < 3 || pet_city.length > 25) {
        alert(
            "Please enter a valid city name. Only letters and spaces are allowed, and the length must be between 3 and 25 characters."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Pet Status Validation
    if (!pet_status) {
        alert("Please select the pet's current status.");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Owner Name Validation
    if (!/^[a-zA-Z\s]+$/.test(owner_name) || owner_name.length < 3 || owner_name.length > 25) {
        alert(
            "Please enter a valid owner's name. Only letters and spaces are allowed, and the length must be between 3 and 25 characters."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Phone Number Validation
    if (!/^\+\d{10,15}$/.test(owner_phone_number)) {
        alert(
            "Invalid phone number. It must start with '+' followed by 10 to 15 digits (e.g., +123456789)."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Email Validation
    if (!/^[a-zA-Z0-9.\-]{3,30}@[a-zA-Z0-9.\-]{3,20}\.[a-zA-Z]{2,4}$/.test(owner_email)) {
        alert("Please enter a valid email address.");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Social Media Links Validation
    if (owner_facebook && (owner_facebook.length < 10 || owner_facebook.length > 150)) {
        alert(
            "Please enter a valid Facebook profile name or link. It should be between 10 and 150 characters."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    if (owner_instagram && (owner_instagram.length < 10 || owner_instagram.length > 150)) {
        alert(
            "Please enter a valid Instagram profile name or link. It should be between 10 and 150 characters."
        );
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Owner Note Validation
    if (owner_note.length > 2000) {
        alert("The owner note must not exceed 2000 characters.");
        cancelButton.disabled = false;
        saveButton.disabled = false;
        hideLoadingSpinner();
        return false;
    }

    // Pet Image Validation
    const petImageFile = petImageInput.files[0];
    if (petImageFile) {
        if (!checkImage(petImageFile) || !checkFormat(petImageFile)) {
            alert("Invalid image file.");
            cancelButton.disabled = false;
            saveButton.disabled = false;
            hideLoadingSpinner();
            return false;
        }
    }
    return true;
}

async function updatePetImage() {
    const petImageFile = petImageInput.files[0];
    if (petImageFile) {
        try {
            // Check image format and store it into a variable (to use it as a file extension)
            const imageFormat = checkFormat(petImageFile);

            // Compress the image before uploading
            const compressedFile = await compressImage(petImageFile);

            // Get the chip key
            const chipKey = await getChipKey();

            // Delete old image and then proceed to upload the new image
            const currentImageURL = await getCurrentImagePath(chipKey);
            const currentImagePath = convertURLtoPath(currentImageURL);
            await deleteFile(currentImagePath);

            // Upload the compressed image to Firebase Storage
            const imageFilePath = `pet_images/${chipKey}/${currentUserUid}/pet_image_${Date.now()}${imageFormat}`;
            const imageURL = await uploadFileToStorage(compressedFile, imageFilePath);

            // Update the database with the new image URL
            await updateImageURL(chipKey, imageURL);
        } catch (error) {
            console.error("Error updating pet image:", error);
        }
    } else {
        console.log("No new pet image selected");
        return;
    }
}

async function deleteFile(filePath) {
    const fileRef = firebase.storage().ref(filePath);

    try {
        // Attempt to delete the file
        await fileRef.delete();
        console.log(`File at ${filePath} deleted successfully`);
    } catch (error) {
        if (error.code === "storage/object-not-found") {
            console.log(`File at ${filePath} does not exist`);
        } else {
            console.error(`Error deleting file at ${filePath}:`, error);
            throw new Error("Failed to delete the file");
        }
    }
}

async function getCurrentImagePath(chipKey) {
    try {
        // Reference to the database path where the image URL is stored
        const imageRef = firebase.database().ref(`chips/${chipKey}/image_url`);

        // Fetch the data from the database
        const snapshot = await imageRef.once("value");

        // Check if the image_url exists and return it
        if (snapshot.exists()) {
            const imageUrl = snapshot.val();
            console.log(`Current image URL: ${imageUrl}`);
            return imageUrl;
        } else {
            console.log("No image URL found for the specified chipKey");
            return null;
        }
    } catch (error) {
        console.error("Error retrieving current image path:", error);
        throw new Error("Failed to retrieve current image path");
    }
}

function convertURLtoPath(url) {
    try {
        // Create a URL object from the given string
        const urlObject = new URL(url);

        // Extract the 'o' parameter from the pathname of the URL
        const pathMatch = urlObject.pathname.match(/\/o\/(.+)/);

        if (pathMatch && pathMatch[1]) {
            return decodeURIComponent(pathMatch[1]);
        } else {
            throw new Error("Path not found in the URL");
        }
    } catch (error) {
        console.error("Error converting URL to path:", error);
        return null;
    }
}

function displayLoadingSpinner() {
    loadingSpinner.style.display = "block";
    viewOverlay.style.display = "block";
}

function hideLoadingSpinner() {
    loadingSpinner.style.display = "none";
    viewOverlay.style.display = "none";
}
