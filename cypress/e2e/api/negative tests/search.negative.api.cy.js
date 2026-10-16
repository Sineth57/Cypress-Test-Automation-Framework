// Helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const specialInputs = [
  "<script>alert(1)</script>", // script 
  "' OR 1=1 --",               // SQL injection 
];

describe("API - Search product - Negative scenarios", () => {
  
  const expectNoResults = (term) => {
    cy.step(`Search for "${term.length > 40 ? term.slice(0, 40) + "..." : term}"`);

    cy.apiCall({
      method: "POST",
      endpoint: "searchProduct",
      body: { search_product: term },
    }).then((result) => {
      const products = result.body.products || [];

      cy.log(`Products returned: ${products.length}`);
      expect(result.code, "responseCode").to.equal(200);
      expect(products.length, "number of products").to.equal(0);
    });
  };

  
  describe("Missing or wrong parameter", () => {
    it("TC195 - rejects a search without the search_product parameter", () => {
      cy.apiCall({ method: "POST", endpoint: "searchProduct" }).then((result) => {
        cy.step("Check the code and the message");
        expect(result.code, "responseCode").to.equal(400);
        expect(result.message, "message").to.equal(
          "Bad request, search_product parameter is missing in POST request."
        );
      });
    });

    it("TC196 - rejects a search that uses a wrong parameter name", () => {
      cy.apiCall({
        method: "POST",
        endpoint: "searchProduct",
        body: { search: "top" }, // the correct name is search_product
      }).then((result) => {
        cy.log(`Message received: ${result.message}`);
        expect(result.code, "responseCode").to.equal(400);
      });
    });
  });


  describe("Searches that find nothing", () => {
    it("TC197 - returns an empty list for a word that matches nothing", () => {
      expectNoResults("xyzabc123");
    });

    // loop tests per special input
    specialInputs.forEach((input, index) => {
      it(`${tcId(198 + index)} - treats "${input}" as plain text and finds nothing`, () => {
        expectNoResults(input);
      });
    });

    it("TC201 - handles a very long search text without breaking", () => {
      expectNoResults("a".repeat(300));
    });
  });
});