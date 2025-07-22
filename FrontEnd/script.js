// Script de test pour vérifier que JS fonctionne bien

console.log("Le script.js est bien chargé !");

// Exemple : changer le texte d'un élément avec l'id "titre"
document.addEventListener('DOMContentLoaded', () => {
  const titre = document.getElementById('titre');
  if(titre) {
    titre.textContent = "Titre modifié par JavaScript !";
  }
});