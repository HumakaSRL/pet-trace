firebase.auth().onAuthStateChanged(async (user) => {
    if (user) window.location = "/dashboard.html";
});

document.addEventListener("DOMContentLoaded", () => {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

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
