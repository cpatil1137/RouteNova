'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { TilesRenderer } from '3d-tiles-renderer';
import * as THREE from 'three';

export default function PuneTiles() {
    const { scene, camera, gl } = useThree();
    const tilesRef = useRef<TilesRenderer | null>(null);

    useEffect(() => {
        // Get Google Maps API key from environment
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

        if (!apiKey) {
            console.warn('Google Maps API key not found. Skipping 3D tiles.');
            return;
        }

        // Initialize 3D Tiles Renderer
        const tilesUrl = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`;

        const tiles = new TilesRenderer(tilesUrl);
        tilesRef.current = tiles;

        // Configure tiles
        tiles.setCamera(camera);
        tiles.setResolutionFromRenderer(camera, gl);

        // Custom material for dark silhouette with emissive glow
        tiles.onLoadTileSet = () => {
            console.log('3D Tiles loaded successfully');

            // Apply custom materials to tiles
            tiles.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a, // Dark gray
                        emissive: 0x2a2a3a, // Subtle purple emissive
                        emissiveIntensity: 0.2,
                        metalness: 0.3,
                        roughness: 0.7,
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
        };

        tiles.onLoadModel = (scene) => {
            // Apply materials to newly loaded models
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a,
                        emissive: 0x2a2a3a,
                        emissiveIntensity: 0.2,
                        metalness: 0.3,
                        roughness: 0.7,
                    });
                }
            });
        };

        // Set Pune bounding box for tile loading
        // Pune: 18.48-18.58 lat, 73.80-73.92 lon
        const puneBounds = {
            south: 18.48,
            north: 18.58,
            west: 73.80,
            east: 73.92,
        };

        // Add tiles to scene
        scene.add(tiles.group);

        // Cleanup
        return () => {
            if (tilesRef.current) {
                scene.remove(tilesRef.current.group);
                tilesRef.current.dispose();
            }
        };
    }, [scene, camera, gl]);

    // Update tiles on each frame
    useFrame(() => {
        if (tilesRef.current) {
            tilesRef.current.setCamera(camera);
            tilesRef.current.setResolutionFromRenderer(camera, gl);
            tilesRef.current.update();
        }
    });

    return null;
}
