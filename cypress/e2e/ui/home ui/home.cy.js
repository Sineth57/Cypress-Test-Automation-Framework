import HomePage from "../../../pages/HomePage";
import ProductsPage from "../../../pages/ProductsPage";
import CartPage from "../../../pages/CartPage";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// links in the header menu for a guest
const headerLinks = [
  { text: "Home", href: "/" },
  { text: "Products", href: "/products" },
  { text: "Cart", href: "/view_cart" },
  { text: "Signup / Login", href: "/login" },
  { text: "Test Cases", href: "/test_cases" },
  { text: "API Testing", href: "/api_list" },
  { text: "Contact us", href: "/contact_us" },
];

describe("Home page - Positive scenarios", () => {

  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });


  describe("Page load and header menu", () => {
    beforeEach(() => {
      HomePage.visit();
    });

    it("TC243 - opens the home page with the right address and title", () => {
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      cy.title().should("include", "Automation Exercise");
    });

    it("TC244 - shows the slider", () => {
      HomePage.slider.should("be.visible");
    });

    // loop test per row of headerLinks
    headerLinks.forEach((link, index) => {
      it(`${tcId(245 + index)} - shows the "${link.text}" link in the header menu`, () => {
        HomePage.menu
          .find(`a[href="${link.href}"]`)
          .should("be.visible")
          .and("contain.text", link.text);
      });
    });

    it("TC252 - points the Video Tutorials link to YouTube", () => {
      HomePage.menu
        .contains("a", "Video Tutorials")
        .should("have.attr", "href")
        .and("include", "youtube.com");
    });
  });

  // page navigation from home
  describe("Navigation from the home page", () => {
    beforeEach(() => {
      HomePage.visit();
    });

    // loop for every header link except Home
    headerLinks.slice(1).forEach((link, index) => {
      it(`${tcId(253 + index)} - opens the right page from the "${link.text}" link`, () => {
        cy.log(`Click ${link.text} and expect the address ${link.href}`);
        HomePage.menu.find(`a[href="${link.href}"]`).click();

        cy.url().should("include", link.href);
      });
    });

    it("TC259 - returns to the home page when the logo is clicked on another page", () => {
      ProductsPage.visit();

      HomePage.logo.click();

      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
      HomePage.slider.should("be.visible");
    });
  });


  describe("Slider", () => {
    beforeEach(() => {
      HomePage.visit();
    });

    it("TC260 - shows the slider heading text", () => {
      HomePage.slider.should(
        "contain.text",
        "Full-Fledged practice website for Automation Engineers"
      );
    });

    it("TC261 - opens the Test Cases page from the slider button", () => {
      HomePage.sliderActiveItem.find('a[href="/test_cases"]').click();

      cy.url().should("include", "/test_cases");
    });

    it("TC262 - opens the API list page from the slider button", () => {
      HomePage.sliderActiveItem.find('a[href="/api_list"]').click();

      cy.url().should("include", "/api_list");
    });

    it("TC263 - changes the slide when the next arrow is clicked", () => {
      HomePage.sliderActiveItem.invoke("index").then((before) => {
        cy.log(`Active slide before the click: ${before}`);

        HomePage.sliderNextArrow.click();

        HomePage.sliderActiveItem.invoke("index").should("not.eq", before);
      });
    });
  });


  describe("Page content", () => {
    beforeEach(() => {
      HomePage.visit();
    });

    it("TC264 - shows the Category and Brands sections", () => {
      HomePage.categorySection.should("be.visible");
      HomePage.brandsSection.should("exist");
      cy.contains(".left-sidebar", "Brands").should("exist");
    });

    it("TC265 - shows the Features Items section with products", () => {
      cy.contains(".features_items .title", "Features Items", { matchCase: false }).should("be.visible");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC266 - shows a name and a price on the first product card", () => {
      ProductsPage.productCards.first().within(() => {
        cy.get(".productinfo h2").should("contain.text", "Rs.");
        cy.get(".productinfo p").should("not.be.empty");
      });
    });

    it("TC267 - filters products by category Women > Dress from the home page", () => {
      ProductsPage.filterByCategory("Women", "Dress");

      ProductsPage.pageTitle.should("contain.text", "Women - Dress");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC268 - filters products by brand Polo from the home page", () => {
      ProductsPage.filterByBrand("Polo");

      ProductsPage.pageTitle.should("contain.text", "Polo");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });

    it("TC269 - opens the product details page from View Product", () => {
      ProductsPage.viewProduct(0);

      cy.url().should("include", "/product_details/");
    });

    it("TC270 - shows a confirmation popup after adding a product from the home page", () => {
      ProductsPage.addToCart(0);

      ProductsPage.cartModal.should("be.visible");
      ProductsPage.cartModal.should("contain.text", "Added!");
    });

    it("TC271 - shows the added product in the cart", () => {
      ProductsPage.addToCart(0);
      ProductsPage.viewCartFromModal();

      cy.url().should("include", "/view_cart");
      CartPage.cartRows.should("have.length", 1);
    });

    it("TC272 - shows the recommended items section", () => {
      HomePage.recommendedItems.scrollIntoView().should("be.visible");
      cy.contains("recommended items", { matchCase: false }).should("exist");
    });

    it("TC273 - subscribes with a valid email", () => {
      HomePage.subscribe("subscriber@example.com");

      HomePage.subscribeSuccess.should("be.visible");
      HomePage.subscribeSuccess.should("contain.text", "You have been successfully subscribed!");
    });

    it("TC274 - goes back to the top with the scroll-up arrow", () => {
      cy.scrollTo("bottom");

      HomePage.scrollUpArrow.should("be.visible").click();

      cy.window().its("scrollY").should("eq", 0);
    });
  });


  describe("Home page for a loggedin user", () => {
    before(() => {
      cy.deleteUserViaApi();
      cy.createUserViaApi();
    });

    after(() => {
      cy.deleteUserViaApi();
    });

    beforeEach(() => {
      cy.loginAsTestUser(); // lands on the home page
    });

    it("TC275 - shows the user's name in the header", () => {
      HomePage.loggedInText.should("contain.text", users.newUser.name);
    });

    it("TC276 - shows the Logout and Delete Account links", () => {
      HomePage.menu.find('a[href="/logout"]').should("be.visible");
      HomePage.menu.find('a[href="/delete_account"]').should("be.visible");
    });

    it("TC277 - hides the Signup / Login link", () => {
      HomePage.menu.find('a[href="/login"]').should("not.exist");
    });

    it("TC278 - logs out from the home page", () => {
      HomePage.logout();

      cy.url().should("include", "/login");
      cy.contains("Login to your account").should("be.visible");
    });

    it("TC279 - shows the slider and products to a loggedin user", () => {
      HomePage.slider.should("be.visible");
      ProductsPage.productCards.should("have.length.greaterThan", 0);
    });
  });
});