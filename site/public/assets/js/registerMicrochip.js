let currentUserUid = null;

document.addEventListener("DOMContentLoaded", () => {
    submitPetFormButton.addEventListener("click", async (e) => {
        e.preventDefault();

        // Check if the user is authenticated
        if (!currentUserUid) {
            console.error("User not authenticated. Please log in.");
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
                    return;
                }

                // Validate and compress the image file
                const validatedFile = checkImage(petImageFile);
                if (!validatedFile) {
                    console.error("Invalid image file.");
                    alert("Please select a valid image file (JPG, PNG, or GIF).");
                    return;
                }

                // Compress the image before uploading
                const compressedFile = await compressImage(validatedFile);

                // Create a new entry in the "chips" node and get the key
                const newChipRef = await firebase.database().ref("chips").push();
                const newChipKey = newChipRef.key; // Get the generated key

                // Save the pet data in the "chips" node
                await newChipRef.set(chipData);

                // Upload the compressed image to Firebase Storage
                const imageFilePath = `pet_images/${newChipKey}/pet_image_${Date.now()}.jpg`; //! check here image format
                await uploadFileToStorage(compressedFile, imageFilePath);

                // Add the chip ID directly to the user's pets (no extra keys generated)
                const userPetsRef = firebase.database().ref(`users/${currentUserUid}/pets`);
                userPetsRef.push(newChipKey);

                // Display success message
                showSuccessMessage("Pet data has been saved successfully!", newChipKey);

                console.log("Chip data: ", chipData); //! RBI
                console.log("New chip ID:", newChipKey); //! RBI
            } catch (error) {
                console.error("Error saving pet data:", error);
                alert("There was an error saving the pet data. Please try again later.");
            }
        }
    });
});

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
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
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
        window.location.href = `/pet.html?chip=${chipId}`;
    };
    successPopup.appendChild(viewPetButton);

    overlay.appendChild(successPopup);
    document.body.appendChild(overlay);
}

