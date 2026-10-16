describe("API - Brands list - Negative scenarios", () => {
  
  it("TC181 - rejects a PUT request with responseCode 405", () => {
    cy.apiCall({ method: "PUT", endpoint: "brandsList" }).then((result) => {
      cy.step("Check the code and the message");
      expect(result.code, "responseCode").to.equal(405);
      expect(result.message, "message").to.equal(
        "This request method is not supported."
      );
    });
  });

  it("TC182 - does not return any brands to a PUT request", () => {
    cy.apiCall({ method: "PUT", endpoint: "brandsList" }).then((result) => {
      cy.step("The body should not contain a brands list");
      expect(result.body, "response body").to.not.have.property("brands");
    });
  });

  it("TC183 - ignores an unknown query parameter and still returns the list", () => {
    cy.apiCall({
      method: "GET",
      endpoint: "brandsList",
      qs: { unknown_parameter: "abc" },
    }).then((result) => {
      expect(result.code, "responseCode").to.equal(200);
      expect(result.body.brands.length, "number of brands").to.be.greaterThan(0);
    });
  });
});