import HomePage from "../../../pages/HomePage";
import ContactUsPage from "../../../pages/ContactUsPage";

describe("Contact Us - Positive scenarios", () => {
  let contact;

  before(() => {
    cy.fixture("contactData").then((data) => {
      contact = data;
    });
  });

  // helper
  const submitForm = (data, filePath) => {
    cy.step("Fill in the contact form");
    ContactUsPage.fillForm(data);

    if (filePath) {
      cy.step(`Attach the file: ${filePath}`);
      ContactUsPage.fileInput.selectFile(filePath);
    } else {
      cy.step("No file given, skipping the upload");
    }

    cy.step("Click Submit");
    ContactUsPage.submit();
  };

  describe("Opening the page", () => {
    it("TC121 - opens the Contact Us page from the header menu", () => {
      cy.step("Open the home page");
      HomePage.visit();

      cy.step("Click Contact us in the header");
      HomePage.goToContactUs();

      cy.url().should("include", "/contact_us");
    });

    it("TC122 - shows the Get In Touch heading", () => {
      ContactUsPage.visit();

      ContactUsPage.title.should("be.visible");
    });

    it("TC123 - shows all the form fields and the Submit button", () => {
      ContactUsPage.visit();

      const fields = [
        { label: "name", element: () => ContactUsPage.nameInput },
        { label: "email", element: () => ContactUsPage.emailInput },
        { label: "subject", element: () => ContactUsPage.subjectInput },
        { label: "message", element: () => ContactUsPage.messageInput },
        { label: "file upload", element: () => ContactUsPage.fileInput },
        { label: "Submit button", element: () => ContactUsPage.submitButton },
      ];

      fields.forEach((field) => {
        cy.step(`The ${field.label} should be visible`);
        field.element().should("be.visible");
      });
    });
  });


  describe("Submitting the form", () => {
    // beforeEach(() => {
    //   ContactUsPage.visit();
    // });

      beforeEach(() => {
      ContactUsPage.visit();
      ContactUsPage.stubConfirm(true); // answer ok automatically
    });

    it("TC124 - submits the form with valid details", () => {
      submitForm(contact.validMessage);

      cy.step("The success message should be visible");
      ContactUsPage.successMessage.should("be.visible");
    });

    it("TC125 - shows the expected success text", () => {
      submitForm(contact.validMessage);

      ContactUsPage.successMessage.should(
        "contain.text",
        "Success! Your details have been submitted successfully."
      );
    });

    it("TC126 - asks for confirmation with a popup before submitting", () => {
      submitForm(contact.validMessage);

      cy.step("Exactly one confirm popup should have appeared");
      cy.get("@confirmPopup").should("have.been.calledOnce");

      cy.step("The popup should say: Press OK to proceed!");
      cy.get("@confirmPopup").should("have.been.calledWith", "Press OK to proceed!");

      ContactUsPage.successMessage.should("be.visible");
    });

    it("TC127 - submits the form with a file attached", () => {
      submitForm(contact.validMessage, contact.uploadFilePath);

      ContactUsPage.successMessage.should("be.visible");
    });

    it("TC128 - shows the chosen file in the upload field", () => {
      cy.step(`Choose the file ${contact.uploadFileName}`);
      ContactUsPage.fileInput.selectFile(contact.uploadFilePath);

      cy.step("The upload field should hold that file");
      ContactUsPage.fileInput.should(($input) => {
        expect($input[0].files[0].name).to.equal(contact.uploadFileName);
      });
    });

    it("TC129 - returns to the home page with the Home button after submitting", () => {
      submitForm(contact.validMessage);
      ContactUsPage.successMessage.should("be.visible");

      cy.step("Click the Home button");
      ContactUsPage.homeButton.click();

      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });

    it("TC130 - accepts special characters in the subject and message", () => {
      submitForm(contact.specialCharactersMessage);

      ContactUsPage.successMessage.should("be.visible");
    });
  });
});