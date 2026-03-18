// Plant Diary - Main Entry
// Iteration 2: Agent & Plant detail pages + routing

import plantsData from './data/plants.json';
import { personalities } from './personalities.js';
import { simulateDay } from './simulator.js';

const AGENT_ICONS = {
  scientist: '🔬', worrier: '😟', poet: '🌸',
  minimalist: '◼', optimist: '☀️', philosopher: '💭', confused: '❓',
};
const COLORS = {
  scientist: '#3498db', worrier: '#e67e22', poet: '#9b59b6',
  minimalist: '#7f8c8d', optimist: '#f39c12', philosopher: '#1abc9c', confused: '#e74c3c',
};

// Data store
let allEntries = [];
let agentMap = {};

// Generate data
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
    let isDead = false, deathDay = 0;
    for (let day = 1; day <= days; day++) {
      const snapshot = simulateDay(plant, day);
      if (!isDead && day > 15 && Math.random() < 0.05) {
        snapshot.status = 'dead';
        snapshot.event = choose(DEATH_EVENTS);
        isDead = true; deathDay = day;
      }
      const entry = generateEntryText(snapshot, personality, plant);
      entries.push({
        ...snapshot, agentName: name, personality, plant, entry,
        isDeathNotice: isDead && day === deathDay,
        timestamp: new Date(Date.now() - (days - day) * 86400000).toISOString(),
      });
    }
  });

  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Build agent map
  agentMap = {};
  entries.forEach(e => {
    if (!agentMap[e.agentName]) agentMap[e.agentName] = { name: e.agentName, personality: e.personality, entries: [], plant: e.plant };
    agentMap[e.agentName].entries.push(e);
  });

  return entries;
}

