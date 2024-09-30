document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You need to log in to access this page.");
    window.location.href = `${window.location.origin}/login`; // Redirect to login page
    return; // Exit early
  }

  console.log("User ID:", userId);

  // Get modal element
  const modal = document.getElementById("addModal");

  // Get button that opens the modal
  const addButton = document.querySelector(".add-button");

  // Get close button
  const closeModal = document.getElementById("closeModal");

  // Open modal when add button is clicked
  addButton.onclick = function () {
    modal.style.display = "block";
  };

  // Close modal when the user clicks on <span> (x)
  closeModal.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when clicking outside of the modal
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Close modal when pressing the Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      modal.style.display = "none";
    }
  });

  // Direct navigation for option clicks
  document.getElementById("addExpenses").onclick = function () {
    // Redirect to Add Expenses page
    window.location.href = `${window.location.origin}/add-expenses`;
  };

  document.getElementById("addCategories").onclick = function () {
    // Redirect to Add Categories page
    window.location.href = `${window.location.origin}/add-categories`;
  };

  // Handle Logout button click
  const logoutButton = document.querySelector(".logout-button");

  logoutButton.onclick = function () {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout(); // Call the logout function
    } else {
      console.log("Logout canceled.");
    }
  };

  // Handle Dashboard link click
  document.getElementById("dashboardLink").onclick = function () {
    // Redirect to the Dashboard page
    window.location.href = `${window.location.origin}/dashboard`;
  };

  initTotalAmount(userId);
  initExpensesChart(userId);
  initCategoryData(userId);

  // Load expenses from the API
  await loadExpenses(userId);

  document.querySelector(".view-all").onclick = function () {
    // Redirect to View Expenses page
    window.location.href = `${window.location.origin}/view-expenses`;
  };
});

// Define the logout function
function logout() {
  // Clear local storage
  localStorage.removeItem("userId");

  // Make a request to the server to destroy the session
  fetch(`${window.location.origin}/api/auth/logout`, {
    method: "POST",
    credentials: "include", // Include credentials to send the session cookie
  })
    .then((response) => {
      if (response.ok) {
        // Redirect to the login page
        window.location.href = `${window.location.origin}/login`;
      } else {
        console.error("Failed to log out");
      }
    })
    .catch((err) => {
      console.error("Error logging out:", err);
    });
}

// Load expenses from the API
async function loadExpenses(userId) {
  try {
    const response = await fetch(
      `${window.location.origin}/api/expenses/recent?userId=${userId}`
    );
    const expenses = await response.json();
    console.log("Fetched recent expenses:", expenses);

    const viewAll = document.querySelector(".view-all");
    const expensesTableWrapper = document.querySelector(
      ".expenses-table-wrapper"
    );
    const noExpensesMessage = document.getElementById("noExpensesMessage");
    const expensesList = document.querySelector(".expenses-table tbody");
    expensesList.innerHTML = ""; // Clear existing list

    if (expenses.length === 0) {
      // No expenses, show the message and hide the table
      noExpensesMessage.style.display = "block";
      viewAll.style.display = "none";
      expensesTableWrapper.style.display = "none";
    } else {
      noExpensesMessage.style.display = "none";
      viewAll.style.display = "block";
      expensesTableWrapper.style.display = "block";

      expenses.forEach((expense) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${expense.category_name}</td>
                <td>${expense.amount}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.description.slice(0, 30)}${
          expense.description.length > 30 ? "..." : ""
        }</td>
            `;
        expensesList.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error fetching expenses:", error);
    alert("Failed to load expenses.");
  }
}

// Fetch total categories for the user
async function fetchUserCategories(userId) {
  const response = await fetch(
    `/api/categories/userCategories?userId=${userId}`
  );
  const categories = await response.json();
  return categories;
}

// Fetch the category with the highest expenses
async function fetchHighestExpenseCategory(userId) {
  const response = await fetch(
    `/api/expenses/categoryWithHighestExp?userId=${userId}`
  );
  const highestExpenseCategory = await response.json();
  return highestExpenseCategory;
}

// Function to render the stacked bar chart
function renderPieChart(categories) {
  const labels = categories.map((item) => item.name); // Get category names
  const data = categories.map((item) => item.totalAmount); // Get total amounts for each category
  const colors = generateColors(categories.length); // Generate colors for each category

  console.log("Labels:", labels);
  console.log("Data:", data);

  const ctx = document.getElementById("category-bars").getContext("2d");

  new Chart(ctx, {
    type: "pie", // Change to pie chart
    data: {
      labels: labels, // Labels for each slice
      datasets: [
        {
          label: "Category Amounts",
          data: data, // Data for each category
          backgroundColor: colors, // Colors for each slice
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right", // Display legend on top to show different categories
          labels: {
            color: "#d4d4d4", // Set legend text color to white
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label}: $${value}`; // Show amount on hover
            },
          },
        },
      },
    },
  });
}

