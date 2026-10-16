class CheckoutPage {

  // checkout review 
  
  get deliveryAddress() { return cy.get("#address_delivery"); }
  get billingAddress() { return cy.get("#address_invoice"); }
  get productNames() { return cy.get(".cart_description h4 a"); }
  get totalRow() { return cy.contains("tr", "Total Amount"); }
  get commentBox() { return cy.get('textarea[name="message"]'); }
  get placeOrderButton() { return cy.contains("a", "Place Order"); }

  // payment form 
  
  get nameOnCard() { return cy.get('[data-qa="name-on-card"]'); }
  get cardNumber() { return cy.get('[data-qa="card-number"]'); }
  get cvc() { return cy.get('[data-qa="cvc"]'); }
  get expiryMonth() { return cy.get('[data-qa="expiry-month"]'); }
  get expiryYear() { return cy.get('[data-qa="expiry-year"]'); }
  get payButton() { return cy.get('[data-qa="pay-button"]'); }

  // order confirmation 
  
  get orderPlacedTitle() { return cy.get('[data-qa="order-placed"]'); }
  get downloadInvoiceLink() { return cy.contains("a", "Download Invoice"); }
  get continueButton() { return cy.get('[data-qa="continue-button"]'); }

  // Actions 
  
  addComment(text) {
    this.commentBox.type(text);
  }

  placeOrder() {
    this.placeOrderButton.click();
    cy.url().should("include", "/payment");
  }


  fillPayment(card) {
    if (card.nameOnCard) this.nameOnCard.type(card.nameOnCard);
    if (card.cardNumber) this.cardNumber.type(card.cardNumber, { log: false });
    if (card.cvc) this.cvc.type(card.cvc, { log: false });
    if (card.expiryMonth) this.expiryMonth.type(card.expiryMonth);
    if (card.expiryYear) this.expiryYear.type(card.expiryYear);
  }

  payAndConfirm() {
    this.payButton.click();
  }
}

export default new CheckoutPage();