'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SimplePuneGround() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            // Subtle rotation
            meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
        }
    });

    return (
        <group>
            {/* Ground plane to represent Pune area */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
                <planeGeometry args={[100, 100, 20, 20]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    wireframe={false}
                    emissive="#2a2a3a"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Grid overlay */}
            <gridHelper args={[100, 50, '#a855f7', '#4a4a5a']} position={[0, -0.9, 0]} />

            {/* Simple building representations */}
            {Array.from({ length: 30 }).map((_, i) => {
                const x = (Math.random() - 0.5) * 80;
                const z = (Math.random() - 0.5) * 80;
                const height = Math.random() * 3 + 1;

                return (
                    <mesh key={i} position={[x, height / 2 - 1, z]}>
                        <boxGeometry args={[2, height, 2]} />
                        <meshStandardMaterial
                            color="#1a1a1a"
                            emissive="#2a2a3a"
                            emissiveIntensity={0.3}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}
