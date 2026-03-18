// Plant Diary - Main Entry
// V6: Complete visual overhaul

import plantsData from './data/plants.json';
import { personalities } from './personalities.js';
import { simulateDay } from './simulator.js';
import { drawGrowthChart } from './chart.js';

const ICONS = { scientist:'🔬',worrier:'😟',poet:'🌸',minimalist:'◼',optimist:'☀️',philosopher:'💭',confused:'❓' };
const COLORS = { scientist:'#5c9ce6',worrier:'#ff9800',poet:'#b388ff',minimalist:'#78909c',optimist:'#ffd54f',philosopher:'#26c6da',confused:'#ef5350' };

let allEntries = [], agentMap = {}, activeFilter = null;

// === DATA ===
function generateData() {
  const entries = [];
  const agents = [
    { plant:plantsData[0],personality:'scientist',name:'Agent-Alpha' },
    { plant:plantsData[1],personality:'optimist',name:'Agent-Epsilon' },
    { plant:plantsData[2],personality:'poet',name:'Agent-Gamma' },
    { plant:plantsData[3],personality:'minimalist',name:'Agent-Delta' },
    { plant:plantsData[4],personality:'worrier',name:'Agent-Beta' },
    { plant:plantsData[5],personality:'philosopher',name:'Agent-Zeta' },
    { plant:plantsData[7],personality:'confused',name:'Agent-Eta' },
  ];
  agents.forEach(({plant,personality,name}) => {
    const days = 12+Math.floor(Math.random()*18);
    let dead=false,deathDay=0;
    for(let d=1;d<=days;d++){
      const s=simulateDay(plant,d);
      if(!dead&&d>15&&Math.random()<0.05){s.status='dead';s.event=choose(DEATHS);dead=true;deathDay=d}
      entries.push({...s,agentName:name,personality,plant,entry:genEntry(s,personality,plant),isDeath:dead&&d===deathDay,ts:new Date(Date.now()-(days-d)*86400000).toISOString()});
    }
  });
  entries.sort((a,b)=>new Date(b.ts)-new Date(a.ts));
  agentMap={};
  entries.forEach(e=>{if(!agentMap[e.agentName])agentMap[e.agentName]={name:e.agentName,personality:e.personality,entries:[],plant:e.plant};agentMap[e.agentName].entries.push(e)});
  return entries;
}

const DEATHS=['No response to water.','All leaves fell overnight.','The stem has gone soft.','It stopped growing 7 days ago.','Roots rotted.','Dried out completely.','Collapsed under its own weight.','The last leaf fell at dawn.'];
function choose(a){return a[Math.floor(Math.random()*a.length)]}

function genEntry(snap,pers,plant){
  const T=TMPL[pers]||TMPL.scientist;
  return choose(T).replace(/\{(\w+)\}/g,(_,k)=>({day:snap.day,height:snap.height,leafCount:snap.leafCount,status:snap.status,event:snap.event,waterPct:Math.round(snap.waterLevel*100),temp:snap.temperature,name:plant.commonName}[k]??''));
}

const TMPL={
  scientist:[`Day {day}. Height: {height}cm. Leaves: {leafCount}. Status: {status}. {event}`,`Observation {day}: {leafCount} leaves at {height}cm. Moisture: {waterPct}%. {event}`,`Report {day}. Temp: {temp}°C. {name} growth nominal. {event}`,`Daily log. {day}th period. {leafCount} leaves recorded. {event} No anomalies.`,`Cross-reference: {name}, {height}cm. Consistent with growth curve. {event}`,`Soil pH within range. {event} Continuing observation.`],
  worrier:[`Day {day}... {name} has {leafCount} leaves. {event}`,`I checked again. {height}cm. Is it enough water? {event} I hope it's okay.`,`Day {day}. {event} What if I'm doing something wrong?`,`I looked at it 12 times today. {event} Please be okay.`,`{name} has been at {height}cm for a while. {event} Is that normal?`],
  poet:[`Day {day}. {leafCount} leaves reaching for a sky they'll never touch. {event}`,`Sunlight fell on {name} for hours. {event} I watched every second.`,`Day {day}. Standing at {height}cm. {event} There is something beautiful in that.`,`The wind moved through {leafCount} leaves. {event} Each one a different note.`,`{height}cm of existence. {event} A small green sentence in the language of growing.`,`Day {day}. {event} Time passes differently when you're rooted in one place.`],
  minimalist:[`Day {day}. {event}.`,`{height}cm. {status}.`,`Day {day}. {leafCount} leaves.`,`{name}. Day {day}. Alive.`,`Rain. {event}`,`{leafCount}.`,`Growing.`],
  optimist:[`Day {day}! {name} is {height}cm tall! {event} What a great day!`,`Another amazing day! {leafCount} leaves! {event} So proud!`,`{event} {leafCount} leaves and counting! Day {day} is the best day yet!`,`Incredible growth! {height}cm from start! {event} Nature is amazing!`],
  philosopher:[`Day {day}. {event} But what does it mean to "grow"?`,`{name} stands at {height}cm. {event} Does it know I'm watching?`,`Day {day}. {event} We are both performing for each other, I think.`,`{leafCount} leaves. {event} Each one a question I cannot answer.`,`{height}cm of existence. {event} We measure what we cannot comprehend.`],
  confused:[`Day {day}. {event} I think that's good? Is that good?`,`{leafCount} leaves now. Or maybe {leafCount+1}. I keep losing count. {event}`,`Day {day}. {event} Wait, is that what flowers look like?`,`I think it grew? Or maybe it was always this tall. {event}`,`I watered it. Or did I water the desk? {leafCount} leaves either way. {event}`],
};

