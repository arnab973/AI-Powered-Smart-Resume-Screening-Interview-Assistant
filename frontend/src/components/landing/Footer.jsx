
import React from "react";
import {
  ArrowUp,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

// =====================================================
// FOOTER AI ANIMATION
// =====================================================

function FooterAI() {
  const nodes = [
    {
      left: "18%",
      top: "42%",
      delay: "0s",
      color: "bg-violet-400",
    },
    {
      left: "31%",
      top: "22%",
      delay: "0.7s",
      color: "bg-cyan-400",
    },
    {
      left: "68%",
      top: "24%",
      delay: "1.2s",
      color: "bg-violet-300",
    },
    {
      left: "82%",
      top: "48%",
      delay: "0.4s",
      color: "bg-cyan-300",
    },
    {
      left: "70%",
      top: "72%",
      delay: "1.6s",
      color: "bg-violet-400",
    },
    {
      left: "30%",
      top: "74%",
      delay: "1s",
      color: "bg-cyan-400",
    },
  ];

  return (
    <div className="relative mx-auto mb-8 h-[150px] w-full max-w-[900px] overflow-hidden sm:mb-10 sm:h-[170px]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,93,252,0.12),transparent_42%)]" />

      {/* Connection Lines */}
      <div className="absolute left-[18%] top-[42%] h-px w-[64%] bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />

      <div className="absolute left-[31%] top-[22%] h-[62%] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

      <div className="absolute left-[68%] top-[24%] h-[60%] w-px -rotate-[28deg] bg-gradient-to-b from-transparent via-violet-400/20 to-transparent" />

      <div className="absolute left-[30%] top-[50%] h-px w-[40%] rotate-[18deg] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      {/* Animated Nodes */}
      {nodes.map((node, index) => (
        <span
          key={index}
          className={`absolute h-1.5 w-1.5 rounded-full ${node.color}`}
          style={{
            left: node.left,
            top: node.top,
            animation: `footerNodePulse 2.8s ease-in-out ${node.delay} infinite`,
          }}
        />
      ))}

      {/* Central AI Core */}
      <div
        className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-violet-400/25 bg-[#0b1020]/80 shadow-[0_0_45px_rgba(109,93,252,0.18)] backdrop-blur-xl"
        style={{
          animation: "footerCoreFloat 4s ease-in-out infinite",
        }}
      >
        <div
          className="absolute inset-[-12px] rounded-full border border-cyan-400/10"
          style={{
            animation: "footerRingPulse 3.5s ease-in-out infinite",
          }}
        />

        <div
          className="absolute inset-[-22px] rounded-full border border-violet-400/[0.06]"
          style={{
            animation: "footerRingRotate 12s linear infinite",
          }}
        />

        <BrainCircuit
          size={30}
          strokeWidth={1.35}
          className="relative z-10 text-violet-200"
        />

        <span className="absolute right-[10px] top-[9px] h-1.5 w-1.5 rounded-full bg-cyan-300" />
      </div>

      {/* AI Label */}
      <div className="absolute left-1/2 top-[calc(50%+48px)] -translate-x-1/2 whitespace-nowrap">
        <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          <Sparkles size={10} className="text-cyan-400" />
          AI Recruitment Intelligence
        </div>
      </div>

      <style>{`
        @keyframes footerNodePulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.7);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes footerCoreFloat {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-6px);
          }
        }

        @keyframes footerRingPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.06);
          }
        }

        @keyframes footerRingRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// =====================================================
// FOOTER COMPONENT
// =====================================================

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const platformLinks = [
    { label: "Home", href: "#top" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For HR", href: "#for-hr" },
    { label: "AI Recruitment", href: "#ai-recruitment" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer
      id="contact"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.07] bg-[#02040c]/65 backdrop-blur-[2px]"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[-180px] h-[420px] w-[420px] rounded-full bg-violet-600/[0.055] blur-[150px]" />

        <div className="absolute right-[5%] top-[-120px] h-[380px] w-[380px] rounded-full bg-cyan-500/[0.045] blur-[140px]" />

        <div className="absolute left-1/2 top-[20%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/[0.018] blur-[160px]" />

        <div className="absolute inset-0 opacity-[0.018] [background-image:linear-gradient(rgba(139,127,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.3)_1px,transparent_1px)] [background-size:80px_80px]" />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-[#01030a]/70 to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="hn-container w-full min-w-0">
          {/* Animated AI */}
          <FooterAI />

          {/* Contact Heading */}
          <div className="mx-auto max-w-2xl px-2 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-4 py-2">
              <Sparkles
                size={14}
                className="text-violet-300"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                Contact & Connect
              </span>
            </div>

            <h2 className="pb-3 text-3xl font-bold leading-[1.2] tracking-tight text-white sm:text-4xl">
              Let's build the future of{" "}
              <span className="inline-block pb-[0.12em] hn-gradient-text">
                recruitment.
              </span>
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">
              Connect with HireNexus and explore the future of
              AI-powered recruitment intelligence.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/[0.12] bg-white/[0.035] px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:border-violet-400/30 hover:text-white"
              >
                GitHub
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/[0.12] bg-white/[0.035] px-6 py-3 text-sm font-medium text-slate-200 transition-all hover:border-violet-400/30 hover:text-white"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="grid gap-8 py-12 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div className="min-w-0">
              <a
                href="#top"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <Sparkles
                    size={18}
                    className="text-violet-300"
                  />
                </div>

                <div>
                  <div className="text-base font-bold tracking-[0.15em] text-white">
                    HIRENEXUS
                  </div>

                  <div className="text-[8px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    AI Recruitment Intelligence
                  </div>
                </div>
              </a>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                AI-powered resume screening, job matching,
                interview evaluation, and recruitment
                intelligence.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                Platform
              </h3>

              <nav className="mt-4 flex flex-col gap-3">
                {platformLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="w-fit text-sm text-slate-400 transition hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                Account
              </h3>

              <nav className="mt-4 flex flex-col gap-3">
                <a
                  href="/login"
                  className="w-fit text-sm text-slate-400 transition hover:text-white"
                >
                  Sign In
                </a>

                <a
                  href="/register"
                  className="w-fit text-sm text-slate-400 transition hover:text-white"
                >
                  Create Account
                </a>
              </nav>
            </div>

            {/* Project */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                Project
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <span>AI Resume Screening</span>
                <span>AI Interview Assistant</span>
                <span>Candidate Intelligence</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col gap-4 border-t border-white/[0.08] py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
            <p className="text-[11px] leading-5 text-slate-400">
              © {new Date().getFullYear()} HireNexus.
              All rights reserved.
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 transition hover:text-white"
            >
              Back to top

              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] transition group-hover:border-white/[0.2] group-hover:bg-white/[0.06]">
                <ArrowUp size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
