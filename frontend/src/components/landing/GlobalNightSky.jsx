import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function Stars() {
  const starsRef = useRef();

  const positions = useMemo(() => {
    const count = 4500;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 30;
      array[i * 3 + 1] = (Math.random() - 0.5) * 18;
      array[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    return array;
  }, []);

  useFrame((state, delta) => {
    if (!starsRef.current) return;

    starsRef.current.rotation.y += delta * 0.006;
    starsRef.current.rotation.x += delta * 0.0015;

    starsRef.current.material.opacity =
      0.65 + Math.sin(state.clock.elapsedTime * 0.45) * 0.05;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
  color="#ffffff"
  size={0.040}
  sizeAttenuation
  transparent
  opacity={0.60}
  depthWrite={false}
/>
    </points>
  );
}

function BrightStars() {
  const starsRef = useRef();

  const positions = useMemo(() => {
    const count = 350;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * 30;
      array[i * 3 + 1] = (Math.random() - 0.5) * 18;
      array[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }

    return array;
  }, []);

  useFrame((state, delta) => {
    if (!starsRef.current) return;

    starsRef.current.rotation.y -= delta * 0.004;

    const pulse =
      0.78 +
      Math.sin(state.clock.elapsedTime * 1.6) * 0.12;

    starsRef.current.material.opacity = pulse;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </points>
  );
}

function GlobalNightSky() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#01030a]"
    >
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 55,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Stars />
        <BrightStars />
      </Canvas>

      <div className="absolute inset-0 bg-[#01030a]/20" />

      <div className="absolute left-[12%] top-[20%] h-[300px] w-[300px] rounded-full bg-violet-600/[0.018] blur-[120px]" />

      <div className="absolute right-[10%] top-[48%] h-[340px] w-[340px] rounded-full bg-cyan-500/[0.012] blur-[140px]" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/5 via-transparent to-[#01030a]/30" />
    </div>
  );
}

export default GlobalNightSky;