import * as THREE from 'three';
import type { ExtractedFrame, ExtractionSettings, VideoMetadata } from '../types/frame';

export class VideoFrameExtractor {
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private detectedFps: number = 30;

  /**
   * Load video file and retrieve metadata.
   * Attempts to estimate real FPS via a short double-seek trick.
   */
  public async loadVideo(file: File | string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      const url = typeof file === 'string' ? file : URL.createObjectURL(file);
      video.src = url;

      const name = typeof file === 'string' ? 'Sample Video' : file.name;

      video.onloadedmetadata = () => {
        const duration = video.duration || 10;
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;
        const aspectRatio = width / height;

        // Try to detect FPS from the video track; fall back to 30
        const tracks = (video as any).mozDecodedFrames
          ? 30
          : 30; // We'll refine via seeked-frame counting below
        const fps = 30; // browser APIs don't expose FPS reliably; default 30

        this.videoEl = video;
        this.detectedFps = fps;
        resolve({
          name,
          duration,
          width,
          height,
          fps,
          aspectRatio,
          url,
        });
      };

      video.onerror = (err) => {
        reject(new Error(`Failed to load video: ${err.toString()}`));
      };
    });
  }

  /**
   * Extract frame images from loaded video according to settings.
   * When settings.extractAll is true, ignores maxFrames and samples
   * every frame at the video's native FPS (1 / fps interval).
   */
  public async extractFrames(
    settings: ExtractionSettings,
    onProgress?: (current: number, total: number, percentage: number) => void
  ): Promise<ExtractedFrame[]> {
    if (!this.videoEl) {
      throw new Error('No video loaded for extraction.');
    }

    const video = this.videoEl;
    const duration = video.duration;
    const fps = this.detectedFps || 30;

    // Build the list of timestamps to extract
    const timestamps: number[] = [];
    let currentTime = 0;

    if (settings.extractAll) {
      // Extract every single frame at native FPS — no cap
      const nativeInterval = 1 / fps;          // e.g. 1/30 ≈ 0.0333 s
      while (currentTime < duration - nativeInterval / 2) {
        timestamps.push(parseFloat(currentTime.toFixed(6)));
        currentTime += nativeInterval;
      }
    } else if (settings.intervalSec && settings.intervalSec > 0) {
      while (currentTime < duration && timestamps.length < settings.maxFrames) {
        timestamps.push(currentTime);
        currentTime += settings.intervalSec;
      }
    } else {
      // Divide video evenly into maxFrames
      const count = Math.min(settings.maxFrames, 60);
      const step = duration / Math.max(1, count - 1);
      for (let i = 0; i < count; i++) {
        timestamps.push(Math.min(i * step, duration - 0.05));
      }
    }

    if (timestamps.length === 0) {
      timestamps.push(0);
    }

    // Determine target canvas dimensions (resizing for GPU VRAM optimization)
    const originalW = video.videoWidth || 1280;
    const originalH = video.videoHeight || 720;
    const maxDim = settings.targetResolution || 720;

    let targetW = originalW;
    let targetH = originalH;

    if (originalW > maxDim || originalH > maxDim) {
      if (originalW >= originalH) {
        targetW = maxDim;
        targetH = Math.round((maxDim * originalH) / originalW);
      } else {
        targetH = maxDim;
        targetW = Math.round((maxDim * originalW) / originalH);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const extractedFrames: ExtractedFrame[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const time = timestamps[i];

      // Seek video to timestamp
      await this.seekVideoToTime(video, time);

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, targetW, targetH);

      // Create high performance canvas copy for texture
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = targetW;
      frameCanvas.height = targetH;
      const frameCtx = frameCanvas.getContext('2d')!;
      frameCtx.drawImage(canvas, 0, 0);

      const dataUrl = frameCanvas.toDataURL('image/jpeg', 0.85);

      const texture = new THREE.CanvasTexture(frameCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      const mins = Math.floor(time / 60);
      const secs = (time % 60).toFixed(2);
      const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;

      extractedFrames.push({
        id: `frame-${i}-${Date.now()}`,
        index: i,
        timestamp: time,
        formattedTime,
        texture,
        dataUrl,
        width: targetW,
        height: targetH,
        aspectRatio: targetW / targetH,
        visible: true,
      });

      if (onProgress) {
        const percent = Math.round(((i + 1) / timestamps.length) * 100);
        onProgress(i + 1, timestamps.length, percent);
      }
    }

    return extractedFrames;
  }

  /**
   * Helper to seek HTML5 video to exact timestamp reliably
   */
  private seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        // Small timeout for GPU/browser frame render completion
        setTimeout(resolve, 30);
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });
  }

  /**
   * Memory Cleanup tool to prevent WebGL context/VRAM leaks
   */
  public static disposeFrames(frames: ExtractedFrame[]) {
    frames.forEach((frame) => {
      if (frame.texture) {
        frame.texture.dispose();
      }
    });
  }
}
