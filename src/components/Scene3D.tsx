import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ExtractedFrame, SceneControls } from '../types/frame';
import { FrameMesh } from './FrameMesh';

interface Scene3DProps {
  frames: ExtractedFrame[];
  controls: SceneControls;
  selectedFrame: ExtractedFrame | null;
  onSelectFrame: (frame: ExtractedFrame) => void;
}

const AutoTurntable: React.FC<{ autoRotate: boolean }> = ({ autoRotate }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.maxAzimuthAngle += 0.005;
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({
  frames,
  controls,
  selectedFrame,
  onSelectFrame,
}) => {
  return (
    <div className="canvas-viewport">
      <Canvas
        camera={{ position: [0, 2, 16], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerDown={(e) => {
          // Deselect when clicking background void
          if (e.target === e.currentTarget) {
            // backdrop clicked
          }
        }}
      >
        <color attach="background" args={['#080808']} />

        {/* Monochrome Studio Lighting */}
        <ambientLight intensity={1.4} color="#ffffff" />
        <directionalLight position={[10, 15, 10]} intensity={1.6} color="#e8e8e8" />
        <directionalLight position={[-10, 10, -10]} intensity={0.9} color="#b0b0b0" />
        <pointLight position={[0, -5, 5]} intensity={0.5} color="#888888" />

        {/* Atmospheric Background */}
        <Stars radius={100} depth={50} count={2500} factor={3} saturation={0} fade speed={0.6} />

        {/* 3D Floor Grid */}
        {controls.showGrid && (
          <Grid
            position={[0, -4, 0]}
            args={[40, 40]}
            cellSize={1}
            cellThickness={0.8}
            cellColor="#1e1e1e"
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor="#3a3a3a"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}

        {/* Frame Mesh Collection */}
        <group position={[0, 0, 0]}>
          {frames.map((frame, index) => (
            <FrameMesh
              key={frame.id}
              frame={frame}
              index={index}
              totalFrames={frames.length}
              controls={controls}
              isSelected={selectedFrame?.id === frame.id}
              onSelect={onSelectFrame}
            />
          ))}
        </group>

        {/* Camera Turntable Controls */}
        <AutoTurntable autoRotate={controls.autoRotate} />
      </Canvas>
    </div>
  );
};
