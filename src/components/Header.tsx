import React, { useRef } from 'react';
import { Layers, Upload, Sparkles, Settings, Video } from 'lucide-react';
import type { VideoMetadata } from '../types/frame';

interface HeaderProps {
  metadata: VideoMetadata | null;
  frameCount: number;
  onFileUpload: (file: File) => void;
  onLoadDemoPreset: (preset: 'cyberpunk' | 'neon_sunset' | 'quantum_matrix') => void;
  onLoadTestVideo?: () => void;
  onOpenSettings: () => void;
  isExtracting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  frameCount,
  onFileUpload,
  onLoadDemoPreset,
  onLoadTestVideo,
  onOpenSettings,
  isExtracting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-logo">
          <Layers size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">FrameSpace 3D</span>
            <span className="brand-badge">VRAM Optimized</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {metadata && (
          <div
            className="glass-pill"
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Video size={14} color="var(--accent-secondary)" />
            <span style={{ color: '#fff', fontWeight: 600 }}>{metadata.name}</span>
            <span>({frameCount} frames)</span>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          style={{ display: 'none' }}
        />

        <button
          className="btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
        >
          <Upload size={16} />
          <span>Upload Video</span>
        </button>

        {onLoadTestVideo && (
          <button
            className="btn-secondary"
            onClick={onLoadTestVideo}
            title="Load 'test video.mp4'"
            disabled={isExtracting}
          >
            <Video size={15} color="var(--text-muted)" />
            <span>Test Video</span>
          </button>
        )}

        {/* Demo Presets Dropdown / Direct triggers */}
        <button
          className="btn-secondary"
          onClick={() => onLoadDemoPreset('cyberpunk')}
          title="Load Cyberpunk Procedural Demo Video"
          disabled={isExtracting}
        >
          <Sparkles size={15} color="var(--text-muted)" />
          <span>Demo</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onOpenSettings}
          title="Extraction Settings"
          style={{ width: '38px', padding: 0, justifyContent: 'center' }}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
