console.log(
    "".concat(
        "%cPet Trace",
        "\n\n%cWARNING: This browser console is intended for developers. Modifying or interfering with the code is strictly prohibited. Any unauthorized changes may cause errors, security issues, or legal consequences. If you're experiencing issues or have questions, please contact our support team at support@humaka.ro. Thank you for using our platform responsibly."
    ),
    "font-weight: bold; font-size: 50px;color:#007FC8;font-family:Raleway, Roboto,'San Francisco',BlinkMacSystemFont,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif",
    "font-weight: bold; color:#FFFFFF; background-color: #007FC8; padding: 10px; border-radius: 5px;font-family:Raleway, Roboto,'San Francisco',BlinkMacSystemFont,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;"
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
                        We use cookies to ensure our site functions properly and to remember your preferences.
                        By selecting "Accept All Cookies" you’ll enjoy a more personalized experience with
                        additional features. Choosing "Accept Necessary Cookies" will limit functionality to
                        essential, non-personalized services. For more information, please see our
                        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
                            Privacy&nbsp;Policy
                        </a>
                    </p>
                    <div class="buttons">
                        <button id="acceptNecessaryCookies">Accept Necessary Cookies</button>
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

    // Event listener for accepting necessary cookies
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
