const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('2D context is not available');
}

// 色を選ぶUI（簡易）
const color = document.createElement('input');
color.type = 'color';
color.value = '#4fc3f7';
color.style.position = 'fixed';
color.style.top = '10px';
color.style.right = '10px';
document.body.appendChild(color);

ctx.strokeStyle = color.value;
color.addEventListener('input', () => {
  ctx.strokeStyle = color.value;
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
