/*

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
Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});

*/

describe('Résultat Empreinte Carbone', () => {
  beforeEach(() => {
    // Mock login API
    cy.intercept('POST', 'http://localhost:8000/api/users/login', {
      statusCode: 200,
      body: { token: 'mock-token' },
    }).as('loginRequest');

    // Mock results API (adjust endpoint as needed)
    cy.intercept('GET', 'http://localhost:8000/api/results', {
      statusCode: 200,
      body: {
        emailSimple: 10,
        emailPJ: 2,
        webQueries: 50,
        streamingVideo: 5,
        streamingAudio: 60,
        videoConf: 3,
        pcCount: 1,
        smartphoneCount: 1,
        consoleCount: 0,
        cloudCount: 2,
      },
    }).as('getResults');

    // Visiter la page de connexion
    cy.visit('http://localhost:9000/#/login');
    cy.log('Visiting login page');

    // Fermer le drawer si présent
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.log('Closing drawer');
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });

    // Vérifier le formulaire de connexion
    cy.log('Checking login form');
    cy.get('form.q-form', { timeout: 15000 }).should('be.visible');

    // Se connecter
    cy.log('Entering login credentials');
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('form.q-form').submit();
    cy.wait('@loginRequest');
    cy.log('Login request completed');

    // Vérifier la redirection vers le questionnaire
    cy.log('Checking redirect to questionnaire');
    cy.url().should('include', '/questionnaire');

    // Soumettre le questionnaire
    cy.log('Filling questionnaire');
    cy.get('form.q-form', { timeout: 15000 }).should('be.visible');
    cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('10');
    cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('2');
    cy.get('input[aria-label="Combien de requêtes web par jour ?"]').type('50');
    cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('5');
    cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('60');
    cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('3');
    cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('1');
    cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
    cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('2');
    cy.get('form.q-form').submit();
    cy.log('Questionnaire submitted');

    // Naviguer vers la page de résultat
    cy.log('Visiting resultat page');
    cy.visit('http://localhost:9000/#/resultat');
    cy.wait('@getResults');

    // Vérifier que la page est chargée
    cy.log('Checking resultat page load');
    cy.get('.q-page', { timeout: 15000 }).should('be.visible');
  });

  afterEach(() => {
    // Déconnecter via le bouton
    cy.log('Clicking logout button');
    cy.get('button[aria-label="Déconnexion"]').should('be.visible').click();
    cy.log('Checking redirect to login');
    cy.url().should('include', '/login');
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.log('Closing drawer');
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('devrait afficher tous les éléments de résultat correctement', () => {
    cy.log('Checking title');
    cy.get('.text-h5').contains('Votre empreinte carbone').should('be.visible');
    cy.log('Checking subtitle');
    cy.get('.text-subtitle2').contains('Estimation basée sur vos réponses').should('be.visible');

    cy.log('Checking result items');
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

    cy.log('Checking URL');
    cy.url().should('include', '/resultat');
  });

  it('devrait afficher correctement une sélection d\'éléments spécifiques', () => {
    cy.log('Checking specific items');
    cy.get('.result-item').contains('.result-label', 'Emails envoyés').parent().contains('.result-value', '10').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Consoles').parent().contains('.result-value', '0').should('be.visible');
    cy.get('.result-item').contains('.result-label', 'Streaming vidéo').parent().contains('.result-value', '5 h/semaine').should('be.visible');
    cy.log('Checking URL');
    cy.url().should('include', '/resultat');
  });

  it('devrait afficher les icônes associées aux éléments', () => {
    cy.log('Checking icons');
    cy.get('.result-item').find('i[name="mdi-email"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-email-fast"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-web"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-youtube"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-music"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-video"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-laptop"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-cellphone"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-gamepad-variant"]').should('exist');
    cy.get('.result-item').find('i[name="mdi-cloud"]').should('exist');
    cy.log('Checking URL');
    cy.url().should('include', '/resultat');
  });
});

Cypress.on('uncaught:exception', (err) => {
  cy.log('Uncaught exception:', err.message);
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false;
  }
  return true;
});
