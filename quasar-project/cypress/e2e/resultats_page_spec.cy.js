describe('Résultat Empreinte Carbone', () => {
  beforeEach(() => {
    // Visiter la page de connexion et connecter l'utilisateur
    cy.visit('http://localhost:9000/#/login');

    // Fermer le drawer si présent
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });

    // Vérifier que le formulaire de connexion est visible
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');

    // Se connecter avec des informations valides
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('form.q-form').submit();

    // Vérifier la redirection vers la page du questionnaire
    cy.url().should('include', '/questionnaire');

    // Naviguer vers la page de résultat
    cy.visit('http://localhost:9000/#/resultat');

    // Vérifier que la page de résultat est chargée
    cy.get('.q-page', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    // Déconnecter l'utilisateur via le bouton "Déconnexion"
    cy.get('button[aria-label="Déconnexion"]').should('be.visible').click();

    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    cy.url().should('include', '/login');

    // Nettoyer le stockage local et les cookies
    cy.clearLocalStorage();
    cy.clearCookies();

    // Fermer le drawer si présent
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('devrait afficher tous les éléments de résultat correctement', () => {
    // Vérifier le titre
    cy.get('.text-h5').contains('Votre empreinte carbone').should('be.visible');
    // Vérifier le sous-titre
    cy.get('.text-subtitle2').contains('Estimation basée sur vos réponses').should('be.visible');

    // Vérifier chaque élément de resultItems
    cy.get('.result-item').contains('.result-label', 'Emails envoyés').parent().contains('.result-value', '10').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Emails avec PJ').parent().contains('.result-value', '2').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Requêtes web').parent().contains('.result-value', '50').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Streaming vidéo').parent().contains('.result-value', '5 h/semaine').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Streaming audio').parent().contains('.result-value', '60 min/jour').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Visioconférence').parent().contains('.result-value', '3 h/semaine').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'PC utilisés').parent().contains('.result-value', '1').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Smartphones').parent().contains('.result-value', '1').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Consoles').parent().contains('.result-value', '0').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Comptes cloud').parent().contains('.result-value', '2').should('be.visible');

    // Vérifier que l'utilisateur reste sur la page de résultat
    cy.url().should('include', '/resultat');
  });

  it('devrait afficher correctement une sélection d\'éléments spécifiques', () => {
    // Vérifier quelques éléments spécifiques pour confirmer les valeurs
    cy.get('.result-item').contains('.result-label', 'Emails envoyés').parent().contains('.result-value', '10').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Consoles').parent().contains('.result-value', '0').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Streaming vidéo').parent().contains('.result-value', '5 h/semaine').should('be.visible');

    // Vérifier que l'utilisateur reste sur la page de résultat
    cy.url().should('include', '/resultat');
  });

  it('devrait afficher les icônes associées aux éléments', () => {
    // Vérifier la présence des icônes via leurs classes Material Design Icons
    cy.get('.mdi-email').should('exist');
    cy.get('.mdi-email-fast').should('exist');
    cy.get('.mdi-web').should('exist');
    cy.get('.mdi-youtube').should('exist');
    cy.get('.mdi-music').should('exist');
    cy.get('.mdi-video').should('exist');
    cy.get('.mdi-laptop').should('exist');
    cy.get('.mdi-cellphone').should('exist');
    cy.get('.mdi-gamepad-variant').should('exist');
    cy.get('.mdi-cloud').should('exist');

    // Vérifier que l'utilisateur reste sur la page de résultat
    cy.url().should('include', '/resultat');
  });
});

// Handle ResizeObserver and other uncaught exceptions
Cypress.on('uncaught:exception', (err/*, runnable */) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});
