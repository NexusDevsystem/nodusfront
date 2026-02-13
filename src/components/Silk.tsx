/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect, useImperativeHandle } from 'react';
import * as THREE from 'three';

const hexToNormalizedRGB = (hex: string) => {
    const color = new THREE.Color(hex);
    return [color.r, color.g, color.b];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
    uniforms: any;
}

const SilkPlane = forwardRef<THREE.Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
    const { viewport } = useThree();
    const localRef = useRef<THREE.Mesh>(null!);

    // Merge provided ref with local ref
    useImperativeHandle(ref, () => localRef.current);

    useLayoutEffect(() => {
        if (localRef.current) {
            localRef.current.scale.set(viewport.width, viewport.height, 1);
        }
    }, [viewport]);

    useFrame((_, delta) => {
        if (localRef.current) {
            (localRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.1 * delta;
        }
    });

    return (
        <mesh ref={localRef}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
        </mesh>
    );
});
SilkPlane.displayName = 'SilkPlane';

interface SilkProps {
    speed?: number;
    scale?: number;
    color?: string;
    noiseIntensity?: number;
    rotation?: number;
}

const Silk = ({
    speed = 5,
    scale = 1,
    color = '#7B7481',
    noiseIntensity = 1.5,
    rotation = 0
}: SilkProps) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(
        () => ({
            uSpeed: { value: speed },
            uScale: { value: scale },
            uNoiseIntensity: { value: noiseIntensity },
            uColor: { value: new THREE.Color(...hexToNormalizedRGB(color)) },
            uRotation: { value: rotation },
            uTime: { value: 0 }
        }),
        [speed, scale, noiseIntensity, color, rotation]
    );

    return (
        <div className="w-full h-full relative">
            <Canvas dpr={[1, 2]} frameloop="always">
                <SilkPlane ref={meshRef} uniforms={uniforms} />
            </Canvas>
        </div>
    );
};

export default Silk;
