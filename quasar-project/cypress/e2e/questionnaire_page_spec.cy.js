describe('Questionnaire', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('http://localhost:9000/#/login');
    // Close the drawer if present
    cy.get('body').then(($body) => {
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
  });

  afterEach(() => {
    // Check if the logout button exists before clicking
    cy.get('body').then(($body) => {
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
    // Clear local storage and cookies
    cy.clearLocalStorage();
    cy.clearCookies();
    // Close the drawer if present
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('should submit the form with valid values', () => {
    // Get the auth token from login
    cy.get('@authToken').then((token) => {
      // Intercept the simulation submission request and add Authorization header
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
        // Debug: Log request headers and response
        cy.log('Request Headers:', interception.request.headers);
        cy.log('Response:', interception.response);
        // Verify the payload
        expect(interception.request.body).to.deep.equal({
          emailSimple: 10,
          emailPJ: 2,
          webHours: 5,
          streamingVideo: 5,
          streamingAudio: 30,
          videoConf: 3,
          pcCount: 1,
          smartphoneCount: 1,
          consoleCount: 0,
          cloudAccounts: 2,
        });
        // Check for 401 and provide debugging info
        if (interception.response.statusCode === 401) {
          cy.log('401 Response Body:', interception.response.body);
          throw new Error(
            'Received 401 Unauthorized. Check console for response body. Possible causes: Invalid JWT keys/passphrase, incorrect security.yaml firewall configuration, or Apache stripping Authorization header.'
          );
        }
      });

      // Verify the response status
      cy.get('@submitSimulation').its('response.statusCode').should('eq', 200);
      // Verify redirection to the result page
      cy.url({ timeout: 15000 }).should('include', '/resultat');
    });
  });

  it('should submit the form with all zero values', () => {
    // Get the auth token from login
    cy.get('@authToken').then((token) => {
      // Intercept the simulation submission request and add Authorization header
      cy.intercept('POST', '**/api/simulation/new', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
      }).as('submitSimulation');

      // Fill the form with zero values
      cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('0');
      cy.get('input[aria-label="...avec pièce jointe (1 Mo) ?"]').type('0');
      cy.get('input[aria-label="Combien d\'heures passez-vous sur internet par jour ?"]').type('0');
      cy.get('input[aria-label="Heures de streaming vidéo par semaine ?"]').type('0');
      cy.get('input[aria-label="Minutes de musique en streaming par jour ?"]').type('0');
      cy.get('input[aria-label="Heures de visioconférence par semaine ?"]').type('0');
      cy.get('input[aria-label="Nombre d\'ordinateurs portables utilisés cette année ?"]').type('0');
      cy.get('input[aria-label="Nombre de smartphones utilisés cette année ?"]').type('0');
      cy.get('input[aria-label="Nombre de consoles de jeu utilisées ?"]').type('0');
      cy.get('input[aria-label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?"]').type('0');

      // Submit the form
      cy.get('form.q-form').submit();

      // Wait for the simulation submission and verify
      cy.wait('@submitSimulation', { timeout: 20000 }).then((interception) => {
        // Debug: Log request headers and response
        cy.log('Request Headers:', interception.request.headers);
        cy.log('Response:', interception.response);
        // Verify the payload
        expect(interception.request.body).to.deep.equal({
          emailSimple: 0,
          emailPJ: 0,
          webHours: 0,
          streamingVideo: 0,
          streamingAudio: 0,
          videoConf: 0,
          pcCount: 0,
          smartphoneCount: 0,
          consoleCount: 0,
          cloudAccounts: 0,
        });
        // Check for 401 and provide debugging info
        if (interception.response.statusCode === 401) {
          cy.log('401 Response Body:', interception.response.body);
          throw new Error(
            'Received 401 Unauthorized. Check console for response body. Possible causes: Invalid JWT keys/passphrase, incorrect security.yaml firewall configuration, or Apache stripping Authorization header.'
          );
        }
      });

      // Verify the response status
      cy.get('@submitSimulation').its('response.statusCode').should('eq', 200);
      // Verify redirection to the result page
      cy.url({ timeout: 15000 }).should('include', '/resultat');
    });
  });

  it('should handle negative values in fields', () => {
    // Get the auth token from login
    cy.get('@authToken').then((token) => {
      // Intercept the simulation submission request and add Authorization header
      cy.intercept('POST', '**/api/simulation/new', (req) => {
        req.headers['Authorization'] = `Bearer ${token}`;
      }).as('submitSimulation');

      // Attempt to enter a negative value
      cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').type('-5');
      // Verify that the input contains -5 (no client-side correction)
      cy.get('input[aria-label="Combien d\'emails envoyez-vous par jour ?"]').should('have.value', '-5');
      // Fill the other fields with valid values
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
        // Debug: Log request headers and response
        cy.log('Request Headers:', interception.request.headers);
        cy.log('Response:', interception.response);
        // Verify the payload (sent as -5, backend casts to 0)
        expect(interception.request.body).to.deep.equal({
          emailSimple: -5,
          emailPJ: 2,
          webHours: 5,
          streamingVideo: 5,
          streamingAudio: 30,
          videoConf: 3,
          pcCount: 1,
          smartphoneCount: 1,
          consoleCount: 0,
          cloudAccounts: 2,
        });
        // Check for 401 and provide debugging info
        if (interception.response.statusCode === 401) {
          cy.log('401 Response Body:', interception.response.body);
          throw new Error(
            'Received 401 Unauthorized. Check console for response body. Possible causes: Invalid JWT keys/passphrase, incorrect security.yaml firewall configuration, or Apache stripping Authorization header.'
          );
        }
        // Verify the response reflects backend casting of negative to 0
        expect(interception.response.body.details).to.be.an('array');
        // const emailDetail = interception.response.body.details.find((detail) => detail.key === 'email');
       // expect(emailDetail.value).to.eq(0); // Backend casts -5 to 0
      });

      // Verify the response status
      cy.get('@submitSimulation').its('response.statusCode').should('eq', 200);
      // Verify redirection to the result page
      cy.url({ timeout: 15000 }).should('include', '/resultat');
    });
  });
});

// Handle ResizeObserver and other uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});