// Function to update the diversification score
function updateDiversificationScore(totalCategories, highestExpenseCategory) {
  const scoreElement = document.getElementById("diversification-score");
  scoreElement.innerHTML = `Total Categories: ${totalCategories}, Highest Expense: ${highestExpenseCategory.name} = $${highestExpenseCategory.totalAmount}`;
}

function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${(i * 360) / count}, 70%, 70%)`);
  }
  return colors;
}

// Main function to fetch and render category data
async function initCategoryData(userId) {
  const categories = await fetchUserCategories(userId);
  const highestExpenseCategory = await fetchHighestExpenseCategory(userId);

  if (categories.length > 0) {
    renderPieChart(categories);
    updateDiversificationScore(categories.length, highestExpenseCategory);
  } else {
    const categoryChart = document.getElementById("category-bars");
    categoryChart.style.display = "none";
    const noCategoriesMessage = document.getElementById("noCategoriesMessage");
    noCategoriesMessage.style.display = "block";
  }
}

// Fetch total expenses amount for the user
async function fetchTotalAmount(userId) {
  const response = await fetch(`/api/expenses/totalExpAmount?userId=${userId}`);
  const totalAmount = await response.json();
  return totalAmount;
}

async function initTotalAmount(userId) {
  const data = await fetchTotalAmount(userId);
  const totalAmountText = document.getElementById("total-amount");

  // Check if data is valid and contains totalAmount
  if (data && data.totalAmount !== undefined) {
    totalAmountText.innerHTML = `$${data.totalAmount}`;
  } else {
    totalAmountText.innerHTML = "$0.00";
  }
}

// Fetch all expenses (ordered) for the user
async function fetchUserExpenses(userId) {
  const response = await fetch(`/api/expenses/allExpenses?userId=${userId}`);
  const expenses = await response.json();
  return expenses;
}

// Function to render a bar chart
function renderBarChart(expenses) {
  // Limit to the last 5 expenses (assuming expenses are ordered)
  const recentExpenses = expenses.slice(-6);

  // Get the canvas element where the chart will be rendered
  const ctx = document.getElementById("expenses-bars").getContext("2d");

  // Extract data for labels (descriptions) and values (amounts)
  const labels = recentExpenses.map((expense) =>
    expense.description.length > 10
      ? expense.description.slice(0, 10) + "..." // Slice to 10 characters and add ellipsis if needed
      : expense.description
  );

  const data = recentExpenses.map((expense) => expense.amount);

  // Create the bar chart using Chart.js
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels, // X-axis labels (expense descriptions)
      datasets: [
        {
          label: "Expenses",
          data: data, // Y-axis data (expense amounts)
          backgroundColor: "rgba(75, 192, 192, 0.6)", // Bars color
          borderColor: "rgba(75, 192, 192, 1)", // Bars border color
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          ticks: {
            color: "#d4d4d4", // Horizontal label color
            maxRotation: 0, // Prevents labels from rotating
            minRotation: 0, // Ensures labels are horizontal
          },
          grid: {
            color: "#4d4d4d", // Change X-axis grid color
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            display: false, // This hides the Y-axis labels
          },
          grid: {
            color: "#4d4d4d", // Change Y-axis grid color
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#d4d4d4", // Set legend text color to white
          },
        },
      },
    },
  });
}

// Main function to fetch and render expenses chart
async function initExpensesChart(userId) {
  const expenses = await fetchUserExpenses(userId);

  if (expenses.length > 0) {
    renderBarChart(expenses); // Call the bar chart rendering function
  } else {
    const expenseChart = document.querySelector(".total-expenses-chart");
    expenseChart.style.display = "none";

    const timeFilters = document.querySelector(".time-filters");
    timeFilters.style.display = "none";

    const noExpMessage = document.getElementById("noExpMessage");
    noExpMessage.style.display = "block";
  }
}
