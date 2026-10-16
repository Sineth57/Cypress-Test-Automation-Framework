import HomePage from "../../../pages/HomePage";
import ProductsPage from "../../../pages/ProductsPage";
import CartPage from "../../../pages/CartPage";
import CheckoutPage from "../../../pages/CheckoutPage";

const TOTAL_STAGES = 6; // stages passing by the smoke test --> login > home > products > cart > checkout > order

const purchaseScenarios = [
  {
    tc: "TC241",
    title: "buys one product from login to order confirmation",
    items: [{ productKey: "blueTop", quantity: 1 }],
  },
  {
    tc: "TC242",
    title: "buys two different products, one of them with quantity 2",
    items: [
      { productKey: "blueTop", quantity: 2 },
      { productKey: "menTshirt", quantity: 1 },
    ],
  },
];

// logging stage line in console
const stage = (number, title) => {
  cy.step(`STAGE ${number} of ${TOTAL_STAGES}: ${title}`);
};

// formatting the price amount
const rs = (amount) => `Rs. ${amount}`;

describe("Smoke - Purchase flow", () => {

  let users;
  let products;
  let payment;

  before(() => {
    cy.fixture("users").then((data) => { users = data; });
    cy.fixture("products").then((data) => { products = data; });
    cy.fixture("paymentData").then((data) => { payment = data; });
  });


  beforeEach(() => {
    cy.resetTestUser();
  });

  after(() => {
    cy.step("Delete the test account");
    cy.deleteUserViaApi();
  });


  // one test per row of purchase scenarios

  purchaseScenarios.forEach((scenario) => {

    it(`${scenario.tc} - ${scenario.title}`, () => {

      // build the shopping list from products      
      const items = scenario.items.map((entry) => ({
        ...products[entry.productKey],
        quantity: entry.quantity,
      }));
      const grandTotal = items.reduce(
        (sum, item) => sum + item.priceValue * item.quantity,
        0
      );
      const unitCount = items.reduce((sum, item) => sum + item.quantity, 0);

      cy.log(

        `Plan: buy ${unitCount} item(s) in ${items.length} product(s). Expected total: ${rs(grandTotal)}`
      );

      // stage 1 -> login

      stage(1, "Log in");
      cy.loginAsTestUser(); // waits until "Logged in as" is shown

      // stage 2 -> home

      stage(2, "Check the home page");
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      HomePage.slider.should("be.visible");
      HomePage.loggedInText.should("contain.text", users.newUser.name);

      // stage 3 -> products

      stage(3, "Products: choose the products and add them to the cart");
      HomePage.goToProducts();
      cy.url().should("include", "/products");
      ProductsPage.pageTitle.should("contain.text", "All Products");

      items.forEach((item, position) => {

        const isLast = position === items.length - 1;

        cy.step(

          `Product ${position + 1} of ${items.length}: "${item.name}" x ${item.quantity}`
        );

        cy.step("Open the product details with View Product");

        ProductsPage.productCards
          .filter(`:contains("${item.name}")`)
          .first()
          .find(".choose a")
          .click();

        cy.url().should("include", "/product_details/");
        ProductsPage.detailName.should("contain.text", item.name);

        if (item.quantity > 1) {

          cy.step(`Set the quantity to ${item.quantity}`);
          ProductsPage.quantityInput.clear().type(String(item.quantity));

        } else {

          cy.step("Keep the default quantity of 1");
        }

        cy.step("Click Add to cart");
        ProductsPage.detailAddToCartButton.click();
        ProductsPage.cartModal.should("be.visible");


        if (isLast) {

          cy.step("Last product added: open the cart from the popup");
          ProductsPage.viewCartFromModal();

        } else {

          cy.step("More products to add: Continue Shopping and go back to the list");
          ProductsPage.continueShopping();
          HomePage.goToProducts();
          cy.url().should("include", "/products");
          ProductsPage.pageTitle.should("contain.text", "All Products");

        }
      });

      // stage 4 -> cart

      stage(4, "Cart: check the products, quantities and totals");
      cy.url().should("include", "/view_cart");
      CartPage.cartRows.should("have.length", items.length);

      items.forEach((item) => {
        const lineTotal = item.priceValue * item.quantity;

        cy.step(
          `Cart row "${item.name}": price ${item.price}, quantity ${item.quantity}, total ${rs(lineTotal)}`
        );
        CartPage.rowFor(item.name).within(() => {
          cy.get(".cart_price p").should("contain.text", item.price);
          cy.get(".cart_quantity button").should("have.text", String(item.quantity));
          cy.get(".cart_total_price").should("contain.text", rs(lineTotal));
        });
      });

      // stage 5 -> checkout

      stage(5, "Checkout: check the address and the order review");
      CartPage.proceedToCheckout();
      cy.url().should("include", "/checkout");
      cy.contains("Address Details").should("be.visible");
      cy.contains("Review Your Order").should("be.visible");

      cy.step("The delivery address should belong to the logged-in user");
      CheckoutPage.deliveryAddress.should("contain.text", users.newUser.firstname);
      CheckoutPage.deliveryAddress.should("contain.text", users.newUser.address1);

      cy.step(`The review should list ${items.length} product(s)`);
      CheckoutPage.productNames.should("have.length", items.length);
      items.forEach((item) => {
        CheckoutPage.productNames.should("contain.text", item.name);
      });

      cy.step(`The total amount should be ${rs(grandTotal)}`);
      CheckoutPage.totalRow
        .find(".cart_total_price")
        .should("contain.text", rs(grandTotal));

      // stage 6 - order
      
      stage(6, "Order: pay and confirm");
      cy.step("Click Place Order");
      CheckoutPage.placeOrder();

      cy.step("Fill in the card details");
      CheckoutPage.fillPayment(payment.validCard);

      cy.step("Click Pay and Confirm Order");
      CheckoutPage.payAndConfirm();

      cy.step("The order confirmation should appear");
      cy.url().should("include", "/payment_done");
      cy.contains("Order Placed!", { matchCase: false }).should("be.visible");
      cy.contains("Congratulations! Your order has been confirmed!").should("be.visible");

      cy.log(
        `Smoke flow complete: ${unitCount} item(s), total ${rs(grandTotal)}, order confirmed`
      );
    });
  });
});