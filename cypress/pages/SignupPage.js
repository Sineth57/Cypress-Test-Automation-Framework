class SignupPage {

  // signup box on the login page
  get signupHeading() { return cy.contains("New User Signup!"); }
  get nameInput() { return cy.get('[data-qa="signup-name"]'); }
  get emailInput() { return cy.get('[data-qa="signup-email"]'); }
  get signupButton() { return cy.get('[data-qa="signup-button"]'); }
  get errorMessage() { return cy.get(".signup-form p"); }

  // account information form 
  get formHeading() { return cy.contains("Enter Account Information", { matchCase: false }); }
  get titleMr() { return cy.get("#id_gender1"); }
  get titleMrs() { return cy.get("#id_gender2"); }
  get accountName() { return cy.get('[data-qa="name"]'); }
  get accountEmail() { return cy.get('[data-qa="email"]'); }
  get password() { return cy.get('[data-qa="password"]'); }
  get day() { return cy.get('[data-qa="days"]'); }
  get month() { return cy.get('[data-qa="months"]'); }
  get year() { return cy.get('[data-qa="years"]'); }
  get newsletter() { return cy.get("#newsletter"); }
  get specialOffers() { return cy.get("#optin"); }
  get firstName() { return cy.get('[data-qa="first_name"]'); }
  get lastName() { return cy.get('[data-qa="last_name"]'); }
  get company() { return cy.get('[data-qa="company"]'); }
  get address() { return cy.get('[data-qa="address"]'); }
  get address2() { return cy.get('[data-qa="address2"]'); }
  get country() { return cy.get('[data-qa="country"]'); }
  get state() { return cy.get('[data-qa="state"]'); }
  get city() { return cy.get('[data-qa="city"]'); }
  get zipcode() { return cy.get('[data-qa="zipcode"]'); }
  get mobileNumber() { return cy.get('[data-qa="mobile_number"]'); }
  get createAccountButton() { return cy.get('[data-qa="create-account"]'); }

  // after the form 
  get accountCreatedTitle() { return cy.get('[data-qa="account-created"]'); }
  get accountDeletedTitle() { return cy.get('[data-qa="account-deleted"]'); }
  get continueButton() { return cy.get('[data-qa="continue-button"]'); }


  //actions 


  visit() {
    cy.visit("/login");
  }

  // step 1: name and email, then Signup
  
  start(name, email) {
    if (name) this.nameInput.type(name);
    if (email) this.emailInput.type(email);
    this.signupButton.click();
  }

  // step 2: fills the account information form from a user object
  
  fillAccountDetails(user) {
    if (user.title === "Mrs") {
      this.titleMrs.check();
    } else {
      this.titleMr.check();
    }

    if (user.password) this.password.type(user.password, { log: false });
    if (user.birth_date) this.day.select(user.birth_date);
    if (user.birth_month) this.month.select(user.birth_month);
    if (user.birth_year) this.year.select(user.birth_year);

    if (user.firstname) this.firstName.type(user.firstname);
    if (user.lastname) this.lastName.type(user.lastname);
    if (user.company) this.company.type(user.company);
    if (user.address1) this.address.type(user.address1);
    if (user.address2) this.address2.type(user.address2);
    if (user.country) this.country.select(user.country);
    if (user.state) this.state.type(user.state);
    if (user.city) this.city.type(user.city);
    if (user.zipcode) this.zipcode.type(user.zipcode);
    if (user.mobile_number) this.mobileNumber.type(user.mobile_number);
  }

  tickNewsletterAndOffers() {
    this.newsletter.check();
    this.specialOffers.check();
  }

  submit() {
    this.createAccountButton.click();
  }

  // signup and Create Account
  registerNewUser(user) {
    this.start(user.name, user.email);
    cy.url().should("include", "/signup");
    this.fillAccountDetails(user);
    this.submit();
  }
}

export default new SignupPage();