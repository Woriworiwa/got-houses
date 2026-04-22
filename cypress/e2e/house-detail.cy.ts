import houseFixture from '../fixtures/house.json';

const API_BASE = 'https://anapioficeandfire.com/api';
const HOUSE_ID = 362;

describe('House Detail', () => {
  beforeEach(() => {
    cy.clearFavorites();
    cy.intercept('GET', `${API_BASE}/houses/${HOUSE_ID}`, {
      statusCode: 200,
      body: houseFixture,
    }).as('getHouse');
  });

  it('shows a loading spinner while fetching', () => {
    cy.intercept('GET', `${API_BASE}/houses/${HOUSE_ID}`, (req) => {
      req.reply((res) => {
        res.setDelay(300);
        res.send({ statusCode: 200, body: houseFixture });
      });
    }).as('getHouseDelayed');

    cy.visit(`/houses/${HOUSE_ID}`);
    cy.get('[aria-label="Loading house details"]').should('be.visible');
    cy.wait('@getHouseDelayed');
    cy.get('[aria-label="Loading house details"]').should('not.exist');
  });

  it('displays the house name', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');
    cy.get('h1').should('contain', houseFixture.name);
  });

  it('displays the house region', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');
    cy.contains(houseFixture.region).should('be.visible');
  });

  it('displays the house words', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');
    cy.contains(houseFixture.words).should('be.visible');
  });

  it('displays house detail fields', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');

    cy.contains('dt', 'Founded').siblings('dd').should('contain', houseFixture.founded);
    cy.contains('dt', 'Founder').siblings('dd').should('contain', houseFixture.founder);
    cy.contains('dt', 'Seats').siblings('dd').should('contain', houseFixture.seats[0]);
  });

  it('displays ancestral weapons', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');
    cy.contains('dt', 'Ancestral Weapons')
      .siblings('dd')
      .should('contain', houseFixture.ancestralWeapons[0]);
  });

  it('shows an error when the API fails', () => {
    cy.intercept('GET', `${API_BASE}/houses/${HOUSE_ID}`, { statusCode: 404 }).as('getHouseFail');
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouseFail');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('has a back link to the houses list', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');
    cy.contains('Back to Houses').click();
    cy.url().should('include', '/houses');
  });

  it('adds the house to favorites from the detail page', () => {
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');

    cy.get('[aria-label="Add to favorites"]').click();
    cy.get('[aria-label="Remove from favorites"]').should('be.visible');
    cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('contain', '1');
  });

  it('removes the house from favorites on the detail page', () => {
    cy.setFavorites([HOUSE_ID]);
    cy.visit(`/houses/${HOUSE_ID}`);
    cy.wait('@getHouse');

    cy.get('[aria-label="Remove from favorites"]').click();
    cy.get('[aria-label="Add to favorites"]').should('be.visible');
    cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('not.exist');
  });
});
