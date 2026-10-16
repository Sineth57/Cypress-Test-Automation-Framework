import ProductsPage from "../pages/ProductsPage";
import CartPage from "../pages/CartPage";

const parseBody = (body) => {
  return typeof body === "string" ? JSON.parse(body) : body;
};

Cypress.Commands.add("createUserViaApi", () => {
  cy.fixture("users").then((users) => {
    cy.request({
      method: "POST",
      url: `${Cypress.expose("apiUrl")}/createAccount`,
      form: true,
      body: users.newUser,
      failOnStatusCode: false,
    }).then((response) => {
      const body = parseBody(response.body);
      cy.log(`Create account: ${body.responseCode} - ${body.message}`);

      const accountIsAvailable =
        body.responseCode === 201 || body.responseCode === 400;

      expect(
        accountIsAvailable,
        `Create account answered ${body.responseCode} - ${body.message}`
      ).to.be.true;
    });
  });
});

Cypress.Commands.add("deleteUserViaApi", () => {
  cy.fixture("users").then((users) => {
    cy.request({
      method: "DELETE",
      url: `${Cypress.expose("apiUrl")}/deleteAccount`,
      form: true,
      body: {
        email: users.newUser.email,
        password: users.newUser.password,
      },
      failOnStatusCode: false,
    }).then((response) => {
      const body = parseBody(response.body);
      cy.log(`Delete account: ${body.responseCode} - ${body.message}`);
    });
  });
});

Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('[data-qa="login-email"]').type(email);
  cy.get('[data-qa="login-password"]').type(password, { log: false });
  cy.get('[data-qa="login-button"]').click();
});

Cypress.Commands.add("loginAsTestUser", () => {
  cy.fixture("users").then((users) => {
    cy.login(users.newUser.email, users.newUser.password);

    cy.step("Wait for the home page to finish loading after login");
    cy.url().should("not.include", "/login");
    cy.contains("Logged in as", { timeout: 30000 }).should("be.visible");
  });
});

Cypress.Commands.add("step", (message) => {
  cy.log(`STEP: ${message}`);
});

Cypress.Commands.add("openCheckoutAsTestUser", (productId, quantity) => {
  const qty = quantity || 1; 

  cy.resetTestUser(); // fresh account = empty cart

  cy.step("Log in as the test user");
  cy.loginAsTestUser(); 

  cy.step(`Add product ${productId} (quantity ${qty}) to the cart`);
  ProductsPage.addFromDetails(productId, qty);

  cy.step("Open the cart and proceed to checkout");
  CartPage.visit();
  CartPage.proceedToCheckout();
  cy.url().should("include", "/checkout");
});

Cypress.Commands.add("resetTestUser", () => {
  cy.step("Reset the test account so its cart starts empty");
  cy.deleteUserViaApi();
  cy.createUserViaApi();
});

Cypress.Commands.add("apiCall", ({ method, endpoint, body, qs }) => {
  const url = `${Cypress.expose("apiUrl")}/${endpoint}`;
  const hasBody = Boolean(body);

  cy.step(`API request: ${method} ${endpoint}`);

  cy.request({
    method,
    url,
    qs,
    form: hasBody,
    body: hasBody ? body : undefined,
    failOnStatusCode: false,
  }).then((response) => {
    let parsed = {};
    try {
      parsed = parseBody(response.body) || {};
    } catch (error) {
      cy.log("WARNING: the response body is not valid JSON");
    }

    const result = {
      httpStatus: response.status,
      code: parsed.responseCode,
      message: parsed.message,
      body: parsed,
      duration: response.duration,
    };

    const messagePart = result.message ? `, message "${result.message}"` : "";
    cy.log(
      `API response: HTTP ${result.httpStatus}, responseCode ${result.code}${messagePart}, ${result.duration} ms`
    );

    cy.wrap(result, { log: false });
  });
});