import './style.css';
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${tab.dataset.tab}`).classList.remove('hidden');
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
});
