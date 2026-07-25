'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

class TrailStop {
    static options = {
        nextStopAdvanceDistance: 10,
        nextStopDirectionSpreadFactor: 0.5,
        circleRadius: 10,
        minDuration: 0.5,
        maxDuration: 1,
        bezierCurveControlPointDistanceFactor: 5,
        stopRotationFactor: 1,
        numberOfCrossCurvePoints: 16,
        numberOfCrossCurves: 48,
        numberOfPointsOnCrossCurvePiece: 10
    };

    scene_: THREE.Scene;
    previousStop_: TrailStop | null;
    nextStop_?: TrailStop;
    obj_!: THREE.Object3D;
    bezierCurvePoints_: [THREE.Vector3, THREE.Vector3][];
    bezierCurves_?: THREE.CubicBezierCurve3[];
    crossCurves_?: { line: THREE.Line; time: number }[];
    startTime_!: number;
    duration_!: number;

    constructor(scene: THREE.Scene, previousStop: TrailStop | null) {
        this.scene_ = scene;
        this.previousStop_ = previousStop;
        this.bezierCurvePoints_ = [];
        if (this.previousStop_) {
            this.initWithPreviousStop();
        } else {
            this.initDefault();
        }
        this.addBezierCurvePoints();
        if (this.previousStop_) {
            this.calculateBezierCurves();
            this.addCrossCurves();
        }
        scene.add(this.obj_);
    }

    initDefault() {
        this.obj_ = new THREE.Object3D();
        this.obj_.position.set(0, 0, 0);
        this.obj_.updateMatrixWorld();
        this.startTime_ = 0;
        this.duration_ = 0;
    }

