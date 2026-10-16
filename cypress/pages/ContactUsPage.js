class ContactUsPage {
  
  get title() { return cy.contains("h2", "Get In Touch"); }
  get nameInput() { return cy.get('[data-qa="name"]'); }
  get emailInput() { return cy.get('[data-qa="email"]'); }
  get subjectInput() { return cy.get('[data-qa="subject"]'); }
  get messageInput() { return cy.get('[data-qa="message"]'); }
  get fileInput() { return cy.get('input[name="upload_file"]'); }
  get submitButton() { return cy.get('[data-qa="submit-button"]'); }
  get successMessage() { return cy.get(".status.alert-success"); }
  get homeButton() { return cy.get("a.btn.btn-success"); }

  // actions 

  visit() {
    cy.visit("/contact_us");
    cy.url().should("include", "/contact_us");
  }

  // data = { name, email, subject, message }
  
  fillForm(data) {
    if (data.name) this.nameInput.type(data.name);
    if (data.email) this.emailInput.type(data.email);
    if (data.subject) this.subjectInput.type(data.subject);
    if (data.message) this.messageInput.type(data.message);
  }

  submit() {
    this.submitButton.click();
  }

  assertNoSuccessMessage() {
    cy.get("body").should(($body) => {
      const $message = $body.find(".status.alert-success");
      expect($message.length === 0 || $message.is(":hidden")).to.be.true;
    });
  }

  stubConfirm(answer = true) {
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(answer).as("confirmPopup");
    });
  }
}



export default new ContactUsPage();