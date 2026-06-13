# Product Requirements Document (PRD) - Ticket Currency & Automatic Ticket Creation

## 1. Objectives & Scoping
The objective is to allow administrators to configure a ticket currency (USD or HTG) and automatically generate a default Standard ticket type matching the event's capacity when creating any new event.

### Scope Checklist

#### Must-Haves
- **Currency Selection Option**: Add a Currency field (USD or HTG) in the ticket creation and edit modal.
- **Currency Display Formatting**:
  - Table listings in the admin ticket manager must render prices formatted with currency suffix/prefix (e.g., `$15` or `1 500 HTG`).
  - Event detail page on the public site must display ticket types and pricing tiers in their respective currency.
- **Auto-Ticket Creation**:
  - Upon creating a new event, automatically insert a default ticket in the `tickets` table linked to the new event.
  - Default ticket attributes: Name = "Standard", Price = 0, Currency = "USD", Quantity = Event Capacity, Allocation Mode = "standard", Available = true.

#### Should-Haves
- **Contextual Pricing Input**: Price inputs in the admin modal should display the selected currency symbol (e.g., `$` or `HTG`) as a label prefix/suffix to guide input.
- **Improved Price Summary**: Replace the generic *Plusieurs prix (N)* display in the admin table with a more useful *À partir de X* (starting from price) representation formatted in the correct currency.

#### Nice-to-Haves
- **Multi-currency support in reservations**: Store the currency selected during user registration on the reservation object (currently default is free/USD).

---

## 2. User Stories

### Currency Settings for Ticket Types
* **As an** event administrator,
* **I want to** select the currency (USD or HTG) when creating or editing a ticket type,
* **So that** attendees see prices in the local currency (HTG) or US Dollars (USD) depending on the ticket target.

### Dynamic Pricing Display
* **As a** visitor browsing an event,
* **I want to** see the ticket prices and pricing tiers in the currency chosen by the admin,
* **So that** I know exactly how much and in what currency I will be billed.

### Zero-Configuration Ticketing
* **As an** event organizer creating a new event,
* **I want** the system to automatically generate a standard ticket linked to the event's capacity,
* **So that** I don't have to manually navigate to the ticket manager and configure a ticket before attendees can start reserving seats.
