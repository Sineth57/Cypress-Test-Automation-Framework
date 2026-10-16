import ContactUsPage from "../../../pages/ContactUsPage";

// Helper for loop tests: tcId(132) gives "TC132"
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// Passes only if the confirm popup was NEVER shown.
// If the browser blocks the form correctly, the popup must not appear.
const assertNoPopup = () => {
  cy.get("@confirmPopup").should("not.have.been.called");
};

// The required fields. For each one we leave it empty and fill the rest.
//   label = used in the test name
//   key   = the property name inside contactData.json
//   input = a function that finds the field on the page
const requiredFields = [
  { label: "name", key: "name", input: () => ContactUsPage.nameInput },
  { label: "email", key: "email", input: () => ContactUsPage.emailInput },
  { label: "subject", key: "subject", input: () => ContactUsPage.subjectInput },
  { label: "message", key: "message", input: () => ContactUsPage.messageInput },
];

// Not valid email addresses (same list as the other negative files)
const invalidEmails = [
  "plainaddress",
  "@no-local-part.com",
  "user@",
  "two@@at.com",
  "spaces in@mail.com",
];

describe("Contact Us - Negative scenarios", () => {
  let contact;

  before(() => {
    cy.fixture("contactData").then((data) => {
      contact = data;
    });
  });

  // =====================================================
  // FORM VALIDATION  (TC131 - TC140)
  // PRECONDITION: we are on the Contact Us page, and the confirm popup
  // is replaced by a recorder that answers OK.
  // =====================================================
  describe("Form validation", () => {
    beforeEach(() => {
      ContactUsPage.visit();
      ContactUsPage.stubConfirm(true);
    });

    it("TC131 - does not submit when the whole form is empty", () => {
      cy.step("Click Submit without typing anything");
      ContactUsPage.submit();

      cy.step("No popup and no success message should appear");
      assertNoPopup();
      ContactUsPage.assertNoSuccessMessage();

      cy.step("The browser should flag the email, the only field it requires");
      ContactUsPage.emailInput.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
    });

        // LOOP: TC132 - TC135 (one test per required field)
    requiredFields.forEach((field, index) => {
      it(`${tcId(132 + index)} - does not submit when the ${field.label} is empty`, () => {
        // Copy the valid details and blank out just this one field
        const data = { ...contact.validMessage, [field.key]: "" };

        cy.step(`Fill the form but leave the ${field.label} empty`);
        ContactUsPage.fillForm(data);

        cy.step("Click Submit");
        ContactUsPage.submit();

        cy.step("No popup and no success message should appear");
        assertNoPopup();
        ContactUsPage.assertNoSuccessMessage();

        cy.step(`The browser should flag the ${field.label} as missing`);
        field.input().should(($input) => {
          expect($input[0].validity.valueMissing).to.be.true;
        });
      });
    });

    // LOOP: TC136 - TC140 (one test per invalid email)
    invalidEmails.forEach((badEmail, index) => {
      it(`${tcId(136 + index)} - does not accept the invalid email "${badEmail}"`, () => {
        // Everything valid except the email
        const data = { ...contact.validMessage, email: "" };

        cy.step("Fill the form without an email");
        ContactUsPage.fillForm(data);

        cy.step(`Set the email to "${badEmail}" in one go`);
        ContactUsPage.emailInput.invoke("val", badEmail);

        cy.step("Click Submit");
        ContactUsPage.submit();

        cy.step("The browser should say this is not an email address");
        ContactUsPage.emailInput.should(($input) => {
          expect($input[0].validity.typeMismatch).to.be.true;
        });
        assertNoPopup();
        ContactUsPage.assertNoSuccessMessage();
      });
    });
  });

  // =====================================================
  // CONFIRMATION POPUP  (TC141)
  // =====================================================
  describe("Confirmation popup", () => {
    beforeEach(() => {
      ContactUsPage.visit();
    });

    it("TC141 - does not submit the form when the confirmation popup is cancelled", () => {
      cy.step("Make the popup answer Cancel");
      ContactUsPage.stubConfirm(false);

      cy.step("Fill in the form with valid details");
      ContactUsPage.fillForm(contact.validMessage);

      cy.step("Click Submit");
      ContactUsPage.submit();

      cy.step("The popup should have appeared once");
      cy.get("@confirmPopup").should("have.been.calledOnce");

      cy.step("The success message should not appear after Cancel");
      ContactUsPage.assertNoSuccessMessage();
      cy.url().should("include", "/contact_us");
    });
  });
});