import * as THREE from 'three';
import type { ExtractedFrame } from '../types/frame';

/**
 * Helper to generate crisp, high-resolution procedural video frame textures
 * so users have rich sample videos out of the box!
 */
export function generateSampleFrames(
  preset: 'cyberpunk' | 'neon_sunset' | 'quantum_matrix' = 'cyberpunk',
  frameCount: number = 24,
  intervalSec: number = 0.2,
  resolution: number = 640
): { frames: ExtractedFrame[]; duration: number; aspectRatio: number } {
  const width = resolution;
  const height = Math.round((resolution * 9) / 16); // 16:9 aspect ratio
  const aspectRatio = width / height;
  const frames: ExtractedFrame[] = [];

  for (let i = 0; i < frameCount; i++) {
    const timestamp = i * intervalSec;
    const progress = i / Math.max(1, frameCount - 1);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    drawSamplePreset(ctx, width, height, preset, progress, i, timestamp);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;

    const formattedTime = formatTimestamp(timestamp);

    frames.push({
      id: `sample-${preset}-${i}-${Date.now()}`,
      index: i,
      timestamp,
      formattedTime,
      texture,
      dataUrl,
      width,
      height,
      aspectRatio,
      visible: true,
    });
  }

  const duration = frameCount * intervalSec;
  return { frames, duration, aspectRatio };
}

function drawSamplePreset(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  preset: string,
  progress: number,
  frameIdx: number,
  time: number
) {
  // Clear canvas
  ctx.fillStyle = '#090a10';
  ctx.fillRect(0, 0, w, h);

  if (preset === 'cyberpunk') {
    // Synthwave / Cyberpunk Grid & Sun
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0d0221');
    grad.addColorStop(0.5, '#260845');
    grad.addColorStop(1, '#020b14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Neon Grid Lines
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    const gridY = h * 0.55;
    for (let x = 0; x <= w; x += 40) {
      const perspectiveX = (x - w / 2) * 1.5 + w / 2;
      ctx.moveTo(perspectiveX, gridY);
      ctx.lineTo((x - w / 2) * 4 + w / 2, h);
    }
    const offset = (frameIdx * 8) % 30;
    for (let y = gridY; y <= h; y += 15 + (y - gridY) * 0.1) {
      ctx.moveTo(0, y + offset);
      ctx.lineTo(w, y + offset);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing Sun
    const sunY = h * 0.45;
    const sunRadius = h * 0.22;
    const sunGrad = ctx.createRadialGradient(w / 2, sunY, 5, w / 2, sunY, sunRadius);
    sunGrad.addColorStop(0, '#fffb96');
    sunGrad.addColorStop(0.4, '#ff2a85');
    sunGrad.addColorStop(1, 'rgba(255, 42, 133, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w / 2, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Moving Car / Neon Laser Particle
    const carX = (progress * (w + 100)) - 50;
    ctx.fillStyle = '#00ffcc';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffcc';
    ctx.fillRect(carX, gridY - 10, 40, 12);
    ctx.shadowBlur = 0;

  } else if (preset === 'neon_sunset') {
    // Abstract Flowing Fluid Wave
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#11052C');
    grad.addColorStop(0.5, '#3E065F');
    grad.addColorStop(1, '#700B97');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dynamic wave curves
    ctx.fillStyle = '#8E05C2';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = Math.sin(x * 0.01 + progress * Math.PI * 4) * 40 + h * 0.5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Secondary wave
    ctx.fillStyle = 'rgba(255, 121, 198, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = Math.cos(x * 0.012 - progress * Math.PI * 3) * 50 + h * 0.6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();

    // Floating orb
    const orbX = w * 0.3 + Math.sin(progress * Math.PI * 2) * w * 0.4;
    const orbY = h * 0.3 + Math.cos(progress * Math.PI * 2) * h * 0.15;
    ctx.fillStyle = '#FFB86C';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#FFB86C';
    ctx.beginPath();
    ctx.arc(orbX, orbY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else {
    // Quantum Matrix / Digital Rain
    ctx.fillStyle = '#050a08';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#00ff66';
    ctx.font = '16px monospace';
    const columns = Math.floor(w / 20);
    for (let col = 0; col < columns; col++) {
      const colX = col * 20;
      const speed = ((col % 5) + 1) * 0.3;
      const headY = ((progress * h * 2 * speed + col * 40) % (h + 100)) - 50;

      for (let j = 0; j < 8; j++) {
        const charY = headY - j * 18;
        if (charY > 0 && charY < h) {
          const opacity = 1 - j / 8;
          ctx.fillStyle = j === 0 ? '#ffffff' : `rgba(0, 255, 102, ${opacity})`;
          const randomChar = String.fromCharCode(0x30a0 + ((col * 7 + j + frameIdx) % 96));
          ctx.fillText(randomChar, colX, charY);
        }
      }
    }
  }

  // Frame stamp watermark overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`FRAME #${String(frameIdx + 1).padStart(2, '0')} | ${time.toFixed(2)}s`, 20, 35);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
}
