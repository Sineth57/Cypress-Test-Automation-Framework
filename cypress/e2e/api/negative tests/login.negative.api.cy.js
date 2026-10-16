// Helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const invalidLogins = [
  {
    label: "a wrong password",
    build: (users) => ({
      email: users.newUser.email,
      password: users.invalidUser.password,
    }),
  },
  {
    label: "an email that is not registered",
    build: (users) => ({
      email: users.invalidUser.email,
      password: users.newUser.password,
    }),
  },
  {
    label: "the right password in the wrong letter case",
    build: (users) => ({
      email: users.newUser.email,
      password: users.newUser.password.toLowerCase(),
    }),
  },
  {
    label: "SQL-injection text as the password",
    build: (users) => ({
      email: users.newUser.email,
      password: "' OR '1'='1",
    }),
  },
];

// requests that leave out a required parameter
const missingParameters = [
  {
    label: "the email is missing",
    build: (users) => ({ password: users.newUser.password }),
  },
  {
    label: "the password is missing",
    build: (users) => ({ email: users.newUser.email }),
  },
  {
    label: "both the email and the password are missing",
    build: () => undefined, // no body 
  },
];

describe("API - Verify login - Negative scenarios", () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
  });


  describe("Invalid logins", () => {
    before(() => {
      cy.step("Make sure the test account exists");
      cy.deleteUserViaApi();
      cy.createUserViaApi();
    });

    after(() => {
      cy.step("Delete the test account");
      cy.deleteUserViaApi();
    });

    // loop tests per each invalid login)
    invalidLogins.forEach((testCase, index) => {
      it(`${tcId(206 + index)} - refuses ${testCase.label}`, () => {
        cy.apiCall({
          method: "POST",
          endpoint: "verifyLogin",
          body: testCase.build(users),
        }).then((result) => {
          cy.step("Check the code and the message");
          expect(result.code, "responseCode").to.equal(404);
          expect(result.message, "message").to.equal("User not found!");
        });
      });
    });
  });

  
  describe("Missing parameters", () => {

    missingParameters.forEach((testCase, index) => {
      it(`${tcId(210 + index)} - rejects the request when ${testCase.label}`, () => {
        const body = testCase.build(users);

        cy.log(body ? `Body sent: ${Object.keys(body).join(", ")}` : "No body is sent");

        cy.apiCall({
          method: "POST",
          endpoint: "verifyLogin",
          body,
        }).then((result) => {
          cy.step("Check the code and the message");
          expect(result.code, "responseCode").to.equal(400);
          expect(result.message, "message").to.equal(
            "Bad request, email or password parameter is missing in POST request."
          );
        });
      });
    });
  });


  describe("wrong method", () => {
    it("TC213 - rejects a DELETE request with responseCode 405", () => {
      cy.apiCall({ method: "DELETE", endpoint: "verifyLogin" }).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(405);
        expect(result.message, "message").to.equal(
          "This request method is not supported."
        );
      });
    });
  });

  
  describe("deleted account", () => {
    before(() => {
      cy.step("Create the account and then delete it");
      cy.createUserViaApi();
      cy.deleteUserViaApi();
    });

    it("TC214 - refuses the login of an account that has been deleted", () => {
      cy.apiCall({
        method: "POST",
        endpoint: "verifyLogin",
        body: { email: users.newUser.email, password: users.newUser.password },
      }).then((result) => {
        expect(result.code, "responseCode").to.equal(404);
        expect(result.message, "message").to.equal("User not found!");
      });
    });
  });
});