import {
  createAccount,
  getUserDetails,
  updateAccount,
  deleteAccount,
  verifyLogin,
  detailFieldMap,
} from "../../../support/apiHelpers";

describe("API - Account - Positive scenarios", () => {
  let users;
  let apiData;

  // details that change in the update tests
  const changes = {
    city: "Kandy",
    company: "Updated Company",
    address1: "456 Peradeniya",
  };

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
    cy.fixture("apiData").then((data) => { apiData = data; });
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });

  
  describe("Create account", () => {
    beforeEach(() => {
      cy.step("Make sure the test account does not exist");
      cy.deleteUserViaApi();
    });

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    it("TC215 - creates a new account", () => {
      createAccount(users.newUser).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(201);
        expect(result.message, "message").to.equal("User created!");
      });
    });

    it("TC216 - lets the new account log in", () => {
      createAccount(users.newUser).then((created) => {
        expect(created.code, "create responseCode").to.equal(201);

        cy.step("Verify the login of the new account");
        verifyLogin(users.newUser.email, users.newUser.password).then((login) => {
          expect(login.code, "login responseCode").to.equal(200);
          expect(login.message, "login message").to.equal("User exists!");
        });
      });
    });
  });


  describe("Get user details", () => {
    before(() => {
      cy.resetTestUser();
    });

    it("TC217 - returns responseCode 200 and a user object", () => {
      getUserDetails(users.newUser.email).then((result) => {
        expect(result.code, "responseCode").to.equal(200);
        expect(result.body.user, "user").to.be.an("object");
      });
    });

    it("TC218 - returns the same details that were used to register", () => {
      getUserDetails(users.newUser.email).then((result) => {
        const user = result.body.user || {};
        const mismatches = [];

        Object.keys(detailFieldMap).forEach((sentName) => {
          const returnedName = detailFieldMap[sentName];
          const sent = String(users.newUser[sentName]);
          const returned = String(user[returnedName]);

          if (sent === returned) {
            cy.log(`OK - ${returnedName}: "${returned}"`);
          } else {
            cy.log(`MISMATCH - ${returnedName}: sent "${sent}", got "${returned}"`);
            mismatches.push(`${returnedName}: sent "${sent}", got "${returned}"`);
          }
        });

        expect(mismatches, "fields that differ").to.be.empty;
      });
    });

    it("TC219 - does not send the password back", () => {
      getUserDetails(users.newUser.email).then((result) => {
        const bodyText = JSON.stringify(result.body);
        expect(bodyText, "response body").to.not.include(users.newUser.password);
      });
    });
  });


  describe("Update account", () => {
    beforeEach(() => {
      cy.resetTestUser();
    });

    it("TC220 - updates the account details", () => {
      updateAccount({ ...users.newUser, ...changes }).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(200);
        expect(result.message, "message").to.equal("User updated!");
      });
    });

    it("TC221 - returns the new values when the details are read again", () => {
      updateAccount({ ...users.newUser, ...changes }).then((updated) => {
        expect(updated.code, "update responseCode").to.equal(200);

        getUserDetails(users.newUser.email).then((details) => {
          const user = details.body.user || {};
          const mismatches = [];

          Object.keys(changes).forEach((field) => {
            cy.log(`${field}: expected "${changes[field]}", got "${user[field]}"`);
            if (user[field] !== changes[field]) {
              mismatches.push(field);
            }
          });

          expect(mismatches, "fields that were not updated").to.be.empty;
        });
      });
    });

    it("TC222 - keeps the details that were not changed", () => {
      const unchangedFields = ["name", "email", "country", "zipcode"];

      updateAccount({ ...users.newUser, ...changes }).then((updated) => {
        expect(updated.code, "update responseCode").to.equal(200);

        getUserDetails(users.newUser.email).then((details) => {
          const user = details.body.user || {};

          unchangedFields.forEach((field) => {
            cy.log(`${field}: expected "${users.newUser[field]}", got "${user[field]}"`);
            expect(String(user[field]), field).to.equal(String(users.newUser[field]));
          });
        });
      });
    });

    it("TC223 - lets the user log in after the update", () => {
      updateAccount({ ...users.newUser, ...changes }).then((updated) => {
        expect(updated.code, "update responseCode").to.equal(200);

        verifyLogin(users.newUser.email, users.newUser.password).then((login) => {
          expect(login.code, "login responseCode").to.equal(200);
        });
      });
    });
  });


  describe("Delete account", () => {
    beforeEach(() => {
      cy.resetTestUser();
    });

    it("TC224 - deletes the account", () => {
      deleteAccount(users.newUser.email, users.newUser.password).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(200);
        expect(result.message, "message").to.equal("Account deleted!");
      });
    });

    it("TC225 - can no longer find the deleted account by its email", () => {
      deleteAccount(users.newUser.email, users.newUser.password).then((deleted) => {
        expect(deleted.code, "delete responseCode").to.equal(200);

        getUserDetails(users.newUser.email).then((details) => {
          expect(details.code, "responseCode").to.equal(404);
          expect(details.message, "message").to.equal(
            "Account not found with this email, try another email!"
          );
        });
      });
    });

    it("TC226 - no longer lets the deleted account log in", () => {
      deleteAccount(users.newUser.email, users.newUser.password).then((deleted) => {
        expect(deleted.code, "delete responseCode").to.equal(200);

        verifyLogin(users.newUser.email, users.newUser.password).then((login) => {
          expect(login.code, "login responseCode").to.equal(404);
          expect(login.message, "login message").to.equal("User not found!");
        });
      });
    });
  });

  describe("Speed", () => {
    it("TC227 - answers every account request within the allowed time", () => {
      const slowRequests = [];

      const check = (label, result) => {
        cy.log(`${label}: ${result.duration} ms (limit ${apiData.maxResponseMs} ms)`);
        if (result.duration >= apiData.maxResponseMs) {
          slowRequests.push(`${label} took ${result.duration} ms`);
        }
      };

      cy.deleteUserViaApi();
      createAccount(users.newUser).then((result) => check("createAccount", result));
      getUserDetails(users.newUser.email).then((result) => check("getUserDetailByEmail", result));
      updateAccount({ ...users.newUser, ...changes }).then((result) => check("updateAccount", result));
      deleteAccount(users.newUser.email, users.newUser.password).then((result) => check("deleteAccount", result));

      cy.then(() => {
        expect(slowRequests, "requests that were too slow").to.be.empty;
      });
    });
  });
});