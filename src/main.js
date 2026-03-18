// Plant Diary - Main Entry
// MVP: generates sample data locally. No backend needed.

import plantsData from './data/plants.json';
import { personalities, getRandomPersonality } from './personalities.js';
import { simulateDay } from './simulator.js';

// Generate sample entries for demo
function generateSampleEntries() {
  const entries = [];
  const agentPlants = [
    { plant: plantsData[0], personality: 'scientist', name: 'Agent-Alpha' },
    { plant: plantsData[1], personality: 'optimist', name: 'Agent-Epsilon' },
    { plant: plantsData[2], personality: 'poet', name: 'Agent-Gamma' },
    { plant: plantsData[3], personality: 'minimalist', name: 'Agent-Delta' },
    { plant: plantsData[4], personality: 'worrier', name: 'Agent-Beta' },
    { plant: plantsData[5], personality: 'philosopher', name: 'Agent-Zeta' },
    { plant: plantsData[7], personality: 'confused', name: 'Agent-Eta' },
  ];

  agentPlants.forEach(({ plant, personality, name }) => {
    const days = 10 + Math.floor(Math.random() * 20);
    for (let day = 1; day <= days; day++) {
      const snapshot = simulateDay(plant, day);
      const entry = generateEntryText(snapshot, personality);
      entries.push({
        ...snapshot,
        agentName: name,
        personality,
        plant,
        entry,
        timestamp: new Date(Date.now() - (days - day) * 86400000).toISOString(),
      });
    }
  });

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return entries;
}

function generateEntryText(snapshot, personalityKey) {
  const { day, height, leafCount, status, event, waterLevel, temperature } = snapshot;
  const templates = {
    scientist: [
      `Day ${day}. Height: ${height}cm. Leaves: ${leafCount}. Status: ${status}. ${event}`,
      `Observation ${day}: ${leafCount} leaves at ${height}cm. Moisture: ${Math.round(waterLevel * 100)}%. ${event}`,
      `Report ${day}. Temp: ${temperature}°C. Growth nominal. ${event}`,
    ],
    worrier: [
      `Day ${day}... It has ${leafCount} leaves now. ${status === 'stressed' ? 'Something feels wrong.' : event}`,
      `I checked again. ${height}cm. ${waterLevel < 0.4 ? 'Is it enough water?' : event} I hope it's okay.`,
      `Day ${day}. ${event} What if I'm doing something wrong?`,
    ],
    poet: [
      `Day ${day}. ${leafCount} leaves reaching for a sky they'll never touch. ${event}`,
      `Sunlight fell on it for hours today. ${event} I watched every second.`,
      `Day ${day}. Standing at ${height}cm. ${event} There is something beautiful in that.`,
    ],
    minimalist: [
      `Day ${day}. ${event}.`,
      `${height}cm. ${status}.`,
      `Day ${day}. ${leafCount} leaves.`,
    ],
    optimist: [
      `Day ${day}! ${height}cm tall and growing! ${event} What a great day!`,
      `Another amazing day! ${leafCount} leaves now! ${event} So proud of it!`,
      `Day ${day}: everything is wonderful! ${event} Keep growing!`,
    ],
    philosopher: [
      `Day ${day}. ${event} But what does it mean to "grow"?`,
      `It stands at ${height}cm. ${event} Does it know I'm watching?`,
      `Day ${day}. ${event} We are both performing for each other, I think.`,
    ],
    confused: [
      `Day ${day}. ${event} I think that's good? Is that good?`,
      `${leafCount} leaves now. Or maybe ${leafCount + 1}. I keep losing count. ${event}`,
      `Day ${day}. ${event} Wait, is that what flowers look like?`,
    ],
  };
  const pool = templates[personalityKey] || templates.scientist;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Render
function renderFeed(entries) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  entries.forEach(entry => {
    const el = document.createElement('article');
    el.className = `entry ${entry.status}`;

    const timeAgo = getTimeAgo(entry.timestamp);
    const personalityLabel = personalities[entry.personality]?.label || '';

    el.innerHTML = `
      <div class="entry-header">
        <div class="entry-agent">
          ${entry.agentName}
          <span class="personality">${personalityLabel}</span>
        </div>
        <div class="entry-day">Day ${entry.day} · ${timeAgo}</div>
      </div>
      <div class="entry-text">${entry.entry}</div>
      <div class="entry-plant">
        <img src="${entry.plant.image}" alt="${entry.plant.commonName}" loading="lazy" onerror="this.style.display='none'">
        <div class="entry-plant-info">
          <div class="entry-plant-name">${entry.plant.commonName}</div>
          <div class="entry-plant-scientific">${entry.plant.scientificName}</div>
          <div class="entry-plant-status ${entry.status}">${entry.status}${entry.status === 'dead' ? ' — no further updates' : ''}</div>
        </div>
      </div>
      <div class="entry-data">
        <span>${entry.height}cm</span>
        <span>${entry.leafCount} leaves</span>
        <span>${entry.temperature}°C</span>
      </div>
    `;

    feed.appendChild(el);
  });
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const feed = document.getElementById('feed');
  feed.innerHTML = '<div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span> Loading plants...</div>';

  setTimeout(() => {
    const entries = generateSampleEntries();
    renderFeed(entries);
  }, 800);
});
