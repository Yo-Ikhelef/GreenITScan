describe('Connexion', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9000/#/login');
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    cy.request({ method: 'POST', url: 'http://localhost:8000/api/auth/logout', failOnStatusCode: false });
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.get('body').then(($body) => {
      if ($body.find('.q-drawer__backdrop').length) {
        cy.get('.q-drawer__backdrop').click({ force: true });
      }
    });
  });

  it('devrait se connecter avec succès avec des informations valides', () => {
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('input[type="checkbox"]').check({ force: true }); // Forcer le coche
    cy.get('form.q-form').submit();
    // cy.contains('.q-notification', 'Login successful! Welcome back.', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/questionnaire');
  });

  it('devrait se souvenir de l\'email si "Remember Me" est coché', () => {
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('input[type="checkbox"]').check({ force: true }); // Forcer le coche
    cy.get('form.q-form').submit();
    // cy.contains('.q-notification', 'Login successful! Welcome back.', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/questionnaire');
    // cy.visit('http://localhost:9000/#/logout'); // Vérifiez que c’est la bonne URL

    cy.visit('http://localhost:9000/#/login');
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');

    // Vérifier que l’email est bien pré-rempli
    cy.get('input[aria-label="Email"]').should('have.value', 'user@example.com', { timeout: 10000 });

    // Vérifier que la checkbox est cochée
    cy.get('.q-checkbox').should('have.attr', 'aria-checked', 'true');
  });
});
