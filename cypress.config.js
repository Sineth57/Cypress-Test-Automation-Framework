require("dotenv").config(); // loads the .env file into process.env
const { defineConfig } = require("cypress");
const { beforeRunHook, afterRunHook } = require("cypress-mochawesome-reporter/lib");
const { sendEmailReport } = require("./reporting/sendEmailReport");

const fs = require("fs");

// true  = keep the video of EVERY test file
// false = keep only videos of test files with a failed or retried test (like screenshots)
const keepAllVideos = process.env.KEEP_ALL_VIDEOS === "true";

module.exports = defineConfig({
  // Use an installed browser (Electron is deprecated in Cypress 16)
  defaultBrowser: "chrome",

  // Public, non-secret values we can read in tests with Cypress.expose("apiUrl")
  expose: {
    apiUrl: "https://automationexercise.com/api",
  },

  // ---------- Report settings ----------
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    reportPageTitle: "Automation Exercise - Cypress Test Report",
    charts: true,
    embeddedScreenshots: true, // failure screenshots are placed inside the HTML
    inlineAssets: true,        // everything in ONE html file, easy to email
    saveAllAttempts: false,    // keep only the last attempt of a retried test
  },

  e2e: {
    baseUrl: "https://automationexercise.com",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: "cypress/videos",
    videoCompression: 32, 

    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // Before the run: let the reporter prepare its folders
      on("before:run", async (details) => {
        await beforeRunHook(details);
      });

      // After the run: first build the HTML report, then email it
      on("after:run", async (results) => {
        await afterRunHook();
        await sendEmailReport(results);
      });

            // After each test file: decide whether its video is worth keeping
      on("after:spec", (spec, results) => {
        if (!results || !results.video) return; // no video was recorded

        // CONDITION: did any test fail, even on a retry attempt?
        const hadFailures = results.tests.some((test) =>
          test.attempts.some((attempt) => attempt.state === "failed")
        );

      if (keepAllVideos) {
          console.log(`[video] Kept (KEEP_ALL_VIDEOS=true): ${results.video}`);
        } else if (hadFailures) {
          console.log(`[video] Kept (failed or retried test): ${results.video}`);
        } else {
          try {
            fs.unlinkSync(results.video);
            console.log(`[video] Deleted (all tests passed): ${spec.relative}`);
          } catch (error) {
            console.log(`[video] Could not delete ${results.video}: ${error.message}`);
          }
        }
      });

      return config;
    },
  },
});