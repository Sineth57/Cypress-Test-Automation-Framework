import HomePage from "../../../pages/HomePage";
import LoginPage from "../../../pages/LoginPage";
import SignupPage from "../../../pages/SignupPage";
import { getUserDetails, detailFieldMap } from "../../../support/apiHelpers";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const formFields = [
  { label: "title Mr", element: () => SignupPage.titleMr },
  { label: "title Mrs", element: () => SignupPage.titleMrs },
  { label: "name", element: () => SignupPage.accountName },
  { label: "email", element: () => SignupPage.accountEmail },
  { label: "password", element: () => SignupPage.password },
  { label: "day of birth", element: () => SignupPage.day },
  { label: "month of birth", element: () => SignupPage.month },
  { label: "year of birth", element: () => SignupPage.year },
  { label: "newsletter box", element: () => SignupPage.newsletter },
  { label: "special offers box", element: () => SignupPage.specialOffers },
  { label: "first name", element: () => SignupPage.firstName },
  { label: "last name", element: () => SignupPage.lastName },
  { label: "company", element: () => SignupPage.company },
  { label: "address", element: () => SignupPage.address },
  { label: "address line 2", element: () => SignupPage.address2 },
  { label: "country", element: () => SignupPage.country },
  { label: "state", element: () => SignupPage.state },
  { label: "city", element: () => SignupPage.city },
  { label: "zip code", element: () => SignupPage.zipcode },
  { label: "mobile number", element: () => SignupPage.mobileNumber },
  { label: "Create Account button", element: () => SignupPage.createAccountButton },
];

const expectedCountries = [
  "India", "United States", "Canada", "Australia", "Israel", "New Zealand", "Singapore",
];

const acceptedNames = ["Test User", "O'Brien-Smith", "José Núñez", "A"];

const titles = ["Mr", "Mrs"];

