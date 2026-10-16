class LoginPage {
  
  // login box 
  get loginEmail() { return cy.get('[data-qa="login-email"]'); }
  get loginPassword() { return cy.get('[data-qa="login-password"]'); }
  get loginButton() { return cy.get('[data-qa="login-button"]'); }
  get loginError() { return cy.get(".login-form p"); }

  // signup box 
  get signupName() { return cy.get('[data-qa="signup-name"]'); }
  get signupEmail() { return cy.get('[data-qa="signup-email"]'); }
  get signupButton() { return cy.get('[data-qa="signup-button"]'); }
  get signupError() { return cy.get(".signup-form p"); }

  // account details form 
  get accountCreatedTitle() { return cy.get('[data-qa="account-created"]'); }
  get continueButton() { return cy.get('[data-qa="continue-button"]'); }


  // actions 

  visit() {
    cy.visit("/login");
  }

  login(email, password) {
    this.loginEmail.type(email);
    this.loginPassword.type(password, { log: false });
    this.loginButton.click();
  }

  // signup: name + email, then click Signup
  startSignup(name, email) {
    this.signupName.type(name);
    this.signupEmail.type(email);
    this.signupButton.click();
  }

  // signup: fill the long form using the data from users.json
  fillAccountDetails(user) {
    
    if (user.title === "Mr") {
      cy.get("#id_gender1").check();
    } else {
      cy.get("#id_gender2").check();
    }

    cy.get('[data-qa="password"]').type(user.password, { log: false });

    // dob details
    cy.get('[data-qa="days"]').select(user.birth_date);
    cy.get('[data-qa="months"]').select(user.birth_month);
    cy.get('[data-qa="years"]').select(user.birth_year);

    // address details
    cy.get('[data-qa="first_name"]').type(user.firstname);
    cy.get('[data-qa="last_name"]').type(user.lastname);
    cy.get('[data-qa="company"]').type(user.company);
    cy.get('[data-qa="address"]').type(user.address1);
    cy.get('[data-qa="address2"]').type(user.address2);
    cy.get('[data-qa="country"]').select(user.country);
    cy.get('[data-qa="state"]').type(user.state);
    cy.get('[data-qa="city"]').type(user.city);
    cy.get('[data-qa="zipcode"]').type(user.zipcode);
    cy.get('[data-qa="mobile_number"]').type(user.mobile_number);
  }

  submitAccountForm() {
    cy.get('[data-qa="create-account"]').click();
  }
}

export default new LoginPage();