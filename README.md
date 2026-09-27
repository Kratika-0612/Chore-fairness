# Chore Fairness

A lightweight web app for two people to track household chores fairly. Tap what you did, and the app keeps a running, effort-weighted tally for the week — no spreadsheets, no guilt trips.

## Features

- **Effort-weighted logging** — each chore carries a weight (1–5) so a deep bathroom clean counts more than taking out the trash.
- **Two-user toggle** — log chores under "You" or "Bob" with a single tap.
- **Weekly split bar** — see the current effort split as a live percentage.
- **7-day trend chart** — a smooth Bézier curve shows how the balance has shifted across the week.
- **Gentle nudges** — context-aware messages surface when the split tilts beyond a threshold, without shaming anyone.
- **Optimistic UI** — chore chips highlight instantly on tap; the Appwrite write happens in the background.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla JS (ES modules) |
| Build tool | [Vite](https://vite.dev) |
| Backend / DB | [Appwrite](https://appwrite.io) (Cloud) |

No framework, no bundled component library — just HTML, CSS, and vanilla JS modules compiled by Vite.

## Project Structure

```
Chore-fairness/
├── index.html          # Single-page shell with all three screens (landing, log, dashboard)
├── src/
│   ├── main.js         # DOM wiring, event listeners, dashboard render loop
│   ├── logic.js        # Pure functions: calculateSplit, calculateDailyTrend, getNudge
│   ├── appwrite.js     # Appwrite client, logChore(), getWeekLogs()
│   └── style.css       # All styles
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- An [Appwrite Cloud](https://cloud.appwrite.io) project (or self-hosted instance)

### 1. Clone and install

```bash
git clone <repo-url>
cd Chore-fairness
npm install
```

### 2. Configure Appwrite

Open [`src/appwrite.js`](src/appwrite.js) and update the constants at the top:

```js
const client = new Client()
  .setEndpoint("https://<your-region>.cloud.appwrite.io/v1")
  .setProject("<your-project-id>");

export const DB_ID = "<your-database-id>";
export const COLLECTION_ID = "<your-collection-id>";

export const USER_YOU_ID = "<document-id-for-you>";
export const USER_BOB_ID = "<document-id-for-bob>";
```

#### Required Appwrite collection schema

Create a collection with the following string attributes:

| Attribute | Type | Notes |
|---|---|---|
| `userId` | String | ID of the user who did the chore |
| `choreId` | String | Slug identifier for the chore |
| `choreName` | String | Human-readable name |
| `weight` | Integer | Effort weight (1–5) |
| `timestamp` | DateTime (ISO 8601) | When the chore was logged |

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serves the built output locally
```

## Chore Weights

| Chore | Weight |
|---|---|
| Wipe counters | 1 |
| Take out trash | 1 |
| Dishes | 2 |
| Vacuum | 3 |
| Laundry | 3 |
| Deep clean bathroom | 5 |

Weights can be adjusted in the `CHORE_WEIGHTS` map inside [`src/main.js`](src/main.js). You can also pass an `effortOverride` to `logChore()` for one-off adjustments.

## How the Split Is Calculated

1. **Weekly logs** — `getWeekLogs()` fetches all documents from the last 7 days.
2. **Weighted totals** — `calculateSplit()` sums each user's `weight` values and expresses them as a percentage of the combined total.
3. **Daily trend** — `calculateDailyTrend()` buckets logs by calendar day (Mon–Sun of the current ISO week) and computes the per-day percentage split. Days with no activity default to 50/50.
4. **Nudge** — `getNudge()` picks a message based on the gap between the two users' percentages: balanced (<10 pp gap), mild nudge (10–24 pp), or strong nudge (≥25 pp).

## Team

**Created by Team TwoBits**

| Name | Contributions | GitHub |
|---|---|---|
| Kratika Srivastava | Project structure setup, UI/UX setup, `logic.js` file setup | [@Kratika-0612](https://github.com/Kratika-0612) |
| Anuj Dixit | Appwrite setup, UI/UX fixes, and bug fixing | [@08-anujdixit](https://github.com/08-anujdixit) |

## License

MIT
