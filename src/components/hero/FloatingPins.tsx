'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pune location pins data
const PUNE_LOCATIONS = [
    { name: 'Koregaon Park', position: [30, 0, -20], color: '#14b8a6' },
    { name: 'Hinjewadi', position: [-40, 0, 30], color: '#14b8a6' },
    { name: 'Viman Nagar', position: [25, 0, 35], color: '#14b8a6' },
    { name: 'Shivajinagar', position: [0, 0, -30], color: '#14b8a6' },
    { name: 'Kothrud', position: [-30, 0, -15], color: '#14b8a6' },
    { name: 'Baner', position: [-35, 0, 10], color: '#14b8a6' },
    { name: 'Wakad', position: [-45, 0, 20], color: '#14b8a6' },
    { name: 'Aundh', position: [-25, 0, 5], color: '#14b8a6' },
    { name: 'Hadapsar', position: [35, 0, 15], color: '#14b8a6' },
    { name: 'Magarpatta', position: [40, 0, 5], color: '#14b8a6' },
];

// Generate additional random pins
for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 60 + 15;
    PUNE_LOCATIONS.push({
        name: `Location ${i}`,
        position: [
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance,
        ],
        color: '#14b8a6',
    });
}

function Pin({ position, delay }: { position: [number, number, number]; delay: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [dropped, setDropped] = useState(false);
    const velocity = useRef(0);
    const targetY = position[1];
    const startY = 80;

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        if (time > delay && !dropped) {
            // Physics: Drop with gravity
            velocity.current += -9.8 * delta * 2;
            meshRef.current.position.y += velocity.current * delta;

            // Bounce on ground
            if (meshRef.current.position.y <= targetY + 5) {
                meshRef.current.position.y = targetY + 5;
                velocity.current = Math.abs(velocity.current) * 0.6; // Bounce with damping

                if (Math.abs(velocity.current) < 0.5) {
                    setDropped(true);
                }
            }
        } else if (dropped) {
            // Float animation
            meshRef.current.position.y = targetY + 5 + Math.sin(time * 2 + delay) * 1.5;
        } else {
            // Initial position
            meshRef.current.position.y = startY;
        }

        // Gentle rotation
        meshRef.current.rotation.y += delta * 0.5;
    });

    return (
        <group position={[position[0], 0, position[2]]}>
            <mesh ref={meshRef}>
                {/* Pin shape: cone + sphere */}
                <group>
                    <mesh position={[0, 0.5, 0]}>
                        <coneGeometry args={[0.5, 2, 8]} />
                        <meshStandardMaterial
                            color="#14b8a6"
                            emissive="#14b8a6"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                    <mesh position={[0, 2, 0]}>
                        <sphereGeometry args={[0.6, 16, 16]} />
                        <meshStandardMaterial
                            color="#14b8a6"
                            emissive="#14b8a6"
                            emissiveIntensity={0.8}
                        />
                    </mesh>
                </group>
            </mesh>

            {/* Glow effect */}
            <pointLight
                position={[0, 5, 0]}
                color="#14b8a6"
                intensity={2}
                distance={10}
            />
        </group>
    );
}

export default function FloatingPins() {
    return (
        <group>
            {PUNE_LOCATIONS.map((location, index) => (
                <Pin
                    key={index}
                    position={location.position as [number, number, number]}
                    delay={index * 0.05 + 2}
                />
            ))}
        </group>
    );
}
