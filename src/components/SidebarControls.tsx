import React from 'react';
import { Layers, Fan, Orbit, Grid, Sliders, RefreshCw } from 'lucide-react';
import type { ArrangementMode, SceneControls } from '../types/frame';

interface SidebarControlsProps {
  controls: SceneControls;
  onChange: (updated: Partial<SceneControls>) => void;
  onReset: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  controls,
  onChange,
  onReset,
}) => {
  const modes: { id: ArrangementMode; label: string; icon: React.ReactNode }[] = [
    { id: 'stack', label: 'Stack', icon: <Layers size={16} /> },
    { id: 'fan', label: 'Fan', icon: <Fan size={16} /> },
    { id: 'helix', label: 'Helix', icon: <Orbit size={16} /> },
    { id: 'grid', label: 'Grid', icon: <Grid size={16} /> },
  ];

  return (
    <aside className="controls-sidebar glass-panel">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Sliders size={18} color="var(--text-muted)" />
          <span>3D Space Controls</span>
        </div>
        <button
          className="btn-secondary"
          onClick={onReset}
          title="Reset Layout Settings"
          style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
        >
          <RefreshCw size={12} />
          <span>Reset</span>
        </button>
      </div>

      <div className="sidebar-body">
        {/* Arrangement Mode Selector */}
        <div className="control-section">
          <span className="section-label">Arrangement Mode</span>
          <div className="mode-grid">
            {modes.map((m) => (
              <button
                key={m.id}
                className={`mode-btn ${controls.mode === m.id ? 'active' : ''}`}
                onClick={() => onChange({ mode: m.id })}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spatial Transformation Sliders */}
        <div className="control-section">
          <span className="section-label">Spatial Layout</span>

          <div className="slider-group">
            <div className="slider-row">
              <span className="slider-name">Frame Spacing</span>
              <span className="slider-val">{controls.spacing.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={controls.spacing}
              onChange={(e) => onChange({ spacing: parseFloat(e.target.value) })}
            />
          </div>

          <div className="slider-group">
            <div className="slider-row">
              <span className="slider-name">Rotation Angle</span>
              <span className="slider-val">{controls.rotationAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={controls.rotationAngle}
              onChange={(e) => onChange({ rotationAngle: parseInt(e.target.value, 10) })}
            />
          </div>

          {controls.mode === 'fan' || controls.mode === 'helix' ? (
            <div className="slider-group">
              <div className="slider-row">
                <span className="slider-name">Curvature Arc</span>
                <span className="slider-val">{controls.curvature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={controls.curvature}
                onChange={(e) => onChange({ curvature: parseFloat(e.target.value) })}
              />
            </div>
          ) : null}

          <div className="slider-group">
            <div className="slider-row">
              <span className="slider-name">Frame Scale</span>
              <span className="slider-val">{controls.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={controls.scale}
              onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
            />
          </div>

          <div className="slider-group">
            <div className="slider-row">
              <span className="slider-name">Depth Offset</span>
              <span className="slider-val">{controls.depthOffset.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={controls.depthOffset}
              onChange={(e) => onChange({ depthOffset: parseFloat(e.target.value) })}
            />
          </div>

          <div className="slider-group">
            <div className="slider-row">
              <span className="slider-name">Frame Opacity</span>
              <span className="slider-val">{Math.round(controls.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={controls.opacity}
              onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        {/* View Toggles & Enhancements */}
        <div className="control-section">
          <span className="section-label">Display Effects</span>

          <label className="toggle-row">
            <span>Neon Border Glow</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={controls.borderGlow}
                onChange={(e) => onChange({ borderGlow: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </div>
          </label>

          <label className="toggle-row">
            <span>3D Floor Grid</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={controls.showGrid}
                onChange={(e) => onChange({ showGrid: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </div>
          </label>

          <label className="toggle-row">
            <span>Timestamp Labels</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={controls.showLabels}
                onChange={(e) => onChange({ showLabels: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </div>
          </label>

          <label className="toggle-row">
            <span>Auto Turntable</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={controls.autoRotate}
                onChange={(e) => onChange({ autoRotate: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
};
