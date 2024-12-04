console.log(
    "%c⚠️ WARNING: Modifying or tampering with the code is strictly prohibited and may result in legal action. Any unauthorized changes can lead to unexpected behavior or security vulnerabilities. If you encounter any issues or have questions, please contact our support team at support@humaka.ro for assistance. Thank you for using our platform responsibly.",
    "font-size: 16px; color: #FF0000; font-weight: bold; background-color: #FFD700; padding: 10px; border-radius: 5px;"
);

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User is signed in: ", user);
    } else console.log("User is signed out.");
});

document.addEventListener("DOMContentLoaded", () => {
    const acceptedAllCookies = localStorage.getItem("acceptedAllCookies");
    const acceptedNecessaryCookies = localStorage.getItem("acceptedNecessaryCookies");
    let cookieConsent = document.getElementById("cookieConsent");
    const acceptAllCookies = document.getElementById("acceptAllCookies");
    const acceptNecessaryCookies = document.getElementById("acceptNecessaryCookies");

    // Check if cookies consent is required
    if (!acceptedAllCookies && !acceptedNecessaryCookies) {
        // Create and append the cookie consent HTML
        const cookieConsentHTML = `
            <div class="cookie-consent" id="cookieConsent">
                <p>This website uses cookies to ensure you get the best experience on our website.</p>
                <div class="buttons">
                    <button id="acceptNecessaryCookies">Accept Necessary Cookies Only</button>
                    <button id="acceptAllCookies">Accept All Cookies</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("afterbegin", cookieConsentHTML);

        // Update reference to cookieConsent element after creation
        cookieConsent = document.getElementById("cookieConsent");

        // Event listener for accepting all cookies
        const acceptAllButton = cookieConsent.querySelector("#acceptAllCookies");
        acceptAllButton.addEventListener("click", () => {
            cookieConsent.style.display = "none";
            localStorage.setItem("acceptedAllCookies", true);
            loadAllCookies();
        });

        // Event listener for accepting necessary cookies only
        const acceptNecessaryButton = cookieConsent.querySelector("#acceptNecessaryCookies");
        acceptNecessaryButton.addEventListener("click", () => {
            cookieConsent.style.display = "none";
            localStorage.setItem("acceptedNecessaryCookies", true);
            loadEssentialCookies();
        });
    } else {
        // Hide cookie consent if cookies have been accepted
        if (cookieConsent) cookieConsent.style.display = "none";

        // Load cookies based on previous consent
        if (acceptedAllCookies) loadAllCookies();
        else if (acceptedNecessaryCookies) loadEssentialCookies();
    }
});

function loadAllCookies() {
    loadEssentialCookies();
    loadNonEssentialCookies();
}

function loadEssentialCookies() {
    // Essential cookies go here
    loadGoogleTagManager();
}

function loadNonEssentialCookies() {
    // Non-essential cookies go here
}

function loadGoogleTagManager() {
    var gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-7LM7J9J116";
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-7LM7J9J116");
}

function clearCookies() {
    localStorage.removeItem("acceptedAllCookies");
    localStorage.removeItem("acceptedNecessaryCookies");
}
