describe("API - Products list - Positive scenarios", () => {
  let apiData;
  let result;

  before(() => {
    cy.fixture("apiData").then((data) => {
      apiData = data;
    });
  });

  beforeEach(() => {
    cy.apiCall({ method: "GET", endpoint: "productsList" }).then((response) => {
      result = response;
    });
  });

  it("TC164 - answers with HTTP 200 and responseCode 200", () => {
    cy.step("Check the HTTP status and the responseCode");
    expect(result.httpStatus, "HTTP status").to.equal(200);
    expect(result.code, "responseCode").to.equal(200);
  });

  it("TC165 - returns a products list that is not empty", () => {
    const products = result.body.products;

    cy.step("The body should contain a list called products");
    expect(products, "products").to.be.an("array");

    cy.log(`Total products returned: ${products.length}`);
    expect(products.length, "number of products").to.be.greaterThan(0);
  });

  it("TC166 - gives every product all the required fields", () => {
    const products = result.body.products;
    const problems = [];

    // collect every problem first, then report them all together
    products.forEach((product) => {
      apiData.requiredProductFields.forEach((field) => {
        const value = product[field];
        const isMissing = value === undefined || value === null || value === "";
        if (isMissing) {
          problems.push(`product ${product.id} has no "${field}"`);
        }
      });
    });

    cy.log(
      `Checked ${products.length} products x ${apiData.requiredProductFields.length} fields. Problems: ${problems.length}`
    );
    expect(problems, "products with missing fields").to.be.empty;
  });

  it("TC167 - gives every product a different id", () => {
    const ids = result.body.products.map((product) => product.id);

    // finds duplicate values in an array and stores them in a new array
    const duplicates = ids.filter((id, position) => ids.indexOf(id) !== position);

    cy.log(`Checked ${ids.length} ids. Duplicates: ${duplicates.length}`);
    expect(duplicates, "duplicate product ids").to.be.empty;
  });

  it('TC168 - writes every price in the format "Rs. number "', () => {
    const priceFormat = /^Rs\. \d+$/;
    const problems = [];

    result.body.products.forEach((product) => {

      if (!priceFormat.test(product.price)) {
        problems.push(`product ${product.id} has price "${product.price}"`);
      }
    });

    cy.log(`Prices with a wrong format: ${problems.length}`);
    expect(problems, "prices with a wrong format").to.be.empty;
  });

  it("TC169 - lists the known product 'Blue Top' with the right details", () => {
    const expected = apiData.blueTop;
    const found = result.body.products.find(
      (product) => product.name === expected.name
    );

    cy.log(
      found
        ? `Found "${expected.name}" with id ${found.id}`
        : `"${expected.name}" was NOT found in the list`
    );

    expect(found, `product "${expected.name}"`).to.exist;
    expect(found.id, "id").to.equal(expected.id);
    expect(found.price, "price").to.equal(expected.price);
    expect(found.brand, "brand").to.equal(expected.brand);
  });

  it("TC170 - gives 'Blue Top' the category Women > Tops", () => {
    const expected = apiData.blueTop;
    const found = result.body.products.find(
      (product) => product.name === expected.name
    );
    expect(found, `product "${expected.name}"`).to.exist;

    const usertype = found.category?.usertype?.usertype;
    const category = found.category?.category;

    cy.log(`Category found: ${usertype} > ${category}`);
    expect(usertype, "usertype").to.equal(expected.usertype);
    expect(category, "category").to.equal(expected.category);
  });

  it("TC171 - responds within the allowed time", () => {
    cy.log(`Response time: ${result.duration} ms (limit ${apiData.maxResponseMs} ms)`);
    expect(result.duration, "response time in ms").to.be.lessThan(apiData.maxResponseMs);
  });
});