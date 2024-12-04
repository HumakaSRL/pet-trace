document.addEventListener("DOMContentLoaded", () => {
    registerButton.addEventListener("click", registerUser);
});

function registerUser(e) {
    e.preventDefault();
    registerButton.disabled = true;
    if (validateFields()) createAccount();
}

function validateFields() {
    // Validate Username
    if (usernameInput.value.trim().length < 6 || /\s/.test(usernameInput.value.trim())) {
        usernameError.textContent =
            "Username must be at least 6 characters and cannot contain spaces.";
        usernameError.style.display = "block";
        registerButton.disabled = false;
        return false;
    } else usernameError.style.display = "none";

    // Validate Email
    const emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email address.";
        emailError.style.display = "block";
        registerButton.disabled = false;
        return false;
    } else if (checkEmailList(emailInput.value.trim())) {
        emailError.textContent = "Please use a trusted email provider such as gmail.com";
        emailError.style.display = "block";
        registerButton.disabled = false;
        return false;
    } else emailError.style.display = "none";

    // Validate Password
    const password = passwordInput.value.trim();
    let hasLowercase = false;
    let hasUppercase = false;
    let isValidLength = password.length >= 6;

    for (let char of password) {
        if (char >= "a" && char <= "z") hasLowercase = true;
        if (char >= "A" && char <= "Z") hasUppercase = true;
    }

    // Check conditions
    if (!isValidLength || !hasLowercase || !hasUppercase) {
        passwordError.textContent =
            "Password must be at least 6 characters long, with at least one lowercase letter and one uppercase letter. Special characters are allowed.";
        passwordError.style.display = "block";
        registerButton.disabled = false;
        return false;
    } else passwordError.style.display = "none";

    // Validate Confirm Password
    if (confirmPasswordInput.value.trim() !== passwordInput.value.trim()) {
        confirmPasswordError.textContent = "Passwords do not match.";
        confirmPasswordError.style.display = "block";
        registerButton.disabled = false;
        return false;
    } else confirmPasswordError.style.display = "none";

    return true;
}

function createAccount() {
    let username = usernameInput.value.trim();
    // Capitalize first letter of the username and make all other letters lowercase
    username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();

    const password = passwordInput.value.trim();
    const email = emailInput.value.trim();

    // Create the user data object, including timestamp
    const user_data = {
        username: username,
        email: email,
        created_at: firebase.database.ServerValue.TIMESTAMP,
    };

    // Reference to Firebase Database
    const databaseRef = firebase.database().ref();

    // Create a new user with email and password
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User successfully registered
            const user = userCredential.user;

            // Update the user's display name with the formatted username
            return user
                .updateProfile({
                    displayName: username,
                })
                .then(() => {
                    // Save the user data to the database under "users" node
                    return databaseRef.child("users").child(user.uid).set(user_data);
                });
        })
        .then(() => {
            // Redirect to email verification page after successful account creation
            window.location.href = "email-verification.html";
        })
        .catch((error) => {
            // Handle errors during account creation
            if (error.code === "auth/email-already-in-use") {
                emailError.textContent = "The email address is already in use by another account.";
                emailError.style.display = "block";
            } else {
                console.error("Error creating user:", error);
            }

            // Re-enable the button after the process completes
            registerButton.disabled = false;
        });
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

    // Check if the email ends with any supported domain
    return !supportedDomains.some((domain) => email.endsWith(domain));
}