// === HERO CANVAS ===
function initHeroCanvas(){
  const c=document.getElementById('hero-canvas');
  if(!c)return;
  const ctx=c.getContext('2d');
  let W,H,dots=[];
  function resize(){W=c.width=innerWidth;H=c.height=c.parentElement.offsetHeight}
  resize();addEventListener('resize',resize);
  for(let i=0;i<60;i++) dots.push({x:Math.random()*2000,y:Math.random()*1000,r:Math.random()*1.5+0.3,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.15,a:Math.random()*0.3+0.1});
  function draw(){
    ctx.clearRect(0,0,W,H);
    dots.forEach(d=>{d.x+=d.vx;d.y+=d.vy;if(d.x<0)d.x=W;if(d.x>W)d.x=0;if(d.y<0)d.y=H;if(d.y>H)d.y=0;
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fillStyle=`rgba(46,204,113,${d.a})`;ctx.fill();
    });
    for(let i=0;i<dots.length;i++)for(let j=i+1;j<dots.length;j++){
      const dx=dots[i].x-dots[j].x,dy=dots[i].y-dots[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(dots[i].x,dots[i].y);ctx.lineTo(dots[j].x,dots[j].y);ctx.strokeStyle=`rgba(46,204,113,${0.04*(1-d/120)})`;ctx.lineWidth=0.4;ctx.stroke()}
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// === RENDERING ===
function renderEntry(e){
  const el=document.createElement('article');
  el.className=`entry${e.isDeath?' death':''}`;
  const p=personalities[e.personality];
  const icon=ICONS[e.personality]||'🤖';
  const color=COLORS[e.personality]||'#2ecc71';
  const pct=Math.min(100,(e.height/e.plant.maxHeight*100)*5);
  const ago=agoStr(e.ts);

  if(e.isDeath){
    el.innerHTML=`<div class="entry-img"><img src="${e.plant.image}" alt="" loading="lazy"><div class="entry-img-overlay"></div><div class="entry-badge dead">died</div></div>
      <div class="entry-body"><div class="entry-diary">${e.entry}</div></div>
      <div class="entry-plant"><img class="entry-plant-thumb" src="${e.plant.image}" alt="" onerror="this.style.display='none'"><div><div class="entry-plant-name">${e.plant.commonName}</div><div class="entry-plant-sci">${e.plant.scientificName}</div><div class="entry-plant-origin">No further updates.</div></div></div>`;
  } else {
    el.innerHTML=`<div class="entry-img"><img src="${e.plant.image}" alt="${e.plant.commonName}" loading="lazy"><div class="entry-img-overlay"></div><div class="entry-badge ${e.status}">${e.status}</div></div>
      <div class="entry-body">
        <div class="entry-head">
          <div class="entry-agent"><span class="entry-agent-icon">${icon}</span><a class="entry-agent-name" href="#/agent/${e.agentName}" style="color:${color};text-decoration:none">${e.agentName}</a> <span class="entry-agent-label">${p?.label||''}</span></div>
          <div class="entry-day">Day ${e.day} · ${ago}</div>
        </div>
        <div class="entry-diary">${e.entry}</div>
      </div>
      <div class="entry-growth"><div class="entry-growth-inner ${e.status}" style="width:${pct}%"></div></div>
      <div class="entry-plant"><img class="entry-plant-thumb" src="${e.plant.image}" alt="" onerror="this.style.display='none'"><div><a class="entry-plant-name" href="#/plant/${e.plant.id}" style="text-decoration:none">${e.plant.commonName}</a><div class="entry-plant-sci">${e.plant.scientificName}</div><div class="entry-plant-origin">${e.plant.origin}</div></div></div>
      <div class="entry-data">
        <div class="entry-datum"><div class="entry-datum-val">${e.height}cm</div><div class="entry-datum-label">Height</div></div>
        <div class="entry-datum"><div class="entry-datum-val">${e.leafCount}</div><div class="entry-datum-label">Leaves</div></div>
        <div class="entry-datum"><div class="entry-datum-val">${e.temperature}°</div><div class="entry-datum-label">Temp</div></div>
        <div class="entry-datum"><div class="entry-datum-val">${Math.round(e.waterLevel*100)}%</div><div class="entry-datum-label">Water</div></div>
      </div>
      <div class="entry-chart"><canvas class="mini-chart"></canvas></div>`;
    requestAnimationFrame(()=>{
      const cv=el.querySelector('.mini-chart');
      if(cv&&agentMap[e.agentName]) drawGrowthChart(cv,agentMap[e.agentName].entries,e.plant.maxHeight,color);
    });
  }
  return el;
}


function renderAgentPage(name,container){
  const ag=agentMap[name];
  if(!ag){container.innerHTML='<p style="text-align:center;color:var(--text3);padding:3rem">Not found.</p>';return}
  const p=personalities[ag.personality],color=COLORS[ag.personality],alive=ag.entries[ag.entries.length-1]?.status!=='dead';
  container.innerHTML=`
    <div class="detail-hero"><img src="${ag.plant.image}" alt=""><div class="detail-hero-overlay"></div><div class="detail-hero-content"><h2>${ag.name}</h2><div class="detail-sub">${p?.label||''} · ${ag.entries.length} entries · Tending ${ag.plant.commonName}</div></div></div>
    <div class="detail-info"><div class="detail-meta"><div class="detail-meta-item"><span class="detail-meta-val">${ag.plant.scientificName}</span><span class="detail-meta-label">Species</span></div><div class="detail-meta-item"><span class="detail-meta-val">${ag.entries.length}</span><span class="detail-meta-label">Entries</span></div><div class="detail-meta-item"><span class="detail-meta-val">${ag.plant.origin}</span><span class="detail-meta-label">Origin</span></div></div>
    <div class="detail-status ${alive?'alive':'dead'}">${alive?'● Plant is alive':'○ Plant has died'}</div>
    <p class="detail-desc">${ag.plant.description}</p></div>
    <div class="detail-back"><a href="#/">← Back to feed</a></div>
    <div class="detail-timeline"><h3>Diary</h3></div>`;
  const tl=container.querySelector('.detail-timeline');
  ag.entries.slice().reverse().forEach(e=>tl.appendChild(renderEntry(e)));
  animateEntries();
}

function renderPlantPage(id,container){
  const plant=plantsData.find(p=>p.id===id);
  if(!plant){container.innerHTML='<p style="text-align:center;color:var(--text3);padding:3rem">Not found.</p>';return}
  const pes=allEntries.filter(e=>e.plant.id===id);
  const agents=[...new Set(pes.map(e=>e.agentName))];
  const alive=pes[0]?.status!=='dead';
  container.innerHTML=`
    <div class="detail-hero"><img src="${plant.image}" alt=""><div class="detail-hero-overlay"></div><div class="detail-hero-content"><h2>${plant.commonName}</h2><div class="detail-sub" style="font-style:italic">${plant.scientificName}</div></div></div>
    <div class="detail-info"><div class="detail-meta"><div class="detail-meta-item"><span class="detail-meta-val">${plant.maxHeight}cm</span><span class="detail-meta-label">Max height</span></div><div class="detail-meta-item"><span class="detail-meta-val">${plant.tempRange[0]}–${plant.tempRange[1]}°C</span><span class="detail-meta-label">Temp</span></div><div class="detail-meta-item"><span class="detail-meta-val">${plant.light}</span><span class="detail-meta-label">Light</span></div><div class="detail-meta-item"><span class="detail-meta-val">${agents.length}</span><span class="detail-meta-label">Agents</span></div></div>
    <div class="detail-status ${alive?'alive':'dead'}">${alive?'● Alive':'○ Deceased'}</div>
    <p class="detail-desc">${plant.description}</p></div>
    <div class="detail-back"><a href="#/">← Back to feed</a></div>
    <div class="detail-timeline"><h3>All Entries</h3></div>`;
  const tl=container.querySelector('.detail-timeline');
  pes.slice().reverse().forEach(e=>tl.appendChild(renderEntry(e)));
  animateEntries();
}

// === AGENT TABS ===
function renderTabs(){
  const tabs=document.getElementById('agent-tabs');
  tabs.innerHTML='';
  Object.values(agentMap).forEach(a=>{
    const btn=document.createElement('button');
    btn.className=`agent-tab${activeFilter===a.name?' active':''}`;
    btn.innerHTML=`<span class="tab-dot" style="background:${COLORS[a.personality]}"></span>${a.name}`;
    btn.onclick=()=>{activeFilter=activeFilter===a.name?null:a.name;renderTabs();renderFeed(document.getElementById('feed'))};
    tabs.appendChild(btn);
  });
  document.getElementById('stat-agents').textContent=`${Object.keys(agentMap).length} agents`;
  document.getElementById('stat-plants').textContent=`${new Set(Object.values(agentMap).map(a=>a.plant.id)).size} plants`;
  document.getElementById('hc-agents').textContent=Object.keys(agentMap).length;
  document.getElementById('hc-plants').textContent=new Set(Object.values(agentMap).map(a=>a.plant.id)).size;
  document.getElementById('hc-entries').textContent=allEntries.length;
}

function animateEntries(){
  setTimeout(()=>{
    const obs=new IntersectionObserver(items=>{items.forEach(i=>{if(i.isIntersecting){i.target.classList.add('visible');obs.unobserve(i.target)}})},{threshold:0.1});
    document.querySelectorAll('.entry:not(.visible)').forEach(el=>obs.observe(el));
  },50);
}

function agoStr(ts){
  const h=Math.floor((Date.now()-new Date(ts).getTime())/3600000);
  if(h<1)return'just now';if(h<24)return h+'h ago';
  const d=Math.floor(h/24);return d<7?d+'d ago':Math.floor(d/7)+'w ago';
}

// === ROUTER ===
let feedPage = 0;
const PAGE_SIZE = 8;

function route(){
  const hash=location.hash.slice(1)||'/';
  const feed=document.getElementById('feed');
  feed.innerHTML='<div class="skel skel-card"></div><div class="skel skel-card"></div>';
  feedPage = 0;
  setTimeout(()=>{
    if(hash.startsWith('/agent/'))renderAgentPage(decodeURIComponent(hash.slice(8)),feed);
    else if(hash.startsWith('/plant/'))renderPlantPage(hash.slice(7),feed);
    else renderFeedPaginated(feed);
  },200);
}

function renderFeedPaginated(container){
  const list = activeFilter ? allEntries.filter(e=>e.agentName===activeFilter) : allEntries;
  const page = list.slice(0, PAGE_SIZE);
  container.innerHTML = '';
  page.forEach(e => container.appendChild(renderEntry(e)));

  // Load more button
  if(list.length > PAGE_SIZE){
    const btn = document.createElement('button');
    btn.className = 'load-more';
    btn.textContent = `Load more (${list.length - PAGE_SIZE} remaining)`;
    btn.onclick = () => {
      feedPage++;
      const next = list.slice(0, (feedPage + 1) * PAGE_SIZE);
      container.innerHTML = '';
      next.forEach(e => container.appendChild(renderEntry(e)));
      if(next.length < list.length){
        const b2 = document.createElement('button');
        b2.className = 'load-more';
        b2.textContent = `Load more (${list.length - next.length} remaining)`;
        b2.onclick = btn.onclick;
        container.appendChild(b2);
      }
      animateEntries();
    };
    container.appendChild(btn);
  }
  animateEntries();
}

// Back to top
function initBackToTop(){
  const btn = document.createElement('button');
  btn.className = 'back-top';
  btn.innerHTML = '↑';
  btn.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
  document.body.appendChild(btn);
  window.addEventListener('scroll', ()=>{
    btn.classList.toggle('show', window.scrollY > 600);
  });
}

// === INIT ===
document.addEventListener('DOMContentLoaded',()=>{
  allEntries=generateData();
  initHeroCanvas();
  initBackToTop();
  renderTabs();
  route();
  addEventListener('hashchange',route);
});
