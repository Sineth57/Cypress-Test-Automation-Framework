describe("API - Brands list - Positive scenarios", () => {
  let apiData;
  let result;

  before(() => {
    cy.fixture("apiData").then((data) => {
      apiData = data;
    });
  });

  beforeEach(() => {
    cy.apiCall({ method: "GET", endpoint: "brandsList" }).then((response) => {
      result = response;
    });
  });

  it("TC175 - answers with HTTP 200 and responseCode 200", () => {
    expect(result.httpStatus, "HTTP status").to.equal(200);
    expect(result.code, "responseCode").to.equal(200);
  });

  it("TC176 - returns a brands list that is not empty", () => {
    const brands = result.body.brands;

    expect(brands, "brands").to.be.an("array");
    cy.log(`Total brands returned: ${brands.length}`);
    expect(brands.length, "number of brands").to.be.greaterThan(0);
  });

  it("TC177 - gives every brand an id and a name", () => {
    const brands = result.body.brands;
    const problems = [];

    brands.forEach((brand, position) => {

      if (brand.id === undefined || brand.id === null) {
        problems.push(`brand number ${position + 1} has no id`);
      }
      if (!brand.brand || String(brand.brand).trim() === "") {
        problems.push(`brand number ${position + 1} has no name`);
      }
    });

    cy.log(`Checked ${brands.length} brands. Problems: ${problems.length}`);
    expect(problems, "brands with missing values").to.be.empty;
  });

  it("TC178 - gives every brand a different id", () => {
    const ids = result.body.brands.map((brand) => brand.id);
    const duplicates = ids.filter((id, position) => ids.indexOf(id) !== position);

    cy.log(`Checked ${ids.length} ids. Duplicates: ${duplicates.length}`);
    expect(duplicates, "duplicate brand ids").to.be.empty;
  });

  it("TC179 - includes the known brands", () => {
    const names = result.body.brands.map((brand) => brand.brand);
    const missing = [];

    apiData.knownBrands.forEach((knownBrand) => {
      const isListed = names.includes(knownBrand);
      cy.log(`Brand "${knownBrand}": ${isListed ? "found" : "NOT found"}`);

      if (!isListed) {
        missing.push(knownBrand);
      }
    });

    expect(missing, "known brands that are missing").to.be.empty;
  });

  it("TC180 - responds within the allowed time", () => {
    cy.log(`Response time: ${result.duration} ms (limit ${apiData.maxResponseMs} ms)`);
    expect(result.duration, "response time in ms").to.be.lessThan(apiData.maxResponseMs);
  });
});