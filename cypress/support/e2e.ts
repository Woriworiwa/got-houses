import './commands';

const API_BASE = 'https://anapioficeandfire.com/api';
const LINK_HEADER =
  `<${API_BASE}/houses?page=2&pageSize=9>; rel="next", ` +
  `<${API_BASE}/houses?page=44&pageSize=9>; rel="last"`;

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(url, options);
});

export { LINK_HEADER, API_BASE };
