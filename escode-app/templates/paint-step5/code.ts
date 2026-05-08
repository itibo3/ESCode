const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('2D context is not available');
}

// UI helper
const createUi = () => {
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.top = '10px';
  wrap.style.right = '10px';
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.alignItems = 'center';
  wrap.style.background = 'rgba(15, 23, 42, 0.65)';
  wrap.style.border = '1px solid rgba(148, 163, 184, 0.25)';
  wrap.style.padding = '6px 8px';
  wrap.style.borderRadius = '8px';
  document.body.appendChild(wrap);

  const color = document.createElement('input');
  color.type = 'color';
  color.value = '#4fc3f7';

  const width = document.createElement('input');
  width.type = 'range';
  width.min = '1';
  width.max = '30';
  width.value = '4';

  const eraser = document.createElement('button');
  eraser.textContent = 'Eraser';

  const clear = document.createElement('button');
  clear.textContent = 'Clear';

  for (const el of [eraser, clear]) {
    el.style.background = '#1e293b';
    el.style.border = '1px solid rgba(148, 163, 184, 0.25)';
    el.style.color = '#e2e8f0';
    el.style.borderRadius = '6px';
    el.style.padding = '4px 10px';
    el.style.cursor = 'pointer';
  }

  wrap.appendChild(eraser);
  wrap.appendChild(clear);
  wrap.appendChild(width);
  wrap.appendChild(color);

  return { color, width, eraser, clear };
};

const ui = createUi();

let isEraser = false;
ui.eraser.addEventListener('click', () => {
  isEraser = !isEraser;
  ui.eraser.textContent = isEraser ? 'Pen' : 'Eraser';
});

ui.clear.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

ctx.strokeStyle = ui.color.value;
ctx.lineWidth = Number(ui.width.value);
ctx.lineCap = 'round';

ui.color.addEventListener('input', () => {
  ctx.strokeStyle = ui.color.value;
});
ui.width.addEventListener('input', () => {
  ctx.lineWidth = Number(ui.width.value);
});

let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});
