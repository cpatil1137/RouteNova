'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simplified Pune building data (procedurally generated)
const generatePuneBuildings = () => {
    const buildings = [];
    const centerLat = 18.5204;
    const centerLon = 73.8567;

    // Generate grid of buildings
    for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 20;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const width = Math.random() * 3 + 1;
        const depth = Math.random() * 3 + 1;
        const height = Math.random() * 20 + 5;

        buildings.push({
            position: [x, height / 2, z],
            size: [width, height, depth],
        });
    }

    return buildings;
};

export default function CityBuildings() {
    const buildings = useMemo(() => generatePuneBuildings(), []);

    const wireframeMaterial = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: '#1e40af',
                wireframe: true,
                transparent: true,
                opacity: 0.3,
            }),
        []
    );

    return (
        <group>
            {buildings.map((building, index) => (
                <mesh
                    key={index}
                    position={building.position as [number, number, number]}
                    material={wireframeMaterial}
                >
                    <boxGeometry args={building.size as [number, number, number]} />
                </mesh>
            ))}

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[200, 200, 20, 20]} />
                <meshBasicMaterial
                    color="#1e293b"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </mesh>
        </group>
    );
}
