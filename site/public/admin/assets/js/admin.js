// Listen to auth state changes
firebase.auth().onAuthStateChanged(async (user) => {
    const loginContainer = document.getElementById("loginContainer");
    const mainContent = document.getElementById("mainContent");

    if (user) {
        try {
            const snapshot = await firebase.database().ref(`users/${user.uid}/role`).once("value");
            const userRole = snapshot.val();

            if (userRole === "admin") {
                loginContainer.style.display = "none";
                mainContent.style.display = "flex";
            } else {
                alert("You are not authorized to access this page, the attempt has been recorded.");
            }
        } catch (error) {
            console.error("Error retrieving user role:", error);
            alert("An error occurred.");
        }
    } else {
        loginContainer.style.display = "flex";
        mainContent.style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", handleLogin);

    initializeAdminNavigation();
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

function initializeAdminNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".admin-section");

    navItems.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.target;

            navItems.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            if (target) {
                sections.forEach((section) => {
                    section.style.display = section.id === target ? "flex" : "none";
                });
            } else if (button.classList.contains("logout-btn")) {
                firebase
                    .auth()
                    .signOut()
                    .then(() => location.reload())
                    .catch((error) => alert("Logout failed: " + error.message));
            }
        });
    });

    // Set dashboard as default active
    const defaultButton = document.querySelector(".nav-item[data-target='dashboard']");
    const defaultSection = document.getElementById("dashboard");
    if (defaultButton && defaultSection) {
        defaultButton.classList.add("active");
        sections.forEach((section) => {
            section.style.display = section.id === "dashboard" ? "flex" : "none";
        });
    }
}
