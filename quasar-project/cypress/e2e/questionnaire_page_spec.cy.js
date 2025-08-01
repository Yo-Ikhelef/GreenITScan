describe('Questionnaire', () => {
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

    // Vérifier que le formulaire du questionnaire est visible
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');
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

  it('devrait soumettre le formulaire avec des valeurs valides', () => {
    // Stub la méthode console.log pour capturer la sortie
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Remplir le formulaire avec des valeurs valides
    cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('10');
    cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('2');
    cy.get('input[aria-label="Combien de requêtes web par jour ?"]').type('50');
    cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('5');
    cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('30');
    cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('3');
    cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
    cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('2');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Vérifier que console.log a été appelé avec les bonnes valeurs
    cy.get('@consoleLog').should('have.been.calledWith', {
      emailSimple: 10,
      emailPJ: 2,
      webQueries: 50,
      streamingVideo: 5,
      streamingAudio: 30,
      videoConf: 3,
      pcCount: 1,
      smartphoneCount: 1,
      consoleCount: 0,
      cloudCount: 2,
    });

    // Vérifier que l'utilisateur reste sur la page du questionnaire
    cy.url().should('include', '/questionnaire');
  });

  it('devrait soumettre le formulaire avec toutes les valeurs à zéro', () => {
    // Stub la méthode console.log pour capturer la sortie
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Remplir le formulaire avec des valeurs à zéro
    cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('0');
    cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('0');
    cy.get('input[aria-label="Combien de requêtes web par jour ?"]').type('0');
    cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('0');
    cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('0');
    cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('0');
    cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('0');
    cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('0');
    cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
    cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('0');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Vérifier que console.log a été appelé avec des valeurs à zéro
    cy.get('@consoleLog').should('have.been.calledWith', {
      emailSimple: 0,
      emailPJ: 0,
      webQueries: 0,
      streamingVideo: 0,
      streamingAudio: 0,
      videoConf: 0,
      pcCount: 0,
      smartphoneCount: 0,
      consoleCount: 0,
      cloudCount: 0,
    });

    // Vérifier que l'utilisateur reste sur la page du questionnaire
    cy.url().should('include', '/questionnaire');
  });

  it('devrait empêcher les valeurs négatives dans les champs', () => {
    // Stub la méthode console.log pour capturer la sortie
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Tenter d'entrer une valeur négative dans un champ
    cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('-5');

    // Vérifier que la valeur est corrigée à 0 (ou reste vide) en raison de min="0"
    cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').should('have.value', '0');

    // Remplir les autres champs avec des valeurs valides
    cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('2');
    cy.get('input[aria-label="Combien de requêtes web par jour ?"]').type('50');
    cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('5');
    cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('30');
    cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('3');
    cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
    cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('2');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Vérifier que console.log a été appelé avec la valeur corrigée
    cy.get('@consoleLog').should('have.been.calledWith', {
      emailSimple: 0, // Corrigé à cause de min="0"
      emailPJ: 2,
      webQueries: 50,
      streamingVideo: 5,
      streamingAudio: 30,
      videoConf: 3,
      pcCount: 1,
      smartphoneCount: 1,
      consoleCount: 0,
      cloudCount: 2,
    });

    // Vérifier que l'utilisateur reste sur la page du questionnaire
    cy.url().should('include', '/questionnaire');
  });
});

// Handle ResizeObserver and other uncaught exceptions
Cypress.on('uncaught:exception', (err/*, runnable*/ ) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});
