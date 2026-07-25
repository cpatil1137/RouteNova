'use client';

import { useEffect, useRef } from 'react';

class Particle {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  acc: { x: number; y: number };
  maxSpeed: number;
  hueShift: number;

  constructor(width: number, height: number) {
    this.pos = { x: Math.random() * width, y: Math.random() * height };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.maxSpeed = Math.random() * 3 + 3; // Increased speed for closer feel
    this.hueShift = Math.random() * 100;
  }

  update(width: number, height: number, noiseScale: number, frameCount: number, mouseX: number, mouseY: number) {
    // Perlin noise simulation using sine/cosine
    const n = this.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * 0.005);
    const angle = n * Math.PI * 4;

    this.acc.x = Math.cos(angle);
    this.acc.y = Math.sin(angle);

    // Mouse interaction
    const dx = mouseX - this.pos.x;
    const dy = mouseY - this.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 300 && dist > 5) {
      const dirX = dx / dist;
      const dirY = dy / dist;
      this.acc.x += dirX * 0.5;
      this.acc.y += dirY * 0.5;
    }

    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;

    const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    if (speed > this.maxSpeed) {
      this.vel.x = (this.vel.x / speed) * this.maxSpeed;
      this.vel.y = (this.vel.y / speed) * this.maxSpeed;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Wrap around edges
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  noise(x: number, y: number, z: number): number {
    // Simple Perlin-like noise using sine
    return (Math.sin(x * 12.9898 + y * 78.233 + z) * 43758.5453) % 1;
  }

  draw(ctx: CanvasRenderingContext2D, frameCount: number, mousePressed: boolean) {
    let r = 127 + 127 * Math.sin(frameCount * 0.02 + this.hueShift);
    let g = 127 + 127 * Math.cos(frameCount * 0.02 + this.hueShift);
    let b = 200;

    if (mousePressed) {
      r = 255; g = 50; b = 50;
    }

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.lineWidth = 2.5; // Increased for thicker strands

    ctx.beginPath();
    ctx.moveTo(this.pos.x - this.vel.x * 4, this.pos.y - this.vel.y * 4); // Longer trails
    ctx.lineTo(this.pos.x, this.pos.y);
    ctx.stroke();
  }
}

export default function CyberStrandsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, pressed: false });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const particleCount = 600;
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height));
    }

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseDown = () => { mouseRef.current.pressed = true; };
    const handleMouseUp = () => { mouseRef.current.pressed = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const animate = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Additive blend mode for neon effect
      ctx.globalCompositeOperation = 'lighter';

      frameCountRef.current++;
      const noiseScale = 0.005; // Reduced from 0.01 for tighter patterns

      particlesRef.current.forEach(particle => {
        particle.update(
          canvas.width,
          canvas.height,
          noiseScale,
          frameCountRef.current,
          mouseRef.current.x,
          mouseRef.current.y
        );
        particle.draw(ctx, frameCountRef.current, mouseRef.current.pressed);
      });

      ctx.globalCompositeOperation = 'source-over';

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
