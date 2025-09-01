// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email, password) => {
  cy.request('GET', 'http://localhost:8000/sanctum/csrf-cookie').then((response) => {
    cy.log('CSRF response:', response);
    // Extraire le cookie XSRF-TOKEN
    const cookies = response.headers['set-cookie'];
    let xsrfToken = 'mock-xsrf-token'; // Fallback pour CI
    if (cookies) {
      const xsrfCookie = cookies.find((cookie) => cookie.includes('XSRF-TOKEN'));
      if (xsrfCookie) {
        xsrfToken = decodeURIComponent(xsrfCookie.split(';')[0].split('=')[1]);
      }
    }
    cy.log('XSRF-TOKEN:', xsrfToken);

    // Effectuer la requête de login
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/auth/login',
      body: { email, password },
      headers: {
        'X-XSRF-TOKEN': xsrfToken
      }
    }).then((response) => {
      cy.log('Login response:', JSON.stringify(response.body, null, 2));
      // Ajuster selon la structure de la réponse
      const token = response.body.data?.token || response.body.token;
      if (!token) {
        throw new Error('Token not found in login response');
      }
      cy.wrap(token).as('authToken');
    });
  });
});

Cypress.Commands.add('mockCommunicationsStore', (data) => {
  cy.window().then((win) => {
    Cypress.log({ name: 'Window keys', message: JSON.stringify(Object.keys(win).slice(0, 20)) });
    const pinia = win.__pinia || win.app?.config?.globalProperties?.$pinia;
    let storeState = null;
    if (pinia) {
      Cypress.log({ name: 'Pinia', message: 'Pinia trouvé, injection des données' });
      pinia.state.value.communicationsStore = pinia.state.value.communicationsStore || {};
      pinia.state.value.communicationsStore.communications = data.data;
      storeState = pinia.state.value.communicationsStore;
    } else {
      Cypress.log({ name: 'Pinia', message: 'Pinia non trouvé, tentative via store' });
      const store = win.app?.$store || win.store || {};
      store.communicationsStore = store.communicationsStore || {};
      store.communicationsStore.communications = data.data;
      storeState = store.communicationsStore;
    }
    Cypress.log({ name: 'Store après mock', message: JSON.stringify(storeState) });
  });
});
