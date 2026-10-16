# Automation Exercise - Cypress Test Automation Framework

End-to-end test automation for [automationexercise.com](https://automationexercise.com), built with **Cypress**.
It covers the website's user interface and its public REST API, and produces an HTML report that is also sent by email after each run.

> FIDENZ QA trainee - Assignment 5: Cypress Test Automation
> Author: Sineth Shashintha

---

## Table of contents

1. [What is tested](#1-what-is-tested)
2. [Tech stack](#2-tech-stack)
3. [Project structure](#3-project-structure)
4. [Getting started](#4-getting-started)
5. [Running the tests](#5-running-the-tests)
6. [Reports and the email report](#6-reports-and-the-email-report)
7. [Framework design](#7-framework-design)
8. [Test case numbering and conventions](#8-test-case-numbering-and-conventions)
9. [How the assignment requirements are met](#9-how-the-assignment-requirements-are-met)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What is tested

About **220 automated tests**, split into positive, negative, and smoke tests. The counts follow the test case numbers (TC001 and up) and can be checked against the HTML report.

### UI tests (143)

| Area                                                                     | Positive | Negative | Test cases    |
| ------------------------------------------------------------------------ | -------- | -------- | ------------- |
| Sign up and login                                                        | 8        | 31       | TC001 - TC039 |
| Products (list, details, search, filters, cart, review)                  | 22       | 15       | TC040 - TC076 |
| Cart                                                                     | 13       | 6        | TC077 - TC095 |
| Checkout and payment                                                     | 19       | 6        | TC096 - TC120 |
| Contact us                                                               | 10       | 11       | TC121 - TC141 |
| Smoke: full purchase flow (login, home, products, cart, checkout, order) | 2        | -        | TC241 - TC242 |

### API tests (77)

| Endpoint group                                                                          | Positive | Negative | Test cases    |
| --------------------------------------------------------------------------------------- | -------- | -------- | ------------- |
| Products list (`/productsList`)                                                         | 8        | 3        | TC164 - TC174 |
| Brands list (`/brandsList`)                                                             | 6        | 3        | TC175 - TC183 |
| Search product (`/searchProduct`)                                                       | 11       | 7        | TC184 - TC201 |
| Verify login (`/verifyLogin`)                                                           | 4        | 9        | TC202 - TC214 |
| Account (`/createAccount`, `/getUserDetailByEmail`, `/updateAccount`, `/deleteAccount`) | 13       | 13       | TC215 - TC240 |

Numbers TC142 - TC163 are intentionally unused (reserved for navigation tests that are not part of this submission).

---

## 2. Tech stack

| Tool                                                                                       | Purpose                                         |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| [Cypress](https://www.cypress.io/) 16                                                      | Test runner (UI and API)                        |
| [cypress-mochawesome-reporter](https://www.npmjs.com/package/cypress-mochawesome-reporter) | HTML report with charts and failure screenshots |
| [Nodemailer](https://nodemailer.com/)                                                      | Sends the email report                          |
| [dotenv](https://www.npmjs.com/package/dotenv)                                             | Keeps email login details out of the code       |
| Node.js and npm                                                                            | Runtime and package manager                     |

---

## 3. Project structure

```
automationexercise-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── ui/
│   │   │   ├── positive tests/
│   │   │   │   ├── signup-login.cy.js
│   │   │   │   ├── products.cy.js
│   │   │   │   ├── cart.cy.js
│   │   │   │   ├── checkout.cy.js
│   │   │   │   └── contact-us.cy.js
│   │   │   ├── negative tests/
│   │   │   │   ├── signup-login.negative.cy.js
│   │   │   │   ├── products.negative.cy.js
│   │   │   │   ├── cart.negative.cy.js
│   │   │   │   ├── checkout.negative.cy.js
│   │   │   │   └── contact-us.negative.cy.js
│   │   │   └── smoke tests/
│   │   │       └── purchase-flow.smoke.cy.js
│   │   └── api/
│   │       ├── positive tests/
│   │       │   ├── products.api.cy.js
│   │       │   ├── brands.api.cy.js
│   │       │   ├── search.api.cy.js
│   │       │   ├── login.api.cy.js
│   │       │   └── account.api.cy.js
│   │       └── negative tests/
│   │           ├── products.negative.api.cy.js
│   │           ├── brands.negative.api.cy.js
│   │           ├── search.negative.api.cy.js
│   │           ├── login.negative.api.cy.js
│   │           └── account.negative.api.cy.js
│   ├── fixtures/                 test data (JSON) and a sample upload file
│   │   ├── users.json
│   │   ├── products.json
│   │   ├── paymentData.json
│   │   ├── contactData.json
│   │   ├── apiData.json
│   │   └── upload-sample.txt
│   ├── pages/                    Page Object Model (one class per page)
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── ProductsPage.js
│   │   ├── CartPage.js
│   │   ├── CheckoutPage.js
│   │   └── ContactUsPage.js
│   └── support/
│       ├── commands.js           custom commands (cy.login, cy.apiCall, ...)
│       ├── apiHelpers.js         small request helpers for the account API tests
│       └── e2e.js                loads commands, the reporter, and ad blocking
├── reporting/
│   └── sendEmailReport.js        builds and sends the email report
├── cypress.config.js             base URL, viewport, timeouts, retries, reporter
├── package.json
├── .env.example                  template for the email settings
├── .gitignore
└── README.md
```

---

## 4. Getting started

### Prerequisites

- **Node.js** (a current LTS version) and **npm**
- **Google Chrome** (the default browser in `cypress.config.js`; Edge and Firefox also work, see below)
- An internet connection (the tests run against the live website)

### Configure the email report (optional)

Skip this step if you only want to run the tests. Without it, the tests still run and the HTML report is still created, but no email is sent.

1. Copy the template: `.env.example` to a new file named `.env`
2. Fill in the values:

| Variable        | Meaning                                                  | Example                                      |
| --------------- | -------------------------------------------------------- | -------------------------------------------- |
| `EMAIL_ENABLED` | `true` sends the email, anything else turns it off       | `true`                                       |
| `EMAIL_HOST`    | SMTP server                                              | `smtp.gmail.com`                             |
| `EMAIL_PORT`    | SMTP port (587, or 465 for SSL)                          | `587`                                        |
| `EMAIL_USER`    | The sending account                                      | `your.address@gmail.com`                     |
| `EMAIL_PASS`    | The account's **App Password** (not the normal password) | 16 characters, no spaces                     |
| `EMAIL_FROM`    | The "from" text                                          | `"Cypress Reports <your.address@gmail.com>"` |
| `EMAIL_TO`      | Who receives the report                                  | `receiver@example.com`                       |

**Gmail:** turn on 2-Step Verification, then create an App Password in your Google Account settings and use it as `EMAIL_PASS`.

`.env` is listed in `.gitignore` and must never be committed.

---

## 5. Running the tests

### Interactive mode (Cypress Test Runner)

```bash
npm run cy:open
```

Choose **E2E Testing**, pick a browser, and click a test file. Use this while writing or debugging tests. No email is sent in this mode.

### Command line (headless)

| Command                 | What it runs                            |
| ----------------------- | --------------------------------------- |
| `npm test`              | All tests (UI and API)                  |
| `npm run test:ui`       | All UI tests                            |
| `npm run test:api`      | All API tests                           |
| `npm run test:positive` | Positive tests only (UI and API)        |
| `npm run test:negative` | Negative tests only (UI and API)        |
| `npm run test:smoke`    | The end-to-end purchase smoke test only |

### Running one file

The folder names contain a space, so the path **must be in quotes**:

```bash
npx cypress run --spec "cypress/e2e/ui/positive tests/cart.cy.js"
```

Several files, separated by commas:

```bash
npx cypress run --spec "cypress/e2e/api/positive tests/products.api.cy.js,cypress/e2e/api/negative tests/products.negative.api.cy.js"
```

### Choosing a browser

```bash
npx cypress run --browser chrome
npx cypress run --browser edge
npx cypress run --browser firefox
```

### Run time

The full suite takes a while, because it uses the live website, many tests log in with the UI, and failed tests are retried up to twice in command-line mode. For a quick check, run `npm run test:smoke` or `npm run test:api`.

---

## 6. Reports and the email report

After every command-line run:

1. **Mochawesome HTML report** is created in `cypress/reports/` (open the `index.html` inside it in a browser, usually `cypress/reports/html/index.html`). It is a single file with charts, every test's status, and screenshots embedded for failed tests.
2. **Failure screenshots** are saved by Cypress in `cypress/screenshots/`.
3. **An email** is sent through Cypress's `after:run` hook (see `cypress.config.js` and `reporting/sendEmailReport.js`). It contains:
   - an overall PASS or FAIL banner and the subject line `[PASS]` or `[FAIL]` with the pass rate
   - totals: tests, passed, failed, skipped, pass rate, duration, browser, start and end time
   - a table with the results of every test file
   - the list of failed tests with the first line of each error
   - the HTML report as an attachment (skipped with a note if it is larger than 20 MB)

The email step is safe: if the settings are missing or sending fails, a message is printed in the terminal (`[email report] ...`) and the test result is not affected.

### Generating a sample report

```bash
npm test
```

Then take a screenshot of the received email and/or the opened `index.html` report.

---

## 7. Framework design

### Page Object Model

Each page of the site has a class in `cypress/pages/` that holds its **selectors** and **actions**. Tests then read like plain steps (`LoginPage.login(...)`), and when the site changes, only one file needs updating.

### Fixtures (test data)

All data lives in `cypress/fixtures/` instead of inside the tests. Tests mostly load it with `cy.fixture(...)` and loop over data tables to create many cases from one block of code.

### Custom commands (`cypress/support/commands.js`)

| Command                                      | What it does                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `cy.createUserViaApi()`                      | Creates the test account through the API (fast, no clicking) and fails with a clear message if it cannot |
| `cy.deleteUserViaApi()`                      | Deletes the test account (safe to call when it does not exist)                                           |
| `cy.resetTestUser()`                         | Deletes and re-creates the account, so it starts with an empty cart                                      |
| `cy.login(email, password)`                  | Logs in through the login page                                                                           |
| `cy.loginAsTestUser()`                       | Logs in with the fixture user and waits until the site shows "Logged in as"                              |
| `cy.openCheckoutAsTestUser(id, qty)`         | Logs in, adds a product, and opens the checkout page                                                     |
| `cy.apiCall({ method, endpoint, body, qs })` | Sends an API request and returns `{ httpStatus, code, message, body, duration }`                         |
| `cy.step("text")`                            | Writes a readable `STEP:` line in the command log                                                        |

### Test independence

Every test prepares what it needs and cleans up afterwards. The test account is created and deleted through the API in `before`, `beforeEach`, and `after` hooks. Because a logged-in user's cart is saved on the server, tests that need an empty cart reset the account first. Tests do not rely on the order they run in.

### Selectors

The `data-qa` attributes provided by the website are used wherever they exist. Where the site has none (for example the search box and the cart table), stable ids and class names are used.

### No hardcoded waits

There is no `cy.wait(...)` in the tests. Cypress retries assertions automatically, and after any action that loads a new page, the tests first wait for the new URL or a piece of text that only the new page contains.

### Conditions and logs

- **Conditions** are used on test data and helpers (for example "set the quantity only when it is not 1", "type a field only when it has a value", "attach the report only if it exists"). Tests never branch on what happens to be on the page, because that can make a test pass for the wrong reason.
- **Logs** make failures easy to read: `cy.step(...)` lines mark each step, API requests and responses are logged with their response code, message, and duration, and the failed assertion messages name what was checked.

### Handling the website's behaviour

| Behaviour                                          | How the tests deal with it                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| The API always answers HTTP 200                    | `cy.apiCall` returns the real `responseCode` from the body, and the tests check that                              |
| The API body can arrive as plain text              | The response is parsed safely before use                                                                          |
| Contact Us shows a browser `confirm` popup         | The page's own `window.confirm` is replaced by a recorder that answers OK or Cancel, so no one has to press a key |
| Required fields are checked by the browser         | Negative tests read the field's `validity` flags (`valueMissing`, `typeMismatch`)                                 |
| Typing removes spaces from an email field          | Invalid emails with spaces are set in one go with `invoke("val", ...)`                                            |
| Third-party ads can cover buttons and throw errors | Ad requests are blocked and unrelated script errors are ignored (`cypress/support/e2e.js`)                        |
| The public site can be slow                        | Generous timeouts and up to 2 automatic retries in command-line mode                                              |

### Configuration (`cypress.config.js`)

| Setting                  | Value                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `baseUrl`                | `https://automationexercise.com`                                                     |
| Viewport                 | 1280 x 720                                                                           |
| `expose.apiUrl`          | `https://automationexercise.com/api` (read in tests with `Cypress.expose("apiUrl")`) |
| `defaultCommandTimeout`  | 10 seconds                                                                           |
| `pageLoadTimeout`        | 60 seconds                                                                           |
| `retries`                | 2 in `cypress run`, 0 in `cypress open`                                              |
| `screenshotOnRunFailure` | on                                                                                   |
| `video`                  | off                                                                                  |
| Reporter                 | `cypress-mochawesome-reporter` (single-file HTML, embedded screenshots)              |

Note: Cypress 16 removed `Cypress.env()`. This project uses `Cypress.expose()` for its non-secret values.

---

## 8. Test case numbering and conventions

- Every test title starts with a continuous test case number: `TC021 - shows an error for an email that is not registered`.
- **Positive and negative tests are in separate folders** (`positive tests` and `negative tests`) for UI and for API, so each kind can be run on its own.
- Test files are named after the area they cover: `cart.cy.js` (positive), `cart.negative.cy.js` (negative), `products.api.cy.js` (API positive), `products.negative.api.cy.js` (API negative).
- Loop tests build their number from the starting number plus the position in the data table (for example `TC016` to `TC020` for five invalid emails). If you add or remove a row in a table, the numbers after it shift.

---

## 9. How the assignment requirements are met

| Requirement                                                                                      | Where it is met                                                                                                         |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Install Cypress locally with npm                                                                 | `package.json`, `npm install`                                                                                           |
| Cypress folder structure                                                                         | Section 3                                                                                                               |
| `cypress.config.js` with base URL and viewport                                                   | `cypress.config.js`                                                                                                     |
| 90+ functional tests                                                                             | About 220 tests (section 1)                                                                                             |
| API testing: fetch product data, validate that "Blue Top" exists, check the status and structure | `cypress/e2e/api/positive tests/products.api.cy.js` (TC164 - TC171, Blue Top in TC169 and TC170) and `search.api.cy.js` |
| Avoid hardcoded waits                                                                            | No `cy.wait()` is used                                                                                                  |
| Use `data-*` selectors where available                                                           | `data-qa` selectors throughout                                                                                          |
| Keep tests independent                                                                           | Per-test setup and cleanup through the API (section 7)                                                                  |
| Source code                                                                                      | This repository                                                                                                         |
| README with run instructions                                                                     | This file                                                                                                               |
| Sample report (Mochawesome or email report; email recommended)                                   | Section 6                                                                                                               |

---

## 10. Troubleshooting

| Problem                                                  | Cause and fix                                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Can't run because no spec files were found`             | The path is wrong or not quoted. Folder names contain spaces, so use quotes, and check the folder spelling (`positive tests`, `negative tests`). |
| `Cypress.env() was removed in Cypress version 16`        | Use `Cypress.expose("name")` and the `expose` block in `cypress.config.js`.                                                                      |
| `cy.something is not a function`                         | A custom command is missing, or Cypress was not restarted after `commands.js` changed. Close Cypress and start it again.                         |
| `Expected to find content: 'Logged in as' but never did` | The site was slow or did not finish the login. Run the test again. The login helper waits up to 30 seconds.                                      |
| A test fails once but passes on re-run                   | The site is a public practice website and is sometimes slow. In command-line mode, failed tests are retried twice.                               |
| `[email report] Skipped: missing settings in .env`       | A value in `.env` is empty. Fill it in (section 4).                                                                                              |
| `[email report] Could not send the email`                | Check `EMAIL_USER`, the App Password, the port, and that the account allows SMTP.                                                                |
| `We failed to trash the existing run results` (Windows)  | A harmless warning about clearing old screenshots. Adding `trashAssetsBeforeRuns: false` at the top level of `cypress.config.js` stops it.       |
| The cart has more products than expected                 | The test account's cart is saved on the server. Use `cy.resetTestUser()` at the start of the test.                                               |

---

## Notes

- The website is a public practice site that anyone can use, so results can occasionally vary with its speed and availability.
- Tests create and delete one dedicated test account (defined in `cypress/fixtures/users.json`). Do not use real personal data in the fixtures.
