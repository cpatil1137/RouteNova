'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import { Environment, Float, Stars } from '@react-three/drei';

function RotatingCore() {
    const outerRef = useRef<Mesh>(null);
    const innerRef = useRef<Mesh>(null);

    useFrame((state, delta) => {
        if (outerRef.current) {
            outerRef.current.rotation.x += delta * 0.2;
            outerRef.current.rotation.y += delta * 0.3;
        }
        if (innerRef.current) {
            innerRef.current.rotation.x -= delta * 0.5;
            innerRef.current.rotation.y -= delta * 0.5;
            // Pulsing effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            innerRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group>
            {/* Outer Wireframe Sphere */}
            <mesh ref={outerRef}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial
                    color="#06b6d4" // Cyan
                    wireframe
                    transparent
                    opacity={0.3}
                    emissive="#06b6d4"
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Inner Glowing Core */}
            <mesh ref={innerRef}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#ec4899" // Pinkish/Purple
                    transparent
                    opacity={0.8}
                    emissive="#ec4899"
                    emissiveIntensity={2}
                />
            </mesh>

            {/* Ambient Particles */}
            <Stars radius={50} depth={50} count={200} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

export default function ThreeLoader() {
    return (
        <div className="w-full h-32 relative">
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <RotatingCore />
                </Float>
                <Environment preset="city" />
            </Canvas>
            <div className="absolute bottom-2 left-0 right-0 text-center">
                <p className="text-xs text-cyan-400/80 font-mono tracking-widest uppercase animate-pulse">
                    Processing
                </p>
            </div>
        </div>
    );
}
