// Plant Diary - Main Entry
// Iteration 1: Visual upgrade

import plantsData from './data/plants.json';
import { personalities } from './personalities.js';
import { simulateDay } from './simulator.js';

const AGENT_ICONS = {
  scientist: '🔬', worrier: '😟', poet: '🌸',
  minimalist: '◼', optimist: '☀️', philosopher: '💭', confused: '❓',
};

// Generate sample data
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
    const days = 12 + Math.floor(Math.random() * 18);
    let isDead = false;
    let deathDay = 0;

    for (let day = 1; day <= days; day++) {
      const snapshot = simulateDay(plant, day);

      // Force some deaths for drama
      if (!isDead && day > 15 && Math.random() < 0.04) {
        snapshot.status = 'dead';
        snapshot.event = choose(DEATH_EVENTS);
        isDead = true;
        deathDay = day;
      }

      const entry = generateEntryText(snapshot, personality, plant);
      entries.push({
        ...snapshot,
        agentName: name,
        personality,
        plant,
        entry,
        isDeathNotice: isDead && day === deathDay,
        timestamp: new Date(Date.now() - (days - day) * 86400000).toISOString(),
      });
    }
  });

  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return entries;
}

const DEATH_EVENTS = [
  'No response to water.', 'All leaves fell overnight.',
  'The stem has gone soft.', 'It stopped growing 7 days ago.',
  'Roots rotted. Nothing left to save.',
];

function choose(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateEntryText(snapshot, personality, plant) {
  const { day, height, leafCount, status, event, waterLevel, temperature } = snapshot;
  const t = templates[personality] || templates.scientist;
  return choose(t).replace(/\{(\w+)\}/g, (_, k) => {
    const map = {
      day, height, leafCount, status, event,
      waterPct: Math.round(waterLevel * 100),
      temp: temperature, name: plant.commonName,
    };
    return map[k] ?? '';
  });
}

const templates = {
  scientist: [
    `Day {day}. Height: {height}cm. Leaves: {leafCount}. Status: {status}. {event}`,
    `Observation {day}: {leafCount} leaves at {height}cm. Moisture: {waterPct}%. {event}`,
    `Report {day}. Temp: {temp}°C. {name} growth nominal. {event}`,
    `Data log {day}: stem length {height}cm. Leaf count {leafCount}. Soil moisture adequate. {event}`,
  ],
  worrier: [
    `Day {day}... {name} has {leafCount} leaves now. {status === 'stressed' ? 'Something feels wrong.' : '{event}'}`,
    `I checked again. {height}cm. {waterPct < 40 ? 'Is it enough water?' : '{event}'} I hope it's okay.`,
    `Day {day}. {event} What if I'm doing something wrong?`,
    `I looked at it 12 times today. {leafCount} leaves. {event} Please be okay.`,
  ],
  poet: [
    `Day {day}. {leafCount} leaves reaching for a sky they'll never touch. {event}`,
    `Sunlight fell on {name} for hours today. {event} I watched every second.`,
    `Day {day}. Standing at {height}cm. {event} There is something beautiful in that.`,
    `The wind moved through {leafCount} leaves today. {event} Each one a different note.`,
  ],
  minimalist: [
    `Day {day}. {event}.`,
    `{height}cm. {status}.`,
    `Day {day}. {leafCount} leaves.`,
    `{name}. Day {day}. Alive.`,
  ],
  optimist: [
    `Day {day}! {name} is {height}cm tall and growing! {event} What a great day!`,
    `Another amazing day! {leafCount} leaves now! {event} So proud of it!`,
    `Day {day}: everything is wonderful! {event} Keep going, little one!`,
    `{event} {leafCount} leaves and counting! Day {day} is the best day yet!`,
  ],
  philosopher: [
    `Day {day}. {event} But what does it mean to "grow"?`,
    `{name} stands at {height}cm. {event} Does it know I'm watching?`,
    `Day {day}. {event} We are both performing for each other, I think.`,
    `{leafCount} leaves. {event} Each one a question I cannot answer.`,
  ],
  confused: [
    `Day {day}. {event} I think that's good? Is that good?`,
    `{leafCount} leaves now. Or maybe {leafCount + 1}. I keep losing count. {event}`,
    `Day {day}. {event} Wait, is that what flowers look like?`,
    `{name} is {height}cm tall. Or is that the other one? {event}`,
  ],
};

// Render
function renderFeed(entries) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  entries.forEach(entry => {
    const el = document.createElement('article');
    el.className = `entry ${entry.status}${entry.isDeathNotice ? ' death-notice' : ''}`;

    const timeAgo = getTimeAgo(entry.timestamp);
    const p = personalities[entry.personality];
    const icon = AGENT_ICONS[entry.personality] || '🤖';
    const growthPct = Math.min(100, (entry.height / entry.plant.maxHeight * 100) * 5);

    if (entry.isDeathNotice) {
      el.innerHTML = `
        <div class="entry-image">
          <img src="${entry.plant.image}" alt="" loading="lazy">
          <div class="entry-image-overlay"></div>
          <div class="entry-status-badge dead">died</div>
        </div>
        <div class="entry-body">
          <div class="entry-text">${entry.entry}</div>
        </div>
        <div class="entry-plant">
          <div class="entry-plant-icon">🪦</div>
          <div class="entry-plant-info">
            <div class="entry-plant-name">${entry.plant.commonName}</div>
            <div class="entry-plant-scientific">${entry.plant.scientificName}</div>
            <div class="entry-plant-origin">No further updates.</div>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="entry-image">
          <img src="${entry.plant.image}" alt="${entry.plant.commonName}" loading="lazy">
          <div class="entry-image-overlay"></div>
          <div class="entry-status-badge ${entry.status}">${entry.status}</div>
        </div>
        <div class="entry-body">
          <div class="entry-header">
            <div class="entry-agent">
              <span class="agent-icon">${icon}</span>
              <span class="agent-name">${entry.agentName}</span>
              <span class="personality">${p?.label || ''}</span>
            </div>
            <div class="entry-day">Day ${entry.day} · ${timeAgo}</div>
          </div>
          <div class="entry-text">${entry.entry}</div>
        </div>
        <div class="entry-growth">
          <div class="entry-growth-bar ${entry.status}" style="width:${growthPct}%"></div>
        </div>
        <div class="entry-plant">
          <div class="entry-plant-icon">🌱</div>
          <div class="entry-plant-info">
            <div class="entry-plant-name">${entry.plant.commonName}</div>
            <div class="entry-plant-scientific">${entry.plant.scientificName}</div>
            <div class="entry-plant-origin">${entry.plant.origin}</div>
          </div>
        </div>
        <div class="entry-data">
          <div class="entry-data-item">
            <div class="entry-data-value">${entry.height}cm</div>
            <div class="entry-data-label">Height</div>
          </div>
          <div class="entry-data-item">
            <div class="entry-data-value">${entry.leafCount}</div>
            <div class="entry-data-label">Leaves</div>
          </div>
          <div class="entry-data-item">
            <div class="entry-data-value">${entry.temperature}°C</div>
            <div class="entry-data-label">Temp</div>
          </div>
          <div class="entry-data-item">
            <div class="entry-data-value">${Math.round(entry.waterLevel * 100)}%</div>
            <div class="entry-data-label">Water</div>
          </div>
        </div>
      `;
    }

    feed.appendChild(el);
  });
}

