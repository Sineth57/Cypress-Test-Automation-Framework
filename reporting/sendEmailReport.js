// sendEmailReport.js
// Builds an HTML summary of a Cypress run and emails it,
// with the Mochawesome HTML report attached.
// This file runs in Node (not in the browser).

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// Where the Mochawesome report may be. We use the first one that exists.
const REPORT_CANDIDATES = [
  "cypress/reports/html/index.html",
  "cypress/reports/index.html",
];

// Gmail allows attachments up to 25 MB. We stay below that.
const MAX_ATTACHMENT_MB = 20;

const REQUIRED_SETTINGS = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];

// ---------- small helpers ----------
const escapeHtml = (text) =>
  String(text ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

const formatDuration = (ms) => {
  const totalSeconds = Math.round((ms || 0) / 1000);
  return `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;
};

const findReportFile = () =>
  REPORT_CANDIDATES.map((file) => path.resolve(file)).find((file) =>
    fs.existsSync(file)
  );

// ---------- collect the numbers from the Cypress results ----------
const buildSummary = (results) => {
  const runs = results.runs || [];
  const failedTests = [];

  runs.forEach((run) => {
    (run.tests || []).forEach((test) => {
      if (test.state === "failed") {
        failedTests.push({
          spec: run.spec?.relative || run.spec?.name || "unknown file",
          title: (test.title || []).join(" > "),
          // the first line of the error is usually the message
          error: String(test.displayError || "").split("\n")[0].slice(0, 200),
        });
      }
    });
  });

  const total = results.totalTests || 0;
  const passed = results.totalPassed || 0;

  return {
    total,
    passed,
    failed: results.totalFailed || 0,
    pending: results.totalPending || 0,
    skipped: results.totalSkipped || 0,
    passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0",
    duration: formatDuration(results.totalDuration),
    browser: `${results.browserName || "unknown"} ${results.browserVersion || ""}`.trim(),
    startedAt: results.startedTestsAt || "",
    endedAt: results.endedTestsAt || "",
    runs,
    failedTests,
  };
};

// ---------- build the email body ----------
const buildHtml = (summary, attachmentNote) => {
  // CONDITION: the banner is green when nothing failed, red otherwise
  const allPassed = summary.failed === 0;
  const color = allPassed ? "#2e7d32" : "#c62828";

  const specRows = summary.runs
    .map((run) => {
      const stats = run.stats || {};
      const rowColor = stats.failures > 0 ? "#c62828" : "#2e7d32";
      return `<tr>
        <td style="padding:6px;border:1px solid #ddd">${escapeHtml(run.spec?.relative || run.spec?.name)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center">${stats.tests ?? 0}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center;color:#2e7d32">${stats.passes ?? 0}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center;color:${rowColor}">${stats.failures ?? 0}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center">${(stats.pending ?? 0) + (stats.skipped ?? 0)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center">${formatDuration(stats.duration)}</td>
      </tr>`;
    })
    .join("");

  // CONDITION: show the failed-test list only when something failed
  const failedSection = summary.failedTests.length
    ? `<h3 style="color:#c62828">Failed tests (${summary.failedTests.length})</h3>
       <ul>${summary.failedTests
         .map(
           (test) =>
             `<li><b>${escapeHtml(test.title)}</b><br>
              <small>${escapeHtml(test.spec)}</small><br>
              <code>${escapeHtml(test.error)}</code></li>`
         )
         .join("")}</ul>`
    : `<p style="color:#2e7d32"><b>No failed tests.</b></p>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:900px">
    <div style="background:${color};color:#fff;padding:14px 18px;border-radius:4px">
      <h2 style="margin:0">Cypress Test Report - ${allPassed ? "ALL PASSED" : "FAILURES FOUND"}</h2>
      <div>Automation Exercise (UI and API tests)</div>
    </div>

    <h3>Summary</h3>
    <table style="border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0">Total tests</td><td><b>${summary.total}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Passed</td><td style="color:#2e7d32"><b>${summary.passed}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Failed</td><td style="color:#c62828"><b>${summary.failed}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Pending / skipped</td><td><b>${summary.pending + summary.skipped}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Pass rate</td><td><b>${summary.passRate}%</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Duration</td><td><b>${summary.duration}</b></td></tr>
      <tr><td style="padding:4px 12px 4px 0">Browser</td><td>${escapeHtml(summary.browser)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0">Started</td><td>${escapeHtml(summary.startedAt)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0">Finished</td><td>${escapeHtml(summary.endedAt)}</td></tr>
    </table>

    <h3>Results per test file</h3>
    <table style="border-collapse:collapse;font-size:13px">
      <tr style="background:#f0f0f0">
        <th style="padding:6px;border:1px solid #ddd;text-align:left">File</th>
        <th style="padding:6px;border:1px solid #ddd">Tests</th>
        <th style="padding:6px;border:1px solid #ddd">Passed</th>
        <th style="padding:6px;border:1px solid #ddd">Failed</th>
        <th style="padding:6px;border:1px solid #ddd">Skipped</th>
        <th style="padding:6px;border:1px solid #ddd">Time</th>
      </tr>
      ${specRows}
    </table>

    ${failedSection}

    <p style="color:#555"><small>${escapeHtml(attachmentNote)}</small></p>
  </div>`;
};

// ---------- the function Cypress calls after the run ----------
const sendEmailReport = async (results) => {
  // CONDITION 1: the person can switch emailing off with EMAIL_ENABLED=false
  if (process.env.EMAIL_ENABLED !== "true") {
    console.log("[email report] Skipped: EMAIL_ENABLED is not set to true.");
    return;
  }

  // CONDITION 2: stop with a clear message if a setting is missing
  const missing = REQUIRED_SETTINGS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.log(`[email report] Skipped: missing settings in .env: ${missing.join(", ")}`);
    return;
  }

  // CONDITION 3: Cypress could not run at all, so there is nothing to report
  if (results.status === "failed") {
    console.log(`[email report] Skipped: Cypress did not run (${results.message || "no details"}).`);
    return;
  }

  const summary = buildSummary(results);

  // CONDITION 4: attach the HTML report only if it exists and is not too big
  const attachments = [];
  let attachmentNote = "The Mochawesome HTML report is attached.";
  const reportFile = findReportFile();

  if (!reportFile) {
    attachmentNote = "The HTML report file was not found, so nothing is attached.";
  } else {
    const sizeMb = fs.statSync(reportFile).size / (1024 * 1024);
    if (sizeMb > MAX_ATTACHMENT_MB) {
      attachmentNote = `The HTML report is ${sizeMb.toFixed(1)} MB, too large to attach. Find it at: ${reportFile}`;
    } else {
      attachments.push({ filename: "cypress-test-report.html", path: reportFile });
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT) === 465, // 465 = secure from the start
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const statusWord = summary.failed === 0 ? "PASS" : "FAIL";
  const subject = `[${statusWord}] Cypress report - ${summary.passed}/${summary.total} passed (${summary.passRate}%)`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject,
      html: buildHtml(summary, attachmentNote),
      attachments,
    });
    console.log(`[email report] Sent. Message id: ${info.messageId}`);
  } catch (error) {
    // The tests are already finished, so an email problem must not break the run
    console.log(`[email report] Could not send the email: ${error.message}`);
  }
};

module.exports = { sendEmailReport };