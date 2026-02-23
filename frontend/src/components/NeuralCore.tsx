"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

function CoreShape() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.rotation.x = time * 0.1;
        meshRef.current.rotation.y = time * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <Sphere ref={meshRef} args={[1.2, 32, 32]}>
        <meshBasicMaterial
          color="#00ff94"
          wireframe
          transparent
          opacity={0.1}
        />
      </Sphere>
    </Float>
  );
}

export default function NeuralCore() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <CoreShape />
        <fog attach="fog" args={["#0d0d0d", 5, 10]} />
      </Canvas>
    </div>
  );
}
