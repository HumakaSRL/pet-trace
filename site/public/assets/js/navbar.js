firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Show logout button and hide login button
        loginButton.style.display = "none";
        logoutButton.style.display = "block";

        // Check if user has a display name and set it
        if (user.displayName) {
            usernameNavbarSpan.textContent = user.displayName;
            userGreeting.style.display = "flex"; // Show greeting message
        }
    } else {
        // Show login button and hide logout button
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    logoutButton.addEventListener("click", logout);
    loginButton.addEventListener("click", () => {
        window.location = "/login.html";
    });
});

function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            location.reload(); // Reload the page after sign out
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
}
