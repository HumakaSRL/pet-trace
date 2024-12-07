firebase.auth().onAuthStateChanged(async (user) => {
    if (user) window.location = "/dashboard.html";
});

document.addEventListener("DOMContentLoaded", () => {
    forgotPasswordLink.addEventListener("click", resetPassword);

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearErrorMessages();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic client-side validation
        if (!email || !password) {
            alert("Please fill in both fields.");
            return;
        }

        // Show loading state (optional)
        loginUserButton.textContent = "Logging in...";
        loginUserButton.disabled = true;

        // Firebase Authentication: Sign In
        firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = "/dashboard.html"; // Adjust this to your landing page
            })
            .catch((error) => {
                // Handle Errors
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Error code:", errorCode);
                console.error("Error message:", errorMessage);

                // Show user-friendly error messages
                alert("Failed to login. Please check your credentials and try again.");
            })
            .finally(() => {
                // Reset the button state after login attempt
                loginUserButton.textContent = "Login";
                loginUserButton.disabled = false;
            });
    });
});

function resetPassword() {
    const email = emailInput.value.trim();
    if (checkEmail(email)) {
        clearErrorMessages();
        sendPasswordResetEmail(email);
    } else displayErrorMessage("emailError", "Please enter a valid email");
}

function checkEmail(email) {
    if (checkEmailList(email) && checkEmailRegex(email)) return true;
    return false;
}

function checkEmailList(email) {
    email = email.trim().toLowerCase();

    // List of supported email domains
    const supportedDomains = [
        "@gmail.com",
        "@hotmail.com",
        "@yahoo.com",
        "@icloud.com",
        "@outlook.com",
        "@live.com",
        "@aol.com",
        "@protonmail.com",
        "@mail.com",
        "@zoho.com",
        "@gmx.com",
        "@yandex.com",
        "@qq.com",
        "@naver.com",
        "@daum.net",
        "@web.de",
        "@libero.it",
        "@orange.fr",
        "@t-online.de",
        "@mail.ru",
        "@rediffmail.com",
    ];

    console.warn(
        "email domain: ",
        supportedDomains.some((domain) => email.endsWith(domain))
    );

    // Check if the email ends with any supported domain
    return supportedDomains.some((domain) => email.endsWith(domain));
}

function checkEmailRegex(email) {
    // Validate Email
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.warn("email regex: ", emailRegex.test(email));
    return emailRegex.test(email);
}

function displayErrorMessage(element, errorMessage) {
    const errorElement = document.getElementById(element);
    try {
        errorElement.textContent = errorMessage;
        errorElement.style.display = "block";
    } catch (e) {
        console.error(e);
        errorElement.textContent = "An unexpected error occurred.";
        errorElement.style.display = "block"; // Make it visible if error occurs
    }
}

function clearErrorMessages() {
    let emailError = document.getElementById("emailError");
    let passwordError = document.getElementById("passwordError");
    emailError.style.display = "none";
    emailError.textContent = "";
    passwordError.style.display = "none";
    passwordError.textContent = "";
}

function sendPasswordResetEmail(email) {
    // Ensure the email is not empty
    if (!email) {
        console.error("No email is provided.");
        return;
    }

    // Send password reset email using Firebase Authentication
    firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => {
            displayErrorMessage("emailError", "A password reset link was sent to your email.");
        })
        .catch((error) => {
            // Handle errors here
            var errorCode = error.code;
            var errorMessage = error.message;

            // Handle common Firebase Auth errors:
            if (errorCode === "auth/invalid-email") {
                displayErrorMessage("emailError", "The email address is invalid.");
                console.error("auth/invalid-email: ", errorMessage);
            } else if (errorCode === "auth/user-not-found") {
                console.error("auth/user-not-found: ", errorMessage);
                displayErrorMessage("emailError", "No user found with this email.");
            } else if (errorCode === "auth/too-many-requests") {
                console.error("auth/too-many-requests: ", errorMessage);
                displayErrorMessage(
                    "emailError",
                    "Hold on! A password reset link was already sent, please check your inbox!"
                );
                forgotPasswordDiv.innerHTML = "";
                forgotPasswordDiv.style.display = "none";
            } else {
                displayErrorMessage(
                    "emailError",
                    "An unknown error occurred, please try again later."
                );
                console.error("Error: " + errorMessage);
            }
        });
}
