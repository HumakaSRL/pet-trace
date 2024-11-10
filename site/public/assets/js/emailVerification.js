firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        if (!user.emailVerified) {
            // If the user's email is not verified, send a verification email
            verifyUser(user);
        } else {
            // If the email is already verified, display the corresponding message
            displayAlreadyVerifiedMessage();
        }
    } else {
        // If no user is logged in, show an error message
        displayErrorMessage();
    }
});

function verifyUser(user) {
    // Send the verification email using Firebase
    user.sendEmailVerification()
        .then(() => {
            // If the email is sent successfully, show a success message
            verificationMessage.textContent = `A verification email has been sent to ${user.email}. Please verify your email.`;
        })
        .catch((error) => {
            // Handle errors if sending the verification email fails
            console.error("Error sending verification email:", error);
            verificationMessage.textContent =
                "There was an error sending the verification email. Please try again later.";
        });
}

function displayAlreadyVerifiedMessage() {
    // If the email is already verified, show a message with a link to the profile page
    verificationMessage.innerHTML =
        'Your email is already verified, click <a href="/dashboard.html">here</a> to visit your profile.';
}

function displayErrorMessage() {
    // If no user is logged in, display an error message
    verificationMessage.textContent = "Your email could not be verified at this time.";
    console.error("User is logged out.");
}
