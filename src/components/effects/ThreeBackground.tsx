'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WavyPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);

  useEffect(() => {
    if (meshRef.current) {
      geometryRef.current = meshRef.current.geometry as THREE.PlaneGeometry;
    }
  }, []);

  useFrame((state) => {
    if (meshRef.current && geometryRef.current) {
      const time = state.clock.getElapsedTime();
      const positions = geometryRef.current.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave1 = Math.sin(x * 0.5 + time) * 0.3;
        const wave2 = Math.sin(y * 0.3 + time * 0.5) * 0.2;
        positions.setZ(i, wave1 + wave2);
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -0.5, -2]}>
      <planeGeometry args={[50, 50, 100, 100]} />
      <meshStandardMaterial
        color="#ec4899"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas camera={{ position: [0, 1, 3], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <WavyPlane />
      </Canvas>
    </div>
  );
}
