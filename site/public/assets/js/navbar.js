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

        // Check if user has a display name and set it
        if (user.displayName) {
            usernameNavbarSpan.textContent = user.displayName;
            userGreeting.style.display = "inherit";
        }
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
    // Logout Icon
    logoutMobileDiv.addEventListener("click", logout);

    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest("nav")) {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        });
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