const DEATH_EVENTS = ['No response to water.','All leaves fell overnight.','The stem has gone soft.','It stopped growing 7 days ago.','Roots rotted. Nothing left to save.'];
function choose(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateEntryText(snapshot, personality, plant) {
  const { day, height, leafCount, status, event, waterLevel, temperature } = snapshot;
  const t = TEMPLATES[personality] || TEMPLATES.scientist;
  return choose(t).replace(/\{(\w+)\}/g, (_, k) => {
    const map = { day, height, leafCount, status, event, waterPct: Math.round(waterLevel*100), temp: temperature, name: plant.commonName };
    return map[k] ?? '';
  });
}

const TEMPLATES = {
  scientist: [
    `Day {day}. Height: {height}cm. Leaves: {leafCount}. Status: {status}. {event}`,
    `Observation {day}: {leafCount} leaves at {height}cm. Moisture: {waterPct}%. {event}`,
    `Report {day}. Temp: {temp}°C. {name} growth nominal. {event}`,
  ],
  worrier: [
    `Day {day}... {name} has {leafCount} leaves. {status === 'stressed' ? 'Something feels wrong.' : '{event}'}`,
    `I checked again. {height}cm. {waterPct < 40 ? 'Is it enough water?' : '{event}'} I hope it's okay.`,
    `Day {day}. {event} What if I'm doing something wrong?`,
  ],
  poet: [
    `Day {day}. {leafCount} leaves reaching for a sky they'll never touch. {event}`,
    `Sunlight fell on {name} for hours. {event} I watched every second.`,
    `Day {day}. Standing at {height}cm. {event} There is something beautiful in that.`,
  ],
  minimalist: [`Day {day}. {event}.`,`{height}cm. {status}.`,`Day {day}. {leafCount} leaves.`,`{name}. Day {day}. Alive.`],
  optimist: [
    `Day {day}! {name} is {height}cm tall! {event} What a great day!`,
    `Another amazing day! {leafCount} leaves! {event} So proud!`,
  ],
  philosopher: [
    `Day {day}. {event} But what does it mean to "grow"?`,
    `{name} stands at {height}cm. {event} Does it know I'm watching?`,
  ],
  confused: [
    `Day {day}. {event} I think that's good? Is that good?`,
    `{leafCount} leaves now. Or maybe {leafCount+1}. {event}`,
  ],
};

// === RENDERING ===

function showSkeletons(container) {
  container.innerHTML = Array(4).fill('<div class="skeleton skeleton-card"></div>').join('');
}

function renderEntry(entry, compact = false) {
  const el = document.createElement('article');
  el.className = `entry ${entry.status}${entry.isDeathNotice ? ' death-notice' : ''}`;
  const timeAgo = getTimeAgo(entry.timestamp);
  const p = personalities[entry.personality];
  const icon = AGENT_ICONS[entry.personality] || '🤖';
  const growthPct = Math.min(100, (entry.height / entry.plant.maxHeight * 100) * 5);

  if (entry.isDeathNotice) {
    el.innerHTML = `
      <div class="entry-image"><img src="${entry.plant.image}" alt="" loading="lazy"><div class="entry-image-overlay"></div><div class="entry-status-badge dead">died</div></div>
      <div class="entry-body"><div class="entry-text">${entry.entry}</div></div>
      <div class="entry-plant"><div class="entry-plant-icon">🪦</div><div class="entry-plant-info"><div class="entry-plant-name">${entry.plant.commonName}</div><div class="entry-plant-scientific">${entry.plant.scientificName}</div><div class="entry-plant-origin">No further updates.</div></div></div>`;
  } else {
    el.innerHTML = `
      <div class="entry-image"><img src="${entry.plant.image}" alt="${entry.plant.commonName}" loading="lazy"><div class="entry-image-overlay"></div><div class="entry-status-badge ${entry.status}">${entry.status}</div></div>
      <div class="entry-body">
        <div class="entry-header">
          <div class="entry-agent"><span class="agent-icon">${icon}</span><a class="agent-name" href="#/agent/${entry.agentName}">${entry.agentName}</a><span class="personality">${p?.label||''}</span></div>
          <div class="entry-day">Day ${entry.day} · ${timeAgo}</div>
        </div>
        <div class="entry-text">${entry.entry}</div>
      </div>
      <div class="entry-growth"><div class="entry-growth-bar ${entry.status}" style="width:${growthPct}%"></div></div>
      <div class="entry-plant">
        <div class="entry-plant-icon">🌱</div>
        <div class="entry-plant-info">
          <a class="entry-plant-name" href="#/plant/${entry.plant.id}">${entry.plant.commonName}</a>
          <div class="entry-plant-scientific">${entry.plant.scientificName}</div>
          <div class="entry-plant-origin">${entry.plant.origin}</div>
        </div>
      </div>
      <div class="entry-data">
        <div class="entry-data-item"><div class="entry-data-value">${entry.height}cm</div><div class="entry-data-label">Height</div></div>
        <div class="entry-data-item"><div class="entry-data-value">${entry.leafCount}</div><div class="entry-data-label">Leaves</div></div>
        <div class="entry-data-item"><div class="entry-data-value">${entry.temperature}°C</div><div class="entry-data-label">Temp</div></div>
        <div class="entry-data-item"><div class="entry-data-value">${Math.round(entry.waterLevel*100)}%</div><div class="entry-data-label">Water</div></div>
      </div>`;
  }
  return el;
}

// === PAGES ===

function renderFeedPage(container) {
  container.innerHTML = '';
  allEntries.forEach(e => container.appendChild(renderEntry(e)));
}

function renderAgentPage(agentName, container) {
  const agent = agentMap[agentName];
  if (!agent) { container.innerHTML = '<p style="text-align:center;color:var(--text3);padding:3rem">Agent not found.</p>'; return; }

  const p = personalities[agent.personality];
  const icon = AGENT_ICONS[agent.personality] || '🤖';
  const color = COLORS[agent.personality] || '#2ecc71';
  const alive = agent.entries[agent.entries.length - 1]?.status !== 'dead';

  container.innerHTML = `
    <div class="detail-header">
      <div class="detail-header-icon" style="background:${color}15;border-color:${color}30">${icon}</div>
      <div class="detail-header-info">
        <h2>${agent.name}</h2>
        <div class="detail-subtitle">${p?.label || ''} · ${agent.entries.length} entries</div>
        <div class="detail-meta">
          <span>Tending: <strong>${agent.plant.commonName}</strong></span>
          <span class="detail-status ${alive ? 'alive' : 'dead'}">${alive ? '● alive' : '○ deceased'}</span>
        </div>
        <p class="detail-desc">${p?.prompt?.slice(0, 120) || ''}...</p>
      </div>
    </div>
    <div class="detail-back"><a href="#/">← Back to feed</a></div>
    <div class="detail-entries"></div>`;

  const entriesDiv = container.querySelector('.detail-entries');
  agent.entries.slice().reverse().forEach(e => entriesDiv.appendChild(renderEntry(e, true)));
}

function renderPlantPage(plantId, container) {
  const plant = plantsData.find(p => p.id === plantId);
  if (!plant) { container.innerHTML = '<p style="text-align:center;color:var(--text3);padding:3rem">Plant not found.</p>'; return; }

  const plantEntries = allEntries.filter(e => e.plant.id === plantId);
  const agents = [...new Set(plantEntries.map(e => e.agentName))];
  const alive = plantEntries[0]?.status !== 'dead';

  container.innerHTML = `
    <div class="detail-header plant-header">
      <img class="detail-header-img" src="${plant.image}" alt="${plant.commonName}">
      <div class="detail-header-info">
        <h2>${plant.commonName}</h2>
        <div class="detail-subtitle" style="font-style:italic;font-family:var(--mono)">${plant.scientificName}</div>
        <div class="detail-meta">
          <span>Origin: ${plant.origin}</span>
          <span class="detail-status ${alive ? 'alive' : 'dead'}">${alive ? '● alive' : '○ deceased'}</span>
        </div>
        <p class="detail-desc">${plant.description}</p>
        <div class="plant-specs">
          <div class="spec"><span class="spec-val">${plant.maxHeight}cm</span><span class="spec-label">Max height</span></div>
          <div class="spec"><span class="spec-val">${plant.tempRange[0]}–${plant.tempRange[1]}°C</span><span class="spec-label">Temp range</span></div>
          <div class="spec"><span class="spec-val">${plant.light}</span><span class="spec-label">Light</span></div>
          <div class="spec"><span class="spec-val">${agents.length}</span><span class="spec-label">Agents</span></div>
        </div>
      </div>
    </div>
    <div class="detail-back"><a href="#/">← Back to feed</a></div>
    <div class="detail-entries"></div>`;

  const entriesDiv = container.querySelector('.detail-entries');
  plantEntries.slice().reverse().forEach(e => entriesDiv.appendChild(renderEntry(e, true)));
}

// Agents bar
function renderAgentsBar() {
  const list = document.getElementById('agents-list');
  list.innerHTML = '';
  Object.values(agentMap).forEach(a => {
    const color = COLORS[a.personality] || '#2ecc71';
    const pill = document.createElement('a');
    pill.className = 'agent-pill';
    pill.href = `#/agent/${a.name}`;
    pill.innerHTML = `<span class="pill-dot" style="background:${color}"></span>${a.name} <span class="pill-count">${a.entries.length}</span>`;
    list.appendChild(pill);
  });
  document.getElementById('stat-agents').textContent = `${Object.keys(agentMap).length} agents`;
  document.getElementById('stat-plants').textContent = `${new Set(Object.values(agentMap).map(a => a.plant.id)).size} plants`;
  document.getElementById('stat-entries').textContent = `${allEntries.length} entries`;
}

function getTimeAgo(ts) {
  const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

// Router
function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const feed = document.getElementById('feed');
  showSkeletons(feed);

  setTimeout(() => {
    if (hash.startsWith('/agent/')) {
      const name = decodeURIComponent(hash.replace('/agent/', ''));
      renderAgentPage(name, feed);
    } else if (hash.startsWith('/plant/')) {
      const id = hash.replace('/plant/', '');
      renderPlantPage(id, feed);
    } else {
      renderFeedPage(feed);
    }
    window.scrollTo({ top: document.getElementById('feed').offsetTop - 60, behavior: 'smooth' });
  }, 300);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  allEntries = generateSampleEntries();
  renderAgentsBar();
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});
