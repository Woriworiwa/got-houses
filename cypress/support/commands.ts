/// <reference types="cypress" />

const FAVORITES_KEY = 'got-houses-favorites';

Cypress.Commands.add('clearFavorites', () => {
  cy.clearLocalStorage(FAVORITES_KEY);
});

Cypress.Commands.add('setFavorites', (ids: number[]) => {
  cy.window().then((win) => {
    win.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      clearFavorites(): Chainable<void>;
      setFavorites(ids: number[]): Chainable<void>;
    }
  }
}
