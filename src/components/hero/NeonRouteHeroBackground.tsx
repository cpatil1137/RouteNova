'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Pune route definitions (3 routes to morph between)
const ROUTES = [
    // Route 1: Koregaon Park → Shivajinagar → Hinjewadi
    [
        [-30, 0, 20],
        [-20, 5, 10],
        [-10, 3, 0],
        [0, 0, -5],
        [10, 2, -10],
        [20, 5, -15],
        [30, 0, -20],
    ],
    // Route 2: Viman Nagar → Kothrud → Baner
    [
        [25, 0, 25],
        [15, 4, 15],
        [5, 2, 5],
        [-5, 0, 0],
        [-15, 3, -5],
        [-25, 5, -10],
        [-35, 0, -15],
    ],
    // Route 3: Hadapsar → Magarpatta → Wakad
    [
        [30, 0, -25],
        [20, 3, -15],
        [10, 5, -5],
        [0, 2, 0],
        [-10, 0, 5],
        [-20, 4, 15],
        [-30, 0, 25],
    ],
];

function NeonRoute() {
    const lineRef = useRef<THREE.Line>(null);
    const nodesRef = useRef<THREE.Group>(null);

    // Create line geometry
    const geometry = useMemo(() => {
        const points = ROUTES[0].map(p => new THREE.Vector3(p[0], p[1], p[2]));
        return new THREE.BufferGeometry().setFromPoints(points);
    }, []);

    // Custom shader material for gradient and glow
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMorphProgress: { value: 0 },
                uColor1: { value: new THREE.Color('#a855f7') }, // Purple
                uColor2: { value: new THREE.Color('#06b6d4') }, // Cyan
                uColor3: { value: new THREE.Color('#ec4899') }, // Magenta
            },
            vertexShader: `
                uniform float uTime;
                uniform float uMorphProgress;
                varying vec3 vPosition;
                varying float vProgress;

                void main() {
                    vPosition = position;
                    vProgress = position.x / 60.0 + 0.5; // Normalize to 0-1
                    
                    // Gentle wave animation
                    vec3 pos = position;
                    pos.y += sin(position.x * 0.1 + uTime) * 2.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uColor3;
                uniform float uTime;
                varying float vProgress;

                void main() {
                    // Gradient along the route
                    vec3 color;
                    if (vProgress < 0.5) {
                        color = mix(uColor1, uColor2, vProgress * 2.0);
                    } else {
                        color = mix(uColor2, uColor3, (vProgress - 0.5) * 2.0);
                    }
                    
                    // Pulsing glow
                    float pulse = sin(uTime * 2.0 + vProgress * 10.0) * 0.3 + 0.7;
                    color *= pulse;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: false,
            side: THREE.DoubleSide,
        });
    }, []);

    // Animation
    useFrame((state) => {
        if (lineRef.current && material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;

            // Morph between routes
            const morphCycle = (state.clock.elapsedTime * 0.2) % 3;
            const currentRoute = Math.floor(morphCycle);
            const nextRoute = (currentRoute + 1) % 3;
            const morphProgress = morphCycle - currentRoute;

            // Interpolate positions
            const positions = geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < ROUTES[0].length; i++) {
                const current = ROUTES[currentRoute][i];
                const next = ROUTES[nextRoute][i];

                positions[i * 3] = THREE.MathUtils.lerp(current[0], next[0], morphProgress);
                positions[i * 3 + 1] = THREE.MathUtils.lerp(current[1], next[1], morphProgress);
                positions[i * 3 + 2] = THREE.MathUtils.lerp(current[2], next[2], morphProgress);
            }
            geometry.attributes.position.needsUpdate = true;
        }

        // Animate nodes
        if (nodesRef.current) {
            nodesRef.current.children.forEach((node, i) => {
                const time = state.clock.elapsedTime;
                const scale = 1 + Math.sin(time * 3 + i * 0.5) * 0.3;
                node.scale.setScalar(scale);
            });
        }
    });

    return (
        <group>
            {/* Route Line */}
            <line ref={lineRef} geometry={geometry} material={material}>
                <lineBasicMaterial attach="material" color="#a855f7" linewidth={3} />
            </line>

            {/* Nodes along the route */}
            <group ref={nodesRef}>
                {ROUTES[0].map((point, i) => (
                    <mesh key={i} position={[point[0], point[1], point[2]]}>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshStandardMaterial
                            color="#06b6d4"
                            emissive="#06b6d4"
                            emissiveIntensity={2}
                            metalness={0.8}
                            roughness={0.2}
                        />
                        <pointLight color="#06b6d4" intensity={3} distance={5} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function CameraRig() {
    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Gentle orbit
        state.camera.position.x = Math.sin(time * 0.1) * 10;
        state.camera.position.y = 20 + Math.sin(time * 0.15) * 5;
        state.camera.position.z = 50 + Math.cos(time * 0.1) * 10;

        state.camera.lookAt(0, 0, 0);
    });

    return null;
}

export default function NeonRouteHeroBackground() {
    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 20, 50], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                {/* Background gradient */}
                <color attach="background" args={['#0a0a1a']} />
                <fog attach="fog" args={['#1a1a3a', 30, 100]} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[0, 20, 0]} intensity={0.5} color="#a855f7" />

                {/* Route */}
                <NeonRoute />

                {/* Camera animation */}
                <CameraRig />

                {/* Post-processing */}
                <EffectComposer>
                    <Bloom
                        intensity={1.5}
                        luminanceThreshold={0.1}
                        luminanceSmoothing={0.9}
                        radius={0.8}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
