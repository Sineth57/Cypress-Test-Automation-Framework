import SignupPage from "../../../pages/SignupPage";
import HomePage from "../../../pages/HomePage";
import { getUserDetails, deleteAccount } from "../../../support/apiHelpers";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// Passwords that some tests below put on the account. The delete request needs the right password. Otherwise an account that the
// site wrongly accepted would stay behind and break the next tests.
const oddPasswords = ["   ", "1"];

const spaceOnlyFields = [
  { label: "password", key: "password" },
  { label: "first name", key: "firstname" },
  { label: "last name", key: "lastname" },
  { label: "address", key: "address1" },
  { label: "state", key: "state" },
  { label: "city", key: "city" },
  { label: "zip code", key: "zipcode" },
  { label: "mobile number", key: "mobile_number" },
];

// values in the wrong format
const wrongFormats = [
  { label: "a mobile number with letters", key: "mobile_number", value: "abcdefghij" },
  { label: "a zip code with letters", key: "zipcode", value: "abcde" },
  { label: "a password of one character", key: "password", value: "1" },
  { label: "a first name made of digits", key: "firstname", value: "12345" },
];

// emails the browser accepts with not really valid addresses
const doubtfulEmails = [
  { value: "user@domain", why: "no domain extension such as .com" },
  { value: "a..b@example.com", why: "two dots in a row" },
  { value: ".user@example.com", why: "starts with a dot" },
];

