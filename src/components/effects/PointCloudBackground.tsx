'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function InteractivePointCloud() {
    const pointsRef = useRef<THREE.Points>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const { size } = useThree();

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!pointsRef.current) return;

        const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
        const gridSize = 50;
        const spacing = 0.5;
        const positions = new Float32Array(gridSize * gridSize * 3);

        let index = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = (i - gridSize / 2) * spacing;
                const y = (j - gridSize / 2) * spacing;
                const z = 0;

                positions[index++] = x;
                positions[index++] = y;
                positions[index++] = z;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
        const positions = geometry.attributes.position.array as Float32Array;
        const time = state.clock.getElapsedTime();
        const gridSize = 50;
        const spacing = 0.5;

        let index = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = (i - gridSize / 2) * spacing;
                const y = (j - gridSize / 2) * spacing;

                // Mouse influence
                const mouseX = mouseRef.current.x * 10;
                const mouseY = mouseRef.current.y * 10;
                const distanceToMouse = Math.sqrt(
                    Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2)
                );
                const mouseInfluence = Math.max(0, 1 - distanceToMouse / 8) * 3;

                // Time-based wave
                const wave1 = Math.sin(x * 0.3 + time) * 0.5;
                const wave2 = Math.sin(y * 0.3 + time * 0.7) * 0.5;
                const wave3 = Math.sin((x + y) * 0.2 + time * 0.5) * 0.3;

                // Combine effects
                const z = wave1 + wave2 + wave3 + mouseInfluence;

                positions[index++] = x;
                positions[index++] = y;
                positions[index++] = z;
            }
        }

        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry />
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
}

export default function PointCloudBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <InteractivePointCloud />
            </Canvas>
        </div>
    );
}
