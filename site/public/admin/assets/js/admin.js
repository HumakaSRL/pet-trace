// Listen to auth state changes
firebase.auth().onAuthStateChanged(async (user) => {
    const loginContainer = document.getElementById("loginContainer");
    const mainContent = document.getElementById("mainContent");

    if (user) {
        try {
            const snapshot = await firebase.database().ref(`users/${user.uid}/role`).once("value");
            const userRole = snapshot.val();

            if (userRole === "admin") {
                loginContainer.style.display = "none";
                mainContent.style.display = "flex";
            } else {
                alert("You are not authorized to access this page, the attempt has been recorded.");
            }
        } catch (error) {
            console.error("Error retrieving user role:", error);
            alert("An error occurred.");
        }
    } else {
        loginContainer.style.display = "flex";
        mainContent.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", handleLogin);

    initializeAdminNavigation();
    fetchDashboard();
});

async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const errorMessage = document.getElementById("loginErrorMessage");

    // Hide error message
    errorMessage.style.display = "none";

    // Get form data
    const email = form.loginEmail.value.trim();
    const password = form.loginPassword.value;

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        // No need to manually hide/show here because onAuthStateChanged will handle it
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = "block";
    }
}

function initializeAdminNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".admin-section");

    navItems.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.target;

            navItems.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            if (target) {
                sections.forEach((section) => {
                    section.style.display = section.id === target ? "flex" : "none";
                });
            } else if (button.classList.contains("logout-btn")) {
                firebase
                    .auth()
                    .signOut()
                    .then(() => location.reload())
                    .catch((error) => alert("Logout failed: " + error.message));
            }
        });
    });

    // Set dashboard as default active
    const defaultButton = document.querySelector(".nav-item[data-target='dashboard']");
    const defaultSection = document.getElementById("dashboard");
    if (defaultButton && defaultSection) {
        defaultButton.classList.add("active");
        sections.forEach((section) => {
            section.style.display = section.id === "dashboard" ? "flex" : "none";
        });
    }
}

async function fetchDashboard() {
    const totalUsersEl = document.getElementById("totalUsers");
    const totalPetOwnersEl = document.getElementById("totalPetOwners");
    const totalClinicsEl = document.getElementById("totalClinics");
    const totalMicrochipsEl = document.getElementById("totalMicrochips");
    const latestUserRegDateEl = document.getElementById("latestUserRegistrationDate");
    const latestUserRegTimeEl = document.getElementById("latestUserRegistrationTime");
    const latestMicrochipRegDateEl = document.getElementById("latestMicrochipRegistrationDate");
    const latestMicrochipRegTimeEl = document.getElementById("latestMicrochipRegistrationTime");

    try {
        // Fetch all users
        const usersSnapshot = await firebase.database().ref("users").once("value");
        const usersData = usersSnapshot.val() || {};

        let totalUsers = 0;
        let totalPetOwners = 0;
        let totalClinics = 0;

        // Track newest user registration timestamp
        let newestUserTimestamp = 0;

        // Iterate users
        Object.values(usersData).forEach((user) => {
            totalUsers++;
            if (user.role === "owner") totalPetOwners++;
            else if (user.role === "clinic") totalClinics++;

            if (user.created_at) {
                const createdAt = new Date(user.created_at).getTime();
                if (createdAt > newestUserTimestamp) {
                    newestUserTimestamp = createdAt;
                }
            }
        });

        // Update users stats in DOM
        totalUsersEl.textContent = totalUsers;
        totalPetOwnersEl.textContent = totalPetOwners;
        totalClinicsEl.textContent = totalClinics;

        if (newestUserTimestamp > 0) {
            const date = new Date(newestUserTimestamp);
            latestUserRegDateEl.textContent = date.toLocaleDateString();
            latestUserRegTimeEl.textContent = date.toLocaleTimeString();
        } else {
            latestUserRegDateEl.textContent = "-";
            latestUserRegTimeEl.textContent = "-";
        }

        // Fetch all microchips
        const chipsSnapshot = await firebase.database().ref("chips").once("value");
        const chipsData = chipsSnapshot.val() || {};

        let totalMicrochips = 0;
        let newestChipTimestamp = 0;

        Object.values(chipsData).forEach((chip) => {
            totalMicrochips++;
            if (chip.created_at) {
                const chipDate = new Date(chip.created_at).getTime();
                if (chipDate > newestChipTimestamp) {
                    newestChipTimestamp = chipDate;
                }
            }
        });

        totalMicrochipsEl.textContent = totalMicrochips;

        if (newestChipTimestamp > 0) {
            const chipDate = new Date(newestChipTimestamp);
            latestMicrochipRegDateEl.textContent = chipDate.toLocaleDateString();
            latestMicrochipRegTimeEl.textContent = chipDate.toLocaleTimeString();
        } else {
            latestMicrochipRegDateEl.textContent = "-";
            latestMicrochipRegTimeEl.textContent = "-";
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally show an error message to the user
    }
}
