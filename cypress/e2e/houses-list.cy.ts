import housesFixture from '../fixtures/houses.json';

const API_BASE = 'https://anapioficeandfire.com/api';
const LINK_HEADER =
  `<${API_BASE}/houses?page=2&pageSize=9>; rel="next", ` +
  `<${API_BASE}/houses?page=44&pageSize=9>; rel="last"`;

describe('Houses List', () => {
  beforeEach(() => {
    cy.clearFavorites();
    cy.intercept('GET', `${API_BASE}/houses*`, {
      statusCode: 200,
      headers: { Link: LINK_HEADER },
      body: housesFixture,
    }).as('getHouses');
  });

  it('displays the page heading', () => {
    cy.visit('/houses');
    cy.get('h1').should('contain', 'The Great Houses');
  });

  it('shows a loading spinner while fetching', () => {
    cy.intercept('GET', `${API_BASE}/houses*`, (req) => {
      req.reply((res) => {
        res.setDelay(300);
        res.send({
          statusCode: 200,
          headers: { Link: LINK_HEADER },
          body: housesFixture,
        });
      });
    }).as('getHousesDelayed');

    cy.visit('/houses');
    cy.get('[aria-label="Loading houses"]').should('be.visible');
    cy.wait('@getHousesDelayed');
    cy.get('[aria-label="Loading houses"]').should('not.exist');
  });

  it('renders a card for each house in the response', () => {
    cy.visit('/houses');
    cy.wait('@getHouses');
    cy.get('article').should('have.length', housesFixture.length);
  });

  it('displays house names on the cards', () => {
    cy.visit('/houses');
    cy.wait('@getHouses');
    cy.get('article').first().should('contain', 'House Stark of Winterfell');
    cy.get('article').eq(1).should('contain', 'House Lannister of Casterly Rock');
  });

  it('displays house words when available', () => {
    cy.visit('/houses');
    cy.wait('@getHouses');
    cy.get('article').first().should('contain', 'Winter is Coming');
  });

  it('shows an error message when the API fails', () => {
    cy.intercept('GET', `${API_BASE}/houses*`, { statusCode: 500 }).as('getHousesFail');
    cy.visit('/houses');
    cy.wait('@getHousesFail');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('shows "No houses found" when the API returns an empty list', () => {
    cy.intercept('GET', `${API_BASE}/houses*`, {
      statusCode: 200,
      headers: { Link: '' },
      body: [],
    }).as('getHousesEmpty');

    cy.visit('/houses');
    cy.wait('@getHousesEmpty');
    cy.contains('No houses found.').should('be.visible');
  });

  it('navigates to the house detail page when clicking a card', () => {
    cy.intercept('GET', `${API_BASE}/houses/362`, {
      statusCode: 200,
      body: housesFixture[0],
    }).as('getHouseDetail');

    cy.visit('/houses');
    cy.wait('@getHouses');
    cy.get('article').first().find('a').first().click();
    cy.url().should('include', '/houses/362');
  });

  it('renders the pagination component', () => {
    cy.visit('/houses');
    cy.wait('@getHouses');
    cy.get('app-pagination').should('exist');
  });

  it('loads a new page when pagination is used', () => {
    cy.visit('/houses');
    cy.wait('@getHouses');

    cy.intercept('GET', `${API_BASE}/houses*`, {
      statusCode: 200,
      headers: {
        Link: `<${API_BASE}/houses?page=1&pageSize=9>; rel="prev", <${API_BASE}/houses?page=44&pageSize=9>; rel="last"`,
      },
      body: housesFixture,
    }).as('getHousesPage2');

    cy.get('app-pagination').find('button').contains('2').click();
    cy.wait('@getHousesPage2');
    cy.get('article').should('have.length', housesFixture.length);
  });
});
