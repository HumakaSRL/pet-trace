firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        loginButton.style.display = "block";
        logoutButton.style.display = "none";
    }
});

logoutButton.addEventListener("click", () => {
    signOut()
        .then(() => {
            location.reload();
        })
        .catch((error) => {
            console.error("Error signing out: ", error);
        });
});

loginButton.addEventListener("click", () => {
    location.reload();
});
