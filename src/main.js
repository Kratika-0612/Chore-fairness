import { getWeekLogs } from './appwrite.js';
import { calculateSplit, calculateDailyTrend, getNudge } from './logic.js';
import './style.css';

const USER_NAMES = {
  [USER_YOU_ID]: 'You',
  [USER_BOB_ID]: 'Bob',
};

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

  // Trend chart (simple version using your existing SVG polylines)
  const trend = calculateDailyTrend(logs, USER_YOU_ID, USER_BOB_ID);
  if (trend.length > 0) {
    const width = 320;
    const step = width / Math.max(trend.length - 1, 1);

    const youPoints = trend.map((d, i) => `${i * step},${120 - d[USER_YOU_ID] * 1.2}`).join(' ');
    const bobPoints = trend.map((d, i) => `${i * step},${120 - d[USER_BOB_ID] * 1.2}`).join(' ');

    document.querySelector('.trend-line.you').setAttribute('points', youPoints);
    document.querySelector('.trend-line.bob').setAttribute('points', bobPoints);
  }
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
  });
});

const toast = document.getElementById('log-toast');
document.querySelectorAll('.chore-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
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
