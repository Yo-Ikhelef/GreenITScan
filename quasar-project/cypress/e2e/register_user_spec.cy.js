describe('Inscription', () => {
  beforeEach(() => {
    // Visiter la page d'inscription
    cy.visit('http://localhost:9000/#/register');

    // Fermer le drawer si présent
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });

    // Vérifier que le formulaire est visible
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    // Nettoyer l'état après chaque test
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/users/logout', // Updated endpoint
      failOnStatusCode: false,
    });

    cy.clearLocalStorage();
    cy.clearCookies();

    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('devrait s\'inscrire avec succès avec des informations valides', () => {
    // Générer un email unique pour éviter les conflits
    const uniqueEmail = `user${Date.now()}@example.com`;

    // Remplir le formulaire
    cy.get('input[aria-label="Email"]').type(uniqueEmail);
    cy.get('input[aria-label="Mot de passe"]').type('azerty');
    cy.get('input[aria-label="Confirmer le mot de passe"]').type('azerty');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Vérifier la redirection vers la page du questionnaire
    cy.url().should('include', '/questionnaire');
  });

  it('devrait afficher une erreur si les mots de passe ne correspondent pas', () => {
    // Remplir le formulaire avec des mots de passe différents
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Mot de passe"]').type('azerty');
    cy.get('input[aria-label="Confirmer le mot de passe"]').type('qwerty');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Vérifier le message d'erreur
    cy.contains('.text-negative', 'Les mots de passe ne correspondent pas.').should('be.visible');

    // Vérifier que l'utilisateur reste sur la page d'inscription
    cy.url().should('include', '/register');
  });

  it('devrait afficher une erreur si l\'inscription échoue (email déjà utilisé)', () => {
    // Intercepter la requête API pour simuler une erreur
    cy.intercept('POST', 'http://localhost:8000/api/users/register', {
      statusCode: 400,
      body: { error: 'Cet email est déjà utilisé.' },
    }).as('registerRequest');

    // Remplir le formulaire
    cy.get('input[aria-label="Email"]').type('existinguser@example.com');
    cy.get('input[aria-label="Mot de passe"]').type('azerty');
    cy.get('input[aria-label="Confirmer le mot de passe"]').type('azerty');

    // Soumettre le formulaire
    cy.get('form.q-form').submit();

    // Attendre la réponse de la requête
    cy.wait('@registerRequest');

    // Vérifier le message d'erreur
    cy.contains('.text-negative', 'Cet email est déjà utilisé.').should('be.visible');

    // Vérifier que l'utilisateur reste sur la page d'inscription
    cy.url().should('include', '/register');
  });
});

// Handle ResizeObserver error globally
Cypress.on('uncaught:exception', (err/*, runnable */) => {
  // Ignore ResizeObserver errors
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Let other errors fail the test
});
