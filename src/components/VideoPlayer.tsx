import React, { useRef, useEffect } from 'react';

type VideoPlayerProps = {
  src: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  playing: boolean;
  onPlayToggle: () => void;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, currentTime, onTimeUpdate, playing, onPlayToggle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid && Math.abs(vid.currentTime - currentTime) > 0.1) {
      vid.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (vid) onTimeUpdate(vid.currentTime);
  };

  return (
    <div className="video-player glass-panel" style={{ padding: '12px' }}>
      <video
        ref={videoRef}
        src={src}
        controls={false}
        style={{ width: '100%' }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onPlayToggle}
      />
      <div className="flex items-center gap-2 mt-2">
        <button className="btn-primary" onClick={onPlayToggle}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={0}
          max={videoRef.current?.duration ?? 0}
          step={0.01}
          value={currentTime}
          onChange={e => onTimeUpdate(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {currentTime.toFixed(2)}s
        </span>
      </div>
    </div>
  );
};
