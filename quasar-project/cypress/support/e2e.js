// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// cypress/support/e2e.js
import './commands';
require('cypress-real-events/support');

beforeEach(() => {
  cy.log('Starting test');
  const authToken = Cypress.env('authToken');

  // Vérifier si le token est défini
  if (authToken) {
    // Mock pour création d’utilisateur
    cy.intercept('POST', 'http://localhost:8000/api/users*', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        message: 'User created'
      },
      headers: { Authorization: `Bearer ${authToken}` },
    }).as('createUser');

    // Mock pour édition de cas de garantie
    cy.intercept('PUT', 'http://localhost:8000/api/warranty-cases*', {
      statusCode: 200,
      body: {
        id: 1,
        title: 'Test Warranty Case',
        status: 'updated',
        message: 'Warranty case updated'
      },
      headers: { Authorization: `Bearer ${authToken}` },
    }).as('editWarrantyCase');

    // Mock générique
    cy.intercept('GET', 'http://localhost:8000/api/*', {
      statusCode: 200,
      body: { message: 'Mock API response', token: authToken },
      headers: { Authorization: `Bearer ${authToken}` },
    }).as('mockApiGet');

    cy.intercept('POST', 'http://localhost:8000/api/auth/login', {
      statusCode: 200,
      body: { token: authToken },
      headers: { Authorization: `Bearer ${authToken}` },
    }).as('mockApiPost');
  }
});

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message);
  if (
    err.message.includes('Cannot read properties of undefined (reading \'toLowerCase\')') ||
    err.message.includes('unhandled promise rejection') ||
    err.message.includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    return false;
  }
  return true;
});

