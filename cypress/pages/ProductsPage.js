class ProductsPage {

  // product list 
  get productCards() { return cy.get(".features_items .product-image-wrapper"); }
  get searchInput() { return cy.get("#search_product"); }
  get searchButton() { return cy.get("#submit_search"); }
  get pageTitle() { return cy.get(".features_items .title"); }

  // product details page
  get detailName() { return cy.get(".product-information h2"); }
  get detailInfo() { return cy.get(".product-information"); }
  get quantityInput() { return cy.get("#quantity"); }
  get detailAddToCartButton() { return cy.get("button.cart"); }

  // review form on product details page
  get reviewName() { return cy.get("#name"); }
  get reviewEmail() { return cy.get("#email"); }
  get reviewText() { return cy.get("#review"); }
  get reviewButton() { return cy.get("#button-review"); }
  get reviewSuccessMessage() { return cy.contains("span", "Thank you for your review."); }

  // popup that appears after adding to cart
  get cartModal() { return cy.get("#cartModal"); }


  // actions 

  visit() {
    cy.visit("/products");
  }

  visitProductDetails(id) {
    cy.visit(`/product_details/${id}`);
  }

  searchFor(term) {
    this.searchInput.type(term);
    this.searchButton.click();
  }

  // index 0 = first product
  viewProduct(index) {
    cy.get(".choose a").eq(index).click();
  }

  addToCart(index) {
    cy.get(".productinfo .add-to-cart").eq(index).click();
  }

  continueShopping() {
    this.cartModal.contains("button", "Continue Shopping").click();
  }

  viewCartFromModal() {
    this.cartModal.contains("View Cart").click();
  }


  filterByCategory(parent, child) {
    cy.get(`a[href="#${parent}"]`).click();
    cy.get(`#${parent}`).contains(child).click();

    cy.url().should("include", "/category_products/");
  }


  filterByBrand(brandName) {
    cy.get(".brands-name").contains("a", brandName).click();

    cy.url().should("include", "/brand_products/");
  }

  fillReview(name, email, text) {
    if (name) this.reviewName.type(name);
    if (email) this.reviewEmail.type(email);
    if (text) this.reviewText.type(text);
  }

  // adds a product to the cart
  addFromDetails(id, quantity) {
    this.visitProductDetails(id);

    if (quantity) {
      this.quantityInput.clear().type(String(quantity));
    }

    this.detailAddToCartButton.click();
    this.cartModal.should("be.visible"); 
  }
}

export default new ProductsPage();