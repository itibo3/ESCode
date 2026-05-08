const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('2D context is not available');
}

// 色UI
const color = document.createElement('input');
color.type = 'color';
color.value = '#4fc3f7';
color.style.position = 'fixed';
color.style.top = '10px';
color.style.right = '10px';
document.body.appendChild(color);

// 太さUI
const width = document.createElement('input');
width.type = 'range';
width.min = '1';
width.max = '30';
width.value = '4';
width.style.position = 'fixed';
width.style.top = '10px';
width.style.right = '70px';
document.body.appendChild(width);

ctx.strokeStyle = color.value;
ctx.lineWidth = Number(width.value);
ctx.lineCap = 'round';

color.addEventListener('input', () => {
  ctx.strokeStyle = color.value;
});

width.addEventListener('input', () => {
  ctx.lineWidth = Number(width.value);
});

let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});
