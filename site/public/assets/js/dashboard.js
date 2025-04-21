let currentUserUid = null;
let currentUser = null;
let petCount = 0;

// Wait for authentication
const authReady = new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUserUid = user.uid; // Store the UID
            currentUser = user; // Store the user object
            mainContent.style.display = "flex";
            resolve(); // Resolve when authentication is ready
        } else window.location = "/login.html";
    });
});

// Wait for DOM content to load
const domReady = new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => {
        resolve(); // Resolve when DOM is ready
    });
});

// Fetch user pets only when both conditions are met
Promise.all([authReady, domReady]).then(() => {
    // console.log("Both authentication and DOM are ready. Fetching user pets...");
    fetchUserPets();
});

async function fetchUserPets() {
    const petsRef = firebase.database().ref(`users/${currentUserUid}/pets`);
    petCount = 0; // reset count if this runs more than once

    try {
        const snapshot = await petsRef.once("value");
        const userPets = snapshot.val();

        if (userPets) {
            for (const chip of Object.keys(userPets)) {
                petCount++;
                const chipId = userPets[chip];
                const chipDataRef = firebase.database().ref(`chips/${chipId}`);
                const chipDataSnapshot = await chipDataRef.once("value");
                const chipData = chipDataSnapshot.val();

                if (chipData) {
                    renderPetCard(chipData);
                } else {
                    console.log("Pet data not found for chip:", chipId);
                }
            }
        } else {
            document.getElementById("noPetsMessage").style.display = "block";
        }

        const maxPetsRef = firebase.database().ref(`users/${currentUserUid}/max_pets`);
        const maxPetsSnapshot = await maxPetsRef.once("value");
        let maxPets = maxPetsSnapshot.val();

        if (!maxPets) {
            maxPets = 5;
            await maxPetsRef.set(maxPets);
        }

        if (petCount < maxPets && currentUser.emailVerified) {
            addPetButton.addEventListener("click", () => {
                window.location = "register-microchip.html";
            });
            addPetButton.disabled = false;
            addPetButton.style.filter = "none";
        } else if (!currentUser.emailVerified) {
            emailVerificationError.style.display = "block";
        }

        if (petCount >= maxPets) petCountSpan.style.color = "var(--error-color)";

        petCountSpan.textContent = `${petCount}/${maxPets}`;
    } catch (error) {
        console.error("Error fetching pets data:", error);
    }
}

function renderPetCard(petData) {
    const petsContainer = document.getElementById("petsContainer");
    const petCard = document.createElement("div");
    petCard.className = "pet-card";

    // Destructure required fields for clarity
    const { chip_id, image_url, pet_info } = petData;
    const { pet_species, pet_breed, pet_city, pet_country, pet_name } = pet_info;

    // Create the content for the pet card
    petCard.innerHTML = `
        <img src="${image_url}" alt="${pet_name}" class="pet-image" />
        <div class="pet-card-content">
            <h3 class="pet-name">${capitalizeFirstLetters(pet_name)}</h3>
            <p class="pet-type">${capitalizeFirstLetters(pet_breed)} ${capitalizeFirstLetters(
        pet_species
    )}</p>
            <p class="pet-location">${capitalizeFirstLetters(pet_city)}, ${capitalizeFirstLetters(
        pet_country
    )}</p>
        </div>
    `;

    // Create the "View" button
    const viewButton = document.createElement("button");
    viewButton.className = "view-pet-button";
    viewButton.textContent = "View";

    // Append the button inside the .pet-card-content div
    const contentDiv = petCard.querySelector(".pet-card-content");
    contentDiv.appendChild(viewButton);

    // Optionally, add a click event to the button
    viewButton.addEventListener("click", () => {
        window.location = `view.html?chip=${chip_id}`;
    });

    // Append the pet card to the pets container
    petsContainer.appendChild(petCard);
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
