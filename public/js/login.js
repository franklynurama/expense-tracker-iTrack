document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const authMsg = document.getElementById("auth-msg");
    authMsg.textContent = ""; // Clear previous messages

    try {
      const response = await fetch(`${window.location.origin}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        authMsg.textContent = result.message;
      } else {
        authMsg.textContent = "Login successful";
        // Store user ID in local storage
        localStorage.setItem("userId", result.userId);
        setTimeout(() => {
          window.location.href = `${window.location.origin}/dashboard`; // Redirect to dashboard
        }, 2000);
      }
    } catch (err) {
      authMsg.textContent = "An error occured";
      console.error("Error during login:", err);
    }
  });
});
