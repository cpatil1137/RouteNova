'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShaderBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Three.js scene
        const camera = new THREE.Camera();
        camera.position.z = 1;

        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Shader uniforms
        const uniforms = {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() }
        };

        // Vertex Shader
        const vertexShader = `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        // Fragment Shader - Glass Light Animation
        const fragmentShader = `
            #ifdef GL_ES
            precision mediump float;
            #endif

            uniform float time;
            uniform vec2 resolution;

            // Noise function for organic movement
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // Smooth noise
            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            // Fractal Brownian Motion
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 5; i++) {
                    value += amplitude * smoothNoise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }

            // Create glass-like light effect
            vec3 glassLight(vec2 uv, vec2 center, float radius, vec3 color) {
                float dist = length(uv - center);
                float intensity = 1.0 - smoothstep(0.0, radius, dist);
                intensity = pow(intensity, 2.0);
                
                // Add glass refraction effect
                vec2 offset = (uv - center) * 0.1;
                float refraction = fbm(uv * 3.0 + offset + time * 0.1);
                intensity *= (0.7 + refraction * 0.3);
                
                return color * intensity;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                uv = uv * 2.0 - 1.0;
                uv.x *= resolution.x / resolution.y;
                
                vec3 finalColor = vec3(0.0);
                
                // Animated background gradient
                float bgNoise = fbm(uv * 2.0 + time * 0.05);
                vec3 bgColor = vec3(0.02, 0.02, 0.05) * (0.5 + bgNoise * 0.5);
                
                // Multiple glass light sources
                float t = time * 0.3;
                
                // Light 1 - Cyan
                vec2 light1Pos = vec2(sin(t) * 0.5, cos(t * 0.7) * 0.5);
                finalColor += glassLight(uv, light1Pos, 1.2, vec3(0.1, 0.8, 1.0));
                
                // Light 2 - Pink
                vec2 light2Pos = vec2(cos(t * 0.8) * 0.6, sin(t * 0.5) * 0.4);
                finalColor += glassLight(uv, light2Pos, 1.0, vec3(1.0, 0.2, 0.6));
                
                // Light 3 - Violet
                vec2 light3Pos = vec2(sin(t * 0.6) * 0.4, cos(t * 0.9) * 0.6);
                finalColor += glassLight(uv, light3Pos, 1.1, vec3(0.6, 0.3, 1.0));
                
                // Light 4 - Yellow/Gold
                vec2 light4Pos = vec2(cos(t * 1.1) * 0.3, sin(t * 0.4) * 0.3);
                finalColor += glassLight(uv, light4Pos, 0.8, vec3(1.0, 0.8, 0.2));
                
                // Add flowing energy lines
                float lines = fbm(vec2(uv.x * 5.0 + time * 0.2, uv.y * 3.0));
                lines = smoothstep(0.4, 0.6, lines);
                finalColor += vec3(0.1, 0.2, 0.3) * lines * 0.3;
                
                // Combine with background
                finalColor = bgColor + finalColor * 0.4;
                
                // Add subtle vignette
                float vignette = 1.0 - length(uv * 0.5);
                vignette = smoothstep(0.3, 1.0, vignette);
                finalColor *= vignette;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;

        containerRef.current.appendChild(renderer.domElement);

        // Handle resize
        const handleResize = () => {
            if (!renderer || !uniforms) return;
            renderer.setSize(window.innerWidth, window.innerHeight);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            uniforms.time.value += 0.05;
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (renderer) {
                renderer.dispose();
                if (containerRef.current?.contains(renderer.domElement)) {
                    containerRef.current.removeChild(renderer.domElement);
                }
            }
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}
