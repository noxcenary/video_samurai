import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Scene3D } from './components/Scene3D';
import { SidebarControls } from './components/SidebarControls';
import { TimelineBar } from './components/TimelineBar';
import { SettingsModal } from './components/SettingsModal';
import { FrameInspectModal } from './components/FrameInspectModal';

import type { ExtractedFrame, SceneControls, ExtractionSettings, VideoMetadata } from './types/frame';
import { generateSampleFrames } from './services/proceduralVideo';
import { VideoFrameExtractor } from './services/videoExtractor';

const DEFAULT_CONTROLS: SceneControls = {
  mode: 'fan',
  spacing: 0.8,
  rotationAngle: 12,
  curvature: 2.2,
  scale: 1.0,
  depthOffset: 0.0,
  opacity: 0.95,
  borderGlow: true,
  glowColor: '#888888',
  showGrid: true,
  showLabels: true,
  autoRotate: false,
};

const DEFAULT_SETTINGS: ExtractionSettings = {
  maxFrames: 30,
  intervalSec: 0.2,
  targetResolution: 720,
  extractAll: true,
};

export default function App() {
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [controls, setControls] = useState<SceneControls>(DEFAULT_CONTROLS);
  const [settings, setSettings] = useState<ExtractionSettings>(DEFAULT_SETTINGS);
  const [selectedFrame, setSelectedFrame] = useState<ExtractedFrame | null>(null);
  const [inspectedFrame, setInspectedFrame] = useState<ExtractedFrame | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progressText, setProgressText] = useState('');

  // Auto-initialize with test video if available, or fall back to procedural demo
  useEffect(() => {
    handleLoadTestVideo().catch(() => {
      loadProceduralDemo('cyberpunk');
    });
  }, []);

  const loadProceduralDemo = (preset: 'cyberpunk' | 'neon_sunset' | 'quantum_matrix') => {
    VideoFrameExtractor.disposeFrames(frames);
    const { frames: newFrames, duration, aspectRatio } = generateSampleFrames(
      preset,
      settings.maxFrames,
      settings.intervalSec,
      settings.targetResolution
    );

    setFrames(newFrames);
    setMetadata({
      name: `${preset.toUpperCase().replace('_', ' ')} Demo Video`,
      duration,
      width: settings.targetResolution,
      height: Math.round((settings.targetResolution * 9) / 16),
      fps: 30,
      aspectRatio,
      url: '',
    });
    setSelectedFrame(newFrames[0] || null);
  };

  const handleLoadTestVideo = async () => {
    setIsExtracting(true);
    setProgressText('Loading test video...');

    try {
      VideoFrameExtractor.disposeFrames(frames);

      const extractor = new VideoFrameExtractor();
      const meta = await extractor.loadVideo('/test_video.mp4');
      meta.name = 'test video.mp4';
      setMetadata(meta);

      setProgressText('Extracting frames from test video...');
      const extracted = await extractor.extractFrames(settings, (current, total, percent) => {
        setProgressText(`Extracting frame ${current}/${total} (${percent}%)`);
      });

      setFrames(extracted);
      setSelectedFrame(extracted[0] || null);
    } catch (err: any) {
      console.error('Test video extraction failed:', err);
      // Fall back to demo procedural video if test video cannot be loaded
      loadProceduralDemo('cyberpunk');
    } finally {
      setIsExtracting(false);
      setProgressText('');
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsExtracting(true);
    setProgressText('Loading video metadata...');

    try {
      VideoFrameExtractor.disposeFrames(frames);

      const extractor = new VideoFrameExtractor();
      const meta = await extractor.loadVideo(file);
      setMetadata(meta);

      setProgressText('Extracting frames...');
      const extracted = await extractor.extractFrames(settings, (current, total, percent) => {
        setProgressText(`Extracting frame ${current}/${total} (${percent}%)`);
      });

      setFrames(extracted);
      setSelectedFrame(extracted[0] || null);
    } catch (err: any) {
      console.error('Frame extraction failed:', err);
      alert(`Error extracting video frames: ${err.message || err}`);
    } finally {
      setIsExtracting(false);
      setProgressText('');
    }
  };

  const handleUpdateControls = (updated: Partial<SceneControls>) => {
    setControls((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleFrameVisibility = (frameId: string) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === frameId ? { ...f, visible: !f.visible } : f))
    );
  };

  return (
    <div className="framespace-container">
      {/* Navbar Header */}
      <Header
        metadata={metadata}
        frameCount={frames.length}
        onFileUpload={handleFileUpload}
        onLoadDemoPreset={loadProceduralDemo}
        onLoadTestVideo={handleLoadTestVideo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isExtracting={isExtracting}
      />

      {/* 3D WebGL Scene */}
      <Scene3D
        frames={frames}
        controls={controls}
        selectedFrame={selectedFrame}
        onSelectFrame={setSelectedFrame}
      />

      {/* Sidebar Controls */}
      <SidebarControls
        controls={controls}
        onChange={handleUpdateControls}
        onReset={() => setControls(DEFAULT_CONTROLS)}
      />

      {/* Scrubber Timeline Bar */}
      <TimelineBar
        frames={frames}
        selectedFrame={selectedFrame}
        onSelectFrame={setSelectedFrame}
        onToggleFrameVisibility={handleToggleFrameVisibility}
        onInspectFrame={setInspectedFrame}
      />

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newSettings) => {
          setSettings(newSettings);
        }}
      />

      {/* Frame Inspection Modal */}
      <FrameInspectModal
        frame={inspectedFrame}
        onClose={() => setInspectedFrame(null)}
      />

      {/* Extraction Overlay Indicator */}
      {isExtracting && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ textAlign: 'center', width: '360px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              FrameSpace Extractor
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
              {progressText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
