import CheckoutPage from "../../../pages/CheckoutPage";

// Helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const paymentFields = [
  { label: "name on card", key: "nameOnCard", input: () => CheckoutPage.nameOnCard },
  { label: "card number", key: "cardNumber", input: () => CheckoutPage.cardNumber },
  { label: "CVC", key: "cvc", input: () => CheckoutPage.cvc },
  { label: "expiry month", key: "expiryMonth", input: () => CheckoutPage.expiryMonth },
  { label: "expiry year", key: "expiryYear", input: () => CheckoutPage.expiryYear },
];

describe("Checkout - Negative scenarios", () => {

  let products;
  let payment;

  before(() => {
    cy.fixture("products").then((data) => { products = data; });
    cy.fixture("paymentData").then((data) => { payment = data; });

    cy.step("Create a fresh test account via the API");
    cy.deleteUserViaApi();
    cy.createUserViaApi();
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });

  // payment form for the cart products

  describe("Payment form", () => {

    beforeEach(() => {
      cy.openCheckoutAsTestUser(products.blueTop.id);
      cy.step("Click Place Order to reach the payment page");
      CheckoutPage.placeOrder();
    });

    it("TC115 - does not place the order when the whole payment form is empty", () => {
      cy.step("Click Pay without typing anything");
      CheckoutPage.payAndConfirm();

      // browser flags the empty required field
      CheckoutPage.nameOnCard.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      cy.url().should("not.include", "/payment_done");
    });

    // loop through one test per card field
    paymentFields.forEach((field, index) => {
      it(`${tcId(116 + index)} - does not place the order when ${field.label} is empty`, () => {
        // copy the valid card and blank out just this one field
        const card = { ...payment.validCard, [field.key]: "" };

        cy.step(`Fill the card but leave ${field.label} empty`);
        CheckoutPage.fillPayment(card);

        cy.step("Click Pay and Confirm Order");
        CheckoutPage.payAndConfirm();

        cy.step(`The browser should flag ${field.label} as missing`);
        field.input().should(($input) => {
          expect($input[0].validity.valueMissing).to.be.true;
        });
        cy.url().should("include", "/payment");
        cy.url().should("not.include", "/payment_done");
      });
    });

    // invalid card details
   
    it("TC152 - does not place the order when the card number contains letters", () => {
      const card = { ...payment.validCard, cardNumber: "abcdefghijklmnop" };

      cy.step("Fill the card with letters in the card number");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC153 - does not place the order when the card number is too short", () => {
      const card = { ...payment.validCard, cardNumber: "1234" };

      cy.step("Fill the card with a card number of only 4 digits");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC154 - does not place the order when the CVC contains letters", () => {
      const card = { ...payment.validCard, cvc: "abc" };

      cy.step("Fill the card with letters in the CVC");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC155 - does not place the order when the expiry month is 13", () => {
      const card = { ...payment.validCard, expiryMonth: "13" };

      cy.step("Fill the card with the expiry month 13");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC156 - does not place the order when the expiry month is 00", () => {
      const card = { ...payment.validCard, expiryMonth: "00" };

      cy.step("Fill the card with the expiry month 00");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC157 - does not place the order when the card has already expired", () => {
      const card = { ...payment.validCard, expiryYear: "2001" };

      cy.step("Fill the card with the expiry year 2001");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC158 - does not place the order when the expiry year contains letters", () => {
      const card = { ...payment.validCard, expiryYear: "abcd" };

      cy.step("Fill the card with letters in the expiry year");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });

    it("TC159 - does not place the order when the name on card is only spaces", () => {
      const card = { ...payment.validCard, nameOnCard: "   " };

      cy.step("Fill the card with only spaces in the name on card");
      CheckoutPage.fillPayment(card);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The form should be blocked, so the success message stays hidden");
      cy.get("#success_message").should("not.be.visible");
      cy.url().should("not.include", "/payment_done");
    });
  });

  // checkout page and order flow

  describe("Checkout page and order flow", () => {

    it("TC160 - does not show the Order Placed page when /payment_done is opened without paying", () => {
      cy.step("Reset the test account so its cart is empty, then log in");
      cy.resetTestUser();
      cy.loginAsTestUser();

      cy.step("Open the order confirmation address directly, without paying");
      // do not fail the test if the site answers with an error page
      cy.visit(`/payment_done/${products.blueTop.priceValue}`, { failOnStatusCode: false });

      cy.step("The Order Placed message should not appear");
      cy.contains("Order Placed!", { matchCase: false }).should("not.exist");
    });

    it("TC161 - does not offer Place Order when the cart is empty", () => {
      cy.step("Reset the test account so its cart is empty, then log in");
      cy.resetTestUser();
      cy.loginAsTestUser();

      cy.step("Open the checkout page directly with an empty cart");
      cy.visit("/checkout", { failOnStatusCode: false });

      cy.step("The Place Order button should not be offered");
      CheckoutPage.placeOrderButton.should("not.exist");
    });

    it("TC162 - treats script text in the order comment as plain text", () => {
      const alertStub = cy.stub().as("alertStub");
      cy.on("window:alert", alertStub);

      cy.openCheckoutAsTestUser(products.blueTop.id);

      cy.step("Type script text in the comment box");
      CheckoutPage.addComment("<script>alert(1)</script>");

      cy.step("Place the order with a valid card");
      CheckoutPage.placeOrder();
      CheckoutPage.fillPayment(payment.validCard);
      CheckoutPage.payAndConfirm();

      cy.step("The order should be placed and no popup should appear");
      cy.url().should("include", "/payment_done");
      cy.get("@alertStub").should("not.have.been.called");
    });

    it("TC163 - does not break the checkout when the order comment is very long", () => {
      cy.openCheckoutAsTestUser(products.blueTop.id);

      cy.step("Type a very long comment (1000 characters)");
      CheckoutPage.addComment("a".repeat(1000));

      cy.step("Click Place Order");
      CheckoutPage.placeOrder();

      cy.step("The payment page should still open and show its form");
      CheckoutPage.nameOnCard.should("be.visible");
      CheckoutPage.payButton.should("be.visible");
    });
  });
});