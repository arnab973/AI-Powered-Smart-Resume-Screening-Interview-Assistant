import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  OrbitControls,
  Points,
  PointMaterial,
  Sparkles,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function CoreSphere() {
  const groupRef = useRef(null);
  const innerRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !innerRef.current) return;

    groupRef.current.rotation.y += delta * 0.16;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;

    innerRef.current.rotation.z -= delta * 0.45;
    innerRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[0.75, 2]} />
        <meshBasicMaterial
          color="#7c6cff"
          wireframe
          transparent
          opacity={0.42}
        />
      </mesh>

      <mesh ref={innerRef} scale={0.52}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>

      <mesh scale={0.35}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#8b7fff"
          transparent
          opacity={0.18}
        />
      </mesh>

      <pointLight
        color="#22d3ee"
        intensity={4}
        distance={5}
      />

      <pointLight
        color="#8b5cf6"
        intensity={3}
        distance={4}
      />
    </group>
  );
}

function OrbitRing({ radius, rotation, color, speed }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed;
  });

  return (
    <group rotation={rotation}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.008, 8, 160]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.34}
        />
      </mesh>
    </group>
  );
}

function OrbitDots() {
  const groupRef = useRef(null);

  const dots = useMemo(() => {
    return Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 18) * Math.PI * 2;
      const radius = 1.35 + (index % 3) * 0.35;

      return {
        angle,
        radius,
        y: (index % 4 - 1.5) * 0.18,
        speed: 0.25 + (index % 4) * 0.08,
        color: index % 2 === 0 ? "#22d3ee" : "#a78bfa",
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((dot, index) => {
      const item = dots[index];

      const angle =
        item.angle +
        state.clock.elapsedTime * item.speed;

      dot.position.x = Math.cos(angle) * item.radius;
      dot.position.z = Math.sin(angle) * item.radius;
      dot.position.y =
        item.y +
        Math.sin(
          state.clock.elapsedTime * 1.5 + index
        ) *
          0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {dots.map((item, index) => (
        <mesh key={index}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial color={item.color} />
        </mesh>
      ))}
    </group>
  );
}

function ConnectionLines() {
  const groupRef = useRef(null);

  const lines = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const outer = 2.15;

      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * outer,
          Math.sin(index * 0.7) * 0.25,
          Math.sin(angle) * outer
        ),
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return geometry;
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y =
      state.clock.elapsedTime * 0.04;
  });

  return (
    <group ref={groupRef}>
      {lines.map((geometry, index) => (
        <line key={index} geometry={geometry}>
          <lineBasicMaterial
            color={index % 2 === 0 ? "#22d3ee" : "#8b7fff"}
            transparent
            opacity={0.13}
          />
        </line>
      ))}
    </group>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const data = new Float32Array(420 * 3);

    for (let i = 0; i < 420; i++) {
      data[i * 3] = (Math.random() - 0.5) * 6;
      data[i * 3 + 1] = (Math.random() - 0.5) * 4;
      data[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    return data;
  }, []);

  return (
    <Points positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#8b7fff"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

function Scanner() {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.position.y =
      Math.sin(state.clock.elapsedTime * 1.3) * 0.9;
  });

  return (
    <mesh ref={ref} rotation={[0, 0, 0]}>
      <boxGeometry args={[2.7, 0.008, 2.7]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.16}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />

      <Float
        speed={1}
        rotationIntensity={0.15}
        floatIntensity={0.25}
      >
        <CoreSphere />
        <OrbitDots />

        <OrbitRing
          radius={1.05}
          rotation={[Math.PI / 2, 0, 0]}
          color="#8b7fff"
          speed={0.22}
        />

        <OrbitRing
          radius={1.45}
          rotation={[Math.PI / 3, 0.4, 0]}
          color="#22d3ee"
          speed={-0.18}
        />

        <OrbitRing
          radius={1.85}
          rotation={[0.9, 0.2, 0]}
          color="#8b7fff"
          speed={0.12}
        />

        <ConnectionLines />

        <Scanner />
      </Float>

      <ParticleField />

      <Sparkles
        count={55}
        scale={[5, 3.5, 5]}
        size={1.2}
        speed={0.25}
        color="#22d3ee"
      />

      <Sparkles
        count={35}
        scale={[4, 3, 4]}
        size={1}
        speed={0.18}
        color="#a78bfa"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  );
}

export default function AIRecruitmentWorkflowCore() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0, 5.2],
          fov: 45,
        }}
        dpr={[1, 1.7]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}