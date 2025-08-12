// Vérifier que le JS est bien chargé
console.log("Le script.js est bien chargé !");

// Sélection de la galerie principale et du conteneur des filtres
const gallery = document.querySelector('.gallery');
const filtersContainer = document.getElementById('filters');

// Sélection de la galerie dans la modale
const modalGalleryItems = document.querySelector('.modal-gallery .gallery-items');

let allWorks = [];

// === UTILITAIRES DOM ===
const clearContainer = container => container.innerHTML = "";
const showElement = (el, display = "block") => el && (el.style.display = display);
const hideElement = el => el && (el.style.display = "none");

// === FETCH GÉNÉRIQUE ===
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du fetch :", error);
  }
}

// === FONCTIONS FETCH SPÉCIFIQUES ===
const fetchCategories = () => fetchData('http://localhost:5678/api/categories');
const fetchWorks = () => fetchData('http://localhost:5678/api/works');

// === AFFICHAGE DANS UN CONTENEUR ===
function displayWorksInContainer(works, container) {
  clearContainer(container);
  works.forEach(work => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    container.appendChild(figure);
  });
}

// === AFFICHAGE GALERIE PRINCIPALE ET MODALE ===
function displayWorks(works) {
  displayWorksInContainer(works, gallery);
  displayWorksInContainer(works, modalGalleryItems);
}

// === GESTION DES BOUTONS FILTRE ===
function createFilterButton(label, filterCallback, isActive = false) {
  const button = document.createElement('button');
  button.textContent = label;
  button.classList.add('filter-btn');
  if (isActive) button.classList.add('active');

  button.addEventListener('click', () => {
    const filteredWorks = filterCallback();
    setActiveButton(button);
    displayWorks(filteredWorks);
  });

  filtersContainer.appendChild(button);
}

function setActiveButton(activeBtn) {
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.remove('active')
  );
  activeBtn.classList.add('active');
}

// === INITIALISATION GALERIE ET FILTRES ===
function initGallery() {
  fetchWorks().then(data => {
    if (!data) return;
    allWorks = data;
    displayWorks(allWorks);
  });
}

function initFilters() {
  fetchCategories().then(categories => {
    if (!categories) return;

    // Bouton "Tous"
    createFilterButton("Tous", () => allWorks, true);

    // Boutons par catégorie
    categories.forEach(category => {
      createFilterButton(category.name, () => {
        return allWorks.filter(work => work.categoryId === category.id);
      });
    });
  });
}

// === GESTION DE L'INTERFACE SELON LE TOKEN ===
function handleAuthUI() {
  const token = localStorage.getItem("token");
  const isConnected = token && token !== "null" && token !== "undefined";

  // Filtres
  isConnected ? hideElement(filtersContainer) : showElement(filtersContainer, "flex");

  // Bandeau édition
  let banner = document.getElementById("edition-banner");
  if (isConnected) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "edition-banner";
      banner.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> <span>Mode édition</span>`;
      document.body.prepend(banner);
    }
    showElement(banner, "flex");
  } else {
    hideElement(banner);
  }

  // Boutons "Modifier"
  document.querySelectorAll(".edit-button").forEach(button =>
    isConnected ? showElement(button, "inline-flex") : hideElement(button)
  );

  // Changement login ↔ logout
  const loginLink = document.querySelector('nav ul li a[href="login.html"]');
  if (loginLink) {
    if (isConnected) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.onclick = e => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "index.html";
      };
    } else {
      loginLink.textContent = "login";
      loginLink.href = "login.html";
    }
  }

  console.log("Token:", token);
}

// === MODALE ===
// Sélections DOM
const modal = document.getElementById("modal");
const modalGallery = document.querySelector(".modal-gallery");
const modalForm = document.querySelector(".modal-form");
const backArrow = document.querySelector(".back-arrow");
const openModalBtn = document.querySelector(".edit-button"); // bouton modifier
const addPhotoBtn = document.getElementById("addPhotoBtn");
const closeModalBtn = document.querySelector(".close-modal");
const form = modalForm.querySelector("form");

// Ouvrir la modale (vue galerie)
function openModal() {
  modal.classList.add("active");
  modalGallery.classList.add("active");
  modalForm.classList.remove("active");
  backArrow.style.display = "none";
}

// Fermer la modale
function closeModal() {
  modal.classList.remove("active");
}

// Afficher formulaire
function showFormView() {
  modalGallery.classList.remove("active");
  modalForm.classList.add("active");
  backArrow.style.display = "block";
}

// Retour à la galerie
function showGalleryView() {
  modalForm.classList.remove("active");
  modalGallery.classList.add("active");
  backArrow.style.display = "none";
}

// Soumission du formulaire
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Formulaire soumis !");
  // TODO : envoyer données vers API

  form.reset();
  showGalleryView();
});

// Événements
openModalBtn.addEventListener("click", openModal);
addPhotoBtn.addEventListener("click", showFormView);
backArrow.addEventListener("click", showGalleryView);
closeModalBtn.addEventListener("click", closeModal);

// Fermer modale en cliquant sur overlay (hors contenu)
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// === INITIALISATION GLOBALE ===
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  initFilters();
  handleAuthUI();
});