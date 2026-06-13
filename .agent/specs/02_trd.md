# Technical Requirements Document (TRD) - User Bro Global Agent

## 1. Technical Stack & Dependencies

### 1.1 Core Tools & Libraries
- **Browser Automation**: Playwright (via Node.js or Python backend execution).
- **Control Interface**: `chrome-devtools` MCP Server.
- **Image Annotation**: Jimp or Sharp (for drawing red highlights on screenshots).
- **Core Reasoning Engine**: Gemini 1.5 Pro or equivalent high-reasoning model (needed for visual comprehension of accessibility trees and screenshots).
- **Reporting Format**: Interactive Markdown (GitHub Flavored Markdown) with embedded media + HTML-based dashboard.

---

## 2. Chrome DevTools MCP Tool Mapping

The agent uses the eager/lazy tools from the `chrome-devtools` MCP server to interact with the target page.

| MCP Tool | Intended Usage | Skill Assignment |
|---|---|---|
| `navigate_page` | Opens target URLs and page redirects. | `visual-perception-and-navigation` |
| `take_screenshot` | Captures screen state after each step. | `visual-perception-and-navigation` |
| `take_snapshot` | Extracts HTML/accessibility tree for element coordinates. | `visual-perception-and-navigation` |
| `click`, `hover` | Performs user interactions on specific bounding boxes. | `visual-perception-and-navigation` |
| `type_text`, `press_key` | Enters inputs and interacts with keyboard navigation. | `naive-form-filler` |
| `list_console_messages` | Detects JS runtime exceptions and warnings. | `frustration-state-tracker` |
| `list_network_requests` | Captures API latencies, HTTP 4xx/5xx failures. | `frustration-state-tracker` |
| `wait_for` | Pauses for loaders or elements to stabilize. | `visual-perception-and-navigation` |

---

## 3. Detailed Technical Specifications of the 5 Skills

### 3.1 `visual-perception-and-navigation`
* **Purpose**: Capture the visual state and perform spatial interactions.
* **Mechanism**:
  - Uses `take_screenshot` to get raw PNG buffers.
  - Uses `take_snapshot` to extract DOM elements, their accessibility labels, and bounding boxes (`x, y, width, height`).
  - Converts element coordinates into direct click actions (e.g., clicking the center of the bounding box).
  - Handles scrolling by executing a window scroll script if elements are offscreen.

### 3.2 `cognitive-decision-maker`
* **Purpose**: Evaluate screenshots and DOM nodes to select the next logical step.
* **Mechanism**:
  - Inputs the current intention, previous steps history, screenshot, and accessibility nodes to the LLM.
  - Simulates the user's internal monologue ("I need to save, so I'm looking for a save button...").
  - Outputs the selected element's DOM ID or accessibility label, along with coordinates.

### 3.3 `naive-form-filler`
* **Purpose**: Input realistic, naive, and incorrect data to test UI constraints.
* **Mechanism**:
  - Automatically identifies form fields (inputs, textareas, selectors).
  - Maps fields to simulated user data (e.g., standard email vs. typing a phone number into an email field to test validation response).
  - Types with adjustable speed depending on the persona configuration.

### 3.4 `frustration-state-tracker`
* **Purpose**: Manage the numerical frustration score (0-100) after each step.
* **Mechanism**:
  - Subscribes to console logs using `list_console_messages` (adds `+30` on errors).
  - Inspects network requests using `list_network_requests` (adds `+40` on 5xx, `+10` per second of load time over 2s).
  - Checks if the DOM state changed between steps (if identical, adds `+20`).
  - Updates the global state object.

### 3.5 `diagnostic-reporter`
* **Purpose**: Build the final dashboard report.
* **Mechanism**:
  - Saves screenshots to the run artifact directory.
  - Draws red circles on the clicked element coordinates.
  - Links Playwright video recordings (`.webm` or `.mp4`).
  - Writes the finalized markdown report, generating an "Autopsie de la Frustration" if the run was aborted.

---

## 4. Run State & Configuration

At start, a run state object is initialized:
```json
{
  "session_id": "uuid-v4",
  "persona": {
    "patience": 0.5,
    "tech_savviness": 0.3,
    "click_speed": "slow"
  },
  "intention": "Try to checkout a product",
  "state": {
    "step_count": 0,
    "frustration_gauge": 0,
    "history": [],
    "video_path": "./recordings/session.webm",
    "status": "RUNNING"
  }
}
```

---

## 5. Security Blocklist Implementation

Before any click/type action, the `cognitive-decision-maker` scans the target element's properties:
- **Rule**: If the innerText, id, class, or aria-label matches regex `/supprimer|delete|payer|commander|buy|purge/i`:
  - **Action**: Stop navigation, trigger a CLI confirmation prompt, or skip to the next candidate element.
  - Logs a warning: `[SECURITY GUARDRAIL TRIGGERED] Blending click to element containing sensitive word.`
