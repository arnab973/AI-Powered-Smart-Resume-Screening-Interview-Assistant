import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  LogIn,
  Sparkles,
  Zap,
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";

import AIRecruitmentCore from "../three/AIRecruitmentCore";

function StarLayer({
  count,
  size,
  opacity,
  color,
  spread,
  depth,
  speed,
}) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      array[i * 3] = (Math.random() - 0.5) * spread;
      array[i * 3 + 1] =
        (Math.random() - 0.5) * (spread * 0.58);
      array[i * 3 + 2] =
        (Math.random() - 0.5) * depth;
    }

    return array;
  }, [count, spread, depth]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y += delta * speed;
    pointsRef.current.rotation.x += delta * speed * 0.2;

    const pulse =
      Math.sin(state.clock.elapsedTime * 0.55) * 0.04;

    pointsRef.current.material.opacity =
      opacity + pulse;
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
      </bufferGeometry>

      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  );
}

function StarField() {
  return (
    <>
      <StarLayer
        count={1500}
        size={0.024}
        opacity={0.42}
        color="#c4b5fd"
        spread={24}
        depth={15}
        speed={0.0035}
      />

      <StarLayer
        count={420}
        size={0.048}
        opacity={0.72}
        color="#e0e7ff"
        spread={22}
        depth={14}
        speed={0.005}
      />

      <StarLayer
        count={90}
        size={0.085}
        opacity={0.92}
        color="#ffffff"
        spread={20}
        depth={12}
        speed={0.007}
      />
    </>
  );
}

function MovingStarsBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#01030a]" />

      <div className="absolute inset-0">
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
          <StarField />
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(109,93,252,0.035),transparent_30%),radial-gradient(circle_at_25%_35%,rgba(34,211,238,0.018),transparent_28%)]" />

      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[4%] top-[12%] h-[180px] w-[180px] rounded-full bg-violet-600/[0.035] blur-[90px] sm:left-[8%] sm:h-[320px] sm:w-[320px] sm:blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[5%] right-[2%] h-[190px] w-[190px] rounded-full bg-cyan-400/[0.025] blur-[100px] sm:h-[340px] sm:w-[340px]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/10 via-transparent to-[#01030a]/55" />
    </div>
  );
}

