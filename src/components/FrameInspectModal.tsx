import React from 'react';
import { X, Download, Film } from 'lucide-react';
import type { ExtractedFrame } from '../types/frame';

interface FrameInspectModalProps {
  frame: ExtractedFrame | null;
  onClose: () => void;
}

export const FrameInspectModal: React.FC<FrameInspectModalProps> = ({ frame, onClose }) => {
  if (!frame) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = frame.dataUrl;
    a.download = `frame_${String(frame.index + 1).padStart(3, '0')}_${frame.formattedTime.replace(':', '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content inspect-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: 0, paddingBottom: '12px' }}>
          <div className="sidebar-title">
            <Film size={18} color="var(--text-muted)" />
            <span>Frame #{frame.index + 1} Metadata</span>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        <img src={frame.dataUrl} alt={`Frame ${frame.index + 1}`} className="inspect-preview" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div>Timestamp: <strong style={{ color: '#fff', fontFamily: 'Fira Code' }}>{frame.formattedTime}</strong></div>
            <div>Resolution: <strong style={{ color: '#fff' }}>{frame.width}x{frame.height}</strong></div>
            <div>Aspect Ratio: <strong style={{ color: '#fff' }}>{frame.aspectRatio.toFixed(2)}</strong></div>
          </div>

          <button className="btn-primary" onClick={handleDownload}>
            <Download size={16} />
            <span>Export JPG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
