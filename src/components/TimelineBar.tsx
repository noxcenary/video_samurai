import React from 'react';
import { Maximize2, Eye, EyeOff, Film } from 'lucide-react';
import type { ExtractedFrame } from '../types/frame';

interface TimelineBarProps {
  frames: ExtractedFrame[];
  selectedFrame: ExtractedFrame | null;
  onSelectFrame: (frame: ExtractedFrame) => void;
  onToggleFrameVisibility: (frameId: string) => void;
  onInspectFrame: (frame: ExtractedFrame) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  frames,
  selectedFrame,
  onSelectFrame,
  onToggleFrameVisibility,
  onInspectFrame,
}) => {
  if (frames.length === 0) return null;

  return (
    <div className="bottom-timeline glass-panel">
      <div className="timeline-header">
        <div className="timeline-info">
          <Film size={14} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, color: '#fff' }}>Extracted Frame Timeline</span>
          <span>({frames.length} total)</span>
        </div>
        {selectedFrame && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'Fira Code, monospace',
                fontSize: '11px',
                color: '#e0e0e0',
              }}
            >
              Frame #{selectedFrame.index + 1} ({selectedFrame.formattedTime})
            </span>
            <button
              className="btn-secondary"
              onClick={() => onInspectFrame(selectedFrame)}
              style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
            >
              <Maximize2 size={12} />
              <span>Inspect</span>
            </button>
            <button
              className="btn-secondary"
              onClick={() => onToggleFrameVisibility(selectedFrame.id)}
              style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
            >
              {selectedFrame.visible ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{selectedFrame.visible ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="timeline-strip">
        {frames.map((frame) => {
          const isSelected = selectedFrame?.id === frame.id;
          return (
            <div
              key={frame.id}
              className={`thumb-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectFrame(frame)}
              style={{ opacity: frame.visible ? 1 : 0.4 }}
            >
              <img src={frame.dataUrl} alt={`Frame ${frame.index + 1}`} />
              <span className="thumb-badge">#{frame.index + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
