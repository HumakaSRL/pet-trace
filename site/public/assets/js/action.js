document.addEventListener("DOMContentLoaded", () => {
    password.addEventListener("focus", () => {
        updatePasswordValidationMessages();
        document.getElementById("errorPassword").style.display = "inline-block";
    });

    password.addEventListener("blur", () => {
        document.getElementById("errorPassword").style.display = "none";
    });
    password.addEventListener("input", () => {
        updatePasswordValidationMessages();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    const actionCode = urlParams.get("oobCode");
    const continueUrl = urlParams.get("continueUrl");

    // if (mode == null && oobCode == null) window.location.href = "../404.html";

    if (mode === "verifyAndChangeEmail" && actionCode) {
        verifyAndChangeEmail(actionCode);
        if (continueUrl) {
            // Wait for 5 seconds before redirecting
            setTimeout(() => {
                window.location = continueUrl;
            }, 5000); // 5000 milliseconds = 5 seconds
        }
    }

    if (mode === "verifyEmail" && actionCode) {
        verificationStatus.textContent = "Verifying your email, please wait...";
        verifyEmail(actionCode);
        if (continueUrl) {
            // Wait for 5 seconds before redirecting
            setTimeout(() => {
                window.location = continueUrl;
            }, 5000); // 5000 milliseconds = 5 seconds
        }
    }

    // Add the following condition to handle email recovery
    if (mode === "recoverEmail" && actionCode) {
        recoverEmail(actionCode);
        if (continueUrl) {
            // Wait for 5 seconds before redirecting
            setTimeout(() => {
                window.location = continueUrl;
            }, 5000); // 5000 milliseconds = 5 seconds
        }
    }

    if (mode === "resetPassword" && actionCode) {
        passwordResetForm.style.display = "block";
    }
    passwordResetForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validatePassword()) {
            const newPassword = document.getElementById("password").value;
            firebase
                .auth()
                .confirmPasswordReset(actionCode, newPassword)
                .then(() => {
                    // Update the UI to show success message
                    passwordResetForm.style.display = "none";
                    document.getElementById("message").textContent =
                        "Your password has been reset successfully. You can now log in with your new password.";
                    if (continueUrl) {
                        // Wait for 5 seconds before redirecting
                        setTimeout(() => {
                            window.location = continueUrl;
                        }, 5000); // 5000 milliseconds = 5 seconds
                    }
                })
                .catch((error) => {
                    // Handle errors here, such as expired or invalid action code
                    message.textContent =
                        "This reset link is no longer valid, please request a new one.";
                    passwordResetForm.style.display = "none";
                    // console.error("Error resetting password:", error);
                });
        }
    });
});

function recoverEmail(actionCode) {
    firebase
        .auth()
        .applyActionCode(actionCode)
        .then(() => {
            // Email recovered successfully
            message.textContent =
                "Your email has been successfully updated, you can now login with your new email.";
        })
        .catch((error) => {
            // Handle errors here
            message.textContent = "Failed to update email. Please try again or contact support.";
        });
}

function verifyEmail(actionCode) {
    // Apply action code to verify email
    firebase
        .auth()
        .applyActionCode(actionCode)
        .then(() => {
            displayVerificationSuccessMessage();
        })
        .then(() => {
            sendNotification();
        })
        .catch((error) => {
            displayVerificationErrorMessage(error);
        });
}

function displayVerificationSuccessMessage() {
    const verificationStatus = document.getElementById("verificationStatus");
    verificationStatus.textContent = "Your email has been successfully verified. ";
    const clickHereLink = document.createElement("a");
    clickHereLink.textContent = "Click here";
    clickHereLink.href = "index.html";
    verificationStatus.appendChild(clickHereLink);
    verificationStatus.appendChild(document.createTextNode(" to continue."));
}

function sendNotification() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("User not logged in");
        return;
    }

    const timestamp = firebase.database.ServerValue.TIMESTAMP;
    const notificationData = {
        new: true,
        timestamp: timestamp,
        message: "Your email has been successfully verified.",
        type: "email verification",
        actionURL: "",
    };

    firebase.database().ref(`users/${userId}/notifications`).push().set(notificationData);
}

function displayVerificationErrorMessage(error) {
    const verificationStatus = document.getElementById("verificationStatus");
    verificationStatus.textContent =
        "Failed to verify email. Please try the verification link again or request a new one. ";
    console.error(error);
}

function validatePassword() {
    // Password Validation
    if (checkPasswordStrength(password.value)) {
        errorPassword.style.display = "inline-block";
        if (password.value === confirmPassword.value) return true;
        else passwordErrorMessage.textContent = "Passwords do not match";
    }
    return false;
}

function verifyAndChangeEmail(oobCode) {
    // Verify and change email using the oobCode
    firebase
        .auth()
        .applyActionCode(oobCode)
        .then(() => {
            message.textContent =
                "Email updated successfully, you can now login with your new email.";
        })
        .catch((error) => {
            // Handle error verifying email
            console.log(error);
            message.textContent = "Error updating Email, please try again.";
        });
}

function updatePasswordValidationMessages() {
    // Get the current password value
    const currentPassword = password.value;

    // Check if the password contains a lowercase letter, an uppercase letter, and a number
    const hasCapitalLetter = /[A-Z]/.test(currentPassword);
    const hasSmallLetter = /[a-z]/.test(currentPassword);
    const hasNumber = /\d/.test(currentPassword);

    // Check if the password has at least 6 characters
    const hasMinLength = currentPassword.length >= 6;

    // Get the elements for each message
    const lowercaseElement = document.getElementById("lowercase-message");
    const uppercaseElement = document.getElementById("uppercase-message");
    const numberElement = document.getElementById("number-message");
    const lengthElement = document.getElementById("length-message");

    // Update the classes and content of each message
    lowercaseElement.innerHTML = hasSmallLetter
        ? `<i class='fa-solid fa-circle-check green'></i> <span class="text">Lowercase letters</span>`
        : `<i class='fa-solid fa-circle-xmark red'></i> <span class="text">Lowercase letters</span>`;
    lowercaseElement.className = hasSmallLetter ? "password-ok" : "password-error";

    uppercaseElement.innerHTML = hasCapitalLetter
        ? `<i class='fa-solid fa-circle-check green'></i> <span class="text">Uppercase letters</span>`
        : `<i class='fa-solid fa-circle-xmark red'></i> <span class="text">Uppercase letters</span>`;
    uppercaseElement.className = hasCapitalLetter ? "password-ok" : "password-error";

    numberElement.innerHTML = hasNumber
        ? `<i class='fa-solid fa-circle-check green'></i> <span class="text">Numbers</span>`
        : `<i class='fa-solid fa-circle-xmark red'></i> <span class="text">Numbers</span>`;
    numberElement.className = hasNumber ? "password-ok" : "password-error";

    lengthElement.innerHTML = hasMinLength
        ? `<i class='fa-solid fa-circle-check green'></i> <span class="text">6 characters</span>`
        : `<i class='fa-solid fa-circle-xmark red'></i> <span class="text">6 characters</span>`;
    lengthElement.className = hasMinLength ? "password-ok" : "password-error";
}

function checkPasswordStrength(password) {
    const hasCapitalLetter = /[A-Z]/.test(password);
    const hasSmallLetter = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasCapitalLetter && hasSmallLetter && hasNumber;
}
