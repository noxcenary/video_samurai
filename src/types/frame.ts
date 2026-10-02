import * as THREE from 'three';

export type ArrangementMode = 'stack' | 'fan' | 'helix' | 'grid';

export interface ExtractedFrame {
  id: string;
  index: number;
  timestamp: number; // in seconds
  formattedTime: string; // e.g., "00:01.45"
  texture: THREE.CanvasTexture;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  visible: boolean;
}

export interface SceneControls {
  mode: ArrangementMode;
  spacing: number;       // distance between frames along depth/arc
  rotationAngle: number; // rotational spread per frame in degrees/radians
  curvature: number;     // radius bend / fan arc depth
  scale: number;          // frame scale factor (0.5x to 2x)
  depthOffset: number;   // stagger / z depth variation
  opacity: number;       // frame opacity (0.1 to 1.0)
  borderGlow: boolean;   // outline glow effect
  glowColor: string;     // accent glow color
  showGrid: boolean;     // 3D floor grid
  showLabels: boolean;   // frame index timestamp badge labels in 3D
  autoRotate: boolean;   // 3D scene auto-turntable
}

export interface ExtractionSettings {
  maxFrames: number;      // limit total extracted frames (e.g. 10 - 100)
  intervalSec: number;    // seconds between frame captures (e.g. 0.1 - 2.0s)
  targetResolution: number; // max dimension (e.g. 512, 720, 1080) for VRAM optimization
  extractAll: boolean;    // when true, ignore maxFrames and extract every frame at native FPS
}

export interface VideoMetadata {
  name: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  aspectRatio: number;
  url: string;
}
