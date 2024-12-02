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
        submitPetFormButton.disabled = true;

        // Check if the user is authenticated
        if (!currentUserUid) {
            window.location = "/login.html";
            return;
        }

        // Check if all required pet data is filled out
        if (checkPetData()) {
            try {
                // Get pet data from the form
                const chipData = await constructPetData(currentUserUid);

                // Check if the pet image is valid
                const petImageFile = petImageInput.files[0];
                if (!petImageFile) {
                    alert("Please select a pet image.");
                    submitPetFormButton.disabled = false;
                    return;
                }

                // Validate and compress the image file
                const validatedFile = checkImage(petImageFile);
                if (!validatedFile) {
                    console.error("Invalid image file.");
                    submitPetFormButton.disabled = false;
                    return;
                }

                // Check image format
                const imageFormat = checkFormat(petImageFile);

                // Compress the image before uploading
                const compressedFile = await compressImage(validatedFile);

                // Create a new entry in the "chips" node and get the key
                const newChipRef = await firebase.database().ref("chips").push();
                const chipKey = newChipRef.key; // Get the generated key

                // Save the pet data in the "chips" node
                await newChipRef.set(chipData);

                // Add the chip ID directly to the user's pets (no extra keys generated)
                const userPetsRef = firebase.database().ref(`users/${currentUserUid}/pets`);
                userPetsRef.push(chipKey);

                // Upload the compressed image to Firebase Storage
                const imageFilePath = `pet_images/${chipKey}/${currentUserUid}/pet_image_${Date.now()}${imageFormat}`;
                const imageURL = await uploadFileToStorage(compressedFile, imageFilePath);

                await updateImageURL(chipKey, imageURL);

                // Display success message
                showSuccessMessage("Pet data has been saved successfully!", chipData.chip_id);

                console.log("Chip data: ", chipData); //! RBI
                console.log("New chip ID:", chipKey); //! RBI
            } catch (error) {
                console.error("Error saving pet data:", error);
                alert("There was an error saving the pet data. Please try again later.");
            }
        }
    });
});

// Helper function for phone number validation
function isValidPhoneNumber(phoneNumber) {
    return /^\d+$/.test(phoneNumber) && phoneNumber.length >= 7 && phoneNumber.length <= 15;
}

// Helper function for validating email format
function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

// Helper function to capitalize the first letter of each word in a string
function capitalizeWords(str) {
    if (typeof str !== "string") console.error("Input must be a string");

    return str.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

// Helper function to handle success message UI
function showSuccessMessage(message, chipId) {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const successPopup = document.createElement("div");
    successPopup.classList.add("success-popup");

    const successMessage = document.createElement("p");
    successMessage.textContent = message;
    successPopup.appendChild(successMessage);

    const dashboardButton = document.createElement("button");
    dashboardButton.textContent = "Go to Dashboard";
    dashboardButton.classList.add("popup-button");
    dashboardButton.onclick = () => {
        window.location.href = "/dashboard.html";
    };
    successPopup.appendChild(dashboardButton);

    const viewPetButton = document.createElement("button");
    viewPetButton.textContent = "View Your Pet";
    viewPetButton.classList.add("popup-button");
    viewPetButton.onclick = () => {
        window.location.href = `/view.html?chip=${chipId}`;
    };
    successPopup.appendChild(viewPetButton);

    overlay.appendChild(successPopup);
    document.body.appendChild(overlay);
}

// Function to construct the pet data object
async function constructPetData(userUid) {
    // Get the data from the input fields
    let chip_id = microchipIdInput.value.trim();
    const pet_name = petNameInput.value.trim().toLowerCase();
    const pet_dob = petDobInput.value;
    const pet_species = animalSpeciesInput.value.toLowerCase();
    const pet_breed = breedInput.value.trim().toLowerCase();
    const pet_country = countrySelect.value.toLowerCase();
    const pet_city = cityInput.value.trim().toLowerCase();
    const pet_status = statusSelect.value.toLowerCase();
    const owner_name = ownerNameInput.value.trim().toLowerCase();
    const owner_phone_number = phoneNumberInput.value.trim();
    const owner_email = ownerEmailInput.value.trim().toLowerCase();
    const owner_facebook = ownerFacebookInput.value.trim().toLowerCase();
    const owner_instagram = ownerInstagramInput.value.trim().toLowerCase();
    const owner_note = ownerNoteInput.value.trim();

    // Convert all letters in chip_id to lowercase, while keeping numbers intact
    chip_id = chip_id.replace(/[a-zA-Z]/g, (match) => match.toLowerCase());

    // Organize the chip data into an object
    const chip_data = {
        chip_id: chip_id,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        last_update: firebase.database.ServerValue.TIMESTAMP,
        owner_uid: userUid,
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
            owner_phone_number: owner_phone_number,
            owner_email: owner_email,
            owner_facebook: owner_facebook,
            owner_instagram: owner_instagram,
            owner_note: owner_note,
        },
    };

    return chip_data;
}

