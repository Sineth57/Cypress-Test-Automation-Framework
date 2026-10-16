  import HomePage from "../../../pages/HomePage";
  import LoginPage from "../../../pages/LoginPage";

// helper for loop tests. padStart(3, "0") adds zeros at the front until the number has 3 digits
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// browser should refuse to submit the form with these emails
const invalidEmails = [
  "plainaddress",       
  "@no-local-part.com", 
  "user@",              
  "two@@at.com",        
  "spaces in@mail.com", 
];

// required fields on the account information form.
const requiredFields = [
  { label: "password", selector: '[data-qa="password"]', key: "password" },
  { label: "first name", selector: '[data-qa="first_name"]', key: "firstname" },
  { label: "last name", selector: '[data-qa="last_name"]', key: "lastname" },
  { label: "address", selector: '[data-qa="address"]', key: "address1" },
  { label: "state", selector: '[data-qa="state"]', key: "state" },
  { label: "city", selector: '[data-qa="city"]', key: "city" },
  { label: "zip code", selector: '[data-qa="zipcode"]', key: "zipcode" },
  { label: "mobile number", selector: '[data-qa="mobile_number"]', key: "mobile_number" },
];

describe("Signup and Login - Negative scenarios", () => {
  
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });


  // login

  describe("Login", () => {
    
    before(() => {
      cy.deleteUserViaApi();
      cy.createUserViaApi();
    });

    after(() => {
      cy.deleteUserViaApi();
    });

    beforeEach(() => {
      LoginPage.visit();
    });

    // wrong credentials
    it("TC009 - shows an error for a wrong password", () => {
      LoginPage.login(users.newUser.email, users.invalidUser.password);

      LoginPage.loginError.should(
        "contain.text",
        "Your email or password is incorrect!"
      );
      HomePage.loggedInText.should("not.exist");
    });

    it("TC010 - shows an error for an email that is not registered", () => {
      LoginPage.login(users.invalidUser.email, users.invalidUser.password);

      LoginPage.loginError.should(
        "contain.text",
        "Your email or password is incorrect!"
      );
      HomePage.loggedInText.should("not.exist");
    });

    it("TC011 - rejects the correct password typed in a different letter case", () => {
      // Test@1234 becomes test@1234
      LoginPage.login(
        users.newUser.email,
        users.newUser.password.toLowerCase()
      );

      LoginPage.loginError.should(
        "contain.text",
        "Your email or password is incorrect!"
      );
      HomePage.loggedInText.should("not.exist");

    });

    it("TC012 - rejects a SQL-injection style text used as the password", () => {

      LoginPage.login(users.newUser.email, "' OR '1'='1");

      LoginPage.loginError.should(
        "contain.text",
        "Your email or password is incorrect!"
      );
      HomePage.loggedInText.should("not.exist");
    });


    // empty fields
    it("TC013 - does not log in when email and password are both empty", () => {
      LoginPage.loginButton.click();

      // flags the empty required field
      LoginPage.loginEmail.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("include", "/login");
    });

    it("TC014 - does not log in when the email is empty", () => {

      LoginPage.loginPassword.type(users.newUser.password, { log: false }); // prevenrts displaying password value
      LoginPage.loginButton.click();

      LoginPage.loginEmail.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("include", "/login");
    });

    it("TC015 - does not log in when the password is empty", () => {

      LoginPage.loginEmail.type(users.newUser.email);
      LoginPage.loginButton.click();

      LoginPage.loginPassword.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("include", "/login");
    });

    
invalidEmails.forEach((badEmail, index) => {

  it(`${tcId(16 + index)} - does not accept the invalid email "${badEmail}" on login`, () => {

    cy.step(`Enter the invalid email "${badEmail}" and a password`);
    LoginPage.loginPassword.type("SomePassword1");
    LoginPage.loginEmail.invoke("val", badEmail); // whole value at once
    LoginPage.loginButton.click();
    LoginPage.loginEmail.should(($input) => {
      expect($input[0].validity.typeMismatch).to.be.true;

        });

    cy.url().should("include", "/login");

    });
  });

});


// login with deleted account - special case

  describe("Login with a deleted account", () => {
    before(() => {
      cy.createUserViaApi();
      cy.deleteUserViaApi();
    });

    it("TC021 - does not log in after the account has been deleted", () => {
      LoginPage.visit();
      LoginPage.login(users.newUser.email, users.newUser.password);

      LoginPage.loginError.should(
        "contain.text",
        "Your email or password is incorrect!"
      );
      HomePage.loggedInText.should("not.exist");
    });
  });


  // sign up - login page -> name + email 

  describe("Signup - name and email step", () => {

    beforeEach(() => {
      cy.deleteUserViaApi();
      LoginPage.visit();
    });

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    // already registered email

    it("TC022 - shows an error when the email is already registered", () => {
      cy.createUserViaApi(); 

      LoginPage.startSignup(users.newUser.name, users.newUser.email);

      LoginPage.signupError.should(
        "contain.text",
        "Email Address already exist!"
      );
     cy.url().should("include", "/signup");
    });

    it("TC023 - shows the same error when a different name is used with a registered email", () => {
      cy.createUserViaApi();

      LoginPage.startSignup("Another Person", users.newUser.email);

      LoginPage.signupError.should(
        "contain.text",
        "Email Address already exist!"
      );
      
      cy.url().should("include", "/signup");    });

    //empty fields

    it("TC024 - does not continue when the name is empty", () => {

      LoginPage.signupEmail.type(users.newUser.email);
      LoginPage.signupButton.click();

      LoginPage.signupName.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });

      cy.url().should("include", "/login");
    });

    it("TC025 - does not continue when the email is empty", () => {

      LoginPage.signupName.type(users.newUser.name);
      LoginPage.signupButton.click();

      LoginPage.signupEmail.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });

      cy.url().should("include", "/login");
    });

   
// sign up loop 

invalidEmails.forEach((badEmail, index) => {

  it(`${tcId(26 + index)} - does not accept the invalid email "${badEmail}" on signup`, () => {

    cy.step(`Enter the invalid email "${badEmail}" with a valid name`);
    LoginPage.signupName.type(users.newUser.name);
    LoginPage.signupEmail.invoke("val", badEmail); // whole value at once

    LoginPage.signupButton.click();

    LoginPage.signupEmail.should(($input) => {

      expect($input[0].validity.typeMismatch).to.be.true;
    });
    cy.url().should("include", "/login");

  });
});
  });


  // signup - account information form 
  
  describe("Signup - account information form", () => {

    // name + email step is done

    beforeEach(() => {

      cy.deleteUserViaApi();
      LoginPage.visit();
      LoginPage.startSignup(users.newUser.name, users.newUser.email);
      cy.url().should("include", "/signup");

    });

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    it("TC031 - does not create the account when the whole form is empty", () => {

      LoginPage.submitAccountForm();

      // password is flagged by the browser
      cy.get('[data-qa="password"]').should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("include", "/signup");
    });

   
    requiredFields.forEach((missingField, index) => {

      it(`${tcId(32 + index)} - does not create the account when ${missingField.label} is empty`, () => {

        requiredFields
          .filter((field) => field !== missingField) // every field except the missing one
          .forEach((field) => {
            // hide the typed value in the log only for the password
            const showInLog = field.key !== "password";
            cy.get(field.selector).type(users.newUser[field.key], {
              log: showInLog,
            });
          });

        LoginPage.submitAccountForm();

        cy.get(missingField.selector).should(($input) => {
          expect($input[0].validity.valueMissing).to.be.true;
        });
        cy.url().should("include", "/signup");
      });
    });
  });
});