function NeuralBackground() {
  const nodes = useMemo(
    () => [
      { left: "6%", top: "20%", size: 5, color: "cyan" },
      { left: "18%", top: "34%", size: 4, color: "violet" },
      { left: "30%", top: "18%", size: 6, color: "cyan" },
      { left: "42%", top: "40%", size: 4, color: "violet" },
      { left: "55%", top: "22%", size: 5, color: "cyan" },
      { left: "70%", top: "36%", size: 4, color: "violet" },
      { left: "84%", top: "18%", size: 5, color: "cyan" },
      { left: "92%", top: "48%", size: 4, color: "violet" },
      { left: "12%", top: "65%", size: 4, color: "violet" },
      { left: "28%", top: "78%", size: 5, color: "cyan" },
      { left: "46%", top: "64%", size: 4, color: "violet" },
      { left: "62%", top: "82%", size: 5, color: "cyan" },
      { left: "78%", top: "68%", size: 4, color: "violet" },
      { left: "90%", top: "84%", size: 5, color: "cyan" },
    ],
    []
  );

  const lines = useMemo(
    () => [
      { x1: "6%", y1: "20%", x2: "18%", y2: "34%" },
      { x1: "18%", y1: "34%", x2: "30%", y2: "18%" },
      { x1: "30%", y1: "18%", x2: "42%", y2: "40%" },
      { x1: "42%", y1: "40%", x2: "55%", y2: "22%" },
      { x1: "55%", y1: "22%", x2: "70%", y2: "36%" },
      { x1: "70%", y1: "36%", x2: "84%", y2: "18%" },
      { x1: "84%", y1: "18%", x2: "92%", y2: "48%" },
      { x1: "12%", y1: "65%", x2: "28%", y2: "78%" },
      { x1: "28%", y1: "78%", x2: "46%", y2: "64%" },
      { x1: "46%", y1: "64%", x2: "62%", y2: "82%" },
      { x1: "62%", y1: "82%", x2: "78%", y2: "68%" },
      { x1: "78%", y1: "68%", x2: "90%", y2: "84%" },
      { x1: "18%", y1: "34%", x2: "46%", y2: "64%" },
      { x1: "30%", y1: "18%", x2: "55%", y2: "22%" },
      { x1: "42%", y1: "40%", x2: "62%", y2: "82%" },
      { x1: "55%", y1: "22%", x2: "78%", y2: "68%" },
    ],
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(109,93,252,0.025),transparent_38%),radial-gradient(circle_at_70%_55%,rgba(34,211,238,0.018),transparent_38%)]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        preserveAspectRatio="none"
      >
        {lines.map((line, index) => (
          <motion.line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={
              index % 2 === 0
                ? "rgba(34,211,238,0.10)"
                : "rgba(139,127,255,0.11)"
            }
            strokeWidth="1"
            strokeDasharray="4 8"
            animate={{
              strokeDashoffset: [0, -40],
              opacity: [0.08, 0.28, 0.08],
            }}
            transition={{
              duration: 5 + (index % 4),
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.18,
            }}
          />
        ))}
      </svg>

      {nodes.map((node, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            left: node.left,
            top: node.top,
            width: node.size,
            height: node.size,
            background:
              node.color === "cyan"
                ? "rgba(34,211,238,0.5)"
                : "rgba(167,139,250,0.5)",
            boxShadow:
              node.color === "cyan"
                ? "0 0 10px rgba(34,211,238,0.3)"
                : "0 0 10px rgba(167,139,250,0.3)",
          }}
          animate={{
            scale: [1, 1.45, 1],
            opacity: [0.18, 0.55, 0.18],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3 + (index % 4) * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.17,
          }}
        />
      ))}

      <motion.div
        className="absolute left-[20%] top-[25%] h-40 w-40 rounded-full bg-violet-500/[0.025] blur-[80px] sm:h-64 sm:w-64"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.3, 0.18],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-[18%] right-[18%] h-40 w-40 rounded-full bg-cyan-400/[0.02] blur-[80px] sm:h-64 sm:w-64"
        animate={{
          scale: [1.15, 1, 1.15],
          opacity: [0.12, 0.24, 0.12],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#01030a]/5 via-transparent to-[#01030a]/48" />
    </div>
  );
}

function HeroSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#01030a]"
    >
      <MovingStarsBackground />

      <NeuralBackground />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
      </div>

      <div className="hn-container relative z-10 w-full min-w-0">
        <div className="grid min-w-0 min-h-[calc(100vh-80px)] grid-cols-1 items-center gap-7 overflow-hidden py-10 sm:gap-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-20 w-full min-w-0 px-1 text-center lg:px-0 lg:text-left"
          >
            <motion.div
              variants={itemVariants}
              className="mx-auto inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded-full border border-violet-400/15 bg-violet-500/[0.05] px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.13em] text-violet-200 sm:mx-0 sm:max-w-full sm:gap-2 sm:px-3.5 sm:text-[10px] sm:tracking-[0.2em]"
            >
              <motion.span
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="shrink-0"
              >
                <Sparkles size={11} className="sm:h-3 sm:w-3" />
              </motion.span>

              <span className="truncate">
                AI Recruitment Intelligence
              </span>
            </motion.div>


<motion.h1
  variants={itemVariants}
  className="mx-auto mt-5 max-w-[340px] pb-2 text-[30px] font-bold leading-[1.18] tracking-[-0.045em] text-white sm:mt-6 sm:max-w-[700px] sm:text-4xl md:text-5xl lg:mx-0 lg:text-[56px] xl:text-[62px]"
>
  <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80 sm:text-xs">
    AI-Powered
  </span>

  <span className="mt-3 block">
    Smart Resume
  </span>

  <span className="block pb-[0.14em] leading-[1.18]">
    <span className="inline-block pb-[0.06em] hn-gradient-text">
      Screening
    </span>
  </span>

  <span className="mt-1 block text-white">
    & Interview Assistant
  </span>
