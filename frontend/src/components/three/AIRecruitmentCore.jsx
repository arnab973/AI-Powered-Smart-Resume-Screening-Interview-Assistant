import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function StarField() {
  const pointsRef = useRef();

  const { positions, sizes, opacities } = useMemo(() => {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      positions[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3 + 2] =
        radius * Math.cos(phi);

      sizes[i] = 0.015 + Math.random() * 0.035;
      opacities[i] = 0.2 + Math.random() * 0.8;
    }

    return {
      positions,
      sizes,
      opacities,
    };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y += delta * 0.008;
    pointsRef.current.rotation.x += delta * 0.002;

    const material = pointsRef.current.material;

    material.opacity =
      0.48 + Math.sin(state.clock.elapsedTime * 0.7) * 0.12;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />

        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />

        <bufferAttribute
          attach="attributes-opacity"
          count={opacities.length}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#c4b5fd"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EnergyParticles() {
  const ref = useRef();

  const positions = useMemo(() => {
    const count = 160;
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.3 + Math.random() * 1.8;

      array[i * 3] = Math.cos(angle) * radius;
      array[i * 3 + 1] =
        (Math.random() - 0.5) * 2.4;
      array[i * 3 + 2] =
        Math.sin(angle) * radius;
    }

    return array;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y -= delta * 0.035;
    ref.current.rotation.x += delta * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#22d3ee"
        size={0.035}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function NeuralConnection({ from, to, color = "#8b7fff" }) {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ];

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [from, to]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

function NeuralCore() {
  const groupRef = useRef();
  const coreRef = useRef();

  const nodes = useMemo(
    () => [
      [-1.65, 0.75, 0.1],
      [-1.35, -0.75, 0.25],
      [-0.85, 1.25, -0.2],
      [-0.35, -1.3, 0.1],
      [0.7, 1.25, 0.2],
      [1.55, 0.65, -0.1],
      [1.4, -0.7, 0.15],
      [0.65, -1.25, -0.15],
      [0, 0.8, 0.1],
      [0, -0.75, 0],
      [0.85, 0, 0.15],
      [-0.85, 0, -0.1],
      [0, 0, 0],
    ],
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += delta * 0.085;
    groupRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.25) * 0.08;

    if (coreRef.current) {
      const pulse =
        1 +
        Math.sin(state.clock.elapsedTime * 2.4) * 0.08;

      coreRef.current.scale.setScalar(pulse);
    }
  });

  const outerNodes = nodes.slice(0, -1);
  const core = nodes[nodes.length - 1];

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef} position={core}>
        <icosahedronGeometry args={[0.3, 2]} />

        <meshStandardMaterial
          color="#a78bfa"
          emissive="#6d5dfc"
          emissiveIntensity={3.5}
          roughness={0.15}
          metalness={0.7}
          transparent
          opacity={0.95}
        />
      </mesh>

      <mesh position={core}>
        <icosahedronGeometry args={[0.44, 1]} />

        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>

      {outerNodes.map((position, index) => (
        <mesh
          key={`node-${index}`}
          position={position}
        >
          <sphereGeometry args={[0.075, 16, 16]} />

          <meshStandardMaterial
            color={
              index % 2 === 0
                ? "#22d3ee"
                : "#a78bfa"
            }
            emissive={
              index % 2 === 0
                ? "#22d3ee"
                : "#6d5dfc"
            }
            emissiveIntensity={3}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}

      {outerNodes.map((node, index) => (
        <NeuralConnection
          key={`connection-${index}`}
          from={node}
          to={core}
          color={
            index % 2 === 0
              ? "#22d3ee"
              : "#8b7fff"
          }
        />
      ))}

      <NeuralConnection
        from={outerNodes[0]}
        to={outerNodes[2]}
        color="#22d3ee"
      />

      <NeuralConnection
        from={outerNodes[2]}
        to={outerNodes[4]}
        color="#8b7fff"
      />

      <NeuralConnection
        from={outerNodes[4]}
        to={outerNodes[5]}
        color="#22d3ee"
      />

      <NeuralConnection
        from={outerNodes[5]}
        to={outerNodes[6]}
        color="#8b7fff"
      />

      <NeuralConnection
        from={outerNodes[6]}
        to={outerNodes[7]}
        color="#22d3ee"
      />

      <NeuralConnection
        from={outerNodes[7]}
        to={outerNodes[3]}
        color="#8b7fff"
      />

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[1.15, 0.008, 12, 120]}
        />

        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 3, 0.5, 0]}
      >
        <torusGeometry
          args={[1.48, 0.006, 12, 120]}
        />

        <meshBasicMaterial
          color="#8b7fff"
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh
        rotation={[Math.PI / 2.7, -0.4, 0.2]}
      >
        <torusGeometry
          args={[1.8, 0.004, 10, 120]}
        />

        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function MovingEnergyRing() {
  const ref = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;

    ref.current.rotation.z += delta * 0.35;

    ref.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.8) *
      0.08;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[2.05, 0.008, 10, 140]}
        />

        <meshBasicMaterial
          color="#6d5dfc"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function AIRecruitmentCore() {
  return (
    <div
      className="relative h-full w-full min-h-0 min-w-0 overflow-visible"
      style={{
        contain: "layout paint",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        resize={{
          scroll: false,
          debounce: {
            resize: 0,
            scroll: 50,
          },
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "pan-y",
        }}
      >
        <ambientLight intensity={0.25} />

        <pointLight
          position={[2.5, 2.5, 3]}
          intensity={5}
          color="#8b7fff"
        />

        <pointLight
          position={[-2.5, -1.5, 2]}
          intensity={4}
          color="#22d3ee"
        />

        <pointLight
          position={[0, 0, 2]}
          intensity={2}
          color="#6d5dfc"
        />

        <StarField />

        <EnergyParticles />

        <Float
          speed={1.3}
          rotationIntensity={0.12}
          floatIntensity={0.25}
        >
          <NeuralCore />
        </Float>

        <MovingEnergyRing />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.035}
          rotateSpeed={0.35}
          minPolarAngle={Math.PI * 0.35}
          maxPolarAngle={Math.PI * 0.65}
        />
      </Canvas>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.14] blur-[70px] sm:h-52 sm:w-52 sm:blur-[90px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[22%] -z-10 h-20 w-20 rounded-full bg-cyan-400/[0.07] blur-[45px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[18%] right-[18%] -z-10 h-20 w-20 rounded-full bg-violet-500/[0.07] blur-[45px]"
      />
    </div>
  );
}

export default AIRecruitmentCore;