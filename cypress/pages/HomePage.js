class HomePage {
  
  get slider() { return cy.get("#slider"); }
  get menu() { return cy.get(".shop-menu"); }
  get loggedInText() { return cy.contains("Logged in as", { timeout: 30000 }); }
  get sliderActiveItem() { return cy.get("#slider-carousel .item.active"); }
  get sliderNextArrow() { return cy.get("#slider-carousel .right.control-carousel"); }

  // logo and page sections
  get logo() { return cy.get(".logo a"); }
  get categorySection() { return cy.get(".left-sidebar .category-products"); }
  get brandsSection() { return cy.get(".left-sidebar .brands_products"); }
  get featuredItems() { return cy.get(".features_items"); }
  get recommendedItems() { return cy.get(".recommended_items"); }

  // footer scroll up arrow
  get subscribeEmail() { return cy.get("#susbscribe_email"); }
  get subscribeButton() { return cy.get("#subscribe"); }
  get subscribeSuccess() { return cy.get("#success-subscribe"); }
  get scrollUpArrow() { return cy.get("#scrollUp"); }

  // actions 

  visit() {
    cy.visit("/");
  }

  goToLogin() {
    this.menu.find('a[href="/login"]').click();
  }

  goToProducts() {
    this.menu.find('a[href="/products"]').click();
  }

  goToCart() {
    this.menu.find('a[href="/view_cart"]').click();
  }

  goToContactUs() {
    this.menu.find('a[href="/contact_us"]').click();
  }

  subscribe(email) {
    this.subscribeEmail.scrollIntoView();
    this.subscribeEmail.type(email);
    this.subscribeButton.click();
  }

  logout() {
    this.menu.find('a[href="/logout"]').click();
  }

  deleteAccount() {
    this.menu.find('a[href="/delete_account"]').click();
  }
}

export default new HomePage();