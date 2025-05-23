let currentUserUid = null;
let petCount = 0;
let maxPets;

// Check if a user is authenticated and store their UID
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        if (!user.emailVerified) window.location = "/email-verification.html";
        currentUserUid = user.uid;
        if (await hasAvailablePetSlot()) {
            mainContent.style.display = "block";
            // Extract the "chip" parameter from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const chipId = urlParams.get("chip");
            if (chipId) microchipIdInput.value = chipId.toLocaleUpperCase();
        } else {
            alert(`You can't register more than ${maxPets} pets at this moment`);
            window.location = "dashboard.html";
        }
    } else window.location = "login.html";
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
        if (await checkPetData()) {
            try {
                // Get pet data from the form
                const chipData = await constructPetData(currentUserUid);

                // Check if the pet image is valid
                const petImageFile = petImageInput.files[0];
                if (!petImageFile) {
                    alert("Please upload a picture of your pet");
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

                // Check image format and store it into a variable (to use it as a file extension)
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

                // console.log("Chip data: ", chipData); //! RBI
                // console.log("New chip ID:", chipKey); //! RBI
            } catch (error) {
                console.error("Error saving pet data:", error);
                alert("There was an error saving the pet data. Please try again later.");
            }
        }
    });
});

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
    const owner_note = ownerNoteInput.value.trim();

    // Convert all letters in chip_id to lowercase, while keeping numbers intact
    chip_id = chip_id.replace(/[a-zA-Z]/g, (match) => match.toLowerCase());

    // Organize the chip data into an object
    const chip_data = {
        chip_id: chip_id,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        last_update: firebase.database.ServerValue.TIMESTAMP,
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
            owner_phone_number: owner_phone_number,
            owner_email: owner_email,
            owner_note: owner_note,
        },
    };

    return chip_data;
}

// Validation logic for pet data form
async function checkPetData() {
    if (await !hasAvailablePetSlot()) {
        alert(`You can't register more than ${maxPets} pets at this moment`);
        return false;
    }

    const chip_id = microchipIdInput.value.trim().toLowerCase();
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
    const owner_note = ownerNoteInput.value.trim();

    // Chip ID Validation
    if (!/^[a-z0-9]{9,15}$/.test(chip_id)) {
        alert("The chip ID must be 9-15 characters long and contain only letters and numbers.");
        submitPetFormButton.disabled = false;
        return false;
    } else if (await checkIfExists(chip_id)) {
        alert("The chip ID is already registered in our database.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Pet Name Validation
    if (!/^[a-zA-Z\s]+$/.test(pet_name) || pet_name.length < 2 || pet_name.length > 25) {
        alert("Please enter a valid name for your pet! Names can only contain letters and spaces.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Date of Birth Validation
    if (pet_dob) {
        const petDob = new Date(pet_dob); // Parse the date input
        const currentDate = new Date();

        if (isNaN(petDob)) {
            alert("Invalid date of birth. Please enter a valid date!");
            submitPetFormButton.disabled = false;
            return false;
        }

        const ageInYears = (currentDate - petDob) / (1000 * 60 * 60 * 24 * 365.25);

        if (ageInYears > 40 || petDob > currentDate) {
            alert(
                ageInYears > 40
                    ? "Your pet cannot be older than 40 years old. Please check the date of birth!"
                    : "Your pet cannot be born in the future. Please check the date of birth!"
            );
            submitPetFormButton.disabled = false;
            return false;
        }
    }

    // Species Validation
    if (!pet_species) {
        alert("Please choose your pet species!");
        submitPetFormButton.disabled = false;
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
    if (!/^[\p{L} ]+$/u.test(pet_city) || pet_city.length < 3 || pet_city.length > 25) {
        alert(
            "Please enter a valid city name. Only letters and spaces are allowed, and the length must be between 3 and 25 characters."
        );
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
    if (!/^[a-zA-Z\s]+$/.test(owner_name) || owner_name.length < 3 || owner_name.length > 25) {
        alert(
            "Please enter a valid owner's name. Only letters and spaces are allowed, and the length must be between 3 and 25 characters."
        );
        submitPetFormButton.disabled = false;
        return false;
    }

    // Phone Number Validation
    if (!/^\+\d{10,15}$/.test(owner_phone_number)) {
        alert(
            "Invalid phone number. It must start with '+' followed by 10 to 15 digits (e.g., +123456789)."
        );
        submitPetFormButton.disabled = false;
        return false;
    }

    // Email Validation
    if (!/^[a-zA-Z0-9.\-]{3,30}@[a-zA-Z0-9.\-]{3,20}\.[a-zA-Z]{2,4}$/.test(owner_email)) {
        alert("Please enter a valid email address.");
        submitPetFormButton.disabled = false;
        return false;
    }

    // Owner Note Validation
    if (owner_note.length > 2000) {
        alert("The owner note must not exceed 2000 characters.");
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

    // Check file size (25 MB limit)
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

async function hasAvailablePetSlot() {
    const petsRef = firebase.database().ref(`users/${currentUserUid}/pets`);
    const maxPetsRef = firebase.database().ref(`users/${currentUserUid}/max_pets`);

    try {
        // Fetch user's pets
        const petsSnapshot = await petsRef.once("value");
        const userPets = petsSnapshot.val();

        // Count pets
        petCount = 0;
        if (userPets) {
            for (const pet in userPets) {
                if (userPets.hasOwnProperty(pet)) petCount++;
            }
        }

        // Fetch max allowed pets
        const maxPetsSnapshot = await maxPetsRef.once("value");
        maxPets = maxPetsSnapshot.val();

        // If maxPets is not set, assume default of 5
        if (!maxPets) {
            maxPets = 5;
            await maxPetsRef.set(maxPets);
        }

        return petCount < maxPets;
    } catch (error) {
        console.error("Error counting pets:", error);
        return false; // fallback
    }
}

async function checkIfExists(chipId) {
    try {
        const snapshot = await firebase
            .database()
            .ref("chips")
            .orderByChild("chip_id")
            .equalTo(chipId.toLowerCase())
            .once("value");

        if (snapshot.exists()) return true;
        else return false;
    } catch (error) {
        console.error("Error fetching data: ", error);
        alert("An error occurred while checking the chip data. Please try again later.");
        return null;
    }
}
