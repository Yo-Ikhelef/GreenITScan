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
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/auth/logout',
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

  it('devrait se connecter avec succès avec des informations valides', () => {
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('input[type="checkbox"]').check({ force: true });
    cy.get('form.q-form').submit();

    cy.url().should('include', '/questionnaire');
  });

//  it('devrait se souvenir de l\'email si "Remember Me" est coché', () => {
//    cy.get('input[aria-label="Email"]').type('user@example.com');
//    cy.get('input[aria-label="Password"]').type('azerty');
//    cy.get('input[type="checkbox"]').check({ force: true });
//    cy.get('form.q-form').submit();
//
//    cy.url().should('include', '/questionnaire');
//
//    // Cliquer sur le bouton "Déconnexion" dans la barre de navigation
//    cy.get('button[aria-label="Déconnexion"]').click();
//
//    // Revenir à la page de connexion
//    cy.url().should('include', '/login');
//    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');
//
//    cy.wait(5000)
//    // Vérifier que l'email est pré-rempli
//    cy.get('input[aria-label="Email"]').should('have.value', 'user@example.com');
//
//    // Vérifier que la checkbox est cochée
//    cy.get('.q-checkbox').should('have.attr', 'aria-checked', 'true');
//  });

  it('devrait se déconnecter avec succès', () => {
    // Se connecter d'abord
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
    cy.get('form.q-form').submit();

    cy.url().should('include', '/questionnaire');

    // Cliquer sur le bouton "Déconnexion" dans la barre de navigation
    cy.get('button[aria-label="Déconnexion"]').click();

    // Vérifier que l'utilisateur est redirigé vers la page de connexion
    cy.url().should('include', '/login');
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');

    // Vérifier que l'utilisateur n'est plus authentifié (par exemple, absence du bouton "Déconnexion")
    cy.get('button[aria-label="Déconnexion"]').should('not.exist');
  });

    it('devrait se souvenir de l\'email si "Remember Me" est coché', () => {
    cy.get('input[aria-label="Email"]').type('user@example.com');
    cy.get('input[aria-label="Password"]').type('azerty');
//    cy.get('input[type="checkbox"]').check({ force: true });
    cy.get('form.q-form').submit();

    cy.url().should('include', '/questionnaire');

    // Cliquer sur le bouton "Déconnexion" dans la barre de navigation
    cy.get('button[aria-label="Déconnexion"]').click();

    // Revenir à la page de connexion
    cy.url().should('include', '/login');
    cy.get('form.q-form', { timeout: 10000 }).should('be.visible');

    cy.wait(5000)
    // Vérifier que l'email est pré-rempli
    cy.get('input[aria-label="Email"]').should('have.value', 'user@example.com');

    // Vérifier que la checkbox est cochée
    cy.get('.q-checkbox').should('have.attr', 'aria-checked', 'true');
  });

});