    initWithPreviousStop() {
        if (!this.previousStop_) return;
        this.previousStop_.nextStop_ = this;
        this.obj_ = this.previousStop_.obj_.clone(false);
        this.obj_.position.copy(
            this.obj_.localToWorld(
                new THREE.Vector3(0, 0, -TrailStop.options.nextStopAdvanceDistance)
            )
        );
        this.obj_.updateMatrixWorld();
        this.startTime_ =
            this.previousStop_.startTime_ + this.previousStop_.duration_;
        this.duration_ = THREE.MathUtils.randFloat(
            TrailStop.options.minDuration,
            TrailStop.options.maxDuration
        );

        const target = new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(
                TrailStop.options.nextStopAdvanceDistance
            ),
            THREE.MathUtils.randFloatSpread(
                TrailStop.options.nextStopAdvanceDistance
            ),
            TrailStop.options.nextStopDirectionSpreadFactor *
            TrailStop.options.nextStopAdvanceDistance
        );
        this.obj_.up.applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            THREE.MathUtils.randFloatSpread(
                Math.PI * TrailStop.options.stopRotationFactor
            )
        );
        this.obj_.lookAt(this.obj_.localToWorld(target));
        this.obj_.updateMatrixWorld();
    }

    addBezierCurvePointWithRandomControlPoint(p: THREE.Vector3) {
        let controlPointOffset = new THREE.Vector3();
        if (this.previousStop_) {
            controlPointOffset.set(
                THREE.MathUtils.randFloatSpread(
                    2 * TrailStop.options.bezierCurveControlPointDistanceFactor
                ),
                THREE.MathUtils.randFloatSpread(
                    2 * TrailStop.options.bezierCurveControlPointDistanceFactor
                ),
                TrailStop.options.bezierCurveControlPointDistanceFactor
            );
        }
        this.bezierCurvePoints_.push([p, controlPointOffset.add(p)]);
    }

    addBezierCurvePoints() {
        this.addBezierCurvePointWithRandomControlPoint(new THREE.Vector3(0, 0, 0));
        this.addBezierCurvePointWithRandomControlPoint(
            new THREE.Vector3(0, TrailStop.options.circleRadius, 0)
        );
        for (let i = 0; i < TrailStop.options.numberOfCrossCurvePoints; ++i) {
            const angle =
                Math.PI *
                (1 +
                    (2 * i + THREE.MathUtils.randFloatSpread(1)) /
                    TrailStop.options.numberOfCrossCurvePoints);
            this.addBezierCurvePointWithRandomControlPoint(
                new THREE.Vector3(
                    TrailStop.options.circleRadius * Math.cos(angle),
                    TrailStop.options.circleRadius * Math.sin(angle),
                    0
                )
            );
        }
    }

    calculateBezierCurves() {
        if (!this.previousStop_) return;
        this.bezierCurves_ = [];
        for (let i = 0; i < this.bezierCurvePoints_.length; ++i) {
            const points = this.bezierCurvePoints_[i];
            const previousPoints = this.previousStop_.bezierCurvePoints_[i].map((p) =>
                this.obj_.worldToLocal(this.previousStop_!.obj_.localToWorld(p.clone()))
            );
            previousPoints[1] = previousPoints[1]
                .negate()
                .addScaledVector(previousPoints[0], 2);
            this.bezierCurves_.push(
                new THREE.CubicBezierCurve3(
                    previousPoints[0],
                    previousPoints[1],
                    points[1],
                    points[0]
                )
            );
        }
    }

    addCrossCurves() {
        if (!this.bezierCurves_) return;
        const allCurvePoints: THREE.Vector3[][] = [];
        for (let i = 0; i < TrailStop.options.numberOfCrossCurvePoints; ++i) {
            const points = this.bezierCurves_[
                this.bezierCurves_.length - 1 - i
            ].getPoints(TrailStop.options.numberOfCrossCurves);
            points.pop();
            allCurvePoints.push(points);
        }
        this.crossCurves_ = [];
        for (let i = 0; i < allCurvePoints.length; ++i) {
            const i1 = (i + 1) % allCurvePoints.length;
            const i2 = (i + 2) % allCurvePoints.length;
            for (let k = 0; k < allCurvePoints[i].length; ++k) {
                const curve = new THREE.QuadraticBezierCurve3(
                    allCurvePoints[i][k]
                        .clone()
                        .add(allCurvePoints[i1][k])
                        .multiplyScalar(0.5),
                    allCurvePoints[i1][k],
                    allCurvePoints[i2][k]
                        .clone()
                        .add(allCurvePoints[i1][k])
                        .multiplyScalar(0.5)
                );
                const geometry = new THREE.BufferGeometry().setFromPoints(
                    curve.getPoints(TrailStop.options.numberOfPointsOnCrossCurvePiece)
                );

                // Create shader material with animated gradient
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color(0xffffff) }
                    },
                    vertexShader: `
                        varying vec3 vPosition;
                        void main() {
                            vPosition = position;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float uTime;
                        uniform vec3 uColor;
                        varying vec3 vPosition;
                        
                        void main() {
                            // Define theme colors
                            vec3 cyan = vec3(0.369, 0.918, 0.831);    // #5EEAD4
                            vec3 violet = vec3(0.545, 0.361, 0.965);  // #8B5CF6
                            vec3 pink = vec3(0.925, 0.282, 0.6);      // #EC4899
                            
                            // Create moving gradient
                            float timeFactor = uTime * 1.57;
                            float mixFactor = sin(vPosition.z * 0.5 + timeFactor) * 0.5 + 0.5;
                            
                            // Mix colors
                            vec3 color1 = mix(cyan, violet, mixFactor);
                            vec3 color2 = mix(violet, pink, sin(timeFactor * 0.5) * 0.5 + 0.5);
                            vec3 finalColor = mix(color1, color2, mixFactor);
                            
                            // Apply brightness from uColor
                            finalColor *= uColor;
                            
                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `,
                    transparent: false
                });

                const line = new THREE.Line(geometry, material);
                this.obj_.add(line);
                this.crossCurves_.push({
                    line: line,
                    time: this.getTime(k / allCurvePoints[i].length)
                });
            }
        }
    }

    remove() {
        this.obj_.removeFromParent();
        if (this.crossCurves_) {
            this.crossCurves_.forEach(curve => {
                curve.line.geometry.dispose();
                (curve.line.material as THREE.Material).dispose();
            });
        }

        if (this.previousStop_) {
            this.previousStop_.nextStop_ = this.nextStop_;
        }
        if (this.nextStop_) {
            this.nextStop_.previousStop_ = this.previousStop_;
        }
    }

    getFinishTime() {
        return this.startTime_ + this.duration_;
    }

    getProgress(time: number) {
        return (time - this.startTime_) / this.duration_;
    }

    getTime(progress: number) {
        return this.startTime_ + progress * this.duration_;
    }

    updateCamera(ctx: { camera: THREE.Object3D; timeElapsed: number }) {
        if (!this.bezierCurves_ || !this.nextStop_?.bezierCurves_) return;
        this.obj_.attach(ctx.camera);

        const progress = this.getProgress(ctx.timeElapsed);
        const cameraPos = new THREE.Vector3();
        this.bezierCurves_[0].getPoint(progress, cameraPos);
        ctx.camera.position.copy(cameraPos);

        const upPoint = this.bezierCurves_[1].getPoint(progress);
        (ctx.camera as any).up.copy(
            this.obj_
                .localToWorld(upPoint)
                .addScaledVector(
                    this.obj_.localToWorld(ctx.camera.position.clone()),
                    -1
                )
        );
        const lookAtPoint = this.nextStop_.bezierCurves_[0].getPoint(progress);
        (ctx.camera as any).lookAt(
            this.nextStop_.obj_.localToWorld(lookAtPoint)
        );
    }

    updateColor(colorFunc: (time: number) => THREE.Color, currentTime: number) {
        if (!this.crossCurves_) {
            return;
        }
        for (const obj of this.crossCurves_) {
            const material = obj.line.material as THREE.ShaderMaterial;
            if (material.uniforms) {
                material.uniforms.uTime.value = currentTime;
                material.uniforms.uColor.value = colorFunc(obj.time);
            }
        }
    }

    updateParticle(particle: { curveCurvePointIndex: number; obj: THREE.Mesh; time: number }) {
        if (!this.bezierCurves_) return;
        const progress = this.getProgress(particle.time);
        const point = this.bezierCurves_[
            this.bezierCurves_.length - 1 - particle.curveCurvePointIndex
        ].getPoint(progress);
        particle.obj.position.copy(this.obj_.localToWorld(point.clone()));
    }
}

