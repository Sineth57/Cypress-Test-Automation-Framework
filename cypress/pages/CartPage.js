class CartPage {

  get cartRows() { return cy.get("#cart_info_table tbody tr"); }
  get productNames() { return cy.get(".cart_description h4 a"); }
  get prices() { return cy.get(".cart_price p"); }
  get quantities() { return cy.get(".cart_quantity button"); }
  get totals() { return cy.get(".cart_total_price"); }
  get emptyCartMessage() { return cy.get("#empty_cart"); }
  get checkoutButton() { return cy.contains("Proceed To Checkout"); }

  // actions 

  visit() {
    cy.visit("/view_cart");
  }


  rowFor(productName) {
    return cy.contains("tr", productName);
  }

  removeProduct(index) {
    cy.get(".cart_quantity_delete").eq(index).click();
  }

  removeProductByName(productName) {
    this.rowFor(productName).find(".cart_quantity_delete").click();
  }

  proceedToCheckout() {
    this.checkoutButton.click();
  }
}

export default new CartPage();