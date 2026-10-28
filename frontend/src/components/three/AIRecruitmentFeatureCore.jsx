
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Core() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.35) * 0.08;

    ref.current.rotation.y =
      state.clock.elapsedTime * 0.18;
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial
          color="#111a30"
          emissive="#6d5dfc"
          emissiveIntensity={1.1}
          metalness={0.7}
          roughness={0.18}
          wireframe
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[0.62, 2]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.08}
        />
      </mesh>

      <mesh scale={0.5}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshBasicMaterial
          color="#8b7fff"
          transparent
          opacity={0.14}
        />
      </mesh>
    </group>
  );
}

function Orbit({ radius, rotation, color, speed }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.z += delta * speed;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry args={[radius, 0.012, 12, 120]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function Node({ position, color, size = 0.07 }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(
        state.clock.elapsedTime * 2.2 + position[0] * 2
      ) *
        0.18;

    ref.current.scale.setScalar(pulse);
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[size, 20, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <mesh>
        <sphereGeometry args={[size * 2.4, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

function EnergyLine({ start, end, color }) {
  const { position, length, rotation } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);

    const direction = new THREE.Vector3().subVectors(b, a);
    const midpoint = new THREE.Vector3()
      .addVectors(a, b)
      .multiplyScalar(0.5);

    const quaternion = new THREE.Quaternion();

    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    return {
      position: midpoint,
      length: direction.length(),
      rotation: new THREE.Euler().setFromQuaternion(
        quaternion
      ),
    };
  }, [start, end]);

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <cylinderGeometry
        args={[0.004, 0.004, length, 8]}
      />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function ParticleField() {
  const ref = useRef();

  const positions = useMemo(() => {
    const data = [];

    for (let i = 0; i < 180; i += 1) {
      const radius = 1.8 + Math.random() * 1.4;
      const angle = Math.random() * Math.PI * 2;

      data.push(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.8,
        Math.sin(angle) * radius
      );
    }

    return new Float32Array(data);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y += delta * 0.018;
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
        color="#8b7fff"
        size={0.018}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

function EnergyPulse() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.position.y =
      Math.sin(state.clock.elapsedTime * 1.2) * 0.62;

    ref.current.scale.x =
      0.65 +
      Math.sin(state.clock.elapsedTime * 1.2) * 0.15;
  });

  return (
    <mesh
      ref={ref}
      position={[0, 0, 0.15]}
    >
      <boxGeometry args={[1.35, 0.012, 0.012]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

function Scene() {
  const nodes = [
    [-1.35, 0.65, 0],
    [-1.25, -0.55, 0.1],
    [1.35, 0.58, -0.05],
    [1.2, -0.65, 0.1],
    [0, 1.25, -0.1],
    [0, -1.15, 0.05],
  ];

  return (
    <>
      <ambientLight intensity={0.35} />

      <pointLight
        position={[2, 2, 3]}
        color="#22d3ee"
        intensity={2.4}
      />

      <pointLight
        position={[-2, -1, 2]}
        color="#6d5dfc"
        intensity={2.8}
      />

      <Core />

      <Orbit
        radius={1.02}
        rotation={[Math.PI / 2.2, 0.25, 0]}
        color="#22d3ee"
        speed={0.3}
      />

      <Orbit
        radius={1.3}
        rotation={[Math.PI / 1.75, -0.35, 0.2]}
        color="#8b7fff"
        speed={-0.22}
      />

      <Orbit
        radius={1.55}
        rotation={[Math.PI / 3.1, 0.4, 0]}
        color="#38bdf8"
        speed={0.14}
      />

      {nodes.map((position, index) => (
        <Node
          key={index}
          position={position}
          color={
            index % 2 === 0
              ? "#22d3ee"
              : "#8b7fff"
          }
        />
      ))}

      {nodes.map((position, index) => (
        <EnergyLine
          key={`line-${index}`}
          start={[0, 0, 0]}
          end={position}
          color={
            index % 2 === 0
              ? "#22d3ee"
              : "#8b7fff"
          }
        />
      ))}

      <EnergyPulse />

      <ParticleField />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.12}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.65}
      />
    </>
  );
}

function AIRecruitmentFeatureCore() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "340px",
        contain: "layout paint",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 4.3],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "pan-y",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default AIRecruitmentFeatureCore;