document.addEventListener("DOMContentLoaded", async () => {
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

  // Fetch categories from the database
  try {
    const response = await fetch(`${window.location.origin}/api/categories`);
    const categories = await response.json();

    const categorySelect = document.getElementById("expenseCategory");
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    alert("Failed to load categories.");
  }

  // Handle form submission
  document.getElementById("addExpenseForm").onsubmit = async function (event) {
    event.preventDefault(); // Prevent default form submission

    const categoryId = document.getElementById("expenseCategory").value;
    const description = document.getElementById("expenseDescription").value;
    const amount = document.getElementById("expenseAmount").value;
    const date = document.getElementById("expenseDate").value;

    try {
      const response = await fetch(`${window.location.origin}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          categoryId,
          description,
          amount,
          date,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message); // Show error message
      } else {
        alert("Expense added successfully!");
        console.log("Expense added:", result);
        this.reset(); // Clear the form fields
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("An error occurred while adding the expense.");
    }
  };
});
