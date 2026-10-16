import ProductsPage from "../../../pages/ProductsPage";
import CartPage from "../../../pages/CartPage";

describe("Cart - Negative scenarios", () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // empty cart and removed items

  describe("Empty and removed items", () => {
    it("TC090 - shows no product rows when nothing has been added", () => {

      CartPage.visit();
      CartPage.cartRows.should("not.exist");
    });

    it("TC091 - does not show a removed product after the page is reloaded", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();
      CartPage.removeProductByName(products.blueTop.name);

      // reloading page to verify products are still displayed
      cy.reload();

      cy.contains(".cart_description", products.blueTop.name).should("not.exist");
      CartPage.emptyCartMessage.should("be.visible");
    });

    it("TC092 - loses the cart when the browser cookies are cleared", () => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();
      CartPage.cartRows.should("have.length", 1);

      // clearing cookies 
      cy.clearCookies();
      cy.reload();

      CartPage.cartRows.should("not.exist");
    });
  });

  // check as a guest / checkout withouth loggin

  describe("Proceed to checkout without logging in", () => {
    beforeEach(() => {
      ProductsPage.addFromDetails(products.blueTop.id);
      CartPage.visit();
      CartPage.proceedToCheckout();
    });

    it("TC093 - asks a guest user to register or log in", () => {
      cy.contains("to proceed on checkout").should("be.visible");
    });

    it("TC094 - does not open the checkout page for a guest user", () => {
      cy.contains("to proceed on checkout").should("be.visible");

      cy.url().should("include", "/view_cart");
    });

    it("TC095 - sends the guest to the login page from the popup link", () => {

      cy.contains("a", "Register / Login").click();

      cy.url().should("include", "/login");
    });

    it("TC142 - keeps the product in the cart when the popup is closed with Continue On Cart", () => {
      // closing the popup without logging in
      cy.contains("Continue On Cart").click();

      cy.url().should("include", "/view_cart");
      CartPage.cartRows.should("have.length", 1);
      cy.contains(".cart_description", products.blueTop.name).should("exist");
    });
  });

  // invalid quantities in cart products
  
  describe("Invalid quantities", () => {
    it("TC143 - does not keep the quantity 0 in the cart", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: "0" },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = quantityButtons.first().text().trim();
          cy.log(`Quantity shown in the cart: ${quantity}`);
          expect(quantity).to.match(/^[1-9]\d*$/);
        }
      });
    });

    it("TC144 - does not keep a negative quantity in the cart", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: "-1" },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = quantityButtons.first().text().trim();
          cy.log(`Quantity shown in the cart: ${quantity}`);
          expect(quantity).to.match(/^[1-9]\d*$/);
        }
      });
    });

    it("TC145 - does not keep a decimal quantity in the cart", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: "1.5" },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = quantityButtons.first().text().trim();
          cy.log(`Quantity shown in the cart: ${quantity}`);
          expect(quantity).to.match(/^[1-9]\d*$/);
        }
      });
    });

    it("TC146 - does not keep a quantity made of letters in the cart", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: "abc" },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = quantityButtons.first().text().trim();
          cy.log(`Quantity shown in the cart: ${quantity}`);
          expect(quantity).to.match(/^[1-9]\d*$/);
        }
      });
    });

    it("TC147 - does not keep an empty quantity in the cart", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: "" },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = quantityButtons.first().text().trim();
          cy.log(`Quantity shown in the cart: ${quantity}`);
          expect(quantity).to.match(/^[1-9]\d*$/);
        }
      });
    });
  });

  // very large quantity

  describe("Very large quantity", () => {
    it("TC148 - keeps the line total equal to price x quantity for a very large quantity", () => {
      cy.request({
        url: `/add_to_cart/${products.blueTop.id}`,
        qs: { quantity: 99999 },
        failOnStatusCode: false,
      });
      CartPage.visit();

      cy.get("body").then(($body) => {
        const quantityButtons = $body.find(".cart_quantity button");

        if (quantityButtons.length === 0) {
          cy.log("The product was not added to the cart");
        } else {
          const quantity = Number(quantityButtons.first().text().trim());
          const shownTotal = Number($body.find(".cart_total_price").first().text().replace(/\D/g, ""));
          const expectedTotal = products.blueTop.priceValue * quantity;

          cy.log(`${quantity} x ${products.blueTop.priceValue} should be ${expectedTotal}, the cart shows ${shownTotal}`);
          expect(shownTotal).to.equal(expectedTotal);
        }
      });
    });
  });

  // checkout with an empty cart

  describe("Checkout with an empty cart", () => {
    it("TC149 - does not offer Proceed To Checkout when the cart is empty", () => {
      CartPage.visit();

      cy.get("body").should(($body) => {
        const visibleButtons = $body.find("a:contains('Proceed To Checkout')").filter(":visible");
        expect(visibleButtons.length).to.equal(0);
      });
    });
  });

  // guest opens protected pages directly

  describe("Guest opens protected pages directly", () => {
    it("TC150 - does not show the checkout review page to a guest who opens /checkout directly", () => {
      ProductsPage.addFromDetails(products.blueTop.id);

      // failOnStatusCode:false = do not fail the test if the site answers with an error page
      cy.visit("/checkout", { failOnStatusCode: false });

      cy.get("body").should(($body) => {
        expect($body.text()).to.not.include("Review Your Order");
      });
    });

    it("TC151 - does not show the payment page to a guest who opens /payment directly", () => {
      ProductsPage.addFromDetails(products.blueTop.id);

      cy.visit("/payment", { failOnStatusCode: false });

      cy.get("body").should(($body) => {
        expect($body.text()).to.not.include("Pay and Confirm Order");
      });
    });
  });
});