const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

if (!ctx) {
  throw new Error('2D context is not available');
}

ctx.fillStyle = '#7c3aed';
ctx.fillRect(20, 20, 180, 100);
