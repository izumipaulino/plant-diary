// Mini Canvas chart renderer
export function drawGrowthChart(canvas, entries, maxVal, color) {
  if (!canvas || entries.length < 2) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth * 2;
  const h = canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const cw = w / 2, ch = h / 2;

  const points = entries.slice(-20).map(e => ({
    x: (e.day / entries[entries.length - 1].day) * cw,
    y: ch - (e.height / maxVal) * ch * 0.9
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, color + '30');
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  ctx.moveTo(points[0].x, ch);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, ch);
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i - 1].x + points[i].x) / 2;
    const yc = (points[i - 1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // End dot
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
