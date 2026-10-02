import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ExtractedFrame, SceneControls } from '../types/frame';
import { calculateFrameTransform } from '../utils/layoutMath';

interface FrameMeshProps {
  frame: ExtractedFrame;
  index: number;
  totalFrames: number;
  controls: SceneControls;
  isSelected: boolean;
  onSelect: (frame: ExtractedFrame) => void;
}

export const FrameMesh: React.FC<FrameMeshProps> = ({
  frame,
  index,
  totalFrames,
  controls,
  isSelected,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Compute targeted 3D position, rotation, and scale from arrangement math
  const transform = calculateFrameTransform(
    index,
    totalFrames,
    frame.aspectRatio || 16 / 9,
    controls
  );

  // Smooth lerp transition towards target transform
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const lerpFactor = Math.min(1, delta * 8);

    // Apply subtle hover pop effect
    const hoverScaleMultiplier = hovered || isSelected ? 1.08 : 1.0;
    const targetScale = transform.scale.clone().multiplyScalar(hoverScaleMultiplier);

    meshRef.current.position.lerp(transform.position, lerpFactor);

    // Lerp rotation smoothly
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      transform.rotation.x,
      lerpFactor
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      transform.rotation.y,
      lerpFactor
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      transform.rotation.z,
      lerpFactor
    );

    meshRef.current.scale.lerp(targetScale, lerpFactor);
  });

  if (!frame.visible) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(frame);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          map={frame.texture}
          transparent={true}
          opacity={controls.opacity}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.1}
        />

        {/* 3D Border Glow Highlight Frame */}
        {(controls.borderGlow || isSelected || hovered) && (
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(1.02, 1.02)]} />
            <lineBasicMaterial
              color={
                isSelected
                  ? '#ffffff'
                  : hovered
                  ? '#cccccc'
                  : controls.glowColor || '#888888'
              }
              linewidth={isSelected ? 3 : 1.5}
            />
          </lineSegments>
        )}

        {/* Optional 3D Timestamp Badge overlay */}
        {controls.showLabels && (
          <Html
            position={[0, 0.55, 0.05]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <div
              style={{
                background: 'rgba(5, 5, 5, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
                color: isSelected ? '#ffffff' : '#cccccc',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'Fira Code, monospace',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.18)' : 'none',
              }}
            >
              #{index + 1} • {frame.formattedTime}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};