// Validation logic for pet data form
function checkPetData() {
    const chip_id = microchipIdInput.value.trim().toUpperCase();
    const pet_name = petNameInput.value.trim().toLowerCase();
    const pet_dob = petDobInput.value;
    const pet_species = animalSpeciesInput.value.toLowerCase();
    const pet_breed = breedInput.value.trim().toLowerCase();
    const pet_country = countrySelect.value.toLowerCase();
    const pet_city = cityInput.value.trim().toLowerCase();
    const pet_status = statusSelect.value.toLowerCase();
    const owner_name = ownerNameInput.value.trim().toLowerCase();
    const owner_phone_number = phoneNumberInput.value.trim();
    const owner_email = ownerEmailInput.value.trim().toLowerCase();
    const owner_facebook = ownerFacebookInput.value.trim().toLowerCase();
    const owner_instagram = ownerInstagramInput.value.trim().toLowerCase();
    const owner_note = ownerNoteInput.value.trim();

    // Chip ID Validation
    if (!/^[A-Z0-9]{9,15}$/.test(chip_id)) {
        alert("The chip ID must be 9-15 characters long and contain only letters and numbers.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Pet Name Validation
    if (pet_name.length < 2 || pet_name.length > 25 || /\d/.test(pet_name)) {
        alert("Please enter a valid name for your pet! Names cannot contain numbers.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Date of Birth Validation
    const pet_dob_year = new Date(pet_dob).getFullYear();
    if (pet_dob_year < 1980) {
        alert("Your pet cannot be older than 40 years old. Please check the date of birth!");
        submitPetFormButton.disabled = false;
        return false;
    }

    if (pet_dob_year > new Date().getFullYear()) {
        alert("Your pet cannot be born in the future. Please check the date of birth!");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Species Validation
    if (!pet_species) {
        alert("Please choose your pet species!");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Pet Breed Validation
    if (pet_breed && (pet_breed.length < 4 || pet_breed.length > 25)) {
        alert("Please enter a valid pet breed.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Country Validation
    if (!pet_country) {
        alert("Please select your pet's current country.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // City Validation
    if (pet_city.length < 2 || pet_city.length > 50) {
        alert("Please enter a valid city name.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Pet Status Validation
    if (!pet_status) {
        alert("Please select the pet's current status.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Owner Name Validation
    if (owner_name.length < 2 || owner_name.length > 50) {
        alert("Please enter a valid owner's name.");
        submitPetFormButton.disabled = false;
        return false;
    }

    if (!isValidPhoneNumber(owner_phone_number)) {
        alert("Please enter a valid phone number.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Email Validation
    if (!owner_email || !isValidEmail(owner_email)) {
        alert("Please enter a valid email address.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Social Media Links Validation
    if (owner_facebook && owner_facebook.length < 5) {
        alert("Please enter a valid Facebook profile link.");
        submitPetFormButton.disabled = false;
        return false;
    }
    if (owner_instagram && owner_instagram.length < 5) {
        alert("Please enter a valid Instagram profile link.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Owner Note Validation
    if (owner_note.length > 2500) {
        alert("The owner note must not exceed 2500 characters.");
        submitPetFormButton.disabled = false;
        return false;
    }

    return true;
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
    imageError.textContent = "";

    // Check if a file is provided
    if (!file) return null;

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Please select a PNG, JPG, or GIF image");
        return null;
    }

    // Check file size (5 MB limit)
    const maxSizeInBytes = 25 * 1024 * 1024; // 5 MB in bytes
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
