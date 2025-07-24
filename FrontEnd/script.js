// Vérifier que le JS est bien chargé
console.log("Le script.js est bien chargé !");

// Sélection de la galerie et du conteneur des filtres
const gallery = document.querySelector('.gallery');
const filtersContainer = document.getElementById('filters');

let allWorks = [];

// Fonction pour afficher des projets dans la galerie
function displayWorks(works) {
  gallery.innerHTML = ""; // Vider la galerie

  works.forEach(work => {
    const figure = document.createElement('figure');
    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;
    gallery.appendChild(figure);
  });
}

// Charger les projets depuis l'API
fetch('http://localhost:5678/api/works')
  .then(response => response.json())
  .then(data => {
    allWorks = data;
    displayWorks(allWorks); // Afficher tous les projets
  });

// Charger les catégories depuis l'API et créer les filtres
fetch('http://localhost:5678/api/categories')
  .then(response => response.json())
  .then(categories => {
    // Ajouter le bouton "Tous"
    const allBtn = document.createElement('button');
    allBtn.textContent = "Tous";
    allBtn.classList.add('filter-btn', 'active');
    allBtn.addEventListener('click', () => {
      displayWorks(allWorks);
      setActiveButton(allBtn);
    });
    filtersContainer.appendChild(allBtn);

    // Créer un bouton pour chaque catégorie
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
  });

// Fonction pour activer visuellement le bouton sélectionné
function setActiveButton(activeBtn) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
}