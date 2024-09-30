document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You need to log in to access this page.");
    window.location.href = `${window.location.origin}/login`; // Redirect to login page
    return; // Exit early
  }

  // Handle Dashboard link click
  document.getElementById("dashboardLink").onclick = function () {
    window.location.href = `${window.location.origin}/dashboard`; // Redirect to dashboard page
  };

  // Handle form submission
  document.getElementById("addCategoryForm").onsubmit = async function (event) {
    event.preventDefault(); // Prevent default form submission

    const categoryName = document.getElementById("categoryName").value;

    try {
      const response = await fetch(`${window.location.origin}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message); // Show error message
      } else {
        alert("Category added successfully!");
        console.log("Category added:", result);
        this.reset(); // Clear the form fields
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("An error occurred while adding the category.");
    }
  };
});
