import housesFixture from '../fixtures/houses.json';

const API_BASE = 'https://anapioficeandfire.com/api';
const LINK_HEADER =
  `<${API_BASE}/houses?page=2&pageSize=9>; rel="next", ` +
  `<${API_BASE}/houses?page=44&pageSize=9>; rel="last"`;

describe('Favorites', () => {
  beforeEach(() => {
    cy.clearFavorites();
    cy.intercept('GET', `${API_BASE}/houses*`, {
      statusCode: 200,
      headers: { Link: LINK_HEADER },
      body: housesFixture,
    }).as('getHouses');
  });

  describe('Favorites page – empty state', () => {
    it('shows the empty state when no favorites are saved', () => {
      cy.visit('/favorites');
      cy.get('h1').should('contain', 'My Favorites');
      cy.contains('No favorites yet').should('be.visible');
    });

    it('has a link back to the Houses list from empty state', () => {
      cy.visit('/favorites');
      cy.contains('Houses of Westeros').click();
      cy.url().should('include', '/houses');
    });
  });

  describe('Adding favorites from the list', () => {
    it('toggles the favorite button on a house card', () => {
      cy.visit('/houses');
      cy.wait('@getHouses');

      cy.get('article')
        .first()
        .find('button[aria-label*="Add House Stark of Winterfell to favorites"]')
        .click();

      cy.get('article')
        .first()
        .find('button[aria-label*="Remove House Stark of Winterfell from favorites"]')
        .should('exist');
    });

    it('shows the favorites count badge in the header after adding a favorite', () => {
      cy.visit('/houses');
      cy.wait('@getHouses');

      cy.get('article')
        .first()
        .find('button[aria-label*="Add"]')
        .click();

      cy.get('[aria-label="Main navigation"]')
        .find('[aria-label*="saved"]')
        .should('contain', '1');
    });

    it('increments the badge count for multiple favorites', () => {
      cy.visit('/houses');
      cy.wait('@getHouses');

      cy.get('article').first().find('button[aria-label*="Add"]').click();
      cy.get('article').eq(1).find('button[aria-label*="Add"]').click();

      cy.get('[aria-label="Main navigation"]')
        .find('[aria-label*="saved"]')
        .should('contain', '2');
    });

    it('removes a favorite when the heart is clicked again', () => {
      cy.visit('/houses');
      cy.wait('@getHouses');

      cy.get('article').first().find('button[aria-label*="Add"]').click();
      cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('contain', '1');

      cy.get('article').first().find('button[aria-label*="Remove"]').click();
      cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('not.exist');
    });
  });

  describe('Favorites page – with saved favorites', () => {
    beforeEach(() => {
      // Pre-seed favorites and intercept the individual house requests
      cy.setFavorites([362, 229]);
      housesFixture.slice(0, 2).forEach((house) => {
        const id = Number(house.url.split('/').pop());
        cy.intercept('GET', `${API_BASE}/houses/${id}`, {
          statusCode: 200,
          body: house,
        }).as(`getHouse${id}`);
      });
    });

    it('displays favorited houses as cards', () => {
      cy.visit('/favorites');
      cy.get('[aria-label="Favorite houses"]', { timeout: 10000 })
        .find('article')
        .should('have.length.gte', 1);
    });

    it('removes a house from favorites when clicking the heart on the favorites page', () => {
      cy.visit('/favorites');
      cy.get('[aria-label="Favorite houses"]', { timeout: 10000 })
        .find('article')
        .should('exist');

      cy.get('[aria-label="Favorite houses"]')
        .find('article')
        .first()
        .find('button[aria-label*="Remove"]')
        .click();

      cy.get('[aria-label="Main navigation"]')
        .find('[aria-label*="saved"]')
        .should('contain', '1');
    });
  });

  describe('Favorites persistence', () => {
    it('persists favorites across page reloads', () => {
      cy.visit('/houses');
      cy.wait('@getHouses');

      cy.get('article').first().find('button[aria-label*="Add"]').click();
      cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('contain', '1');

      cy.reload();
      cy.wait('@getHouses');

      cy.get('[aria-label="Main navigation"]').find('[aria-label*="saved"]').should('contain', '1');
    });
  });
});
