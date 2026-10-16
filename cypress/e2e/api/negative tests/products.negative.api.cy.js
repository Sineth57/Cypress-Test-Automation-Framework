describe("API - Products list - Negative scenarios", () => {
  
  it("TC172 - rejects a POST request with responseCode 405", () => {
    cy.apiCall({ method: "POST", endpoint: "productsList" }).then((result) => {
      cy.step("Check the code and the message");
      expect(result.code, "responseCode").to.equal(405);
      expect(result.message, "message").to.equal(
        "This request method is not supported."
      );
    });
  });

  it("TC173 - does not return any products to a POST request", () => {
    cy.apiCall({ method: "POST", endpoint: "productsList" }).then((result) => {
      cy.step("The body should not contain a products list");
      expect(result.body, "response body").to.not.have.property("products");
    });
  });

  it("TC174 - ignores an unknown query parameter and still returns the list", () => {
    cy.apiCall({
      method: "GET",
      endpoint: "productsList",
      qs: { unknown_parameter: "abc" },
    }).then((result) => {
      expect(result.code, "responseCode").to.equal(200);
      expect(result.body.products.length, "number of products").to.be.greaterThan(0);
    });
  });
});