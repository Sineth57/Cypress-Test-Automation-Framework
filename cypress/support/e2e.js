// Load custom commands

import "./commands";
import "cypress-mochawesome-reporter/register";

// Telling Cypress to ignore ads instead of failing the test.

Cypress.on("uncaught:exception", () => {
  return false;
});

// Block ad requests so ads don't cover buttons and break clicks.

beforeEach(() => {
  cy.intercept(
    { url: /googlesyndication|doubleclick|adservice/ },
    { statusCode: 204, body: "" }
  );
});