import HomePage from "../../../pages/HomePage";
import ProductsPage from "../../../pages/ProductsPage";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// invalid email addresses 
const invalidEmails = [
  { value: "plainaddress", why: "no @ sign" },
  { value: "@no-local-part.com", why: "nothing before the @" },
  { value: "user@", why: "nothing after the @" },
  { value: "two@@at.com", why: "two @ signs" },
  { value: "spaces in@mail.com", why: "contains a space" },
];

describe("Home page - Negative scenarios", () => {

  // in the footer of the home page
  describe("Subscription", () => {
    beforeEach(() => {
      HomePage.visit();
      HomePage.subscribeEmail.scrollIntoView();
    });

    it("TC280 - does not subscribe when the email is empty", () => {
      HomePage.subscribeButton.click();

      // browser flags the empty required field
      HomePage.subscribeEmail.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      HomePage.subscribeSuccess.should("not.be.visible");
    });

    // loop tests per row of invalidEmails
    invalidEmails.forEach((item, index) => {
      it(`${tcId(281 + index)} - does not accept the invalid email "${item.value}"`, () => {
        cy.log(`Why this email is invalid: ${item.why}`);

        HomePage.subscribeEmail.invoke("val", item.value);
        HomePage.subscribeButton.click();

        HomePage.subscribeEmail.should(($input) => {
          expect($input[0].validity.typeMismatch).to.be.true;
        });
        HomePage.subscribeSuccess.should("not.be.visible");
      });
    });
  });

  // home page header for a guest

  describe("Header for a guest", () => {
    beforeEach(() => {
      HomePage.visit();
    });

    it("TC286 - does not show the Logout link to a guest", () => {
      HomePage.menu.find('a[href="/logout"]').should("not.exist");
    });

    it("TC287 - does not show the Delete Account link to a guest", () => {
      HomePage.menu.find('a[href="/delete_account"]').should("not.exist");
    });

    it("TC288 - does not show 'Logged in as' to a guest", () => {
      cy.contains("Logged in as").should("not.exist");
    });

    it("TC289 - does not delete anything when a guest opens /delete_account directly", () => {

      cy.visit("/delete_account", { failOnStatusCode: false });

      cy.contains("Account Deleted!", { matchCase: false }).should("not.exist");
    });
  });

  // after logout

  describe("After logout", () => {
    after(() => {
      cy.deleteUserViaApi();
    });

    it("TC290 - does not show the loggedin header after the user logs out", () => {
      cy.resetTestUser();
      cy.loginAsTestUser();

      HomePage.logout();
      HomePage.visit();

      HomePage.menu.find('a[href="/logout"]').should("not.exist");
      cy.contains("Logged in as").should("not.exist");
    });
  });


  describe("Addresses that do not exist", () => {
       it("TC291 - sends an address that does not exist back to the home page", () => {
      cy.visit("/this-page-does-not-exist", { failOnStatusCode: false });

      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });

    it("TC292 - shows no products for a category that does not exist", () => {
      cy.visit("/category_products/9999", { failOnStatusCode: false });

      ProductsPage.productCards.should("not.exist");
    });

    it("TC293 - shows no products for a brand that does not exist", () => {
      cy.visit("/brand_products/NoSuchBrand", { failOnStatusCode: false });

      ProductsPage.productCards.should("not.exist");
    });
  });
});


  describe("Guest opens the delete account address", () => {
    before(() => {
      cy.deleteUserViaApi();
      cy.createUserViaApi();
    });

    after(() => {
      cy.deleteUserViaApi();
    });

    it("TC294 - keeps an existing account when a guest opens /delete_account directly", () => {
      cy.visit("/delete_account", { failOnStatusCode: false });

      cy.fixture("users").then((users) => {
        cy.apiCall({
          method: "POST",
          endpoint: "verifyLogin",
          body: { email: users.newUser.email, password: users.newUser.password },
        }).then((result) => {
          expect(result.code, "responseCode").to.equal(200);
          expect(result.message, "message").to.equal("User exists!");
        });
      });
    });
  });