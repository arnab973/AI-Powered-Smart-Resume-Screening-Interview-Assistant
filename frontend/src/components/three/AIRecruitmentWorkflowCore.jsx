import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function CentralCore() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.y += 0.0025;

    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.35) * 0.06;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 2]} />

        <meshBasicMaterial
          color="#8b7fff"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      <mesh scale={0.68}>
        <icosahedronGeometry args={[1, 2]} />

        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />

        <meshStandardMaterial
          color="#7c6cff"
          emissive="#5b4cff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      <pointLight
        color="#8b7fff"
        intensity={2.2}
        distance={4}
      />

      <pointLight
        color="#22d3ee"
        intensity={1.4}
        distance={3}
      />
    </group>
  );
}

function OrbitRing({ radius, rotation, color, speed }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    ref.current.rotation.z += speed;
    ref.current.rotation.x += speed * 0.22;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.008, 12, 180]} />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

function FloatingNode({ position, color, delay }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(
        state.clock.elapsedTime * 2.2 + delay
      ) *
        0.12;

    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.085, 20, 20]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>

      <mesh scale={1.9}>
        <sphereGeometry args={[0.085, 20, 20]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

function ConnectionLine({ start, end, color }) {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ];

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.2}
      />
    </line>
  );
}

function EnergyPulse({ start, end, color, delay }) {
  const ref = useRef();

  const startVector = useMemo(
    () => new THREE.Vector3(...start),
    [start]
  );

  const endVector = useMemo(
    () => new THREE.Vector3(...end),
    [end]
  );

  useFrame((state) => {
    if (!ref.current) return;

    const progress =
      (state.clock.elapsedTime * 0.22 + delay) % 1;

    ref.current.position.lerpVectors(
      startVector,
      endVector,
      progress
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 12, 12]} />

      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const values = [];

    for (let i = 0; i < 220; i += 1) {
      values.push(
        (Math.random() - 0.5) * 5.5,
        (Math.random() - 0.5) * 5.5,
        (Math.random() - 0.5) * 5.5
      );
    }

    return new Float32Array(values);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#a78bfa"
        size={0.018}
        transparent
        opacity={0.5}
      />
    </points>
  );
}

function Scene() {
  const nodes = [
    [-1.7, 0.65, 0.15],
    [1.65, 0.85, -0.15],
    [1.8, -0.75, 0.2],
    [-1.5, -0.95, -0.2],
    [0.1, 1.7, 0.1],
    [0.1, -1.7, -0.1],
  ];

  const colors = [
    "#22d3ee",
    "#8b7fff",
    "#38bdf8",
    "#a78bfa",
    "#22d3ee",
    "#8b7fff",
  ];

  return (
    <>
      <ambientLight intensity={0.25} />

      <Stars
        radius={5}
        depth={3}
        count={180}
        factor={1.2}
        saturation={0}
        fade
        speed={0.25}
      />

      <ParticleField />

      <CentralCore />

      <OrbitRing
        radius={1.5}
        rotation={[0.7, 0.2, 0]}
        color="#22d3ee"
        speed={0.003}
      />

      <OrbitRing
        radius={1.7}
        rotation={[1.3, 0.5, 0.7]}
        color="#8b7fff"
        speed={-0.0025}
      />

      <OrbitRing
        radius={1.25}
        rotation={[0.2, 1.1, 0.4]}
        color="#38bdf8"
        speed={0.002}
      />

      {nodes.map((node, index) => (
        <FloatingNode
          key={`node-${index}`}
          position={node}
          color={colors[index]}
          delay={index * 0.6}
        />
      ))}

      {nodes.map((node, index) => (
        <ConnectionLine
          key={`line-${index}`}
          start={[0, 0, 0]}
          end={node}
          color={colors[index]}
        />
      ))}

      {nodes.map((node, index) => (
        <EnergyPulse
          key={`pulse-${index}`}
          start={[0, 0, 0]}
          end={node}
          color={colors[index]}
          delay={index * 0.16}
        />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.04}
        autoRotate
        autoRotateSpeed={0.18}
      />
    </>
  );
}

function AIRecruitmentWorkflowCore() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 4.8],
        fov: 45,
      }}
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <Scene />
    </Canvas>
  );
}

export default AIRecruitmentWorkflowCore;