// Function to construct the pet data object
async function constructPetData(userUid) {
    // Get the data from the input fields
    let chip_id = microchipIdInput.value.trim();
    let pet_name = petNameInput.value.trim();
    const pet_dob = petDobInput.value;
    const pet_species = animalSpeciesInput.value;
    let pet_breed = breedInput.value.trim();
    const pet_country = countrySelect.value;
    let pet_city = cityInput.value.trim();
    const pet_status = statusSelect.value;
    let owner_name = ownerNameInput.value.trim();
    const owner_phone_country_code = countryCodeInput.value.trim();
    const owner_phone_number = phoneNumberInput.value.trim();
    let owner_email = ownerEmailInput.value.trim();
    let owner_facebook = ownerFacebookInput.value.trim();
    let owner_instagram = ownerInstagramInput.value.trim();
    const owner_note = ownerNoteInput.value.trim();

    // Capitalize the first letter of each word for certain fields
    pet_name = capitalizeWords(pet_name);
    pet_breed = capitalizeWords(pet_breed);
    pet_city = capitalizeWords(pet_city);
    owner_name = capitalizeWords(owner_name);

    // Make email, facebook, and instagram lowercase
    owner_email = owner_email.toLowerCase();
    owner_facebook = owner_facebook.toLowerCase();
    owner_instagram = owner_instagram.toLowerCase();

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

// Validation logic for pet data form
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

    // Chip ID Validation
    if (!/^\d{9,15}$/.test(chip_id)) {
        alert("The chip ID must be 9-15 digits long.");
        return false;
    }

    // Pet Name Validation
    if (pet_name.length < 2 || pet_name.length > 25 || /\d/.test(pet_name)) {
        alert("Please enter a valid name for your pet! Names cannot contain numbers.");
        return false;
    }

    // Date of Birth Validation
    const pet_dob_year = new Date(pet_dob).getFullYear();
    if (pet_dob_year < 1980) {
        alert("Your pet cannot be older than 40 years old. Please check the date of birth!");
        return false;
    }
    if (pet_dob_year > new Date().getFullYear()) {
        alert("Your pet cannot be born in the future. Please check the date of birth!");
        return false;
    }

    // Species Validation
    if (!pet_species) {
        alert("Please choose your pet species!");
        return false;
    }

    // Pet Breed Validation
    if (pet_breed && (pet_breed.length < 4 || pet_breed.length > 25)) {
        alert("Please enter a valid pet breed.");
        return false;
    }

    // Country Validation
    if (!pet_country) {
        alert("Please select your pet's current country.");
        return false;
    }

    // City Validation
    if (pet_city.length < 2 || pet_city.length > 50) {
        alert("Please enter a valid city name.");
        return false;
    }

    // Pet Status Validation
    if (!pet_status) {
        alert("Please select the pet's current status.");
        return false;
    }

    // Owner Name Validation
    if (owner_name.length < 2 || owner_name.length > 50) {
        alert("Please enter a valid owner's name.");
        return false;
    }

    // Phone Number Validation
    if (!/^\d+$/.test(owner_phone_country_code)) {
        alert("Please enter a valid country code.");
        return false;
    }
    if (!isValidPhoneNumber(owner_phone_number)) {
        alert("Please enter a valid phone number.");
        return false;
    }

    // Email Validation
    if (!owner_email || !isValidEmail(owner_email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Social Media Links Validation
    if (owner_facebook && owner_facebook.length < 5) {
        alert("Please enter a valid Facebook profile link.");
        return false;
    }
    if (owner_instagram && owner_instagram.length < 5) {
        alert("Please enter a valid Instagram profile link.");
        return false;
    }

    // Owner Note Validation
    if (owner_note.length > 2500) {
        alert("The owner note must not exceed 2500 characters.");
        return false;
    }

    return true;
}

function compressImage(imageFile) {
    return new Promise((resolve, reject) => {
        const maxWidth = 200;
        const quality = 0.98;

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

// // Add click event listener to the profile photo
// profilePhoto.addEventListener("click", () => imageFile.click());

// // Add change event listener to the file input
// imageFile.addEventListener("change", (event) => {
//     /*
//     If the user choses multiple files, it only selects the first one,
//     it doesn't get all the images don't worry, thats why we use [0] here,
//     is to get the first file in the "array" if there is an "array" of files.
//     */
//     const file = event.target.files[0];
//     if (file) {
//         imageError.textContent = "";
//         const preparedFile = checkImage(file);
//         if (preparedFile) {
//             // File is prepared, you can show the upload button
//             uploadImageButton.style.display = "block";
//             imageError.textContent = `Selected file: ${file.name}`;
//         }
//     } else {
//         // No file selected, hide the upload button
//         uploadImageButton.style.display = "none";
//         imageError.textContent = "";
//     }
// });

// // Add click event listener to the upload overlay on the picture
// uploadImageButton.addEventListener("click", async () => {
//     const file = imageFile.files[0];
//     if (file) {
//         const preparedFile = checkImage(file);
//         const compressedFile = await compressImage(preparedFile);
//         if (preparedFile) {
//             // Handle file upload using preparedFile...
//             uploadImageButton.style.display = "none";
//             const filePath = `user_data/${currentUser.uid}/profile_picture`;
//             // Upload the file to Firebase Storage
//             uploadFileToStorage(compressedFile, filePath);
//         }
//     }
// });

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

// function uploadFileToStorage(file, filePath) {
//     const storageRef = firebase.storage().ref();
//     const uploadTask = storageRef.child(filePath).put(file);

//     // Add a listener to the upload task to track its completion
//     uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//             const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             imageError.textContent = `Uploading ${Math.round(progress)}%`;
//         },
//         (error) => {
//             // Handle upload errors
//             (imageError.textContent = "Upload failed"), error;
//         },
//         async () => {
//             try {
//                 // Get the download URL for the uploaded file
//                 const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

//                 // Update the photoURL in the user's profile
//                 const user = firebase.auth().currentUser;
//                 await user.updateProfile({
//                     photoURL: downloadURL,
//                 });

//                 // Update successful, reload the page or perform other actions
//                 updateProfilePictureUI();
//             } catch (error) {
//                 // Handle errors updating the user profile
//                 console.error("Error updating user profile:", error);
//                 imageError.textContent = "Error updating user profile";
//             }
//         }
//     );
// }
