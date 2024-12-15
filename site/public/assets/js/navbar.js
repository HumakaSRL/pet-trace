firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        // Show logout button and hide login button
        loginButton.style.display = "none";
        logoutButton.style.display = "block";

        // Check if user has a display name and set it
        if (user.displayName) {
            usernameNavbarSpan.textContent = `${user.displayName}!`;
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

    donateButton.addEventListener("click", (e) => {
        e.preventDefault();
        // Log event for donate button click
        firebase.analytics().logEvent("donate_button_click", {
            donationAction: "clicked",
        });

        // Redirect to the donation link
        window.open("https://donate.stripe.com/9AQ9COboD6Yi1C8005", "_blank");
    });

    navLogo.addEventListener("click", () => {
        window.location = "/";
    });

    usernameNavbarSpan.addEventListener("click", () => {
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
