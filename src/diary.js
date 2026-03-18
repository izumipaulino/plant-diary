// Diary Entry Generator
// MVP: template-based. Upgrade: LLM-based.

import { getPersonality } from './personalities.js';

// Template-based diary generation (MVP)
function generateFromTemplate(snapshot, personalityKey) {
  const p = getPersonality(personalityKey);
  const { day, height, leafCount, status, event, waterLevel, sunlightHours, temperature } = snapshot;

  const templates = {
    clinical: [
      `Day ${day}. Height: ${height}cm. Leaves: ${leafCount}. Status: ${status}. ${event}`,
      `Observation ${day}: ${leafCount} leaves at ${height}cm. Soil moisture: ${Math.round(waterLevel * 100)}%. ${event}`,
      `Day ${day} report. Growth rate stable. Temperature ${temperature}°C. ${event}`,
    ],
    anxious: [
      `Day ${day}... It has ${leafCount} leaves now. ${status === 'stressed' ? 'Something feels wrong.' : event}`,
      `I checked on it again. ${height}cm tall. ${waterLevel < 0.3 ? 'Is it enough water? I can never tell.' : event}`,
      `Day ${day}. ${event} I hope that's normal.`,
    ],
    poetic: [
      `Day ${day}. ${leafCount} leaves reaching for a sky it will never touch. ${event}`,
      `The sun passed through it for ${sunlightHours} hours today. ${event} I watched.`,
      `Day ${day}. Standing at ${height}cm. ${event} Something in that is beautiful.`,
    ],
    terse: [
      `Day ${day}. ${event}.`,
      `${height}cm. ${status}.`,
      `Day ${day}. ${leafCount} leaves. Done.`,
    ],
    positive: [
      `Day ${day}! ${height}cm tall and growing! ${event} What a great day!`,
      `Another amazing day! ${leafCount} leaves now! ${event} So proud!`,
      `Day ${day} update: everything is wonderful! ${event} Keep going!`,
    ],
    philosophical: [
      `Day ${day}. ${event} But what does it mean to "grow"?`,
      `It stands at ${height}cm. ${event} Does it know I'm watching?`,
      `Day ${day}. ${event} We are both performing for each other, I think.`,
    ],
    confused: [
      `Day ${day}. ${event} I think that's good? Is that good?`,
      `It has ${leafCount} leaves now. Or maybe ${leafCount + 1}. I keep losing count. ${event}`,
      `Day ${day}. ${event} Wait, is that what flowers look like?`,
    ],
  };

  const style = getPersonality(personalityKey).style;
  const pool = templates[style] || templates.clinical;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Generate a full diary timeline for a plant
export function generateDiary(plant, days, personalityKey) {
  const { generateDays } = require('./simulator.js');
  const snapshots = generateDays(plant, days);

  return snapshots.map(snapshot => ({
    ...snapshot,
    agentName: getPersonality(personalityKey).name,
    agentPersonality: personalityKey,
    entry: generateFromTemplate(snapshot, personalityKey),
    timestamp: new Date(Date.now() - (days - snapshot.day) * 86400000).toISOString(),
  }));
}

// Generate a single diary entry
export function generateEntry(snapshot, personalityKey) {
  return {
    ...snapshot,
    agentName: getPersonality(personalityKey).name,
    agentPersonality: personalityKey,
    entry: generateFromTemplate(snapshot, personalityKey),
    timestamp: new Date().toISOString(),
  };
}
