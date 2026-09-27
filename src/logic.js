export function calculateSplit(logs, userAId, userBId) {
  const totals = { [userAId]: 0, [userBId]: 0 };
  logs.forEach(log => {
    if (totals[log.userId] !== undefined) totals[log.userId] += log.weight;
  });
  const total = totals[userAId] + totals[userBId];
  if (total === 0) return { [userAId]: 50, [userBId]: 50 };

  return {
    [userAId]: Math.round((totals[userAId] / total) * 100),
    [userBId]: Math.round((totals[userBId] / total) * 100),
  };
}

export function calculateDailyTrend(logs, userAId, userBId) {
  const byDay = {};
  logs.forEach(log => {
    const day = log.timestamp.slice(0, 10);
    if (!byDay[day]) byDay[day] = { [userAId]: 0, [userBId]: 0 };
    byDay[day][log.userId] += log.weight;
  });

  // Build the Mon–Sun dates for the current ISO week so every day slot is present
  const today = new Date();
  // dayOfWeek: 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const dow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return weekDays.map(day => {
    const vals = byDay[day] ?? { [userAId]: 0, [userBId]: 0 };
    const total = vals[userAId] + vals[userBId];
    return {
      day,
      [userAId]: total ? Math.round((vals[userAId] / total) * 100) : 50,
      [userBId]: total ? Math.round((vals[userBId] / total) * 100) : 50,
    };
  });
}

const nudgeTemplates = {
  low: ["Nicely balanced this week 👌", "You two are pretty even right now."],
  mid: [
    (name) => `Heads up, the scale's tipping ${name}'s way this week.`,
    (name) => `${name} might appreciate a hand — things have leaned their way lately.`,
  ],
  high: [
    (name) => `It's been a lopsided week — might be a good time to swap a chore with ${name}.`,
    (name) => `${name}'s been carrying a lot lately. Maybe pick up something today?`,
  ],
};

export function getNudge(split, userAId, userBId, names) {
  const gap = Math.abs(split[userAId] - split[userBId]);
  const leaderId = split[userAId] > split[userBId] ? userAId : userBId;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (gap < 10) return pick(nudgeTemplates.low);
  if (gap < 25) return pick(nudgeTemplates.mid)(names[leaderId]);
  return pick(nudgeTemplates.high)(names[leaderId]);
}