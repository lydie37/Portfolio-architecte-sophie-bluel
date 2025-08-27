// Vérification du chargement du script
console.log("Le script.js est bien chargé !");

//  SÉLECTION DES ÉLÉMENTS DOM
const modal = document.getElementById("modal");
const overlay = document.querySelector(".page-overlay");
const modalGallery = document.querySelector(".modal-gallery");
const modalForm = document.querySelector(".modal-form");
const backArrow = document.querySelector(".back-arrow");
const openModalBtn = document.querySelector(".edit-button");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const closeModalBtn = document.querySelector(".close-modal");

const addPhotoForm = document.getElementById("add-photo-form");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("category");
const imageInput = document.getElementById("photo");
const imagePreview = document.getElementById("image-preview");
const btnContent = document.querySelector(".custom-file-btn .btn-content");
const gallery = document.querySelector(".gallery");
const filtersContainer = document.getElementById("filters");
const submitBtn = document.getElementById("submitBtn");
const modalGalleryItems = document.querySelector('.modal-gallery .gallery-items');

//  UTILITAIRES DOM
const clearContainer = container => container.innerHTML = "";
const showElement = (el, display = "block") => el && (el.style.display = display);
const hideElement = el => el && (el.style.display = "none");

//  CONSTANTES ET VARIABLES
const API_BASE_URL = "http://localhost:5678/api";
let allWorks = [];
const token = sessionStorage.getItem("token");
const isConnected = token && token !== "null" && token !== "undefined";

//  FETCH GÉNÉRIQUE ET SPÉCIFIQUES
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du fetch :", error);
  }
}

const fetchCategories = () => fetchData(API_BASE_URL + "/categories");
const fetchWorks = () => fetchData(API_BASE_URL + "/works");

//  AFFICHAGE DES TRAVAUX DE LA GALERIE
function createWorkFigure(work) {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  img.src = work.imageUrl;
  img.alt = work.title;

  const caption = document.createElement('figcaption');
  caption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(caption);

  return figure;
}

function displayGallery(works) {
  clearContainer(gallery);
  works.forEach(work => gallery.appendChild(createWorkFigure(work)));
}

//  FILTRES DE LA GALERIE
function createFilterButton(label, filterCallback, isActive = false) {
  const button = document.createElement('button');
  button.textContent = label;
  button.classList.add('filter-btn');
  if (isActive) button.classList.add('active');

  button.addEventListener('click', () => {
    displayGallery(filterCallback());
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

//  INITIALISATION GALERIE ET FILTRES
async function initGallery() {
  const data = await fetchWorks();
  if (!data) return;
  allWorks = data;
  displayGallery(allWorks);
  displayModalGallery(allWorks);
}

async function initFilters() {
  const categories = await fetchCategories();
  if (!categories) return;

  createFilterButton("Tous", () => allWorks, true);
  categories.forEach(cat => {
    createFilterButton(cat.name, () => allWorks.filter(work => work.categoryId === cat.id));
  });
}

//  UI SELON CONNEXION
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

//  MODALE
// Ouvrir / fermer la modale
function openModal() {
  modal.classList.add("active");
  modalGallery.classList.add("active");
  modalForm.classList.remove("active");
  backArrow.style.display = "none";
  overlay.classList.add("show");

  displayModalGallery(allWorks);
}

function closeModal() {
  modal.classList.remove("active");
  overlay.classList.remove("show");
  resetForm();
  showGalleryView();
}

overlay.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Affichage de la galerie modale
function displayModalGallery(works) {
  clearContainer(modalGalleryItems);
  works.forEach(work => modalGalleryItems.appendChild(createModalWorkFigure(work)));
}

// Création d’un work figure avec bouton corbeille
function createModalWorkFigure(work) {
  const figure = createWorkFigure(work);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.dataset.id = work.id;
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;

  deleteBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/works/${work.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        figure.remove();
        allWorks = allWorks.filter(w => w.id !== work.id);
        displayGallery(allWorks);
        displayModalGallery(allWorks);
      } else {
        console.error("Erreur suppression :", response.status);
      }
    } catch (err) {
      console.error("Erreur fetch DELETE :", err);
    }
  });

  figure.appendChild(deleteBtn);
  return figure;
}

// Navigation modale galerie / formulaire
function showFormView() {
  modalGallery.classList.remove("active");
  modalForm.classList.add("active");
  backArrow.style.display = "block";
}

function showGalleryView() {
  modalForm.classList.remove("active");
  modalGallery.classList.add("active");
  backArrow.style.display = "none";
}

//  Formulaire d'ajout de projet
function updateSubmitButtonState() {
  const hasTitle = titleInput.value.trim() !== "";
  const hasCategory = categorySelect.value !== "";
  const hasImage = imageInput.files && imageInput.files.length > 0;

  const isValid = hasTitle && hasCategory && hasImage;

  submitBtn.disabled = !isValid;
  submitBtn.classList.toggle("active", isValid);
}

function resetForm() {
  addPhotoForm.reset();
  imagePreview.src = "";
  imagePreview.style.display = "none";
  btnContent.style.display = "flex";
  submitBtn.classList.remove("active");
  submitBtn.disabled = true;
}

// Écouteurs champs formulaire
titleInput.addEventListener("input", updateSubmitButtonState);
categorySelect.addEventListener("change", updateSubmitButtonState);
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreview.style.display = "block";
      btnContent.style.display = "none";
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "";
    imagePreview.style.display = "none";
    btnContent.style.display = "flex";
  }
  updateSubmitButtonState();
});

//  Initialisation du select catégories
async function initCategoriesSelect() {
  const categories = await fetchCategories();
  if (!categories) return;

  clearContainer(categorySelect);

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "";
  categorySelect.appendChild(defaultOption);

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// Soumission formulaire
addPhotoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  updateSubmitButtonState();

  if (submitBtn.disabled) {
    alert("Veuillez remplir tous les champs et ajouter une image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", titleInput.value.trim());
  formData.append("category", categorySelect.value);
  formData.append("image", imageInput.files[0]);

  try {
    const response = await fetch(`${API_BASE_URL}/works`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (response.ok) {
      const newWork = await response.json();
      allWorks.push(newWork);
      displayGallery(allWorks);
      displayModalGallery(allWorks);

      resetForm();
      closeModal();
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

//  ÉVÉNEMENTS MODALE
openModalBtn.addEventListener("click", openModal);
addPhotoBtn.addEventListener("click", showFormView);
backArrow.addEventListener("click", showGalleryView);
closeModalBtn.addEventListener("click", closeModal);

//  INITIALISATION
updateSubmitButtonState();
initGallery();
initFilters();
initCategoriesSelect();
handleAuthUI();
