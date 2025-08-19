const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("token", data.token);
            window.location.href = "index.html"; // redirection page accueil
        } else {
            errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe";
        }
    } catch (error) {
        errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe";
        console.error(error);
    }
});

