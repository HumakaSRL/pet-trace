firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
    } else {
        window.location = "/index.html";
    }
});
