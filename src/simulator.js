// Plant Simulator - generates daily data snapshots based on real plant parameters

const EVENTS = {
  positive: [
    { text: 'A new leaf unfurled today.', weight: 3 },
    { text: 'Growing steadily toward the light.', weight: 2 },
    { text: 'The stem feels stronger than yesterday.', weight: 2 },
    { text: 'A small bud appeared.', weight: 1 },
    { text: 'Roots expanding deeper into the soil.', weight: 2 },
  ],
  neutral: [
    { text: 'A quiet day. No visible changes.', weight: 3 },
    { text: 'Standing still. Waiting.', weight: 2 },
    { text: 'The wind was gentle today.', weight: 1 },
    { text: 'Leaves catching whatever light comes through.', weight: 2 },
  ],
  negative: [
    { text: 'One leaf turned yellow at the edge.', weight: 2 },
    { text: 'A small insect was spotted on the stem.', weight: 1 },
    { text: 'The soil feels drier than usual.', weight: 2 },
    { text: 'Drooping slightly. Needs water.', weight: 2 },
    { text: 'A branch was damaged by wind.', weight: 1 },
  ],
  death: [
    { text: 'No response to water.', weight: 1 },
    { text: 'All leaves fell overnight.', weight: 1 },
    { text: 'The stem has gone soft.', weight: 1 },
    { text: 'It stopped growing 7 days ago.', weight: 1 },
  ],
};

function weightedRandom(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.text;
  }
  return items[0].text;
}

export function simulateDay(plant, day, conditions = {}) {
  const {
    waterLevel = 0.7 + Math.random() * 0.3,
    sunlightHours = 4 + Math.random() * 8,
    temperature = 20 + (Math.random() - 0.5) * 15,
  } = conditions;

  // Growth calculation
  const growthFactor = calculateGrowthFactor(plant, waterLevel, sunlightHours, temperature);
  const dailyGrowth = plant.growthRate * growthFactor;
  const height = Math.min(plant.maxHeight, dailyGrowth * day);
  const leafCount = Math.min(
    plant.maxLeaves,
    Math.floor((day / (plant.maxHeight / plant.growthRate / 30)) * plant.maxLeaves)
  );

  // Status
  let status = 'growing';
  if (growthFactor < 0.1) status = 'stressed';
  if (growthFactor < 0.01) status = 'dying';
  if (height <= 0 && day > 5) status = 'dead';

  // Flowering check
  const currentMonth = (new Date()).getMonth() + 1;
  if (plant.floweringMonth.includes(currentMonth) && day > 60) {
    status = 'flowering';
  }

  // Event selection
  let event;
  if (status === 'dead') {
    event = weightedRandom(EVENTS.death);
  } else if (status === 'dying') {
    event = weightedRandom(EVENTS.negative);
  } else if (status === 'stressed') {
    event = Math.random() > 0.5
      ? weightedRandom(EVENTS.negative)
      : weightedRandom(EVENTS.neutral);
  } else {
    event = Math.random() > 0.3
      ? weightedRandom(EVENTS.positive)
      : weightedRandom(EVENTS.neutral);
  }

  return {
    day,
    height: Math.round(height * 10) / 10,
    leafCount,
    waterLevel: Math.round(waterLevel * 100) / 100,
    sunlightHours: Math.round(sunlightHours * 10) / 10,
    temperature: Math.round(temperature * 10) / 10,
    soilPH: plant.soilPH[0] + Math.random() * (plant.soilPH[1] - plant.soilPH[0]),
    status,
    event,
  };
}

function calculateGrowthFactor(plant, water, sun, temp) {
  let factor = 1.0;

  // Water stress
  if (water < 0.2) factor *= 0.1;
  else if (water < 0.4) factor *= 0.5;
  else if (water > 0.95) factor *= 0.7; // too much water

  // Light
  if (plant.light === 'full-sun' && sun < 4) factor *= 0.4;
  if (plant.light === 'shade' && sun > 10) factor *= 0.6;
  if (plant.light === 'partial' && (sun < 2 || sun > 12)) factor *= 0.5;

  // Temperature
  if (temp < plant.tempRange[0]) factor *= 0.1;
  else if (temp < plant.tempRange[0] + 5) factor *= 0.5;
  if (temp > plant.tempRange[1]) factor *= 0.1;
  else if (temp > plant.tempRange[1] - 5) factor *= 0.5;

  // Random variation
  factor *= (0.8 + Math.random() * 0.4);

  return Math.max(0, Math.min(1, factor));
}

export function generateDays(plant, totalDays) {
  const days = [];
  for (let i = 1; i <= totalDays; i++) {
    days.push(simulateDay(plant, i));
  }
  return days;
}
