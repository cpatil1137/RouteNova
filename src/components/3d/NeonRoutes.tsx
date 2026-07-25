'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PUNE_GRAPH_PINS, getPinById } from '@/data/puneGraphPins';
import { latLonTo3D } from '@/utils/mercatorProjection';
import { neonLineVertexShader, neonLineFragmentShader, type NeonLineUniforms } from '@/shaders/neonShaders';

export default function NeonRoutes() {
    const groupRef = useRef<THREE.Group>(null);

    // Generate route connections
    const routes = useMemo(() => {
        const connections: Array<{
            start: THREE.Vector3;
            end: THREE.Vector3;
            id: string;
        }> = [];

        PUNE_GRAPH_PINS.forEach((pin) => {
            const startPos = latLonTo3D(pin.lat, pin.lon, 2);
            const start = new THREE.Vector3(startPos.x, startPos.y, startPos.z);

            pin.connections.forEach((connId) => {
                const connectedPin = getPinById(connId);
                if (connectedPin) {
                    const endPos = latLonTo3D(connectedPin.lat, connectedPin.lon, 2);
                    const end = new THREE.Vector3(endPos.x, endPos.y, endPos.z);

                    // Avoid duplicate connections
                    const routeId = [pin.id, connId].sort().join('-');
                    if (!connections.find((r) => r.id === routeId)) {
                        connections.push({ start, end, id: routeId });
                    }
                }
            });
        });

        return connections;
    }, []);

    // Animate routes
    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        const time = clock.getElapsedTime();

        groupRef.current.children.forEach((child) => {
            if (child instanceof THREE.Line) {
                const material = child.material as THREE.ShaderMaterial;
                if (material.uniforms?.uTime) {
                    material.uniforms.uTime.value = time;
                    material.uniforms.uTrailPosition.value = (time * 0.2) % 1.0;
                }
            }
        });
    });

    return (
        <group ref={groupRef}>
            {routes.map((route) => (
                <NeonRoute key={route.id} start={route.start} end={route.end} />
            ))}
        </group>
    );
}

interface NeonRouteProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
}

function NeonRoute({ start, end }: NeonRouteProps) {
    // Create curved path between points
    const curve = useMemo(() => {
        const midPoint = new THREE.Vector3()
            .addVectors(start, end)
            .multiplyScalar(0.5);

        // Add arc height based on distance
        const distance = start.distanceTo(end);
        midPoint.y += distance * 0.15; // Arc height proportional to distance

        return new THREE.QuadraticBezierCurve3(start, midPoint, end);
    }, [start, end]);

    // Generate geometry from curve
    const geometry = useMemo(() => {
        const points = curve.getPoints(50);
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [curve]);

    // Create shader material
    const material = useMemo(() => {
        const uniforms: NeonLineUniforms = {
            uTime: { value: 0 },
            uColorStart: { value: [0.6, 0.3, 0.9] }, // Purple
            uColorMid: { value: [0.2, 0.9, 0.9] }, // Cyan
            uColorEnd: { value: [0.9, 0.3, 0.7] }, // Magenta
            uTrailPosition: { value: 0 },
            uTrailLength: { value: 0.2 },
            uGlowIntensity: { value: 1.2 },
        };

        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: neonLineVertexShader,
            fragmentShader: neonLineFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            linewidth: 2,
        });
    }, []);

    return <line geometry={geometry} material={material} />;
}
