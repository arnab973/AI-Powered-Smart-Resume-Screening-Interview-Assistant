import React from "react";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  FileSearch,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import AIRecruitmentRolesCore from "../three/AIRecruitmentRolesCore";

const candidateFeatures = [
  { icon: FileSearch, text: "AI-powered resume screening" },
  { icon: Target, text: "ATS compatibility analysis" },
  { icon: MessageSquareText, text: "Personalized AI interview" },
  { icon: BarChart3, text: "Performance insights" },
];

const recruiterFeatures = [
  { icon: Users, text: "Candidate management" },
  { icon: BrainCircuit, text: "AI-assisted screening" },
  { icon: BriefcaseBusiness, text: "Smart job matching" },
  { icon: BarChart3, text: "Structured reports" },
];

function FeatureRow({ icon: Icon, text }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-2.5"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035]">
        <Icon size={13} className="text-cyan-300" strokeWidth={1.7} />
      </div>

      <span className="text-[11px] text-slate-400">
        {text}
      </span>
    </motion.div>
  );
}

function ExperienceCard({
  type,
  icon: Icon,
  title,
  highlight,
  description,
  features,
  accent,
  direction,
}) {
  const violet = accent === "violet";

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: direction,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: false,
        amount: 0.3,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
      }}
      className={`group relative overflow-hidden rounded-[18px] border p-5 ${
        violet
          ? "border-violet-400/15 bg-gradient-to-br from-violet-500/[0.075] via-[#0a0e1b] to-[#070b14]"
          : "border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.065] via-[#09121b] to-[#070b14]"
      }`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-px ${
          violet
            ? "bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"
            : "bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
        }`}
      />

      <motion.div
        animate={{ x: ["-120%", "180%"] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: violet ? 0 : 1.8,
        }}
        className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"
      />

      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-[70px] ${
          violet ? "bg-violet-500/[0.09]" : "bg-cyan-400/[0.08]"
        }`}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              violet
                ? "border-violet-400/20 bg-violet-500/[0.08]"
                : "border-cyan-400/20 bg-cyan-500/[0.08]"
            }`}
          >
            <Icon
              size={16}
              className={violet ? "text-violet-300" : "text-cyan-300"}
              strokeWidth={1.6}
            />
          </motion.div>

          <span
            className={`rounded-full border px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.18em] ${
              violet
                ? "border-violet-300/15 bg-violet-300/[0.04] text-violet-200"
                : "border-cyan-300/15 bg-cyan-300/[0.04] text-cyan-200"
            }`}
          >
            {type}
          </span>
        </div>

        <h3 className="mt-4 text-[17px] font-semibold leading-[1.18] tracking-[-0.025em] text-white">
          {title}
          <br />
          <span className={violet ? "text-violet-200" : "text-cyan-200"}>
            {highlight}
          </span>
        </h3>

        <p className="mt-2.5 text-[10px] leading-[1.55] text-slate-500">
          {description}
        </p>

        <div className="my-3.5 h-px bg-white/[0.07]" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {features.map((feature) => (
            <FeatureRow
              key={feature.text}
              icon={feature.icon}
              text={feature.text}
            />
          ))}
        </div>

        <motion.div
          whileHover={{ x: 4 }}
          className={`mt-4 flex items-center gap-1.5 text-[10px] font-semibold ${
            violet ? "text-violet-200" : "text-cyan-200"
          }`}
        >
          {violet ? "Analyze your profile" : "Explore recruiter workflow"}
          <ArrowRight size={12} />
        </motion.div>
      </div>

      <motion.div
        animate={{
          opacity: [0.25, 1, 0.25],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className={`absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full ${
          violet
            ? "bg-violet-400 shadow-[0_0_10px_rgba(139,127,255,0.8)]"
            : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
        }`}
      />
    </motion.div>
  );
}

function ForRolesSection() {
  return (
    <section
      id="for-hr"
      className="relative overflow-hidden py-12 sm:py-14 lg:py-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[30%] h-64 w-64 rounded-full bg-violet-500/[0.035] blur-[110px]" />
        <div className="absolute right-[5%] top-[25%] h-64 w-64 rounded-full bg-cyan-400/[0.03] blur-[110px]" />
      </div>

      <div className="hn-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.04] px-3 py-1.5"
          >
            <Sparkles size={12} className="text-violet-300" />

            <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-violet-200">
              Built for both sides
            </span>
          </motion.div>

          <h2 className="mt-3 text-4xl font-bold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl lg:text-[50px]">
            One platform.
            <span className="hn-gradient-text">
              {" "}
              Two powerful experiences.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            HireNexus brings candidate intelligence and recruiter workflows
            together in one AI-powered recruitment ecosystem.
          </p>
        </motion.div>

        <div className="mt-8 grid items-center gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
          <div className="flex flex-col gap-4">
            <ExperienceCard
              type="Candidate"
              icon={Target}
              title="Understand your profile."
              highlight="Prepare with intelligence."
              description="Get a deeper understanding of your resume, job fit, interview performance, and areas that need improvement."
              features={candidateFeatures}
              accent="violet"
              direction={-70}
            />

            <ExperienceCard
              type="HR / Recruiter"
              icon={BriefcaseBusiness}
              title="Screen candidates."
              highlight="Make informed decisions."
              description="Manage candidate profiles, compare job fit, review AI-assisted evaluations, and access structured reports."
              features={recruiterFeatures}
              accent="cyan"
              direction={70}
            />
          </div>

          <motion.div
            initial={{
              opacity: 0,
              x: 70,
              scale: 0.94,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: false,
              amount: 0.15,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative h-[520px] w-full lg:h-[560px]"
          >
            <AIRecruitmentRolesCore />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ForRolesSection;