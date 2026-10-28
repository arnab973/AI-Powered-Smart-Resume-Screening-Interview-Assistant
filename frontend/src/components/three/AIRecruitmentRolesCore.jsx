import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function NeuralCore() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.rotation.y += 0.0035;

    group.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.4) * 0.08;

    const pulse =
      1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.05;

    group.current.scale.setScalar(pulse);
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshBasicMaterial
          color="#8b7fff"
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh>
        <octahedronGeometry args={[0.43, 1]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#22d3ee"
          emissiveIntensity={5}
        />
      </mesh>

      <pointLight
        color="#22d3ee"
        intensity={2.5}
        distance={4}
      />

      <pointLight
        color="#8b7fff"
        intensity={1.5}
        distance={3}
      />
    </group>
  );
}

function EnergyRing({ radius, rotation, color, speed }) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    ref.current.rotation.z += speed;
    ref.current.rotation.x += speed * 0.2;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry
        args={[radius, 0.008, 10, 180]}
      />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.58}
      />
    </mesh>
  );
}

function NeuralNode({ position, color, delay }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(
        state.clock.elapsedTime * 2.3 + delay
      ) *
        0.16;

    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 18, 18]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
        />
      </mesh>

      <mesh scale={2.5}>
        <sphereGeometry args={[0.07, 18, 18]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.07}
        />
      </mesh>
    </group>
  );
}

function NeuralConnection({ start, end, color }) {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ];

    return new THREE.BufferGeometry().setFromPoints(
      points
    );
  }, [start, end]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.16}
      />
    </line>
  );
}

function EnergyPulse({
  start,
  end,
  color,
  delay,
}) {
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

function Scene() {
  const nodes = [
    [-1.6, 1.05, 0],
    [1.6, 0.9, -0.15],
    [-1.7, -0.85, 0.15],
    [1.65, -1.05, 0],
    [0, 1.65, 0],
    [0, -1.6, -0.1],
    [-1.05, 0, 0.25],
    [1.05, 0, -0.2],
  ];

  const colors = [
    "#8b7fff",
    "#22d3ee",
    "#38bdf8",
    "#a78bfa",
    "#22d3ee",
    "#8b7fff",
    "#38bdf8",
    "#22d3ee",
  ];

  return (
    <>
      <ambientLight intensity={0.2} />

      <Sparkles
        count={190}
        scale={[5.5, 5.5, 4]}
        size={1.1}
        speed={0.3}
        color="#a78bfa"
      />

      <NeuralCore />

      <EnergyRing
        radius={1.2}
        rotation={[0.7, 0.2, 0]}
        color="#22d3ee"
        speed={0.003}
      />

      <EnergyRing
        radius={1.5}
        rotation={[1.25, 0.4, 0.7]}
        color="#8b7fff"
        speed={-0.002}
      />

      <EnergyRing
        radius={0.95}
        rotation={[0.2, 1.1, 0.3]}
        color="#38bdf8"
        speed={0.004}
      />

      {nodes.map((node, index) => (
        <NeuralNode
          key={`node-${index}`}
          position={node}
          color={colors[index]}
          delay={index * 0.5}
        />
      ))}

      {nodes.map((node, index) => (
        <NeuralConnection
          key={`connection-${index}`}
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
          delay={index * 0.14}
        />
      ))}
    </>
  );
}

function AIRecruitmentRolesCore() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 5],
        fov: 46,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <Scene />
    </Canvas>
  );
}

export default AIRecruitmentRolesCore;