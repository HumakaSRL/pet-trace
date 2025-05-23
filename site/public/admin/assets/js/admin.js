// Listen to auth state changes
firebase.auth().onAuthStateChanged((user) => {
    const loginContainer = document.getElementById("loginContainer");
    const mainContent = document.getElementById("mainContent");

    if (user) {
        // User is signed in: hide login, show main content
        loginContainer.style.display = "none";
        mainContent.style.display = "block";
    } else {
        // No user signed in: show login, hide main content
        loginContainer.style.display = "flex"; // since .login-wrapper uses flex
        mainContent.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", handleLogin);
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
        // No need to manually hide/show here because onAuthStateChanged will handle it
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = "block";
    }
}
