// Make sure these elements exist in your HTML
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const dashboardButton = document.getElementById("dashboardButton");
const navLogo = document.getElementById("navLogo");
const userGreeting = document.getElementById("userGreeting");
const usernameNavbarSpan = document.getElementById("usernameNavbarSpan");

/**
 * Detect Auth State Change
 */
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Hide Login button, Show Logout + Dashboard buttons
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
        dashboardButton.style.display = "block";

        // Check if user has a display name and set it
        if (user.displayName) {
            usernameNavbarSpan.textContent = `${user.displayName}!`;
            userGreeting.style.display = "flex"; // Show greeting message
        }
    } else {
        // Hide Logout + Dashboard buttons, Show Login button
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
        dashboardButton.style.display = "none";
        userGreeting.style.display = "none";
    }
});

/**
 * Once the DOM is loaded, set up event listeners
 */
document.addEventListener("DOMContentLoaded", () => {
    // Logout event
    logoutButton.addEventListener("click", logout);

    // Login event
    loginButton.addEventListener("click", () => {
        window.location = "/login.html";
    });

    // Logo click -> Go to homepage
    navLogo.addEventListener("click", () => {
        window.location = "/";
    });

    // Username click -> Dashboard
    usernameNavbarSpan.addEventListener("click", () => {
        window.location = "/dashboard.html";
    });

    // Dashboard button click -> Dashboard
    dashboardButton.addEventListener("click", () => {
        window.location = "/dashboard.html";
    });
});

function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            window.location = "/";
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
}
