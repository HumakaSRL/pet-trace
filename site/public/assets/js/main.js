firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User is signed in: ", user);
    } else console.log("User is signed out.");
});
