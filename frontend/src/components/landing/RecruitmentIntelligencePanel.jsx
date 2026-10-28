import { motion } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  Zap,
} from "lucide-react";

const dots = [
  { left: "16%", top: "28%", delay: 0, size: "h-2.5 w-2.5" },
  { left: "82%", top: "23%", delay: 1.2, size: "h-2 w-2" },
  { left: "88%", top: "69%", delay: 2, size: "h-2.5 w-2.5" },
  { left: "17%", top: "73%", delay: 0.7, size: "h-2 w-2" },
  { left: "53%", top: "10%", delay: 1.6, size: "h-2 w-2" },
  { left: "53%", top: "86%", delay: 2.4, size: "h-2.5 w-2.5" },
];

const labels = [
  {
    text: "AI SCREENING",
    className: "left-[5%] top-[20%]",
    icon: BrainCircuit,
    color: "text-violet-300",
    border: "border-violet-400/20",
  },
  {
    text: "SEMANTIC MATCH",
    className: "right-[3%] top-[35%]",
    icon: Zap,
    color: "text-cyan-300",
    border: "border-cyan-400/20",
  },
  {
    text: "INTELLIGENCE ACTIVE",
    className: "left-[7%] bottom-[18%]",
    icon: Sparkles,
    color: "text-emerald-300",
    border: "border-emerald-400/20",
  },
  {
    text: "AI EVALUATION",
    className: "right-[4%] bottom-[16%]",
    icon: BrainCircuit,
    color: "text-violet-300",
    border: "border-violet-400/20",
  },
];

export default function RecruitmentIntelligencePanel() {
  return (
    <div className="relative h-full w-full overflow-visible">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[330px] w-[330px] rounded-full bg-violet-500/[0.035] blur-[130px]" />

        <div className="absolute h-[230px] w-[230px] rounded-full bg-cyan-400/[0.025] blur-[100px]" />
      </div>

      <div className="absolute left-1/2 top-[5%] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.28em] text-slate-600 sm:text-[9px]">
        <motion.span
          animate={{
            opacity: [0.35, 1, 0.35],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,.9)]"
        />

        Recruitment Intelligence Engine
      </div>

      <svg
        viewBox="0 0 700 500"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="coreGlow">
            <stop
              offset="0%"
              stopColor="#a78bfa"
              stopOpacity="0.32"
            />

            <stop
              offset="42%"
              stopColor="#22d3ee"
              stopOpacity="0.09"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
              stopOpacity="0"
            />
          </radialGradient>

          <linearGradient
            id="energyLine"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stopColor="#8b7fff"
              stopOpacity="0"
            />

            <stop
              offset="45%"
              stopColor="#8b7fff"
              stopOpacity="0.4"
            />

            <stop
              offset="55%"
              stopColor="#22d3ee"
              stopOpacity="0.7"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <circle
          cx="350"
          cy="260"
          r="175"
          fill="url(#coreGlow)"
        />

        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: "350px 260px",
          }}
        >
          <circle
            cx="350"
            cy="260"
            r="72"
            fill="none"
            stroke="#8b7fff"
            strokeOpacity="0.18"
            strokeWidth="1"
          />

          <circle
            cx="350"
            cy="260"
            r="102"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.15"
            strokeWidth="1"
          />

          <circle
            cx="350"
            cy="260"
            r="135"
            fill="none"
            stroke="#8b7fff"
            strokeOpacity="0.13"
            strokeWidth="1"
          />

          <circle
            cx="350"
            cy="260"
            r="165"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.09"
            strokeWidth="1"
          />
        </motion.g>

        <motion.g
          animate={{ rotate: -360 }}
          transition={{
            duration: 48,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: "350px 260px",
          }}
        >
          <ellipse
            cx="350"
            cy="260"
            rx="145"
            ry="62"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.11"
            strokeWidth="1"
          />

          <ellipse
            cx="350"
            cy="260"
            rx="175"
            ry="84"
            fill="none"
            stroke="#8b7fff"
            strokeOpacity="0.09"
            strokeWidth="1"
          />
        </motion.g>

        <motion.line
          x1="55"
          y1="260"
          x2="645"
          y2="260"
          stroke="url(#energyLine)"
          strokeWidth="1"
          strokeDasharray="8 12"
          animate={{
            strokeDashoffset: [0, -80],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.line
          x1="350"
          y1="65"
          x2="350"
          y2="455"
          stroke="url(#energyLine)"
          strokeWidth="1"
          strokeDasharray="6 14"
          animate={{
            strokeDashoffset: [0, -80],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <line
          x1="350"
          y1="260"
          x2="125"
          y2="135"
          stroke="#8b7fff"
          strokeOpacity="0.09"
        />

        <line
          x1="350"
          y1="260"
          x2="585"
          y2="145"
          stroke="#22d3ee"
          strokeOpacity="0.09"
        />

        <line
          x1="350"
          y1="260"
          x2="125"
          y2="385"
          stroke="#22d3ee"
          strokeOpacity="0.08"
        />

        <line
          x1="350"
          y1="260"
          x2="585"
          y2="380"
          stroke="#8b7fff"
          strokeOpacity="0.08"
        />

        <circle
          cx="350"
          cy="260"
          r="50"
          fill="#080d1d"
          fillOpacity="0.92"
          stroke="#8b7fff"
          strokeOpacity="0.3"
        />

        <circle
          cx="350"
          cy="260"
          r="34"
          fill="#11152b"
          stroke="#22d3ee"
          strokeOpacity="0.22"
        />
      </svg>

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/2 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0b1020]/95 shadow-[0_0_45px_rgba(109,93,252,.28)]"
      >
        <BrainCircuit className="h-9 w-9 text-violet-200" />
      </motion.div>

      {dots.map((dot, index) => (
        <motion.span
          key={index}
          className={`absolute ${dot.size} rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,.8)]`}
          style={{
            left: dot.left,
            top: dot.top,
          }}
          animate={{
            opacity: [0.25, 1, 0.25],
            scale: [0.7, 1.4, 0.7],
          }}
          transition={{
            duration: 2.8,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {labels.map((label, index) => {
        const Icon = label.icon;

        return (
          <motion.div
            key={label.text}
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 3.5,
              delay: index * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${label.className} flex items-center gap-2 rounded-full border ${label.border} bg-[#070b18]/75 px-3.5 py-2 backdrop-blur-xl`}
          >
            <Icon className={`h-3 w-3 ${label.color}`} />

            <span
              className={`text-[8px] font-semibold uppercase tracking-[0.2em] ${label.color}`}
            >
              {label.text}
            </span>
          </motion.div>
        );
      })}

      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-medium uppercase tracking-[0.4em] text-slate-700 sm:text-[8px]">
        Analyze · Match · Evaluate · Decide
      </div>

      <motion.div
        className="absolute left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        animate={{
          top: ["18%", "82%", "18%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}