let currentUserUid = null;
let currentUser = null;
let petCount = 0;
const MAX_PETS = 5;

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
    // Get the reference to the pets in the user's account
    const petsRef = firebase.database().ref(`users/${currentUserUid}/pets`);

    try {
        const snapshot = await petsRef.once("value");
        const userPets = snapshot.val();

        if (userPets) {
            // Loop over the pets and render the pet cards
            for (const chip in userPets) {
                if (userPets.hasOwnProperty(chip)) {
                    petCount++;
                    const chipId = userPets[chip];

                    // Now get the detailed pet data from the 'chips/{chipId}' path
                    const chipDataRef = firebase.database().ref(`chips/${chipId}`);
                    const chipDataSnapshot = await chipDataRef.once("value");
                    const chipData = chipDataSnapshot.val();

                    if (chipData) {
                        // console.log(chipData);
                        renderPetCard(chipData);
                    } else console.log("no pets");
                }
            }
        } else {
            // console.log("No pets registered.");
            // Optionally, show a message if there are no pets
            const noPetsMessage = document.getElementById("noPetsMessage");
            noPetsMessage.style.display = "block";
        }
        if (petCount < MAX_PETS && currentUser.emailVerified) {
            registerPetButton.addEventListener("click", () => {
                window.location = "register-microchip.html";
            });
            registerPetButton.disabled = false;
            registerPetButton.style.filter = "none";
        } else if (!currentUser.emailVerified) emailVerificationError.style.display = "block";

        petCountSpan.textContent = `${petCount}/${MAX_PETS}`;
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
    const { pet_name } = pet_info;

    // Create the content for the pet card
    petCard.innerHTML = `
        <img src="${image_url}" alt="${pet_name}" class="pet-image" />
        <h3>${capitalizeFirstLetters(pet_name)}</h3>
        <p>Chip ID: ${chip_id}</p>
    `;

    // Create the "View" button
    const viewButton = document.createElement("button");
    viewButton.className = "view-pet-button";
    viewButton.textContent = "View";

    // Append the button to the pet card
    petCard.appendChild(viewButton);

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
