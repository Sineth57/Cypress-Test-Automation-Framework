import HomePage from "../../../pages/HomePage";
import ProductsPage from "../../../pages/ProductsPage";
import CartPage from "../../../pages/CartPage";


describe("Cart - Positive scenarios", () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // Empty cart 

  describe("Empty cart", () => {
    it("TC077 - shows the empty cart message when nothing has been added", () => {
      CartPage.visit();

      CartPage.emptyCartMessage.should("be.visible");
      CartPage.emptyCartMessage.should("contain.text", "Cart is empty!");
    });

    it("TC078 - opens the cart page from the header menu", () => {
      HomePage.visit();
      HomePage.goToCart();

      cy.url().should("include", "/view_cart");
    });
  });

  // cart contents

  describe("Cart contents", () => {
    it("TC079 - shows the product name after adding a product", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.productNames.should("contain.text", products.blueTop.name);
    });

    it("TC080 - shows the correct price for the product", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.rowFor(products.blueTop.name)
        .find(".cart_price p")
        .should("contain.text", products.blueTop.price);
    });

    it("TC081 - shows quantity 1 by default", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.quantities.first().should("have.text", "1");
    });

    it("TC082 - shows the quantity chosen on the product details page", () => {
      ProductsPage.addFromDetails(products.blueTop.id, 3);
      CartPage.visit();

      CartPage.quantities.first().should("have.text", "3");
    });

    it("TC083 - shows the total as price multiplied by quantity", () => {
      const quantity = 3;
      ProductsPage.addFromDetails(products.blueTop.id, quantity);
      CartPage.visit();

      // 500 x 3 = 1500
      const expectedTotal = `Rs. ${products.blueTop.priceValue * quantity}`;
      CartPage.rowFor(products.blueTop.name)
        .find(".cart_total_price")
        .should("contain.text", expectedTotal);
    });

    it("TC084 - lists two different products as two rows", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      ProductsPage.addFromDetails(products.menTshirt.id);
      CartPage.visit();

      CartPage.cartRows.should("have.length", 2);
      CartPage.productNames.should("contain.text", products.blueTop.name);
      CartPage.productNames.should("contain.text", products.menTshirt.name);
    });

    it("TC085 - increases the quantity when the same product is added twice", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.cartRows.should("have.length", 1);
      CartPage.quantities.first().should("have.text", "2");
    });
  });

  // removing products from the cart
  describe("Removing products", () => {
    it("TC086 - shows the empty cart message after removing the only product", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.removeProductByName(products.blueTop.name);

      CartPage.emptyCartMessage.should("be.visible");
    });

    it("TC087 - keeps the other product when one of two is removed", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      ProductsPage.addFromDetails(products.menTshirt.id);
      CartPage.visit();

      CartPage.removeProductByName(products.blueTop.name);

      CartPage.cartRows.should("have.length", 1);
      CartPage.productNames.should("contain.text", products.menTshirt.name);
    });
  });

  // other cart behaviors

  describe("Cart behaviour", () => {
    it("TC088 - keeps the product in the cart after the page is reloaded", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();
      cy.reload();

      CartPage.cartRows.should("have.length", 1);
      CartPage.productNames.should("contain.text", products.blueTop.name);
    });

    it("TC089 - shows the Proceed To Checkout button when the cart has a product", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();

      CartPage.checkoutButton.should("be.visible");
    });
  });
});