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

  // Handle Dashboard link click
  document.querySelector(".back-to-dashboard").onclick = function () {
    window.location.href = `${window.location.origin}/dashboard`; // Redirect to dashboard page
  };

  loadAllExpenses(userId);

  // Get modal elements
  const updateExpenseModal = document.querySelector(".modal");
  const passwordModal = document.getElementById("passwordModal");

  // Close modal when clicking outside of the modal
  window.onclick = function (event) {
    if (event.target === updateExpenseModal) {
      updateExpenseModal.style.display = "none"; // Close update modal
    } else if (event.target === passwordModal) {
      passwordModal.style.display = "none"; // Close password modal
    }
  };

  // Close modal when pressing the Esc key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      updateExpenseModal.style.display = "none"; // Close update modal
      passwordModal.style.display = "none"; // Close password modal
    }
  });

  // Add event listener for keydown on the update expense modal
  updateExpenseModal.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission
      document.querySelector(".modal .button[type='submit']").click(); // Trigger the update button click
    }
  });

  // Add event listener for keydown on the password modal
  passwordModal.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission
      document.getElementById("confirmButton").click(); // Trigger the confirm button click
    }
  });
});

// Load all expenses from the API
async function loadAllExpenses(userId) {
  try {
    const response = await fetch(
      `${window.location.origin}/api/viewPage/allExpensesDesc?userId=${userId}`
    );
    const expenses = await response.json();
    console.log("Fetched expenses DESC:", expenses);

    const expensesList = document.querySelector(".expenses-table tbody");
    expensesList.innerHTML = ""; // Clear existing list

    expenses.forEach((expense) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${expense.category_name}</td>
                  <td>${expense.amount}</td>
                  <td>${new Date(expense.date).toLocaleDateString()}</td>
                  <td>${expense.description}</td>
                  <td><button class="update-button" onclick="updateExpense(${
                    expense.id
                  })">Update</button></td>
                  <td><button class="delete-button" onclick="deleteExpense(${
                    expense.id
                  })">Delete</button></td>
              `;
      expensesList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    alert("Failed to load expenses.");
  }
}

// Fetch the current details of the expense and populate the form
async function fetchExpenseDetails(expenseId) {
  try {
    const response = await fetch(
      `${window.location.origin}/api/viewPage/fetchExpense?expenseId=${expenseId}`
    );
    const expense = await response.json();

    if (expense) {
      // Fetch categories and populate the select dropdown
      const categorySelect = document.getElementById("updateExpenseCategory");

      // Assuming you have an API that fetches all categories
      const categoriesResponse = await fetch(
        `${window.location.origin}/api/categories`
      );
      const categories = await categoriesResponse.json();

      // Clear any previous options
      categorySelect.innerHTML =
        '<option value="" disabled selected>Select Category</option>';

      // Populate the categories
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

      // Set the current category as selected
      categorySelect.value = expense.category_id;

      // Populate other form fields with existing data
      document.getElementById("updateExpenseDescription").value =
        expense.description;
      document.getElementById("updateExpenseAmount").value = expense.amount;
      document.getElementById("updateExpenseDate").value = new Date(
        expense.date
      )
        .toISOString()
        .split("T")[0]; // Set date in 'YYYY-MM-DD' format
    } else {
      alert("Expense not found.");
    }
  } catch (error) {
    console.error("Error fetching expense details:", error);
    alert("Failed to fetch expense details.");
  }
}

// Update an expense
async function updateExpense(expenseId) {
  const userId = localStorage.getItem("userId");

  return new Promise((resolve) => {
    // Show the update modal
    const modal = document.querySelector(".modal");
    modal.style.display = "flex";

    // Fetch the current expense details and populate the form
    fetchExpenseDetails(expenseId);

    // Get references to the modal buttons
    const updateButton = document.querySelector(
      ".modal .button[type='submit']"
    );
    const cancelButton = document.getElementById("cancelUpdate");

    // Handle the Update button click
    updateButton.onclick = async function (event) {
      event.preventDefault();

      // Get the updated values from the form
      const updatedCategoryId = document.getElementById(
        "updateExpenseCategory"
      ).value;
      const updatedDescription = document.getElementById(
        "updateExpenseDescription"
      ).value;
      const updatedAmount = document.getElementById(
        "updateExpenseAmount"
      ).value;
      const updatedDate = document.getElementById("updateExpenseDate").value;

      // Validate the form fields (basic validation)
      if (
        !updatedCategoryId ||
        !updatedDescription ||
        !updatedAmount ||
        !updatedDate
      ) {
        alert("All fields are required.");
        return;
      }

      modal.style.display = "none"; // Hide the modal after form submission

      // Send the update request
      try {
        const response = await fetch(
          `${window.location.origin}/api/viewPage/updateExpense?expenseId=${expenseId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              categoryId: updatedCategoryId,
              description: updatedDescription,
              amount: updatedAmount,
              date: updatedDate,
            }),
          }
        );

        const result = await response.json();

        if (response.status === 200) {
          loadAllExpenses(userId); // Refresh the expenses list after update
          alert("Expense updated successfully");
        } else {
          alert(result.error || "Failed to update expense");
        }
      } catch (error) {
        console.error("Error updating expense:", error);
        alert("Failed to update expense.");
      }

      resolve();
    };

    // Handle the Cancel button click
    cancelButton.onclick = function () {
      modal.style.display = "none"; // Hide the modal
      resolve();
    };
  });
}

// Delete an expense
async function deleteExpense(expenseId) {
  const userId = localStorage.getItem("userId");

  return new Promise((resolve) => {
    // Show the password modal
    const modal = document.getElementById("passwordModal");
    modal.style.display = "block";

    // Get references to the modal buttons and input
    const passwordInput = document.getElementById("passwordInput");
    const confirmButton = document.getElementById("confirmButton");
    const cancelButton = document.getElementById("cancelButton");

    // Handle the Confirm button click
    confirmButton.onclick = async function () {
      const password = passwordInput.value;

      if (!password) {
        alert("Password is required to delete this expense.");
        return;
      }

      modal.style.display = "none"; // Hide the modal
      passwordInput.value = ""; // Clear the input field

      // Proceed with the deletion request
      try {
        const response = await fetch(
          `${window.location.origin}/api/viewPage/deleteExpense?expenseId=${expenseId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          }
        );

        const result = await response.json();

        if (response.status === 200) {
          loadAllExpenses(userId); // Refresh list after deleting
          alert("Expense deleted successfully");
        } else {
          alert(result.error || "Failed to delete expense");
        }
      } catch (error) {
        console.error("Error deleting expenses:", error);
        alert("Failed to delete expenses.");
      }

      resolve();
    };

    // Handle the Cancel button click
    cancelButton.onclick = function () {
      modal.style.display = "none"; // Hide the modal
      passwordInput.value = ""; // Clear the input field
      resolve();
    };
  });
}