</motion.h1>


            <motion.p
              variants={itemVariants}
              className="mx-auto mt-4 max-w-[315px] text-[12px] leading-5 text-slate-500 sm:mt-6 sm:max-w-[560px] sm:text-sm sm:leading-7 lg:mx-0 lg:text-base"
            >
              Analyze resumes, match candidates with job requirements,
              conduct AI-powered interviews, and transform candidate
              responses into structured recruitment intelligence.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-6 flex w-full max-w-[310px] flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:justify-start"
            >
              <motion.a
                href="/register"
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="hn-gradient-button flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold sm:w-auto sm:px-6"
              >
                Start Screening

                <motion.span
                  animate={{
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 1.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight size={17} />
                </motion.span>
              </motion.a>

              <motion.a
                href="/login"
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 text-sm font-semibold text-slate-200 transition-all hover:border-cyan-400/25 hover:bg-cyan-400/[0.05] hover:text-white sm:w-auto sm:px-6"
              >
                <LogIn size={16} className="text-cyan-300" />
                Login
              </motion.a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mx-auto mt-7 flex max-w-[310px] flex-wrap items-center justify-center gap-x-3.5 gap-y-2.5 sm:mt-8 sm:max-w-[390px] sm:gap-x-5 sm:gap-y-3 lg:mx-0 lg:max-w-none lg:justify-start"
            >
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-slate-600 sm:gap-2 sm:text-[10px] sm:tracking-[0.13em]">
                <FileSearch
                  size={12}
                  className="shrink-0 text-cyan-300/70 sm:h-[13px] sm:w-[13px]"
                />
                Resume Analysis
              </div>

              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-slate-600 sm:gap-2 sm:text-[10px] sm:tracking-[0.13em]">
                <BrainCircuit
                  size={12}
                  className="shrink-0 text-violet-300/70 sm:h-[13px] sm:w-[13px]"
                />
                AI Interview
              </div>

              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.1em] text-slate-600 sm:gap-2 sm:text-[10px] sm:tracking-[0.13em]">
                <Zap
                  size={12}
                  className="shrink-0 text-amber-300/70 sm:h-[13px] sm:w-[13px]"
                />
                Smart Matching
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.82,
              x: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            transition={{
              duration: 1,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto flex w-full min-w-0 max-w-[340px] items-center justify-center sm:max-w-[430px] lg:max-w-[520px]"
          >
            <motion.div
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.2, 0.32, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.08] blur-[65px] sm:h-[320px] sm:w-[320px] sm:blur-[85px]"
            />

            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 h-[250px] w-full max-w-[285px] sm:h-[390px] sm:max-w-[420px] lg:h-[500px] lg:max-w-[500px]"
            >
              <AIRecruitmentCore />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: -25,
                y: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
              }}
              transition={{
                delay: 0.9,
                duration: 0.6,
              }}
              className="absolute left-0 top-[18%] z-20 hidden w-[165px] rounded-2xl border border-white/10 bg-[#080d1a]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:block lg:-left-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">
                  <FileSearch
                    size={15}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-white">
                    Resume Analysis
                  </div>

                  <div className="mt-0.5 text-[8px] text-slate-500">
                    AI parsing active
                  </div>
                </div>
              </div>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{
                    delay: 1.2,
                    duration: 1,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 25,
                y: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
              }}
              transition={{
                delay: 1.05,
                duration: 0.6,
              }}
              className="absolute right-0 top-[31%] z-20 hidden w-[155px] rounded-2xl border border-white/10 bg-[#080d1a]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:block lg:-right-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.12em] text-slate-500">
                  Job Match
                </span>

                <CheckCircle2
                  size={14}
                  className="text-emerald-300"
                />
              </div>

              <div className="mt-1.5 text-2xl font-bold text-white">
                85.7%
              </div>

              <div className="mt-1 text-[8px] text-emerald-300/70">
                Strong candidate alignment
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 1.2,
                duration: 0.6,
              }}
              className="absolute bottom-[12%] left-1/2 z-20 hidden w-[190px] -translate-x-1/2 rounded-2xl border border-violet-400/15 bg-[#080d1a]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10"
                >
                  <BrainCircuit
                    size={15}
                    className="text-violet-300"
                  />
                </motion.div>

                <div>
                  <div className="text-[10px] font-semibold text-white">
                    Intelligence Engine
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[8px] text-emerald-300/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    System Active
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#features"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.5,
          duration: 0.6,
        }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-slate-600 transition-colors hover:text-slate-400 sm:flex"
      >
        Explore platform

        <motion.span
          animate={{
            y: [0, 4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          â†“
        </motion.span>
      </motion.a>
    </section>
  );
}

export default HeroSection;
