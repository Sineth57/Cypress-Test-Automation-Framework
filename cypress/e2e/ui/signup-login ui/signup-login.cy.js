import HomePage from "../../../pages/HomePage";
import LoginPage from "../../../pages/LoginPage";

describe("Signup and Login - Positive scenarios", () => {

  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  // Login

  describe("Login", () => {

    // to runs once before all login tests and delete account if already exists, then create a new one
    before(() => {
      cy.deleteUserViaApi();
      cy.createUserViaApi();
    });

    // delete account after the test
    after(() => {
      cy.deleteUserViaApi();
    });


    beforeEach(() => {
      LoginPage.visit();
    });

    it("TC001 - shows both the login form and the signup form", () => {
      cy.contains("Login to your account").should("be.visible");
      cy.contains("New User Signup!").should("be.visible");
    });

    it("TC002 - logs in with a valid email and password", () => {
      LoginPage.login(users.newUser.email, users.newUser.password);

      HomePage.loggedInText.should("be.visible");
    });

    it("TC003 - shows the username in the header after login", () => {
      LoginPage.login(users.newUser.email, users.newUser.password);

      HomePage.loggedInText.should("contain.text", users.newUser.name);
    });

    it("TC004 - shows Logout and Delete Account links, and hides the Login link", () => {

      LoginPage.login(users.newUser.email, users.newUser.password);

      HomePage.menu.find('a[href="/logout"]').should("be.visible");
      HomePage.menu.find('a[href="/delete_account"]').should("be.visible");
      HomePage.menu.find('a[href="/login"]').should("not.exist");
    });

 
    it("TC005 - stays logged in after the page is reloaded", () => {

      cy.step("Log in with valid credentials");
      LoginPage.login(users.newUser.email, users.newUser.password);

      cy.step("Wait until the login has finished, before reloading");
      HomePage.loggedInText.should("be.visible");

      cy.step("Reload the page");
      cy.reload();

      cy.step("The user should still be logged in");
      HomePage.loggedInText.should("be.visible");

    });

    it("TC006 - logs out successfully", () => {

      LoginPage.login(users.newUser.email, users.newUser.password);
      HomePage.logout();

      cy.url().should("include", "/login");
      LoginPage.loginEmail.should("be.visible");
      HomePage.loggedInText.should("not.exist");
    });
  });


  //signup


  describe("Signup", () => {
    
    beforeEach(() => {
      cy.deleteUserViaApi();
      LoginPage.visit();
    });

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    it("TC007 - opens the account information form for a new name and email", () => {

      LoginPage.startSignup(users.newUser.name, users.newUser.email);

      cy.url().should("include", "/signup");
      cy.contains("Enter Account Information", { matchCase: false }).should("be.visible");

    });

    it("TC008 - registers a new user, logs in, and deletes the account", () => {

      // name + email
      LoginPage.startSignup(users.newUser.name, users.newUser.email);

      // fill the long form and submit
      LoginPage.fillAccountDetails(users.newUser);
      LoginPage.submitAccountForm();

      // account is created
      cy.contains("Account Created!", { matchCase: false }).should(
        "be.visible"
      );
      LoginPage.continueButton.click();

      // logged in automatically
      HomePage.loggedInText.should("contain.text", users.newUser.name);

      // delete the account through the UI
      HomePage.deleteAccount();
      cy.contains("Account Deleted!", { matchCase: false }).should(
        "be.visible"
      );
      LoginPage.continueButton.click();

    });
  });
});