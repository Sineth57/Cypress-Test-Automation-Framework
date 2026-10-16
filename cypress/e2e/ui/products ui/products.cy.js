import ProductsPage from "../../../pages/ProductsPage";
import CartPage from "../../../pages/CartPage";

describe("Products - Positive scenarios", () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // all product page

  describe("All products page", () => {

    beforeEach(() => {
      ProductsPage.visit();
    });

    it("TC040 - shows the All Products page title", () => {
      cy.url().should("include", "/products");
      ProductsPage.pageTitle.should("contain.text", "All Products");
    });

    it("TC041 - shows a name and a price on the first product card", () => {
      ProductsPage.productCards.should("have.length.greaterThan", 0);

      ProductsPage.productCards.first().within(() => {
        cy.get(".productinfo h2").should("contain.text", "Rs.");
        cy.get(".productinfo p").should("not.be.empty");
      });
    });

    it("TC042 - lists the known product 'Blue Top'", () => {
      cy.contains(".productinfo p", products.blueTop.name).should("exist");
    });

    it("TC043 - opens the product details page from View Product", () => {
      ProductsPage.viewProduct(0);

      cy.url().should("include", "/product_details/");
    });
  });

  // product details

  describe("Product details page", () => {
    beforeEach(() => {
      ProductsPage.visitProductDetails(products.blueTop.id);
    });

    it("TC044 - shows the product name", () => {
      ProductsPage.detailName.should("contain.text", products.blueTop.name);
    });

    it("TC045 - shows the product category", () => {
      ProductsPage.detailInfo.should("contain.text", products.blueTop.category);
    });

    it("TC046 - shows the product price", () => {
      ProductsPage.detailInfo.should("contain.text", products.blueTop.price);
    });

    it("TC047 - shows the product availability", () => {
      ProductsPage.detailInfo.should("contain.text", "In Stock");
    });

    it("TC048 - shows the product brand", () => {
      ProductsPage.detailInfo.should("contain.text", products.blueTop.brand);
    });
  });

  // search option

  describe("Search", () => {
    beforeEach(() => {
      ProductsPage.visit();
    });

    it("TC049 - shows the Searched Products title after a search", () => {
      ProductsPage.searchFor(products.searchTerms.valid);

      ProductsPage.pageTitle.should("contain.text", "Searched Products");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC050 - finds a product by its exact name", () => {
      ProductsPage.searchFor(products.blueTop.name);

      cy.contains(".productinfo p", products.blueTop.name).should("exist");
    });

    it("TC051 - finds a product when the name is typed in lowercase", () => {
      ProductsPage.searchFor(products.blueTop.name.toLowerCase());

      cy.contains(".productinfo p", products.blueTop.name).should("exist");
    });
  });

  // category and brand filters

  describe("Category and brand filters", () => {
    beforeEach(() => {
      ProductsPage.visit();
    });

    it("TC052 - filters products by category Women > Dress", () => {
      ProductsPage.filterByCategory("Women", "Dress");

      ProductsPage.pageTitle.should("contain.text", "Women - Dress");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC053 - filters products by category Men > Tshirts", () => {
      ProductsPage.filterByCategory("Men", "Tshirts");

      ProductsPage.pageTitle.should("contain.text", "Men - Tshirts");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC054 - filters products by brand Polo", () => {
      ProductsPage.filterByBrand("Polo");

      ProductsPage.pageTitle.should("contain.text", "Polo");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC055 - filters products by brand H&M", () => {
      ProductsPage.filterByBrand("H&M");

      ProductsPage.pageTitle.should("contain.text", "H&M");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });
  });

  // add to cart from products

  describe("Add to cart", () => {

    beforeEach(() => {
      ProductsPage.visit();
    });

    it("TC056 - shows a confirmation popup after adding a product", () => {
      ProductsPage.addToCart(0);

      ProductsPage.cartModal.should("be.visible");
      ProductsPage.cartModal.should("contain.text", "Added!");
    });

    it("TC057 - stays on the products page after Continue Shopping", () => {
      ProductsPage.addToCart(0);
      ProductsPage.continueShopping();

      ProductsPage.cartModal.should("not.be.visible");
      cy.url().should("include", "/products");
    });

    it("TC058 - shows the added product in the cart", () => {
      ProductsPage.addToCart(0);
      ProductsPage.viewCartFromModal();

      cy.url().should("include", "/view_cart");
      CartPage.cartRows.should("have.length", 1);
    });

    it("TC059 - adds two different products to the cart", () => {
      ProductsPage.addToCart(0);
      ProductsPage.continueShopping();
      ProductsPage.addToCart(1);
      ProductsPage.viewCartFromModal();

      CartPage.cartRows.should("have.length", 2);
    });

  
    it("TC060 - adds a product with quantity 4 from the details page", () => {
      const quantity = 4;
    
      cy.step(`Open the details page of "${products.blueTop.name}"`);
      ProductsPage.visitProductDetails(products.blueTop.id);
    
      if (quantity !== 1) {
        cy.step(`Set the quantity to ${quantity}`);
        ProductsPage.quantityInput.clear().type(String(quantity));
        } else {
          cy.step("Keep the default quantity of 1");
        }
    
        cy.step("Click Add to cart and open the cart");
        ProductsPage.detailAddToCartButton.click();
         ProductsPage.viewCartFromModal();
    
        cy.step(`The cart should show quantity ${quantity}`);
        CartPage.quantities.first().should("have.text", String(quantity));
        });


  });

  // product review

  describe("Product review", () => {
    it("TC061 - submits a review successfully", () => {
      ProductsPage.visitProductDetails(products.blueTop.id);

      ProductsPage.fillReview(
        "Test Reviewer",
        "reviewer@example.com",
        "Great quality, fits well."
      );
      ProductsPage.reviewButton.click();

      ProductsPage.reviewSuccessMessage.should("be.visible");
    });
  });
});