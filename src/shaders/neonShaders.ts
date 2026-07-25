// Custom neon line shader for route connections
// Creates animated gradient effect with trail animation

export const neonLineVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const neonLineFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorStart;
  uniform vec3 uColorMid;
  uniform vec3 uColorEnd;
  uniform float uTrailPosition;
  uniform float uTrailLength;
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    // Create gradient along the line
    float gradientMix = vUv.x;
    
    // Mix between three colors for rich gradient
    vec3 color1 = mix(uColorStart, uColorMid, smoothstep(0.0, 0.5, gradientMix));
    vec3 color2 = mix(uColorMid, uColorEnd, smoothstep(0.5, 1.0, gradientMix));
    vec3 baseColor = mix(color1, color2, step(0.5, gradientMix));
    
    // Animated trail effect
    float trailStart = mod(uTrailPosition, 1.0 + uTrailLength);
    float trailEnd = trailStart + uTrailLength;
    float distanceFromTrail = abs(vUv.x - trailStart);
    float trailIntensity = 1.0 - smoothstep(0.0, uTrailLength, distanceFromTrail);
    
    // Pulsing glow effect
    float pulse = (sin(uTime * 2.0) + 1.0) * 0.5;
    float glow = uGlowIntensity * (0.7 + pulse * 0.3);
    
    // Combine effects
    vec3 finalColor = baseColor * (1.0 + trailIntensity * 2.0) * glow;
    float alpha = 0.8 + trailIntensity * 0.2;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Pin glow shader
export const pinGlowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const pinGlowFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uGlowIntensity;
  uniform float uPulseSpeed;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect for rim glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
    
    // Pulsing animation
    float pulse = (sin(uTime * uPulseSpeed) + 1.0) * 0.5;
    
    // Combine effects
    float intensity = uGlowIntensity * (0.6 + pulse * 0.4 + fresnel * 0.5);
    vec3 glowColor = uColor * intensity;
    
    gl_FragColor = vec4(glowColor, 1.0);
  }
`;

// Shader uniforms types
export interface NeonLineUniforms {
    uTime: { value: number };
    uColorStart: { value: [number, number, number] };
    uColorMid: { value: [number, number, number] };
    uColorEnd: { value: [number, number, number] };
    uTrailPosition: { value: number };
    uTrailLength: { value: number };
    uGlowIntensity: { value: number };
}

export interface PinGlowUniforms {
    uTime: { value: number };
    uColor: { value: [number, number, number] };
    uGlowIntensity: { value: number };
    uPulseSpeed: { value: number };
}