class Trail {
    static options = {
        maxNumberStops: 8,
        maxVisibleStops: 2,
        indexOfCameraStop: 1,
        timeAdvanceStep: 0.003,
        numberOfParticles: 16,
        particleSpeedRange: [0.006, 0.012],
        maxParticleSpawnDelay: 0.5,
        particleSizeRange: [0.1, 0.5]
    };

    scene_: THREE.Scene;
    stops_: TrailStop[];
    particles_: {
        obj: THREE.Mesh;
        curveCurvePointIndex?: number;
        time?: number;
        speed?: number;
    }[];
    timeElapsed: number;
    totalDurationOfFinishedStops: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene_ = scene;
        this.stops_ = [];
        for (let i = 0; i < Trail.options.maxNumberStops; ++i) {
            this.addNewStop();
        }

        this.particles_ = [];
        for (let i = 0; i < Trail.options.numberOfParticles; ++i) {
            const size = THREE.MathUtils.randFloat(
                Trail.options.particleSizeRange[0],
                Trail.options.particleSizeRange[1]
            );
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(size / 2, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            this.scene_.add(sphere);
            this.particles_.push({ obj: sphere });
        }
        for (const particle of this.particles_) {
            this.resetParticle(particle);
            particle.time! += THREE.MathUtils.randFloatSpread(
                Trail.options.maxParticleSpawnDelay * Trail.options.numberOfParticles
            );
        }

        this.timeElapsed = this.stops_[Trail.options.indexOfCameraStop].startTime_;
    }

    resetParticle(particle: any) {
        particle.curveCurvePointIndex = THREE.MathUtils.randInt(
            0,
            TrailStop.options.numberOfCrossCurvePoints - 1
        );

        particle.time =
            this.getTotalDuration() +
            THREE.MathUtils.randFloat(0, Trail.options.maxParticleSpawnDelay);
        particle.speed = THREE.MathUtils.randFloat(
            Trail.options.particleSpeedRange[0],
            Trail.options.particleSpeedRange[1]
        );
    }

