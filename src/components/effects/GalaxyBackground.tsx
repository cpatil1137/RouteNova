'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'three-stdlib';
import { MeshSurfaceSampler } from 'three-stdlib';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';
import { createNoise3D } from 'simplex-noise';
// @ts-ignore
import chroma from 'chroma-js';
import gsap from 'gsap';

export default function GalaxyBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        /* SETUP */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5.5; // Increased from 3 to 5.5 to make it look smaller

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const glitchPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.6, 1, 0.5); // Reduced bloom slightly
        composer.addPass(glitchPass);

        /* CONTROLS */
        const controls = new TrackballControls(camera, renderer.domElement);
        controls.minDistance = 0.7;
        controls.maxDistance = 8;
        controls.noZoom = true;
        controls.noPan = true;

        /* NOISE */
        const noise3D = createNoise3D();

        /* COLORS - Matched to App Theme (Cyan, Pink, Violet) */
        const gradient = chroma.scale(["#06b6d4", "#ec4899", "#8b5cf6", "#06b6d4"]);

        /* GALAXY */
        const galaxy = new THREE.Group();
        scene.add(galaxy);

        /* PLANET */
        const planetGeom = new THREE.IcosahedronGeometry(1, 32);
        const planetMat = new THREE.MeshBasicMaterial();
        const planet = new THREE.Mesh(planetGeom, planetMat);

        /* SKY */
        const skyGeom = new THREE.IcosahedronGeometry(10, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                color1: {
                    value: new THREE.Color(0x000000) // Black
                },
                color2: {
                    value: new THREE.Color(0x0a0a0a) // Very dark grey/black
                }
            },
            side: THREE.BackSide,
            vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `
        });
        const sky = new THREE.Mesh(skyGeom, material);
        galaxy.add(sky);

        gsap.to(galaxy.rotation, {
            y: Math.PI * 2,
            x: Math.PI * 2,
            z: Math.PI * 2,
            duration: 60,
            repeat: -1,
            ease: 'none'
        });

        /* BUBBLES */
        const sampler = new MeshSurfaceSampler(planet).build();
        const BUBBLES_COUNT = 50000; // Reduced count slightly for performance, original was 200000
        const tempPosition = new THREE.Vector3();
        const positionsV: THREE.Vector3[] = [];
        const positionsV1: any[] = [];
        const positionsV2: THREE.Vector3[] = [];
        const colors: number[] = [];
        const bubbleGeom = new THREE.BufferGeometry();
        const bubbleMat = new THREE.ShaderMaterial({
            uniforms: {
                size: { value: 6 },
            },
            transparent: true,
            vertexShader: `
        uniform float size;
        attribute vec3 color;

        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = ( size / - mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        void main() {
          if (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
          if (distance(gl_PointCoord, vec2(0.5)) > 0.45) {
            float alpha = distance(gl_PointCoord, vec2(0.5)) - 0.45;
            alpha = alpha / 0.05;
            alpha = 1.0 - alpha;
            gl_FragColor = vec4(vColor, alpha);
          } else {
            gl_FragColor = vec4(vColor, 1.0);
          }
        }
      `,
        });
        const points = new THREE.Points(bubbleGeom, bubbleMat);
        galaxy.add(points);

        for (let i = 0; i < BUBBLES_COUNT; i++) {
            sampler.sample(tempPosition);
            let noise = noise3D(tempPosition.x, tempPosition.y, tempPosition.z);
            noise += 1;
            noise /= 2;
            if (Math.random() > (noise * noise)) {
                i--;
            } else {
                const clone = tempPosition.clone();
                positionsV.push(clone);
                const clone2 = clone.clone() as any;
                clone2.noise = noise;
                positionsV1.push(clone2);
                const clone3 = tempPosition.clone().multiplyScalar(1 + noise * 0.3);
                positionsV2.push(clone3);
                const color = new THREE.Color(gradient(noise).brighten(1).hex());
                colors.push(color.r);
                colors.push(color.g);
                colors.push(color.b);
            }
        }
        bubbleGeom.setFromPoints(positionsV);
        bubbleGeom.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        /* RENDERING */
        let tween = { a: 0 };
        gsap.to(tween, {
            a: 1,
            duration: 4,
            yoyo: true,
            repeat: -1,
            ease: 'none'
        });

        let animationId: number;
        function render() {
            animationId = requestAnimationFrame(render);

            // Only update controls if needed, trackball might grab events
            controls.update();

            positionsV.forEach((p, i) => {
                const p1 = tempPosition.copy(positionsV1[i]);
                const p2 = positionsV2[i];
                let alpha = tween.a;
                if (tween.a + positionsV1[i].noise > 1) {
                    alpha = 1 - (alpha - 1);
                } else {
                }
                p1.lerp(p2, alpha);
                p.copy(p1);
            });

            bubbleGeom.setFromPoints(positionsV);
            composer.render();
        }

        render();

        /* EVENTS */
        function onWindowResize() {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
            glitchPass.setSize(w, h);
        }

        // Use ResizeObserver for more robust resizing of the div container
        const resizeObserver = new ResizeObserver(onWindowResize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationId);
            controls.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            // Cleanup GSAP tweens if possible, though strict cleanup might require keeping track of them
            gsap.killTweensOf(tween);
            gsap.killTweensOf(galaxy.rotation);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0" style={{ transform: 'translateX(0%)' }} /> // Reset transform as we are background now
    );
}

// Add these types if they are missing

