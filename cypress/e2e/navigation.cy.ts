import housesFixture from '../fixtures/houses.json';

const API_BASE = 'https://anapioficeandfire.com/api';
const LINK_HEADER =
  `<${API_BASE}/houses?page=2&pageSize=9>; rel="next", ` +
  `<${API_BASE}/houses?page=44&pageSize=9>; rel="last"`;

describe('Navigation', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}/houses*`, {
      statusCode: 200,
      headers: { Link: LINK_HEADER },
      body: housesFixture,
    }).as('getHouses');
  });

  it('redirects from root to /houses', () => {
    cy.visit('/');
    cy.url().should('include', '/houses');
  });

  it('shows the site title linking to /houses', () => {
    cy.visit('/houses');
    cy.get('[aria-label="Westeros Catalog home"]')
      .should('be.visible')
      .and('have.attr', 'href', '/houses');
  });

  it('navigates to Favorites page via desktop nav', () => {
    cy.visit('/houses');
    cy.get('[aria-label="Main navigation"]').contains('Favorites').click();
    cy.url().should('include', '/favorites');
    cy.get('h1').should('contain', 'My Favorites');
  });

  it('navigates to Houses page via desktop nav', () => {
    cy.visit('/favorites');
    cy.get('[aria-label="Main navigation"]').contains('Houses').click();
    cy.url().should('include', '/houses');
    cy.get('h1').should('contain', 'The Great Houses');
  });

  it('navigates via mobile bottom nav', () => {
    cy.viewport('iphone-se2');
    cy.visit('/houses');
    cy.get('[aria-label="Mobile navigation"]').find('[aria-label="Favorites"]').click();
    cy.url().should('include', '/favorites');
  });

  it('highlights the active nav link', () => {
    cy.visit('/houses');
    cy.get('[aria-label="Main navigation"]')
      .contains('Houses')
      .should('have.class', '!text-primary');
  });
});
