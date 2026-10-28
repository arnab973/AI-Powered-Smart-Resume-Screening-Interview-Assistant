
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Sparkles,
  Zap,
} from "lucide-react";

import RecruitmentIntelligencePanel from "./RecruitmentIntelligencePanel";

function CTASection() {
  return (
    <section
      id="ai-recruitment"
      className="relative scroll-mt-28 overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[18%] h-80 w-80 rounded-full bg-violet-500/[0.045] blur-[130px]" />

        <div className="absolute bottom-[8%] right-[5%] h-80 w-80 rounded-full bg-cyan-400/[0.04] blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.012] [background-image:linear-gradient(rgba(148,163,184,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.5)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      <div className="hn-container relative w-full max-w-[1320px]">
        <div className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20">

          {/* LEFT: AI Recruitment Animation */}
          <motion.div
            initial={{
              opacity: 0,
              x: -50,
              scale: 0.94,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: false,
              amount: 0.2,
            }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative order-2 flex min-h-[360px] items-center justify-center lg:order-1 lg:min-h-[520px]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-violet-500/[0.055] blur-[130px]" />

              <div className="absolute h-56 w-56 rounded-full bg-cyan-400/[0.035] blur-[100px]" />
            </div>

            <motion.div
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative h-[390px] w-full max-w-[580px] sm:h-[470px] lg:h-[540px] lg:max-w-[620px]"
            >
              <RecruitmentIntelligencePanel />
            </motion.div>
          </motion.div>

          {/* RIGHT: Recruitment Content */}
          <motion.div
            initial={{
              opacity: 0,
              x: 60,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: false,
              amount: 0.2,
            }}
            transition={{
              duration: 0.85,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 order-1 min-w-0 lg:order-2 lg:translate-x-6 xl:translate-x-10"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.07] px-3.5 py-1.5">
              <Sparkles
                size={13}
                className="text-violet-300"
              />

              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                Recruitment Intelligence
              </span>
            </div>

            {/* Heading - Fixed Clipping */}
            <h2 className="mt-5 max-w-2xl pb-3 text-4xl font-bold leading-[1.2] tracking-[-0.045em] text-white sm:text-5xl lg:text-[52px] xl:text-[60px]">
              Ready to make recruitment{" "}
              <span className="inline-block pb-[0.12em] hn-gradient-text">
                more intelligent?
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-[15px] sm:leading-8">
              Upload a resume, analyze candidate fit, run an AI
              interview, and turn the results into structured
              recruitment intelligence.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/register"
                className="hn-gradient-button inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight size={17} />
              </a>

              <a
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/[0.12] bg-white/[0.035] px-6 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.07] hover:text-white"
              >
                Sign In
              </a>
            </div>

            {/* Divider */}
            <div className="mt-8 h-px w-full max-w-[600px] bg-gradient-to-r from-white/[0.1] via-white/[0.05] to-transparent" />

            {/* Feature Labels */}
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <Zap
                  size={14}
                  className="text-amber-300"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  AI Screening
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BrainCircuit
                  size={14}
                  className="text-violet-300"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  AI Interview
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles
                  size={14}
                  className="text-cyan-300"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Smart Insights
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
