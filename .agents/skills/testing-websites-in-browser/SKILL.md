---
name: testing-websites-in-browser
description: Tests a web application or website directly in a browser environment, identifying visual, navigational, functional, and console issues, and generates a structured testing report. Use when the user requests end-to-end browser testing, UI verification, or crawl reports for a website.
---

# Testing Websites in Browser

This skill enables autonomous agents to perform thorough browser-based testing on any target web application. It crawls pages, clicks interactive elements, submits forms, monitors errors, and produces a structured visual and functional report.

---

## When to use this skill
Use this skill when you need to:
- Perform end-to-end browser testing of a local or public website.
- Crawl a website to identify broken links, navigation errors, and layout responsiveness.
- Inspect browser console logs and network traffic for active bugs.
- Synthesize an executive-level quality and compatibility report.

---

## Workflow

### 1. Target Verification
- Verify that the target website URL is fully qualified and reachable (e.g., handles `localhost` ports or remote servers).
- Check if the site requires basic authentication or session setup.

### 2. Crawl & Discovery
- Navigate the browser to the root URL.
- Map the site hierarchy by discovering and compiling all internal links.
- Classify pages by type (e.g., landing page, dashboard, forms, blogs).

### 3. Deep Interaction & Functional Testing
- **Element Interaction**: Systematically click buttons, open modals, toggle menus, and trigger UI state changes.
- **Form Validation**: Locate input forms, submit mock data, and verify both success and validation error states.
- **Console Harvesting**: Continuously monitor and record console errors, warnings, stack traces, and unhandled promise rejections.
- **Network Auditing**: Track all API or asset requests that result in `4xx` or `5xx` responses.

### 4. Responsiveness & Visual Auditing
- Load pages under multiple viewports (Desktop: `1440x900`, Mobile: `375x812`).
- Inspect for overlapping text, horizontal scroll issues, broken layouts, or hidden buttons.
- Capture screenshot artifacts of critical pages and identified bugs.

### 5. Report Compilation
- Aggregate all gathered data into a unified, executive-grade report.
- Include a high-level summary, a functional pass/fail checklist, detailed issue logs classified by severity, and specific performance metrics.

---

## Instructions

### 1. Browser Navigation Guidelines
When operating the browser:
- Always wait for the network to idle (`networkidle0` or equivalent) or wait for a specific critical selector to load before proceeding.
- Implement explicit delays (e.g., 200ms-500ms) between clicks and typing to mimic human interaction and allow dynamic JS to execute.
- Handle popups and cookie consent banners dynamically by clicking close or accept buttons before starting deep tests.

### 2. Error Harvesting Patterns
Collect errors and trace them to their root cause. Ensure the agent monitors:
- **Console Output**: Record any `console.error` calls.
- **Uncaught Exceptions**: Capture any global unhandled errors.
- **Network Failures**: Filter failed network requests and log the method, URL, status code, and payload if applicable.

### 3. Report Synthesis Schema
The final report must follow this exact Markdown structure for consistency:

```markdown
# Web Application Testing Report

## Executive Summary
- **Target URL**: [URL]
- **Timestamp**: [ISO Timestamp]
- **Overall Status**: [PASS / FAIL / WARNING]
- **Total Issues Found**: [Count] (Critical: [X], High: [Y], Medium: [Z])

## Tested Viewports
- [x] Desktop (1440x900)
- [x] Mobile (375x812 - iPhone X)

## Functional Pass/Fail Checklist
- [ ] Navigation and Link Integrity
- [ ] Form Submissions and Input Validation
- [ ] Interactive Elements (Modals, Toggles, Menus)
- [ ] Asset & Media Loading

## Issue Logs

### 🔴 Critical Issues
*No critical issues found.* OR:
- **Issue ID**: CRIT-01
- **Page URL**: `http://...`
- **Description**: [Detailed description]
- **Error Trace**: `[Stack trace or Console Error]`
- **Screenshot Ref**: `[Path to screenshot]`

### 🟡 High Severity
- **Issue ID**: HIGH-01
- **Page URL**: `http://...`
- **Description**: [Detailed description]

### 🔵 Medium & Low Severity
- **Issue ID**: MED-01
- **Page URL**: `http://...`
- **Description**: [Detailed description]

## Performance & Accessibility Metrics
- **Average Page Load Time**: [Time in ms]
- **Visual Glitches / Overlaps**: [Notes on responsive styling]
- **API Status**: [All endpoints healthy / Slow response on endpoint X]
```

---

## Validation

Verify that your browser-testing agent conforms to these criteria:
- [ ] **Viewport Check**: Tested the pages on both mobile and desktop resolutions.
- [ ] **Log Harvesting**: Captured console log output during navigation and interaction steps.
- [ ] **Link Validation**: Verified that internal links resolve correctly without 404s.
- [ ] **State Capturing**: Created a screenshot of pages where errors occurred and saved it to the app data directory.
- [ ] **Clear Report Generation**: Created a complete report matching the mandated Markdown schema.

---

## Resources

### Mock Input Schema for Browser Automation Script
When generating scripts for this agent, you can follow this simple mock setup:

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('pageerror', error => {
    console.log(`[PAGE_ERROR] ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE_ERROR] ${msg.text()}`);
    }
  });

  // Navigate to target
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // Perform screenshot
  await page.screenshot({ path: 'screenshot_desktop.png' });
  
  await browser.close();
})();
```
