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
                fetchAdminPanel(user);
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

function fetchAdminPanel(user) {
    document.getElementById("welcomeUserName").textContent = user.displayName;
    fetchDashboard();
    fetchUsers();
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".role-filter").forEach((cb) => {
        cb.addEventListener("change", applyRoleFilter);
    });

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", handleLogin);

    document.getElementById("refreshDashboard").addEventListener("click", refreshDashboardStats);

    initializeAdminNavigation();
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
        fetchAdminPanel();

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

function refreshDashboardStats() {
    rotateRefreshIcon();
    fetchDashboard();
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
    const unreadMessagesEl = document.getElementById("unreadMessages");

    totalUsersEl.textContent = "-";
    totalPetOwnersEl.textContent = "-";
    totalClinicsEl.textContent = "-";
    totalMicrochipsEl.textContent = "-";
    latestUserRegDateEl.textContent = "-";
    latestUserRegTimeEl.textContent = "-";
    latestMicrochipRegDateEl.textContent = "-";
    latestMicrochipRegTimeEl.textContent = "-";
    unreadMessagesEl.textContent = "-";

    try {
        // Fetch all users
        const usersSnapshot = await firebase.database().ref("users").once("value");
        const usersData = usersSnapshot.val() || {};

        let totalUsers = 0;
        let totalPetOwners = 0;
        let totalClinics = 0;
        let newestUserTimestamp = 0;

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

        totalUsersEl.textContent = totalUsers;
        totalPetOwnersEl.textContent = totalPetOwners;
        totalClinicsEl.textContent = totalClinics;

        if (newestUserTimestamp > 0) {
            const date = new Date(newestUserTimestamp);
            latestUserRegDateEl.textContent = date.toLocaleDateString();
            latestUserRegTimeEl.textContent = date.toLocaleTimeString();
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
        }

        // Fetch messages and count unread
        const messagesSnapshot = await firebase.database().ref("messages").once("value");
        const messagesData = messagesSnapshot.val() || {};

        let unreadCount = 0;

        Object.values(messagesData).forEach((msg) => {
            if (msg.new === true || msg.new === "true") {
                unreadCount++;
            }
        });

        unreadMessagesEl.textContent = unreadCount;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

function rotateRefreshIcon() {
    const refreshIcon = document.querySelector("#refreshDashboard img");
    refreshIcon.classList.remove("rotate");
    void refreshIcon.offsetWidth; // Trigger reflow to restart animation
    refreshIcon.classList.add("rotate");
}

async function fetchUsers() {
    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = ""; // Clear current content

    try {
        const snapshot = await firebase
            .database()
            .ref("users")
            .orderByKey()
            .limitToFirst(1000)
            .once("value");

        const usersData = snapshot.val() || {};

        const sortedUsers = Object.entries(usersData).sort(([, a], [, b]) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA; // Newest first
        });

        sortedUsers.forEach(([uid, user]) => {
            const registrationDate = formatDate(user.created_at);

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.username || "N/A"}</td>
                <td>${user.email || "N/A"}</td>
                <td>${user.max_pets !== undefined ? user.max_pets : "-"}</td>
                <td>${user.role || "-"}</td>
                <td>${registrationDate}</td>
                <td>
                    <button class="user-btn-view" data-uid="${uid}">View</button>
                    <button class="user-btn-edit" data-uid="${uid}">Edit</button>
                </td>
            `;

            row.setAttribute("data-role", user.role || "-");

            userTableBody.appendChild(row);
        });

        attachUserActionEvents();
    } catch (error) {
        console.error("Failed to fetch users:", error);
        alert("Failed to load user data.");
    }
}

function attachUserActionEvents() {
    document.querySelectorAll(".user-btn-view").forEach((btn) => {
        btn.addEventListener("click", () => {
            const uid = btn.dataset.uid;
            // Add your view logic here
            alert("Viewing user: " + uid);
        });
    });

    document.querySelectorAll(".user-btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
            const uid = btn.dataset.uid;
            // Add your edit logic here
            alert("Editing user: " + uid);
        });
    });
}

function formatDate(timestamp) {
    if (!timestamp) return "-";
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

function applyRoleFilter() {
    const selectedRoles = Array.from(document.querySelectorAll(".role-filter:checked")).map(
        (cb) => cb.value
    );

    const allRows = document.querySelectorAll("#userTableBody tr");

    allRows.forEach((row) => {
        const role = row.getAttribute("data-role");
        row.style.display = selectedRoles.includes(role) ? "table-row" : "none";
    });
}