    addNewStop() {
        if (this.stops_.length === 0) {
            this.stops_.push(new TrailStop(this.scene_, null));
        } else {
            this.stops_.push(
                new TrailStop(this.scene_, this.stops_[this.stops_.length - 1])
            );
        }
        while (this.stops_.length > Trail.options.maxNumberStops) {
            const stop = this.stops_.shift();
            if (stop) {
                this.totalDurationOfFinishedStops += stop.duration_;
                stop.remove();
            }
        }
    }

    getTotalDuration() {
        const lastStop = this.stops_[this.stops_.length - 1];
        return lastStop.startTime_ + lastStop.duration_;
    }

    colorFunction(time: number) {
        if (time < this.timeElapsed) {
            return new THREE.Color(1, 1, 1);
        }
        const maxDuration =
            (Trail.options.maxVisibleStops *
                (TrailStop.options.minDuration + TrailStop.options.maxDuration)) /
            2;
        let t = time - this.timeElapsed;
        if (t > maxDuration) {
            return new THREE.Color(0, 0, 0);
        }
        t = t / maxDuration;
        t = 1 - t * t;
        return new THREE.Color(t, t, t);
    }

    update(ctx: { camera: THREE.Object3D }) {
        while (
            this.timeElapsed >
            this.stops_[Trail.options.indexOfCameraStop + 1].startTime_
        ) {
            this.addNewStop();
        }
        const cameraStop = this.stops_[Trail.options.indexOfCameraStop];
        cameraStop.updateCamera({
            camera: ctx.camera,
            timeElapsed: this.timeElapsed
        });
        for (const stop of this.stops_) {
            stop.updateColor((t) => this.colorFunction(t), this.timeElapsed);
        }
        for (const particle of this.particles_) {
            particle.time! -= particle.speed!;
            if (particle.time! > this.getTotalDuration()) {
                continue;
            }
            for (
                let curStop: TrailStop | null | undefined = this.stops_[this.stops_.length - 1];
                ;
                curStop = curStop?.previousStop_
            ) {
                if (!curStop) {
                    this.resetParticle(particle);
                    break;
                }
                if (particle.time! < curStop.startTime_) {
                    continue;
                }
                const material = particle.obj.material as THREE.MeshBasicMaterial;
                material.color = this.colorFunction(particle.time!);
                curStop.updateParticle(particle as any);
                break;
            }
        }
        this.timeElapsed += Trail.options.timeAdvanceStep;
    }

    cleanup() {
        // Clean up all stops
        for (const stop of this.stops_) {
            stop.remove();
        }
        // Clean up all particles
        for (const particle of this.particles_) {
            particle.obj.geometry.dispose();
            (particle.obj.material as THREE.Material).dispose();
            this.scene_.remove(particle.obj);
        }
    }
}

export default function TrailBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const trailRef = useRef<Trail | null>(null);
    const cameraContainerRef = useRef<THREE.Object3D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !mounted) return;

        // Setup scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        cameraRef.current = camera;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        // Camera container
        const cameraContainer = new THREE.Object3D();
        cameraContainerRef.current = cameraContainer;
        cameraContainer.attach(camera);
        camera.lookAt(0, 0, 10);

        // Create trail
        const trail = new Trail(scene);
        trailRef.current = trail;

        // Handle resize
        const handleResize = () => {
            if (!renderer || !camera) return;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        function animate() {
            if (!trail || !cameraContainer || !renderer || !camera || !scene) return;
            trail.update({ camera: cameraContainer });
            renderer.render(scene, camera);
            animationFrameRef.current = window.requestAnimationFrame(animate);
        }
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (trailRef.current) {
                trailRef.current.cleanup();
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (containerRef.current && rendererRef.current.domElement) {
                    containerRef.current.removeChild(rendererRef.current.domElement);
                }
            }
        };
    }, [mounted]);

    if (!mounted) {
        return (
            <div
                className="fixed inset-0 w-full h-full -z-10"
                style={{ backgroundColor: '#000000' }}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-full h-full -z-10"
            style={{ backgroundColor: '#000000' }}
        />
    );
}
