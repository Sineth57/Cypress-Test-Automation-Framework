import HomePage from "../../../pages/HomePage";
import CartPage from "../../../pages/CartPage";
import ProductsPage from "../../../pages/ProductsPage";
import CheckoutPage from "../../../pages/CheckoutPage";

describe("Checkout - Positive scenarios", () => {

  let users;
  let products;
  let payment;

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
    cy.fixture("products").then((data) => { products = data; });
    cy.fixture("paymentData").then((data) => { payment = data; });

    // creating a new account
    cy.step("Create a fresh test account via the API");
    cy.deleteUserViaApi();
    cy.createUserViaApi();
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });

  // helper function for checking whether comment is provided and enter comment
  const completeOrder = (comment) => {

    if (comment) {
      cy.step(`Type the order comment: "${comment}"`);
      CheckoutPage.addComment(comment);
    } else {
      cy.step("No comment given, skipping the comment box");
    }

    cy.step("Click Place Order");
    CheckoutPage.placeOrder();

    cy.step("Fill in the card details");
    CheckoutPage.fillPayment(payment.validCard);

    cy.step("Click Pay and Confirm Order");
    CheckoutPage.payAndConfirm();
  };

  // checkout review page

  describe("Checkout review page", () => {

    beforeEach(() => {
      cy.openCheckoutAsTestUser(products.blueTop.id);
    });

    it("TC096 - opens the checkout page from the cart", () => {
      cy.step("Check the URL and the page headings");
      cy.url().should("include", "/checkout");
      cy.contains("Address Details").should("be.visible");
      cy.contains("Review Your Order").should("be.visible");
    });

    it("TC097 - shows the delivery address of the logged in user", () => {
      const expectedLines = [
        users.newUser.firstname,
        users.newUser.address1,
        users.newUser.city,
        users.newUser.mobile_number,
      ];

      expectedLines.forEach((line) => {
        cy.step(`Delivery address should contain: ${line}`);
        CheckoutPage.deliveryAddress.should("contain.text", line);
      });
    });

    it("TC098 - shows the billing address of the logged in user", () => {
      const expectedLines = [
        users.newUser.firstname,
        users.newUser.address1,
        users.newUser.city,
        users.newUser.mobile_number,
      ];

      expectedLines.forEach((line) => {
        cy.step(`Billing address should contain: ${line}`);
        CheckoutPage.billingAddress.should("contain.text", line);
      });
    });

    it("TC099 - shows the product in the order review", () => {
      cy.step("Check the product name in the review table");
      CheckoutPage.productNames.should("contain.text", products.blueTop.name);
    });

    it("TC100 - shows the correct total amount", () => {

      const expectedTotal = `Rs. ${products.blueTop.priceValue}`;

      cy.step(`Total amount should be ${expectedTotal}`);
      CheckoutPage.totalRow
        .find(".cart_total_price")
        .should("contain.text", expectedTotal);
    });

    it("TC101 - accepts a comment in the comment box", () => {

      const comment = "Please call before delivery.";

      cy.step("Type a comment");
      CheckoutPage.addComment(comment);

      cy.step("The box should keep the text");
      CheckoutPage.commentBox.should("have.value", comment);
    });

    it("TC102 - shows the Place Order button", () => {
      CheckoutPage.placeOrderButton.should("be.visible");
    });
  });

  // payment page

  describe("Payment page", () => {

    beforeEach(() => {
      cy.openCheckoutAsTestUser(products.blueTop.id);
      cy.step("Click Place Order to reach the payment page");
      CheckoutPage.placeOrder();
    });

    it("TC103 - opens the payment page after Place Order", () => {
      cy.url().should("include", "/payment");
    });

    it("TC104 - shows all the card detail fields", () => {
      const fields = [
        { label: "name on card", input: () => CheckoutPage.nameOnCard },
        { label: "card number", input: () => CheckoutPage.cardNumber },
        { label: "CVC", input: () => CheckoutPage.cvc },
        { label: "expiry month", input: () => CheckoutPage.expiryMonth },
        { label: "expiry year", input: () => CheckoutPage.expiryYear },
      ];

      fields.forEach((field) => {
        cy.step(`The ${field.label} field should be visible`);
        field.input().should("be.visible");
      });
    });

    it("TC105 - shows the Pay and Confirm Order button", () => {
      CheckoutPage.payButton.should("be.visible");
      CheckoutPage.payButton.should("contain.text", "Pay and Confirm Order");
    });
  });

  // order confirmation
  
  describe("Order confirmation", () => {
    beforeEach(() => {
      cy.openCheckoutAsTestUser(products.blueTop.id);
      completeOrder(); // no comment
    });

    it("TC106 - shows the Order Placed page after paying", () => {
      cy.url().should("include", "/payment_done");
      cy.contains("Order Placed!", { matchCase: false }).should("be.visible");
    });

    it("TC107 - shows the order confirmed message", () => {
      cy.contains("Congratulations! Your order has been confirmed!").should(
        "be.visible"
      );
    });

    it("TC108 - shows a Download Invoice link that points to the invoice", () => {
      CheckoutPage.downloadInvoiceLink
        .should("be.visible")
        .and("have.attr", "href")
        .and("include", "/download_invoice");
    });

    it("TC109 - returns to the home page after Continue", () => {
      cy.step("Click Continue");
      CheckoutPage.continueButton.click();

      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    });

    it("TC110 - empties the cart after the order is placed", () => {
      cy.step("Open the cart page");
      CartPage.visit();

      CartPage.emptyCartMessage.should("be.visible");
    });

    it("TC111 - keeps the user logged in after the order", () => {
      cy.step("Open the home page");
      HomePage.visit();

      HomePage.loggedInText.should("contain.text", users.newUser.name);
    });
  });

  // order variations
  
  describe("Order variations", () => {

    it("TC112 - places an order with a comment", () => {
      cy.openCheckoutAsTestUser(products.blueTop.id);

      completeOrder("Please deliver after 5 pm.");

      cy.url().should("include", "/payment_done");
      cy.contains("Order Placed!", { matchCase: false }).should("be.visible");
    });

    it("TC113 - shows the correct total for quantity 3", () => {
      
      const quantity = 3;
      const expectedTotal = `Rs. ${products.blueTop.priceValue * quantity}`;

      cy.openCheckoutAsTestUser(products.blueTop.id, quantity);

      cy.step(`Total amount should be ${expectedTotal}`);
      CheckoutPage.totalRow
        .find(".cart_total_price")
        .should("contain.text", expectedTotal);
    });

    it("TC114 - lists two different products in the order review", () => {
      cy.resetTestUser();

      cy.step("Log in as the test user");
      cy.loginAsTestUser();
      cy.contains("Logged in as").should("be.visible");

      cy.step("Add two different products");
      ProductsPage.addFromDetails(products.blueTop.id);
      ProductsPage.addFromDetails(products.menTshirt.id);

      cy.step("Open the cart and proceed to checkout");
      CartPage.visit();
      CartPage.proceedToCheckout();
      cy.url().should("include", "/checkout");

      cy.step("Both product names should be in the review");
      CheckoutPage.productNames.should("have.length", 2);
      CheckoutPage.productNames.should("contain.text", products.blueTop.name);
      CheckoutPage.productNames.should("contain.text", products.menTshirt.name);
    });
  });
});