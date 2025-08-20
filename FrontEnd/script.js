// Vérifier que le JS est bien chargé
console.log("Le script.js est bien chargé !");

// === SÉLECTION DES ÉLÉMENTS ===
const modal = document.getElementById("modal");
const overlay = document.querySelector(".page-overlay");
const modalGallery = document.querySelector(".modal-gallery");
const modalForm = document.querySelector(".modal-form");
const backArrow = document.querySelector(".back-arrow");
const openModalBtn = document.querySelector(".edit-button");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const closeModalBtn = document.querySelector(".close-modal");
const addPhotoForm = document.getElementById("add-photo-form");
const imageInput = document.getElementById("photo");
const imagePreview = document.getElementById("image-preview");
const btnContent = document.querySelector(".custom-file-btn .btn-content");
const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters");
const submitBtn = addPhotoForm.querySelector('button[type="submit"]');

// === VARIABLES ===
let allWorks = [];
const token = sessionStorage.getItem("token");
const isConnected = token && token !== "null" && token !== "undefined";

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

// === FETCH SPÉCIFIQUES ===
const fetchCategories = () => fetchData('http://localhost:5678/api/categories');
const fetchWorks = () => fetchData('http://localhost:5678/api/works');

// === AFFICHAGE DES TRAVAUX ===
function displayWorksInContainer(works, container) {
  clearContainer(container);
  works.forEach(work => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;

    // Bouton corbeille dans la modale
    if (container === document.querySelector('.modal-gallery .gallery-items')) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.dataset.id = work.id;
      deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;

      deleteBtn.addEventListener("click", async () => {
        try {
          const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (response.ok) {
            figure.remove();
            allWorks = allWorks.filter(w => w.id !== work.id);
            displayWorks(allWorks);
          } else {
            console.error("Erreur suppression :", response.status);
          }
        } catch (err) {
          console.error("Erreur fetch DELETE :", err);
        }
      });

      figure.appendChild(deleteBtn);
    }

    container.appendChild(figure);
  });
}

function displayWorks(works) {
  displayWorksInContainer(works, gallery);
  displayWorksInContainer(works, document.querySelector('.modal-gallery .gallery-items'));
}

// === FILTRES ===
function createFilterButton(label, filterCallback, isActive = false) {
  const button = document.createElement('button');
  button.textContent = label;
  button.classList.add('filter-btn');
  if (isActive) button.classList.add('active');

  button.addEventListener('click', () => {
    displayWorks(filterCallback());
    setActiveButton(button);
  });

  filtersContainer.appendChild(button);
}

function setActiveButton(activeBtn) {
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.remove('active')
  );
  activeBtn.classList.add('active');
}

async function initGallery() {
  const data = await fetchWorks();
  if (!data) return;
  allWorks = data;
  displayWorks(allWorks);
}

async function initFilters() {
  const categories = await fetchCategories();
  if (!categories) return;

  createFilterButton("Tous", () => allWorks, true);
  categories.forEach(cat => {
    createFilterButton(cat.name, () => allWorks.filter(work => work.categoryId === cat.id));
  });
}