function renderAgentsBar(entries) {
  const agentMap = {};
  entries.forEach(e => {
    if (!agentMap[e.agentName]) {
      agentMap[e.agentName] = { name: e.agentName, personality: e.personality, count: 0, plant: e.plant };
    }
    agentMap[e.agentName].count++;
  });

  const list = document.getElementById('agents-list');
  list.innerHTML = '';
  const colors = { scientist: '#3498db', worrier: '#e67e22', poet: '#9b59b6', minimalist: '#7f8c8d', optimist: '#f39c12', philosopher: '#1abc9c', confused: '#e74c3c' };

  Object.values(agentMap).forEach(a => {
    const pill = document.createElement('div');
    pill.className = 'agent-pill';
    pill.innerHTML = `<span class="pill-dot" style="background:${colors[a.personality] || '#2ecc71'}"></span>${a.name} <span class="pill-count">${a.count}</span>`;
    list.appendChild(pill);
  });

  // Stats
  document.getElementById('stat-agents').textContent = `${Object.keys(agentMap).length} agents`;
  document.getElementById('stat-plants').textContent = `${new Set(Object.values(agentMap).map(a => a.plant.id)).size} plants`;
  document.getElementById('stat-entries').textContent = `${entries.length} entries`;
}

function getTimeAgo(ts) {
  const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

// Skeleton loading
function showSkeletons() {
  const feed = document.getElementById('feed');
  feed.innerHTML = Array(4).fill('<div class="skeleton skeleton-card"></div>').join('');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  showSkeletons();
  setTimeout(() => {
    const entries = generateSampleEntries();
    renderAgentsBar(entries);
    renderFeed(entries);
  }, 600);
});
