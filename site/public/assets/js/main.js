console.log(
    "%c⚠️ WARNING: Modifying or tampering with the code is strictly prohibited and may result in legal action. Any unauthorized changes can lead to unexpected behavior or security vulnerabilities. If you encounter any issues or have questions, please contact our support team at support@humaka.ro for assistance. Thank you for using our platform responsibly.",
    "font-size: 16px; color: #FF0000; font-weight: bold; background-color: #FFD700; padding: 10px; border-radius: 5px;"
);

const acceptedAllCookies = localStorage.getItem("acceptedAllCookies");
const acceptedNecessaryCookies = localStorage.getItem("acceptedNecessaryCookies");
let cookieConsent = document.getElementById("cookieConsent");
const acceptAllCookies = document.getElementById("acceptAllCookies");
const acceptNecessaryCookies = document.getElementById("acceptNecessaryCookies");

// Check if cookies consent is required
if (
    !acceptedAllCookies &&
    !acceptedNecessaryCookies &&
    !window.location.pathname.endsWith("privacy-policy.html")
) {
    // Create and append the cookie consent HTML
    const cookieConsentHTML = `
            <div id="cookieConsent" class="cookie-consent">
                <div class="cookie-wrapper">
                    <h2>Hey, pet friend!</h2>
                    <p>
                        We use cookies to keep our site running smoothly and remember your
                        preferences, just like a loyal companion! Choose "Accept All Cookies" to unlock a
                        richer, personalized experience with extra features and fun surprises. If you
                        opt for "Accept Necessary Cookies Only," you'll get only the essential
                        non-personalized experience. Check our
                        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
                            Privacy Policy
                        </a>
                        for more details
                    </p>
                    <div class="buttons">
                        <button id="acceptNecessaryCookies">Accept Necessary Cookies Only</button>
                        <button id="acceptAllCookies">Accept All Cookies</button>
                    </div>
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
