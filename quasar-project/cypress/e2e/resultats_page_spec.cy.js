describe('Résultat Empreinte Carbone', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('http://localhost:9000/#/login');
    // Close the drawer if present
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
    // Verify that the login form is visible
    cy.get('form.q-form', { timeout: 15000 }).should('be.visible');
    // Log in with valid credentials
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    // Intercept the login request
    cy.intercept('POST', '**/api/users/login').as('loginRequest');
    cy.get('form.q-form').submit();
    // Wait for login response and store the token
    cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
      cy.log('Login response:', interception.response.body);
      const token = interception.response.body.token;
      cy.wrap(token).as('authToken');
      // Store token in localStorage for frontend
      cy.window().then((win) => {
        win.localStorage.setItem('token', token);
      });
    });
    // Verify redirection to the questionnaire page
    cy.url({ timeout: 15000 }).should('include', '/questionnaire');
    // Verify that the questionnaire form is visible
    cy.get('form.q-form', { timeout: 15000 }).should('be.visible');

    // Submit a simulation to populate simulationStore.result
    cy.get('@authToken').then((token) => {
      cy.intercept('POST', '**/api/simulation/new', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
      }).as('submitSimulation');

      // Fill the form with valid values
      cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('10');
      cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('2');
      cy.get('input[aria-label="Combien d\'heures passez-vous sur internet par jour ?"]').type('5');
      cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('5');
      cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('30');
      cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('3');
      cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('1');
      cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('1');
      cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
      cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('2');

      // Submit the form
      cy.get('form.q-form').submit();

      // Wait for the simulation submission and verify
      cy.wait('@submitSimulation', { timeout: 20000 }).then((interception) => {
        cy.log('Simulation Request Headers:', interception.request.headers);
        cy.log('Simulation Response:', interception.response);
        if (interception.response.statusCode === 401) {
          cy.log('401 Response Body:', interception.response.body);
          throw new Error(
            'Received 401 Unauthorized on simulation submission. Check console for response body. Possible causes: Invalid JWT keys/passphrase, incorrect security.yaml, or Apache stripping Authorization header.'
          );
        }
      });
      // Verify the response status
      cy.get('@submitSimulation').its('response.statusCode').should('eq', 200);
      // Verify redirection to the result page
      cy.url({ timeout: 15000 }).should('include', '/resultat');
    });
    // Verify that the result page is loaded
    cy.get('.q-page', { timeout: 15000 }).should('be.visible');
    // Debug: Log the DOM content of the result page
    cy.get('.q-card').invoke('html').then((html) => {
      cy.log('Result Page DOM:', html);
    });
  });

  afterEach(() => {
    // Ensure the page is loaded before accessing body
    cy.visit('http://localhost:9000/#/resultat', { timeout: 15000 }).then(() => {
      cy.get('body', { timeout: 15000 }).then(($body) => {
        if ($body.find('button[aria-label="Déconnexion"]').length) {
          cy.log('Logout button found, clicking...');
          cy.get('button[aria-label="Déconnexion"]', { timeout: 15000 }).should('be.visible').click();
          cy.url({ timeout: 15000 }).should('include', '/login');
        } else {
          cy.log('Logout button not found. Forcing login page visit.');
          cy.visit('http://localhost:9000/#/login');
          cy.url({ timeout: 15000 }).should('include', '/login');
        }
      });
    });
    // Clear local storage and cookies
    cy.clearLocalStorage();
    cy.clearCookies();
    // Close the drawer if present
    cy.get('body', { timeout: 15000 }).then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('devrait afficher tous les éléments de résultat correctement', () => {
    // Verify the title
    cy.get('.text-h5').contains('Votre empreinte carbone').should('be.visible');
    // Verify the subtitle
    cy.get('.text-subtitle2').contains('Vos réponses').should('be.visible');
    // Verify each result item
    cy.get('.q-card').within(() => {
      cy.get('.result-item').contains('.result-label', 'Email envoyé').parent().contains('.result-value', '10').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Email avec pièce jointe (1Mo)').parent().contains('.result-value', '2').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Requête web').parent().contains('.result-value', '5').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Streaming vidéo (HD)').parent().contains('.result-value', '5').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Streaming audio').parent().contains('.result-value', '30').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Visioconférence (HD)').parent().contains('.result-value', '3').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Ordinateur portable (fabrication)').parent().contains('.result-value', '1').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Smartphone (fabrication)').parent().contains('.result-value', '1').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Console de jeu (fabrication)').parent().contains('.result-value', '0').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Service cloud professionnel ou d\'hébergement (stockage)').parent().contains('.result-value', '2').should('be.visible');
      // Verify additional result items
      cy.get('.result-item').contains('.result-label', 'Total CO₂ (kg)').parent().contains('.result-value', '129.51').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Équivalent arbres').parent().contains('.result-value', '5').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Équivalent km voiture').parent().contains('.result-value', '1').should('be.visible');
    });
    // Verify the user stays on the result page
    cy.url({ timeout: 15000 }).should('include', '/resultat');
  });

  it('devrait afficher correctement une sélection d\'éléments spécifiques', () => {
    // Verify specific result items
    cy.get('.q-card').within(() => {
      cy.get('.result-item').contains('.result-label', 'Email envoyé').parent().contains('.result-value', '10').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Console de jeu (fabrication)').parent().contains('.result-value', '0').should('be.visible');
      cy.get('.result-item').contains('.result-label', 'Streaming vidéo (HD)').parent().contains('.result-value', '5').should('be.visible');
    });
    // Verify the user stays on the result page
    cy.url({ timeout: 15000 }).should('include', '/resultat');
  });

  it('devrait afficher les icônes associées aux éléments', () => {
    // Verify the presence of icons
    cy.get('.q-card').within(() => {
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
      cy.get('.mdi-pine-tree').should('exist');
      cy.get('.mdi-car').should('exist');
    });
    // Verify the user stays on the result page
    cy.url({ timeout: 15000 }).should('include', '/resultat');
  });

  it('devrait permettre de retourner au questionnaire', () => {
    // Verify the "Nouveau questionnaire" button exists and click it
    cy.get('.q-btn').contains('Nouveau questionnaire').should('be.visible').click();
    // Verify redirection to the questionnaire page
    cy.url({ timeout: 15000 }).should('include', '/questionnaire');
    // Verify the questionnaire form is visible
    cy.get('form.q-form', { timeout: 15000 }).should('be.visible');
  });
});

// Handle ResizeObserver and other uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});
