import ProductsPage from "../../../pages/ProductsPage";

// helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

// Special characters 
const specialSearches = [
  "<script>alert(1)</script>", // script injection 
  "' OR 1=1 --",               // sql injection ---> https://www.w3schools.com/sql/sql_injection.asp
  "!!!@@@###",                 
];

// invalid email ids
const invalidEmails = [
  "plainaddress",
  "@no-local-part.com",
  "user@",
  "two@@at.com",
  "spaces in@mail.com",
];

describe("Products - Negative scenarios", () => {

  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // search

  describe("Search", () => {
    beforeEach(() => {
      ProductsPage.visit();
    });

    it("TC062 - shows no products for a search with no match", () => {
      ProductsPage.searchFor(products.searchTerms.noResults);

      ProductsPage.pageTitle.should("contain.text", "Searched Products");
      ProductsPage.productCards.should("not.exist");
    });

    
    specialSearches.forEach((term, index) => {
      it(`${tcId(63 + index)} - treats "${term}" as plain text and shows no products`, () => {
        // if the page ever runs the text as code, this "alert" would come
        const alertStub = cy.stub().as("alertStub");
        cy.on("window:alert", alertStub);

        ProductsPage.searchFor(term);

        ProductsPage.pageTitle.should("contain.text", "Searched Products");
        ProductsPage.productCards.should("not.exist");
        cy.get("@alertStub").should("not.have.been.called");
      });
    });

    it("TC066 - handles a very long search text without breaking", () => {
      ProductsPage.searchFor("a".repeat(300));

      ProductsPage.pageTitle.should("contain.text", "Searched Products");
      ProductsPage.productCards.should("not.exist");
    });
  });

  // product details

  describe("Product details", () => {
    
    it("TC067 - does not show a product for an id that does not exist", () => {

      cy.visit("/product_details/99999", { failOnStatusCode: false });

      cy.contains(products.blueTop.name).should("not.exist");
    });
  });

  // review form

  describe("Review form", () => {
    
    beforeEach(() => {
      ProductsPage.visitProductDetails(products.blueTop.id);
    });

    it("TC068 - does not submit the review when all fields are empty", () => {

      ProductsPage.reviewButton.click();

      ProductsPage.reviewName.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      ProductsPage.reviewSuccessMessage.should("not.be.visible");
    });

    it("TC069 - does not submit the review when the name is empty", () => {

      ProductsPage.fillReview("", "reviewer@example.com", "Nice product.");
      ProductsPage.reviewButton.click();

      ProductsPage.reviewName.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      ProductsPage.reviewSuccessMessage.should("not.be.visible");
    });

    it("TC070 - does not submit the review when the email is empty", () => {

      ProductsPage.fillReview("Test Reviewer", "", "Nice product.");
      ProductsPage.reviewButton.click();

      ProductsPage.reviewEmail.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      ProductsPage.reviewSuccessMessage.should("not.be.visible");
    });

    it("TC071 - does not submit the review when the review text is empty", () => {

      ProductsPage.fillReview("Test Reviewer", "reviewer@example.com", "");
      ProductsPage.reviewButton.click();

      ProductsPage.reviewText.should(($input) => {
        expect($input[0].validity.valueMissing).to.be.true;
      });
      ProductsPage.reviewSuccessMessage.should("not.be.visible");
    });

    // invalid email loop

    invalidEmails.forEach((badEmail, index) => {
      it(`${tcId(72 + index)} - does not accept the invalid email "${badEmail}" in a review`, () => {

        // filling everything except the email
        ProductsPage.fillReview("Test Reviewer", "", "Nice product.");

        // then put the whole email 
        ProductsPage.reviewEmail.invoke("val", badEmail);
        ProductsPage.reviewButton.click();

        ProductsPage.reviewEmail.should(($input) => {
          expect($input[0].validity.typeMismatch).to.be.true;
        });
        ProductsPage.reviewSuccessMessage.should("not.be.visible");
      });
    });
  });
});