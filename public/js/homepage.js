let currentSlide = 0;
const slides = document.querySelectorAll(".slider-image");
const totalSlides = slides.length;
let slideInterval; // Store the interval ID

// Show the first slide initially
slides[currentSlide].classList.add("active");

// Function to change slides
function changeSlide(direction) {
  slides[currentSlide].classList.remove("active"); // Hide the current slide

  currentSlide += direction; // Update the current slide index

  // Loop back to the beginning or end
  if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  } else if (currentSlide >= totalSlides) {
    currentSlide = 0;
  }

  slides[currentSlide].classList.add("active"); // Show the new slide
}

// Function to start the automatic slide interval
function startSlideInterval() {
  slideInterval = setInterval(() => {
    changeSlide(1); // Move to the next slide automatically
  }, 5000); // Every 5 seconds
}

// Function to reset the interval
function resetSlideInterval() {
  clearInterval(slideInterval); // Clear the existing interval
  startSlideInterval(); // Start a new interval
}

// Attach event listeners to your controls (e.g., buttons)
const nextButton = document.querySelector(".next"); // Adjust with your button class
const prevButton = document.querySelector(".prev"); // Adjust with your button class

nextButton.addEventListener("click", () => {
  changeSlide(1); // Move to the next slide
  resetSlideInterval(); // Reset the timer
});

prevButton.addEventListener("click", () => {
  changeSlide(-1); // Move to the previous slide
  resetSlideInterval(); // Reset the timer
});

// Start the automatic slide interval when the page loads
startSlideInterval();
