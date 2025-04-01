// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth",
        });
    });
});

// Search functionality placeholder
const searchBtn = document.querySelector(".search-btn");
searchBtn.addEventListener("click", () => {
    const chipId = document.querySelector(".search-input").value;
    if (chipId) {
        alert(
            `Searching for microchip ID: ${chipId}\nThis would connect to the database in a real implementation.`
        );
    } else {
        alert("Please enter a microchip ID to search");
    }
});