describe("Signup - Negative scenarios", () => {

  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });


  const cleanUpAccount = () => {
    cy.deleteUserViaApi();
    oddPasswords.forEach((password) => {
      deleteAccount(users.newUser.email, password);
    });
  };



  describe("Name and email step", () => {
    beforeEach(() => {
      cleanUpAccount();
      SignupPage.visit();
    });

    afterEach(() => {
      cleanUpAccount();
    });

    it("TC314 - does not continue when the name is only spaces", () => {
      SignupPage.start("   ", users.newUser.email);

      // wait for the site's answer first, then check the form did not open
      cy.url().should("include", "/signup");
      SignupPage.formHeading.should("not.exist");
    });

    it("TC315 - treats script text in the name as plain text", () => {
      const scriptName = "<script>alert(1)</script>";
      // if the page ever runs the text as code
      const alertStub = cy.stub().as("alertStub");
      cy.on("window:alert", alertStub);

      SignupPage.start(scriptName, users.newUser.email);

      cy.url().should("include", "/signup");
      SignupPage.accountName.should("have.value", scriptName);
      cy.get("@alertStub").should("not.have.been.called");
    });

    it("TC316 - treats SQL-style text in the name as plain text", () => {
      const sqlName = "' OR 1=1 --";

      SignupPage.start(sqlName, users.newUser.email);

      cy.url().should("include", "/signup");
      SignupPage.accountName.should("have.value", sqlName);
    });

    it("TC317 - rejects a registered email written in capital letters", () => {

      cy.createUserViaApi();

      const upperCaseEmail = users.newUser.email.toUpperCase();
      cy.log(`Signing up again with ${upperCaseEmail}`);
      SignupPage.start(users.newUser.name, upperCaseEmail);

      // wait for the site's answer first, then check what it shows
      cy.url().should("include", "/signup");
      SignupPage.formHeading.should("not.exist");
      SignupPage.errorMessage.should("contain.text", "Email Address already exist!");
    });

    it("TC318 - does not show the account form when /signup is opened directly", () => {

      cy.visit("/signup", { failOnStatusCode: false });

      SignupPage.formHeading.should("not.exist");
    });

    it("TC332 - does not show a server error for a very long name", () => {
      SignupPage.start("a".repeat(500), users.newUser.email);

      cy.url().should("include", "/signup");
      cy.get("body").should(($body) => {
        expect($body.text()).to.not.match(/server error/i);
      });
    });

    // loop one test per row of doubtfulEmails
    doubtfulEmails.forEach((item, index) => {
      it(`${tcId(333 + index)} - does not continue with the email "${item.value}"`, () => {
        cy.log(`Why this email is doubtful: ${item.why}`);

        SignupPage.start(users.newUser.name, item.value);

        cy.url().should("include", "/signup");
        SignupPage.formHeading.should("not.exist");
      });
    });

    it("TC336 - does not show a server error for a very long email", () => {
      const longEmail = `${"a".repeat(300)}@example.com`;

      SignupPage.start(users.newUser.name, longEmail);

      cy.url().should("include", "/signup");
      cy.get("body").should(($body) => {
        expect($body.text()).to.not.match(/server error/i);
      });
    });
  });

 
  describe("Account information form", () => {
    beforeEach(() => {
      cleanUpAccount();
      SignupPage.visit();
      SignupPage.start(users.newUser.name, users.newUser.email);

      SignupPage.formHeading.should("be.visible");
    });

    afterEach(() => {
      cleanUpAccount();
    });

    // fills the form, clicks create account, waits for the site's answer then asks the API whether the account was created
    const submitAndExpectNoAccount = (user) => {
      SignupPage.fillAccountDetails(user);

      cy.intercept("POST", "**/signup").as("createAccountRequest");
      SignupPage.submit();
      cy.wait("@createAccountRequest");

      getUserDetails(users.newUser.email).then((result) => {
        cy.log(`Account lookup: responseCode ${result.code}`);
        expect(result.code, "the account should NOT exist (responseCode 404)").to.equal(404);
      });
    };

    // loo p one test per row of spaceOnlyFields
    spaceOnlyFields.forEach((field, index) => {
      it(`${tcId(319 + index)} - does not create the account when the ${field.label} is only spaces`, () => {
        submitAndExpectNoAccount({ ...users.newUser, [field.key]: "   " });
      });
    });

    // loop one test per row of wrongFormats
    wrongFormats.forEach((item, index) => {
      it(`${tcId(327 + index)} - does not create the account with ${item.label}`, () => {
        cy.log(`Using "${item.value}" as the ${item.key}`);
        submitAndExpectNoAccount({ ...users.newUser, [item.key]: item.value });
      });
    });

    it("TC331 - does not create the account for the date of birth 31 February", () => {
      submitAndExpectNoAccount({ ...users.newUser, birth_date: "31", birth_month: "February" });
    });

    it("TC337 - does not create the account when the name is cleared on the account form", () => {
      SignupPage.accountName.clear();
      SignupPage.fillAccountDetails(users.newUser);
      SignupPage.submit();

      // the browser should flag the empty name and stop the form
      SignupPage.accountName.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("not.include", "/account_created");
    });

    it("TC338 - does not create the account when the name on the account form is only spaces", () => {
      SignupPage.accountName.clear().type("   ");

      submitAndExpectNoAccount(users.newUser);
    });

    it("TC339 - does not show a server error for a very long first name", () => {
      SignupPage.fillAccountDetails({ ...users.newUser, firstname: "a".repeat(500) });

      cy.intercept("POST", "**/signup").as("createAccountRequest");
      SignupPage.submit();
      cy.wait("@createAccountRequest");

      cy.get("body").should(($body) => {
        expect($body.text()).to.not.match(/server error/i);
      });
    });

    it("TC340 - stores SQL-style text in the address as plain text", () => {
      const sqlAddress = "'; DROP TABLE users; --";

      SignupPage.fillAccountDetails({ ...users.newUser, address1: sqlAddress });
      SignupPage.submit();
      cy.url().should("include", "/account_created");

      // ask the API what the site saved
      getUserDetails(users.newUser.email).then((result) => {
        const saved = result.body.user ? result.body.user.address1 : undefined;
        cy.log(`Saved address: ${saved}`);
        expect(saved, "saved address").to.equal(sqlAddress);
      });
    });
  });

 
  // opening page directly
  
  describe("Opening pages directly", () => {
    after(() => {
      cleanUpAccount();
    });

    it("TC343 - does not show the Account Created page when /account_created is opened directly", () => {

      cy.visit("/account_created", { failOnStatusCode: false });

      cy.contains("Account Created!", { matchCase: false }).should("not.exist");
    });

    it("TC344 - does not show the signup box to a user who is already logged in", () => {
      cy.resetTestUser();
      cy.loginAsTestUser();

      cy.visit("/login");

      SignupPage.signupHeading.should("not.exist");

    });
  });
});