// === Initialisation du select catégorie ===
async function initCategoriesSelect() {
  const categories = await fetchCategories();
  if (!categories) return;

  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  clearContainer(categorySelect); // vider les options existantes

  // Option par défaut
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "";
  categorySelect.appendChild(defaultOption);

  // Ajouter les catégories de l'API
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// === UI selon token ===
function handleAuthUI() {
  isConnected ? hideElement(filtersContainer) : showElement(filtersContainer, "flex");

  let banner = document.getElementById("edition-banner");
  if (isConnected) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "edition-banner";
      banner.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> <span>Mode édition</span>`;
      document.body.prepend(banner);
    }
    showElement(banner, "flex");
  } else hideElement(banner);

  document.querySelectorAll(".edit-button").forEach(btn =>
    isConnected ? showElement(btn, "inline-flex") : hideElement(btn)
  );

  const loginLink = document.querySelector('nav ul li a[href="login.html"]');
  if (loginLink) {
    if (isConnected) {
      loginLink.textContent = "logout";
      loginLink.href = "#";
      loginLink.onclick = e => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        window.location.href = "index.html";
      };
    } else {
      loginLink.textContent = "login";
      loginLink.href = "login.html";
    }
  }
}

// === MODALE & FORMULAIRE ===

// Ouvrir la modale
function openModal() {
  modal.classList.add("active");
  modalGallery.classList.add("active");
  modalForm.classList.remove("active");
  backArrow.style.display = "none";
  overlay.classList.add("show");
}

// Réinitialiser et fermer la modale
function closeModal() {
  modal.classList.remove("active");
  overlay.classList.remove("show");

  // Réinitialiser formulaire et preview image
  addPhotoForm.reset();
  imagePreview.src = "";
  imagePreview.style.display = "none";
  btnContent.style.display = "flex";
  setTimeout(() => btnContent.style.opacity = "1", 10);

  showGalleryView();
}

// Clic sur overlay pour fermer la modale (NE PAS TOUCHER)
overlay.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Afficher la vue formulaire
function showFormView() {
  modalGallery.classList.remove("active");
  modalForm.classList.add("active");
  backArrow.style.display = "block";
}

// Afficher la vue galerie
function showGalleryView() {
  modalForm.classList.remove("active");
  modalGallery.classList.add("active");
  backArrow.style.display = "none";
}

// === ACTIVER / DÉSACTIVER LE BOUTON SUBMIT ===
function updateSubmitButtonState() {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const imageFile = imageInput.files[0];

  const isValid = title && category && imageFile;

  submitBtn.disabled = !isValid;

  if (isValid) {
    submitBtn.classList.add("active");
  } else {
    submitBtn.classList.remove("active");
  }
}

addPhotoForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche le rechargement de la page

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const imageFile = imageInput.files[0];

  if (!title || !category || !imageFile) return;

  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("image", imageFile);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }, // ton token si nécessaire
      body: formData
    });

    if (response.ok) {
      const newWork = await response.json();
      allWorks.push(newWork);  // mettre à jour la galerie
      displayWorks(allWorks);  // rafraîchir l’affichage
      closeModal();             // fermer la modale
      alert("Projet ajouté avec succès !");
    } else {
      const errorData = await response.json();
      alert("Erreur lors de l'ajout : " + (errorData.message || response.status));
    }
  } catch (err) {
    console.error("Erreur fetch POST :", err);
    alert("Erreur lors de l'ajout du projet.");
  }
});

// Écouter les changements sur les champs
// Aperçu de l’image sélectionnée
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreview.style.display = "block"; // montrer l’image
      btnContent.style.display = "none";    // cacher le bouton "ajout photo"
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "";
    imagePreview.style.display = "none";
    btnContent.style.display = "flex";
  }

  updateSubmitButtonState();
});

document.getElementById("title").addEventListener("input", updateSubmitButtonState);
document.getElementById("category").addEventListener("change", updateSubmitButtonState);

// Initialiser l’état du bouton au chargement
updateSubmitButtonState();



// === SOUMISSION FORMULAIRE ===
addPhotoForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const imageFile = imageInput.files[0];

  // Vérification des champs
  if (!title || !category || !imageFile) {
    alert("Veuillez remplir tous les champs et ajouter une image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("image", imageFile);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (response.ok) {
      const newWork = await response.json();
      allWorks.push(newWork);
      displayWorks(allWorks); // Met à jour la galerie
      closeModal();            // Ferme la modale
      alert("Projet ajouté avec succès !");
    } else {
      const errorData = await response.json();
      alert("Erreur lors de l'ajout : " + (errorData.message || response.status));
    }
  } catch (err) {
    console.error("Erreur fetch POST :", err);
    alert("Erreur lors de l'ajout du projet.");
  }
});

// === Événements modale ===
openModalBtn.addEventListener("click", openModal);
addPhotoBtn.addEventListener("click", showFormView);
backArrow.addEventListener("click", showGalleryView);
closeModalBtn.addEventListener("click", closeModal);

// === INIT ===
initGallery();
initFilters();
initCategoriesSelect(); // <-- Ajout pour remplir le select
handleAuthUI();

