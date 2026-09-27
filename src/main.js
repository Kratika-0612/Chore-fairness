import { getWeekLogs, logChore, USER_YOU_ID, USER_BOB_ID } from './appwrite.js';
import { calculateSplit, calculateDailyTrend, getNudge } from './logic.js';
import './style.css';

const USER_NAMES = {
  [USER_YOU_ID]: 'You',
  [USER_BOB_ID]: 'Bob',
};

// Track which user is active on the Log screen
let activeUserId = USER_YOU_ID;

async function renderDashboard() {
  const logs = await getWeekLogs();

  const split = calculateSplit(logs, USER_YOU_ID, USER_BOB_ID);
  const nudge = getNudge(split, USER_YOU_ID, USER_BOB_ID, USER_NAMES);

  // Update split bar
  const youFill = document.querySelector('.split-fill.you');
  const bobFill = document.querySelector('.split-fill.bob');
  youFill.style.width = split[USER_YOU_ID] + '%';
  bobFill.style.width = split[USER_BOB_ID] + '%';
  youFill.querySelector('.split-label').textContent = `You · ${split[USER_YOU_ID]}%`;
  bobFill.querySelector('.split-label').textContent = `Bob · ${split[USER_BOB_ID]}%`;

  // Update nudge text
  document.querySelector('.nudge p').textContent = nudge;

  // Trend chart — X positions must match the fixed day-label positions in the SVG
  const DAY_X = [10, 60, 110, 160, 210, 260, 310];
  const trend = calculateDailyTrend(logs, USER_YOU_ID, USER_BOB_ID);

  // Build a smooth cubic Bézier path through all 7 data points.
  // Uses Catmull-Rom → cubic Bézier conversion with tension 0.4.
  function smoothPath(pts) {
    if (pts.length === 0) return '';
    const t = 0.4;
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) * t;
      const cp1y = p1[1] + (p2[1] - p0[1]) * t;
      const cp2x = p2[0] - (p3[0] - p1[0]) * t;
      const cp2y = p2[1] - (p3[1] - p1[1]) * t;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  // Always overwrite d (clears placeholder values when there is no data)
  const youPts = trend.map((d, i) => [DAY_X[i], 120 - d[USER_YOU_ID] * 1.2]);
  const bobPts = trend.map((d, i) => [DAY_X[i], 120 - d[USER_BOB_ID] * 1.2]);

  document.querySelector('.trend-line.you').setAttribute('d', smoothPath(youPts));
  document.querySelector('.trend-line.bob').setAttribute('d', smoothPath(bobPts));
}


document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${tab.dataset.tab}`).classList.remove('hidden');

    if (tab.dataset.tab === 'dashboard') {
      renderDashboard();
    }
  });
});

document.querySelectorAll('.user-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.user-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeUserId = pill.classList.contains('you') ? USER_YOU_ID : USER_BOB_ID;
  });
});

const CHORE_WEIGHTS = {
  'Dishes': 2,
  'Take out trash': 1,
  'Vacuum': 3,
  'Deep clean bathroom': 5,
  'Laundry': 3,
  'Wipe counters': 1,
};

const toast = document.getElementById('log-toast');
document.querySelectorAll('.chore-chip').forEach(chip => {
  chip.addEventListener('click', async () => {
    const choreName = chip.querySelector('.chore-name').textContent;
    const chore = { id: choreName.toLowerCase().replace(/\s+/g, '-'), name: choreName, defaultWeight: CHORE_WEIGHTS[choreName] ?? 1 };

    // Optimistic UI feedback
    const loggedClass = activeUserId === USER_YOU_ID ? 'logged-you' : 'logged-bob';
    chip.classList.add(loggedClass);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);

    try {
      await logChore(activeUserId, chore);
    } catch (err) {
      console.error('Failed to log chore:', err);
      chip.classList.remove(loggedClass);
    }
  });
});

document.getElementById('get-started').addEventListener('click', () => {
  document.getElementById('screen-landing').classList.add('hidden');
  document.getElementById('tabs').classList.remove('hidden');
  document.getElementById('screen-log').classList.remove('hidden');
  document.getElementById('back-to-landing').classList.remove('hidden');
});

document.getElementById('back-to-landing').addEventListener('click', () => {
  document.getElementById('screen-log').classList.add('hidden');
  document.getElementById('tabs').classList.add('hidden');
  document.getElementById('screen-landing').classList.remove('hidden');
  document.getElementById('back-to-landing').classList.add('hidden');
});
