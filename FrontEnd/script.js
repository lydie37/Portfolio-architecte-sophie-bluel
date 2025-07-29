// Vérifier que le JS est bien chargé
console.log("Le script.js est bien chargé !");

// Sélection de la galerie et du conteneur des filtres
const gallery = document.querySelector('.gallery');
const filtersContainer = document.getElementById('filters');

let allWorks = [];

// Fonction pour faire un fetch
function fetchData(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error("Erreur lors du fetch :", error);
    });
}

// Fonction pour afficher les projets dans la galerie
function displayWorks(works) {
  gallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
  });
}

// Charger les projets
fetchData('http://localhost:5678/api/works').then(data => {
  if (data) {
    allWorks = data;
    displayWorks(allWorks);
  }
});

// Charger les catégories et créer les filtres
fetchData('http://localhost:5678/api/categories').then(categories => {
  if (categories) {
    // Bouton "Tous"
    const allBtn = document.createElement('button');
    allBtn.textContent = "Tous";
    allBtn.classList.add('filter-btn', 'active');
    allBtn.addEventListener('click', () => {
      displayWorks(allWorks);
      setActiveButton(allBtn);
    });
    filtersContainer.appendChild(allBtn);

    // Boutons pour chaque catégorie
    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.textContent = category.name;
      btn.classList.add('filter-btn');
      btn.addEventListener('click', () => {
        const filtered = allWorks.filter(work => work.categoryId === category.id);
        displayWorks(filtered);
        setActiveButton(btn);
      });
      filtersContainer.appendChild(btn);
    });
  }
});

// Activer le bon bouton de filtre
function setActiveButton(activeBtn) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);

  // Masquer les filtres si connecté
  if (token && token !== "null" && token !== "undefined") {
    if (filtersContainer) {
      filtersContainer.style.display = "none";
    }

    // Afficher bandeau édition
    let banner = document.getElementById("edition-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "edition-banner";
      banner.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> <span>Mode édition</span>`;
      document.body.prepend(banner);
    }
    banner.style.display = "flex";

    // Afficher boutons Modifier
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach(button => {
      button.style.display = "inline-flex";
    });

    // Modifier login en logout
    const loginLink = document.querySelector('nav ul li a[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = "logout";
      loginLink.href = "#";

      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });
    }
  } else {
    // Pas connecté : montrer filtres + cacher bandeau + boutons Modifier
    if (filtersContainer) {
      filtersContainer.style.display = "flex";
    }
    const banner = document.getElementById("edition-banner");
    if (banner) {
      banner.style.display = "none";
    }
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach(button => {
      button.style.display = "none";
    });
  }
});