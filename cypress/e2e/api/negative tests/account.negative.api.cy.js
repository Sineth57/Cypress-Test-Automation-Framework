import {
  createAccount,
  getUserDetails,
  updateAccount,
  deleteAccount,
} from "../../../support/apiHelpers";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const requiredFields = ["name", "email", "password"];

describe("API - Account - Negative scenarios", () => {

  let users;

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });

  // create account

  describe("Create account", () => {

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    it("TC228 - rejects an email that is already registered", () => {

      cy.step("precondition: the account already exists");
      cy.resetTestUser();

      createAccount(users.newUser).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(400);
        expect(result.message, "message").to.equal("Email already exists!");
      });
    });

    // loop test per missing field
    
    requiredFields.forEach((field, index) => {
    
      it(`${tcId(229 + index)} - rejects a request when "${field}" is missing`, () => {
        cy.step("precondition: the account does not exist");
        cy.deleteUserViaApi();

        // Copy all the details, then remove just this one field
        const body = { ...users.newUser };
        delete body[field];
        cy.log(`Fields sent: ${Object.keys(body).length}, left out: ${field}`);

        createAccount(body).then((result) => {
          cy.log(`Message received: ${result.message}`);
          expect(result.code, "responseCode").to.equal(400);
        });
      });
    });
  });

  describe("Get user details", () => {
    it("TC232 - reports an email that is not registered", () => {
      getUserDetails(users.invalidUser.email).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(404);
        expect(result.message, "message").to.equal(
          "Account not found with this email, try another email!"
        );
      });
    });

    it("TC233 - rejects a request that has no email", () => {
      getUserDetails().then((result) => {
        cy.log(`Message received: ${result.message}`);
        expect(result.code, "responseCode").to.equal(400);
      });
    });
  });

  describe("Update account", () => {
    it("TC234 - rejects an update for an account that does not exist", () => {
      cy.step("PRECONDITION: the account does not exist");
      cy.deleteUserViaApi();

      updateAccount({ ...users.newUser, city: "Kandy" }).then((result) => {
        cy.log(`Message received: ${result.message}`);
        expect(result.code, "responseCode").to.equal(404);
      });
    });

    describe("With a wrong password", () => {

      beforeEach(() => {
        cy.resetTestUser();
      });

      const attack = () => ({
        ...users.newUser,
        password: users.invalidUser.password,
        city: "Hacked City",
      });

      it("TC235 - rejects an update that uses a wrong password", () => {
        updateAccount(attack()).then((result) => {
          cy.log(`Message received: ${result.message}`);
          expect(result.code, "responseCode").to.equal(404);
        });
      });

      it("TC236 - does not change the stored details when the update is rejected", () => {
        updateAccount(attack()).then(() => {
          cy.step("Read the details back and compare the city");

          getUserDetails(users.newUser.email).then((details) => {
            const city = details.body.user?.city;

            cy.log(`City is "${city}", it should still be "${users.newUser.city}"`);
            expect(city, "city").to.equal(users.newUser.city);
          });
        });
      });
    });
  });

  describe("Delete account", () => {
    it("TC237 - rejects deleting an account that does not exist", () => {
      cy.step("PRECONDITION: the account does not exist");
      cy.deleteUserViaApi();

      deleteAccount(users.newUser.email, users.newUser.password).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(404);
        expect(result.message, "message").to.equal("Account not found!");
      });
    });

    describe("With a wrong password", () => {

      beforeEach(() => {
        cy.resetTestUser();
      });

      it("TC238 - rejects deleting an account with a wrong password", () => {
        deleteAccount(users.newUser.email, users.invalidUser.password).then((result) => {
          cy.log(`Message received: ${result.message}`);
          expect(result.code, "responseCode").to.equal(404);
        });
      });

      it("TC239 - keeps the account after a rejected delete", () => {
        deleteAccount(users.newUser.email, users.invalidUser.password).then(() => {
          cy.step("The account should still be there");

          getUserDetails(users.newUser.email).then((details) => {
            expect(details.code, "responseCode").to.equal(200);
          });
        });
      });
    });

    it("TC240 - rejects a delete request that has no email and password", () => {
      cy.apiCall({ method: "DELETE", endpoint: "deleteAccount" }).then((result) => {
        cy.log(`Message received: ${result.message}`);
        expect(result.code, "responseCode").to.equal(400);
      });
    });
  });
});