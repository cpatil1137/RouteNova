'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function SubtleWaveShader() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    useEffect(() => {
        if (!meshRef.current) return;

        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.resolution.value = new THREE.Vector2(size.width, size.height);
    }, [size]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.time.value = state.clock.getElapsedTime();
    });

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform float time;
    uniform vec2 resolution;

    void main() {
      vec2 uv = (vUv * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
      
      float t = time * 0.3;
      
      // Create gentle wave pattern
      float wave1 = sin(uv.x * 3.0 + t) * 0.5;
      float wave2 = sin(uv.y * 3.0 + t * 0.8) * 0.5;
      float wave3 = sin((uv.x + uv.y) * 2.0 + t * 0.6) * 0.3;
      
      float pattern = wave1 + wave2 + wave3;
      
      // Distance from center for fade
      float dist = length(uv);
      float fade = smoothstep(1.8, 0.0, dist);
      
      // Pink/violet glow
      vec3 color1 = vec3(0.9, 0.3, 0.6); // pink
      vec3 color2 = vec3(0.5, 0.3, 0.8); // violet
      vec3 color = mix(color1, color2, sin(pattern + t) * 0.5 + 0.5);
      
      // Increased visibility
      float intensity = (pattern * 0.5 + 0.5) * fade * 0.4;
      
      gl_FragColor = vec4(color * intensity, intensity);
    }
  `;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    time: { value: 0 },
                    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                }}
                transparent={true}
            />
        </mesh>
    );
}

export default function SubtleWaveBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75 }}
                gl={{ alpha: true, antialias: true }}
            >
                <SubtleWaveShader />
            </Canvas>
        </div>
    );
}
