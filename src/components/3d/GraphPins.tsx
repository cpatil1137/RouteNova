'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PUNE_GRAPH_PINS } from '@/data/puneGraphPins';
import { latLonTo3D } from '@/utils/mercatorProjection';
import { pinGlowVertexShader, pinGlowFragmentShader } from '@/shaders/neonShaders';

const PIN_COLORS = {
    cafe: [0.2, 0.9, 0.9] as [number, number, number], // Cyan
    coworking: [0.6, 0.3, 0.9] as [number, number, number], // Purple
    park: [0.3, 0.9, 0.4] as [number, number, number], // Green
    transit: [0.9, 0.5, 0.2] as [number, number, number], // Orange
    restaurant: [0.9, 0.3, 0.5] as [number, number, number], // Pink
    historical: [0.9, 0.8, 0.2] as [number, number, number], // Gold
};

export default function GraphPins() {
    const groupRef = useRef<THREE.Group>(null);

    // Convert pins to 3D positions
    const pins = useMemo(() => {
        return PUNE_GRAPH_PINS.map((pin) => {
            const position = latLonTo3D(pin.lat, pin.lon, 2); // Elevation of 2 units
            return {
                ...pin,
                position: new THREE.Vector3(position.x, position.y, position.z),
                color: PIN_COLORS[pin.type],
            };
        });
    }, []);

    // Animate pins (floating motion)
    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        groupRef.current.children.forEach((child, index) => {
            if (child instanceof THREE.Mesh) {
                // Floating animation with sine wave
                const time = clock.getElapsedTime();
                const offset = index * 0.5; // Stagger the animation
                child.position.y = 2 + Math.sin(time * 0.5 + offset) * 0.3;

                // Update shader time uniform
                const material = child.material as THREE.ShaderMaterial;
                if (material.uniforms?.uTime) {
                    material.uniforms.uTime.value = time;
                }
            }
        });
    });

    return (
        <group ref={groupRef}>
            {pins.map((pin) => (
                <Pin
                    key={pin.id}
                    position={pin.position}
                    color={pin.color}
                    name={pin.name}
                    type={pin.type}
                />
            ))}
        </group>
    );
}

interface PinProps {
    position: THREE.Vector3;
    color: [number, number, number];
    name: string;
    type: string;
}

function Pin({ position, color, name, type }: PinProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Create shader material for pin glow
    const material = useMemo(() => {
        const uniforms = {
            uTime: { value: 0 },
            uColor: { value: color },
            uGlowIntensity: { value: 1.5 },
            uPulseSpeed: { value: 1.0 },
        };

        return new THREE.ShaderMaterial({
            uniforms: uniforms as any,
            vertexShader: pinGlowVertexShader,
            fragmentShader: pinGlowFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
    }, [color]);

    // Update hover state
    useFrame(() => {
        if (!meshRef.current) return;

        const targetScale = hovered ? 1.5 : 1.0;
        meshRef.current.scale.lerp(
            new THREE.Vector3(targetScale, targetScale, targetScale),
            0.1
        );

        // Update glow intensity on hover
        if (material.uniforms?.uGlowIntensity) {
            const targetIntensity = hovered ? 2.5 : 1.5;
            material.uniforms.uGlowIntensity.value = THREE.MathUtils.lerp(
                material.uniforms.uGlowIntensity.value,
                targetIntensity,
                0.1
            );
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            material={material}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <sphereGeometry args={[0.3, 16, 16]} />

            {/* Outer glow ring */}
            <mesh position={[0, 0, 0]} scale={1.5}>
                <ringGeometry args={[0.4, 0.5, 32]} />
                <meshBasicMaterial
                    color={new THREE.Color(...color)}
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </mesh>
    );
}
