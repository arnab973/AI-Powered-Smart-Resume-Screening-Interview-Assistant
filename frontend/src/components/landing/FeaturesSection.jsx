
import React from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileSearch,
  Gauge,
  MessageSquareText,
  Network,
  BarChart3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import AIRecruitmentFeatureCore from "../three/AIRecruitmentFeatureCore";

const features = [
  {
    icon: FileSearch,
    title: "AI Resume Screening",
    description:
      "Automatically parse resumes, extract candidate information, identify skills, and analyze profile relevance.",
    accent: "violet",
  },
  {
    icon: Gauge,
    title: "ATS Compatibility",
    description:
      "Analyze resume structure, keywords, sections, and job requirements to generate an ATS compatibility score.",
    accent: "cyan",
  },
  {
    icon: Network,
    title: "Smart Job Matching",
    description:
      "Compare candidate profiles with job descriptions using skills and semantic similarity.",
    accent: "blue",
  },
  {
    icon: MessageSquareText,
    title: "AI Interview",
    description:
      "Generate personalized technical, skill-gap, and HR interview questions based on the candidate profile.",
    accent: "violet",
  },
  {
    icon: BrainCircuit,
    title: "Answer Evaluation",
    description:
      "Evaluate interview answers across technical accuracy, relevance, clarity, and completeness.",
    accent: "cyan",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    description:
      "Generate structured candidate performance insights with strengths, weaknesses, and improvement recommendations.",
    accent: "blue",
  },
];

const cardVariants = {
  hidden: (index) => ({
    opacity: 0,
    y: 25,
    x: index % 2 === 0 ? -20 : 20,
    scale: 0.97,
  }),
  visible: (index) => ({
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const accentStyles = {
  violet: {
    box: "border-violet-400/20 bg-violet-500/[0.055]",
    icon: "border-violet-400/25 bg-violet-500/10 text-violet-300",
  },
  cyan: {
    box: "border-cyan-400/20 bg-cyan-500/[0.045]",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
  },
  blue: {
    box: "border-sky-400/20 bg-sky-500/[0.045]",
    icon: "border-sky-400/25 bg-sky-500/10 text-sky-300",
  },
};

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  const style = accentStyles[feature.accent];

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={`group relative flex h-[142px] flex-col justify-between overflow-hidden rounded-2xl border ${style.box} p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${style.icon}`}
        >
          <Icon size={18} strokeWidth={1.7} />
        </div>

        <ArrowUpRight
          size={16}
          className="text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-300"
        />
      </div>

      <div>
        <h3 className="text-[14px] font-semibold tracking-tight text-white sm:text-[15px]">
          {feature.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.45] text-slate-500 sm:text-[12px]">
          {feature.description}
        </p>
      </div>

      <div className="pointer-events-none absolute -bottom-10 -right-10 h-20 w-20 rounded-full bg-white/[0.025] blur-2xl transition-all duration-500 group-hover:bg-white/[0.05]" />
    </motion.article>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative flex min-h-[calc(100vh-80px)] items-start overflow-hidden py-4 sm:py-5 lg:py-3"
    >
      <div className="hn-container w-full">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-1.5">
            <Sparkles size={13} className="text-cyan-300" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">
              Intelligent Recruitment
            </span>
          </div>

          <h2 className="mt-3 text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-[50px]">
            Everything you need to{" "}
            <span className="hn-gradient-text">screen smarter.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-5 text-slate-500 sm:text-sm">
            HireNexus connects resume intelligence, job matching, AI interviews,
            and candidate evaluation into one streamlined recruitment workflow.
          </p>
        </motion.div>

        <div className="mx-auto mt-5 max-w-6xl lg:mt-5">
          <div className="grid items-center gap-4 lg:grid-cols-[1.35fr_0.85fr] lg:gap-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  index={index}
                />
              ))}
            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 45,
                scale: 0.94,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex min-h-[310px] items-center justify-center lg:min-h-[350px]"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-60 w-60 rounded-full bg-violet-500/[0.07] blur-[85px]" />
                <div className="absolute h-44 w-44 rounded-full bg-cyan-400/[0.06] blur-[75px]" />
              </div>

              <div className="relative h-[330px] w-full max-w-[430px] sm:h-[360px] lg:h-[400px]">
                <AIRecruitmentFeatureCore />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[9px] uppercase tracking-[0.18em] text-slate-600 sm:text-[10px]"
        >
          <span>Resume Intelligence</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
          <span>Semantic Matching</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
          <span>AI Evaluation</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
          <span>Recruitment Analytics</span>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
