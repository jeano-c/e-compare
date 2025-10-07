import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function TextureMesh() {
  const mesh = useRef();

  useFrame((state) => {
    const { clock, mouse, gl } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.u_mouse.value = [
        mouse.x / 2 + 0.5,
        mouse.y / 2 + 0.5,
      ];
      mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
      const rect = gl.domElement.getBoundingClientRect();
      mesh.current.material.uniforms.u_resolution.value = [
        rect.width,
        rect.height,
      ];
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1024, 1024]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={{
          u_color: { value: new THREE.Vector3(0.3, 0, 1) },
          u_background: { value: new THREE.Vector4(0, 0, 0, 1) },
          u_speed: { value: 0.1 },
          u_detail: { value: 0.4 },
          u_time: { value: 0 },
          u_mouse: { value: [0, 0] },
          u_resolution: { value: [1024, 1024] },
        }}
      />
    </mesh>
  );
}

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color;
  uniform vec4 u_background;
  uniform float u_speed;
  uniform float u_detail;

  mat2 m(float a) {
    float c=cos(a), s=sin(a);
    return mat2(c,-s,s,c);
  }

  float map(vec3 p) {
    float t = u_time * u_speed;
    p.xz *= m(t * 0.4);
    p.xy *= m(t * 0.1);
    vec3 q = p * 2.0 + t;
    return length(p + vec3(sin((t*u_speed) * 0.1))) * log(length(p) + 0.9)
      + cos(q.x + sin(q.z + cos(q.y))) * 0.5 - 1.0;
  }

  void main() {
    vec2 a = gl_FragCoord.xy / u_resolution.x - vec2(0.5, 0.5);
    vec3 cl = vec3(0.0);
    float d = 2.5;

    for (float i = 0.; i <= (1. + 20. * u_detail); i++) {
      vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
      float rz = map(p);
      float f = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
      vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
      cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
      d += min(rz, 1.0);
    }

    vec4 color = vec4(min(u_color, cl),1.0);
    color.r = max(u_background.r,color.r);
    color.g = max(u_background.g,color.g);
    color.b = max(u_background.b,color.b);
    gl_FragColor = color;
  }
`;

export default function ShaderBackground() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
      gl={{
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
        alpha: true,
        antialias: true,
        precision: "highp",
        powerPreference: "high-performance",
      }}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
    >
      <TextureMesh />
    </Canvas>
  );
}
