'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleSystem() {
    const particlesRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);

    // Create particles
    const particlesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(1000 * 3);
        const colors = new Float32Array(1000 * 3);

        for (let i = 0; i < 1000; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 150;
            positions[i3 + 1] = Math.random() * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 150;

            // Purple color
            const color = new THREE.Color('#8b5cf6');
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        return geometry;
    }, []);

    const particlesMaterial = useMemo(
        () =>
            new THREE.PointsMaterial({
                size: 0.3,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
            }),
        []
    );

    // Animate particles
    useFrame((state) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true;
            particlesRef.current.rotation.y += 0.0002;
        }
    });

    return (
        <group>
            {/* Particles */}
            <points
                ref={particlesRef}
                geometry={particlesGeometry}
                material={particlesMaterial}
            />
        </group>
    );
}
