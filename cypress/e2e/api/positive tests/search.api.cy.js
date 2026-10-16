// Helper for loop tests
const tcId = (number) => `TC${String(number).padStart(3, "0")}`;

const categoryTerms = ["tshirt", "dress", "jeans", "saree"];

describe("API - Search product - Positive scenarios", () => {
  let apiData;

  before(() => {
    cy.fixture("apiData").then((data) => {
      apiData = data;
    });
  });

  const searchFor = (term) => {
    cy.step(`Search for "${term}"`);
    return cy.apiCall({
      method: "POST",
      endpoint: "searchProduct",
      body: { search_product: term },
    });
  };

 
  describe("Basic search", () => {
    it("TC184 - answers a search with HTTP 200 and responseCode 200", () => {
      searchFor("top").then((result) => {
        expect(result.httpStatus, "HTTP status").to.equal(200);
        expect(result.code, "responseCode").to.equal(200);
      });
    });

    it("TC185 - returns a products list that is not empty for the word 'top'", () => {
      searchFor("top").then((result) => {
        const products = result.body.products;

        expect(products, "products").to.be.an("array");
        cy.log(`Products found for "top": ${products.length}`);
        expect(products.length, "number of products").to.be.greaterThan(0);
      });
    });

    it("TC186 - includes 'Blue Top' when searching for the word 'top'", () => {
      searchFor("top").then((result) => {
        const names = result.body.products.map((product) => product.name);
        cy.log(`Names found: ${names.join(", ")}`);

        expect(names, "product names").to.include(apiData.blueTop.name);
      });
    });

    it("TC187 - gives every found product all the required fields", () => {
      searchFor("top").then((result) => {
        const products = result.body.products;
        const problems = [];

        products.forEach((product) => {
          apiData.requiredProductFields.forEach((field) => {
            const value = product[field];
            // getting only the values that are really missing
            if (value === undefined || value === null || value === "") {
              problems.push(`product ${product.id} has no "${field}"`);
            }
          });
        });

        cy.log(`Checked ${products.length} products. Problems: ${problems.length}`);
        expect(problems, "products with missing fields").to.be.empty;
      });
    });

    it("TC188 - finds 'Blue Top' when the search is typed in lowercase", () => {
      searchFor("blue top").then((result) => {
        const names = result.body.products.map((product) => product.name);
        cy.log(`Names found: ${names.join(", ")}`);

        expect(names, "product names").to.include(apiData.blueTop.name);
      });
    });

    it("TC189 - returns 'Blue Top' with the right details for an exact search", () => {
      const expected = apiData.blueTop;

      searchFor(expected.name).then((result) => {
        const found = result.body.products.find(
          (product) => product.name === expected.name
        );

        cy.log(
          found
            ? `Found "${expected.name}" with id ${found.id}`
            : `"${expected.name}" was NOT found`
        );

        expect(found, `product "${expected.name}"`).to.exist;
        expect(found.id, "id").to.equal(expected.id);
        expect(found.price, "price").to.equal(expected.price);
        expect(found.brand, "brand").to.equal(expected.brand);
      });
    });
  });

  // searching by category names

  describe("Search by category word", () => {
    categoryTerms.forEach((term, index) => {
      it(`${tcId(190 + index)} - finds products when searching for "${term}"`, () => {
        searchFor(term).then((result) => {
          const products = result.body.products || [];

          // loging a few names only when there are results
          if (products.length > 0) {
            const sample = products.slice(0, 3).map((product) => product.name);
            cy.log(`Found ${products.length} products, for example: ${sample.join(", ")}`);
          } else {
            cy.log(`No products found for "${term}"`);
          }

          expect(result.code, "responseCode").to.equal(200);
          expect(products.length, "number of products").to.be.greaterThan(0);
        });
      });
    });
  });

  // response time test
  describe("Speed", () => {
    it("TC194 - answers a search within the allowed time", () => {
      searchFor("top").then((result) => {
        cy.log(`Response time: ${result.duration} ms (limit ${apiData.maxResponseMs} ms)`);
        expect(result.duration, "response time in ms").to.be.lessThan(apiData.maxResponseMs);
      });
    });
  });
});