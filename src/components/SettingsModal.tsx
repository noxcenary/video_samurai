import React, { useState } from 'react';
import { X, Settings, Check } from 'lucide-react';
import type { ExtractionSettings } from '../types/frame';

interface SettingsModalProps {
  settings: ExtractionSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ExtractionSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [maxFrames, setMaxFrames] = useState(settings.maxFrames);
  const [intervalSec, setIntervalSec] = useState(settings.intervalSec);
  const [targetResolution, setTargetResolution] = useState(settings.targetResolution);
  const [extractAll, setExtractAll] = useState(settings.extractAll ?? true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ maxFrames, intervalSec, targetResolution, extractAll });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div
          className="sidebar-header"
          style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, paddingBottom: '12px' }}
        >
          <div className="sidebar-title">
            <Settings size={18} color="var(--accent-cyan)" />
            <span>Extraction &amp; VRAM Settings</span>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Extract All Frames toggle ── */}
          <div
            style={{
              background: extractAll ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${extractAll ? 'rgba(0,240,255,0.35)' : 'var(--border-subtle)'}`,
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.2s ease',
            }}
          >
            <label className="toggle-row" style={{ padding: 0 }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                  Extract All Frames
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Captures every frame at native FPS — no count limit
                </div>
              </div>
              <div className="switch">
                <input
                  type="checkbox"
                  checked={extractAll}
                  onChange={(e) => setExtractAll(e.target.checked)}
                />
                <span className="slider-switch"></span>
              </div>
            </label>
          </div>

          {/* ── Manual sampling controls (hidden when extractAll is ON) ── */}
          {!extractAll && (
            <>
              <div className="slider-group">
                <div className="slider-row">
                  <span className="slider-name">Max Frame Count</span>
                  <span className="slider-val">{maxFrames} frames</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={maxFrames}
                  onChange={(e) => setMaxFrames(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-row">
                  <span className="slider-name">Sampling Interval</span>
                  <span className="slider-val">{intervalSec.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0.033"
                  max="2.0"
                  step="0.033"
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}

          {/* ── Texture resolution ── */}
          <div className="control-section">
            <span className="section-label">Texture Resolution (VRAM Optimization)</span>
            <div className="mode-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[480, 720, 1080].map((res) => (
                <button
                  key={res}
                  className={`mode-btn ${targetResolution === res ? 'active' : ''}`}
                  onClick={() => setTargetResolution(res)}
                >
                  <span>{res}p</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