describe("Signup - Positive scenarios", () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

describe("Signup box and account form", () => {
    beforeEach(() => {
      cy.deleteUserViaApi();
      SignupPage.visit();
    });

    it("TC295 - shows the New User Signup box with name, email and button", () => {
      SignupPage.signupHeading.should("be.visible");
      SignupPage.nameInput.should("be.visible");
      SignupPage.emailInput.should("be.visible");
      SignupPage.signupButton.should("be.visible");
    });

    it("TC296 - shows the entered name and email on the account form", () => {

      SignupPage.start(users.newUser.name, users.newUser.email);

      cy.url().should("include", "/signup");
      SignupPage.formHeading.should("be.visible");
      SignupPage.accountName.should("have.value", users.newUser.name);
      SignupPage.accountEmail.should("have.value", users.newUser.email);
    });

    it("TC297 - does not let the user change the email on the account form", () => {
      SignupPage.start(users.newUser.name, users.newUser.email);

      SignupPage.accountEmail.should("be.disabled");
    });

    it("TC298 - shows all the fields of the account information form", () => {
      SignupPage.start(users.newUser.name, users.newUser.email);
      cy.url().should("include", "/signup");

      formFields.forEach((field) => {
        cy.log(`Check: the form has the ${field.label}`);
        field.element().should("exist");
      });
    });

    it("TC299 - offers the expected countries in the country list", () => {
      SignupPage.start(users.newUser.name, users.newUser.email);
      cy.url().should("include", "/signup");

      expectedCountries.forEach((country) => {
        cy.log(`Check: the country list has ${country}`);
        SignupPage.country.should("contain.text", country);
      });
    });

    it("TC300 - offers the days 1 to 31 and all months in the date of birth lists", () => {
      SignupPage.start(users.newUser.name, users.newUser.email);
      cy.url().should("include", "/signup");

      SignupPage.day.find("option").should("have.length.greaterThan", 30);
      SignupPage.day.should("contain.text", "31");
      SignupPage.month.find("option").should("have.length.greaterThan", 11);
      SignupPage.month.should("contain.text", "December");
    });

    // loop test per name in accepted names
    acceptedNames.forEach((name, index) => {
        
      it(`${tcId(301 + index)} - accepts the name "${name}" in the first step`, () => {
        SignupPage.start(name, users.newUser.email);

        cy.url().should("include", "/signup");
        SignupPage.accountName.should("have.value", name);
      });
    });
  });


  describe("Registering an account", () => {
    beforeEach(() => {
      cy.deleteUserViaApi();
      SignupPage.visit();
    });

    afterEach(() => {
      cy.deleteUserViaApi();
    });

    // loop test per title
    titles.forEach((title, index) => {
      it(`${tcId(305 + index)} - registers a new user with the title ${title}`, () => {
        SignupPage.registerNewUser({ ...users.newUser, title });

        cy.url().should("include", "/account_created");
        cy.contains("Account Created!", { matchCase: false }).should("be.visible");

        SignupPage.continueButton.click();
        HomePage.loggedInText.should("contain.text", users.newUser.name);
      });
    });

    it("TC307 - shows the account created confirmation text", () => {
      SignupPage.registerNewUser(users.newUser);

      cy.contains("Congratulations! Your new account has been successfully created!").should("be.visible");
    });

    it("TC308 - registers with the newsletter and special offers boxes ticked", () => {
      SignupPage.start(users.newUser.name, users.newUser.email);
      cy.url().should("include", "/signup");

      SignupPage.fillAccountDetails(users.newUser);
      SignupPage.tickNewsletterAndOffers();
      SignupPage.newsletter.should("be.checked");
      SignupPage.specialOffers.should("be.checked");
      SignupPage.submit();

      cy.url().should("include", "/account_created");
    });

    it("TC309 - registers without the optional fields (company and address line 2)", () => {
      SignupPage.registerNewUser({ ...users.newUser, company: "", address2: "" });

      cy.url().should("include", "/account_created");
      cy.contains("Account Created!", { matchCase: false }).should("be.visible");
    });

    it("TC310 - shows the new user's name in the header after Continue", () => {
      SignupPage.registerNewUser(users.newUser);
      SignupPage.continueButton.click();

      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      HomePage.loggedInText.should("contain.text", users.newUser.name);
    });

 
    it("TC311 - saves the details that were entered in the form", () => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      SignupPage.registerNewUser(users.newUser);
      cy.url().should("include", "/account_created");

      // ask the API what the site saved, and compare field by field
      getUserDetails(users.newUser.email).then((result) => {
        const user = result.body.user || {};
        const mismatches = [];

        Object.keys(detailFieldMap).forEach((sentName) => {
          const returnedName = detailFieldMap[sentName];
          const sent = String(users.newUser[sentName]);
          let returned = String(user[returnedName]);

     
          if (returnedName === "birth_month" && /^\d+$/.test(returned)) {
            returned = monthNames[Number(returned) - 1];
          }

          if (sent !== returned) {
            mismatches.push(`${returnedName}: entered "${sent}", saved "${returned}"`);
          }
        });

        expect(mismatches, `fields saved differently -> ${mismatches.join(" | ")}`).to.be.empty;
      });
    });

    it("TC312 - lets the new user log in again after logging out", () => {
      SignupPage.registerNewUser(users.newUser);
      SignupPage.continueButton.click();
      HomePage.loggedInText.should("contain.text", users.newUser.name);

      HomePage.logout();
      cy.url().should("include", "/login");

      LoginPage.login(users.newUser.email, users.newUser.password);
      HomePage.loggedInText.should("contain.text", users.newUser.name);
    });

    it("TC313 - lets the same email sign up again after the account is deleted", () => {
      SignupPage.registerNewUser(users.newUser);
      SignupPage.continueButton.click();

      // delete the account from the header
      HomePage.deleteAccount();
      cy.contains("Account Deleted!", { matchCase: false }).should("be.visible");
      SignupPage.continueButton.click();

      // the same email should be free again
      SignupPage.visit();
      SignupPage.start(users.newUser.name, users.newUser.email);

      cy.url().should("include", "/signup");
      SignupPage.formHeading.should("be.visible");
    });
  });
});
