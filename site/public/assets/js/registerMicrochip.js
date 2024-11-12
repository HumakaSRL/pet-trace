firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //
    } else {
        // Redirect to Login
        window.location = "/login.html";
    }
});
