import React from "react";
import { motion } from "framer-motion";
import {
  FileSearch,
  BrainCircuit,
  Gauge,
  Network,
  MessageSquareText,
  ScanSearch,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import AIRecruitmentWorkflowCore from "../three/AIRecruitmentWorkflowCore";

const workflow = [
  {
    number: "01",
    title: "Resume Upload",
    text: "Upload your resume and let HireNexus begin intelligent profile extraction.",
    icon: FileSearch,
    color: "violet",
  },
  {
    number: "02",
    title: "AI Resume Parsing",
    text: "AI extracts skills, experience, education, projects, and candidate information.",
    icon: BrainCircuit,
    color: "cyan",
  },
  {
    number: "03",
    title: "ATS Analysis",
    text: "Resume structure, keywords, sections, and job requirements are analyzed.",
    icon: Gauge,
    color: "blue",
  },
  {
    number: "04",
    title: "Smart Job Matching",
    text: "Candidate profiles are compared with jobs using skills and semantic similarity.",
    icon: Network,
    color: "violet",
  },
  {
    number: "05",
    title: "AI Interview",
    text: "Personalized technical, skill-gap, and HR questions are generated.",
    icon: MessageSquareText,
    color: "cyan",
  },
  {
    number: "06",
    title: "Answer Evaluation",
    text: "Interview answers are evaluated for accuracy, relevance, clarity, and completeness.",
    icon: ScanSearch,
    color: "blue",
  },
  {
    number: "07",
    title: "Performance Report",
    text: "Strengths, weaknesses, insights, and improvement areas are generated.",
    icon: BarChart3,
    color: "violet",
  },
];

const colors = {
  violet: {
    icon: "text-violet-200 border-violet-400/35 bg-violet-500/[0.08]",
    glow: "#8b7fff",
    border: "group-hover:border-violet-400/35",
  },
  cyan: {
    icon: "text-cyan-200 border-cyan-400/35 bg-cyan-500/[0.08]",
    glow: "#22d3ee",
    border: "group-hover:border-cyan-400/35",
  },
  blue: {
    icon: "text-sky-200 border-sky-400/35 bg-sky-500/[0.08]",
    glow: "#38bdf8",
    border: "group-hover:border-sky-400/35",
  },
};

function WorkflowCard({ step, index }) {
  const Icon = step.icon;
  const theme = colors[step.color];
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: fromLeft ? -70 : 70,
        scale: 0.97,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative ${fromLeft ? "lg:pr-7" : "lg:pl-7"}`}
    >
      <motion.div
        whileHover={{
          x: fromLeft ? 5 : -5,
          borderColor: `${theme.glow}55`,
          boxShadow: `0 0 30px ${theme.glow}18`,
        }}
        className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1120]/75 px-3.5 py-3 backdrop-blur-xl transition-all duration-300 ${theme.border}`}
      >
        <motion.div
          animate={{
            x: ["-130%", "220%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.35,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 opacity-0 blur-lg group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.glow}50, transparent)`,
          }}
        />

        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.glow}70, transparent)`,
          }}
        />

        <div className="relative flex items-center gap-3.5">
          <motion.div
            animate={{
              boxShadow: [
                `0 0 0 ${theme.glow}00`,
                `0 0 18px ${theme.glow}30`,
                `0 0 0 ${theme.glow}00`,
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.icon}`}
          >
            <Icon size={17} strokeWidth={1.7} />
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[8px] tracking-[0.2em]"
                style={{ color: `${theme.glow}99` }}
              >
                {step.number}
              </span>

              <h3 className="truncate text-[13px] font-semibold text-white">
                {step.title}
              </h3>
            </div>

            <p className="mt-1 text-[10px] leading-[1.45] text-slate-500">
              {step.text}
            </p>
          </div>

          <motion.span
            animate={{
              opacity: [0.25, 1, 0.25],
              scale: [0.8, 1.15, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.18,
            }}
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor: theme.glow,
              boxShadow: `0 0 12px ${theme.glow}`,
            }}
          />
        </div>
      </motion.div>

      {index < workflow.length - 1 && (
        <div
          className={`absolute ${
            fromLeft ? "lg:right-3" : "lg:left-3"
          } top-full hidden h-5 w-px lg:block`}
          style={{
            background: `linear-gradient(to bottom, ${theme.glow}50, transparent)`,
          }}
        />
      )}
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden pt-16 pb-8 sm:pt-20 sm:pb-10 lg:pt-24 lg:pb-12"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[7%] top-[20%] h-64 w-64 rounded-full bg-violet-500/[0.04] blur-[110px]" />

        <div className="absolute bottom-[8%] right-[6%] h-64 w-64 rounded-full bg-cyan-400/[0.035] blur-[110px]" />

        <div className="absolute inset-0 opacity-[0.014] [background-image:linear-gradient(rgba(148,163,184,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      <div className="hn-container relative">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.05] px-3 py-1.5">
            <Sparkles size={13} className="text-cyan-300" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
              Intelligent Recruitment Pipeline
            </span>
          </div>

          <h2 className="mt-4 text-4xl font-bold leading-[1] tracking-[-0.045em] text-white sm:text-5xl lg:text-[52px]">
            From resume to{" "}
            <span className="hn-gradient-text">
              recruitment intelligence.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            Every stage of the hiring journey is connected through one
            intelligent AI-powered workflow.
          </p>
        </motion.div>

        <div className="mt-8 grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <motion.div
            initial={{
              opacity: 0,
              x: -55,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.12,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative order-2 flex min-h-[360px] items-center justify-center lg:order-1 lg:min-h-[440px]"
          >
            <div className="absolute h-64 w-64 rounded-full bg-violet-500/[0.055] blur-[100px]" />

            <div className="absolute h-52 w-52 rounded-full bg-cyan-400/[0.035] blur-[90px]" />

            <div className="relative h-[340px] w-full max-w-[500px] sm:h-[390px] lg:h-[430px]">
              <AIRecruitmentWorkflowCore />
            </div>

            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[4%] left-[2%] hidden rounded-xl border border-emerald-400/15 bg-[#0d1426]/80 px-3 py-2 backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

                <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  Pipeline Active
                </span>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, 7, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-[2%] top-[6%] hidden rounded-xl border border-cyan-400/15 bg-[#0d1426]/80 px-3 py-2 backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit size={13} className="text-cyan-300" />

                <span className="text-[9px] uppercase tracking-[0.14em] text-slate-500">
                  Neural Processing
                </span>
              </div>
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.08]" />

              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-600">
                Processing Pipeline
              </span>

              <div className="h-px w-8 bg-white/[0.08]" />
            </div>

            <div className="space-y-2.5">
              {workflow.map((step, index) => (
                <WorkflowCard
                  key={step.number}
                  step={step}
                  index={index}
                />
              ))}
            </div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.7,
              }}
              className="mt-3 flex items-center justify-end gap-2 text-[9px] uppercase tracking-[0.18em] text-slate-600"
            >
              End-to-end AI recruitment intelligence
              <ArrowRight size={11} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;