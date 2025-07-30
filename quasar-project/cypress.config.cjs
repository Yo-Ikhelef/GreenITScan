const { defineConfig } = require("cypress");
const fs = require("fs"); // Ajout de fs pour lire les fichiers

module.exports = defineConfig({
  e2e: {
    // Utiliser une URL dynamique pour le front-end
    baseUrl: process.env.CYPRESS_FRONTEND_URL || "http://localhost:9000",
    // Ajouter des variables d'environnement pour l'API
    env: {
      apiUrl: process.env.CYPRESS_API_URL || "http://localhost:8000", // URL par défaut pour le développement local
    },
    setupNodeEvents(on/*, config*/) {
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.name === "electron") {
          launchOptions.preferences.fullscreen = false; // Éviter des problèmes d'affichage
        }
        return launchOptions;
      });

      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        // Nouvelle tâche pour vérifier les fichiers téléchargés
        readFileMaybe({ path }) {
          if (fs.existsSync(path)) {
            return fs.readFileSync(path, "utf8");
          }
          return null;
        },
      });
    },
    projectId: "8v18h7",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    downloadsFolder: "cypress/downloads", // Dossier pour les téléchargements
    // Activer les captures d'écran et vidéos pour le débogage
    screenshotOnRunFailure: false,
    video: false,
    // Augmenter les délais d'attente pour la CI
    defaultCommandTimeout: 10000, // 10 secondes
    requestTimeout: 15000, // 15 secondes
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "webpack",
    },
  },
});


