/**
 * Detect Auth State Change
 */
firebase.auth().onAuthStateChanged(async (user) => {
    const authElements = document.querySelectorAll(".auth");
    const deauthElements = document.querySelectorAll(".deauth");
    if (user) {
        authElements.forEach((element) => {
            element.style.display = "inherit";
        });

        deauthElements.forEach((element) => {
            element.style.display = "none";
        });
    } else {
        authElements.forEach((element) => {
            element.style.display = "none";
        });

        deauthElements.forEach((element) => {
            element.style.display = "inherit";
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Logout event
    logoutButton.addEventListener("click", logout);
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
