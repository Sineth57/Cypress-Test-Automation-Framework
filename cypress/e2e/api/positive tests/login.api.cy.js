describe("API - Verify login - Positive scenarios", () => {
  let users;
  let apiData;

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
    cy.fixture("apiData").then((data) => { apiData = data; });

    cy.step("Make sure the test account exists");
    cy.deleteUserViaApi();
    cy.createUserViaApi();
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });

  // asks the API whether an email and password are valid
  const verifyLogin = (email, password) => {
    return cy.apiCall({
      method: "POST",
      endpoint: "verifyLogin",
      body: { email, password },
    });
  };

  it("TC202 - confirms that the account exists for a valid email and password", () => {
    verifyLogin(users.newUser.email, users.newUser.password).then((result) => {
      cy.step("Check the HTTP status, the code, and the message");
      expect(result.httpStatus, "HTTP status").to.equal(200);
      expect(result.code, "responseCode").to.equal(200);
      expect(result.message, "message").to.equal("User exists!");
    });
  });

  it("TC203 - does not send the password back in the response", () => {
    verifyLogin(users.newUser.email, users.newUser.password).then((result) => {
      const bodyText = JSON.stringify(result.body);

      cy.log(`Response body: ${bodyText}`);
      expect(bodyText, "response body").to.not.include(users.newUser.password);
    });
  });

  it("TC204 - gives the same answer when the same login is verified twice", () => {
    verifyLogin(users.newUser.email, users.newUser.password).then((first) => {
      cy.step("Verify the same login a second time");

      verifyLogin(users.newUser.email, users.newUser.password).then((second) => {
        cy.log(`First: ${first.code} - ${first.message}. Second: ${second.code} - ${second.message}`);

        expect(second.code, "responseCode").to.equal(first.code);
        expect(second.message, "message").to.equal(first.message);
      });
    });
  });

  it("TC205 - answers within the allowed time", () => {
    verifyLogin(users.newUser.email, users.newUser.password).then((result) => {
      cy.log(`Response time: ${result.duration} ms (limit ${apiData.maxResponseMs} ms)`);
      expect(result.duration, "response time in ms").to.be.lessThan(apiData.maxResponseMs);
    });
  });
});