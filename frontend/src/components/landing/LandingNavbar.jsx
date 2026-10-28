import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);


const navItems = [
  {
    label: "Home",
    href: "#top",
  },
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "For HR",
    href: "#for-hr",
  },
  {
    label: "AI Recruitment",
    href: "#ai-recruitment",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];


  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed left-0 right-0 top-0 z-[100] px-2 pt-2 sm:px-4 sm:pt-3"
      >
        <div className="hn-container w-full min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070b18]/80 shadow-[0_10px_45px_rgba(0,0,0,0.28),0_0_35px_rgba(109,93,252,0.05)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/[0.025] via-transparent to-cyan-400/[0.025]" />

            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
              }}
              className="pointer-events-none absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
            />

            <div className="relative flex min-h-14 min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:min-h-[72px] sm:px-5 sm:py-0 lg:px-6">
              <motion.a
                href="#top"
                aria-label="HireNexus home"
                whileHover={{ y: -1 }}
                className="group flex min-w-0 items-center gap-2 sm:gap-3"
              >
                <motion.div
                  initial={{
                    rotateY: 0,
                    rotateX: 0,
                  }}
                  whileHover={{
                    rotateY: 18,
                    rotateX: -10,
                    scale: 1.05,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: 800,
                  }}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-violet-400/30 bg-violet-500/10 shadow-[0_0_24px_rgba(109,93,252,0.2)] sm:h-10 sm:w-10 sm:rounded-xl"
                >
                  <Sparkles
                    size={16}
                    strokeWidth={1.8}
                    className="relative z-10 text-violet-300 sm:h-5 sm:w-5"
                  />

                  <motion.span
                    animate={{
                      opacity: [0.2, 0.7, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-[10px] border border-cyan-400/25 sm:rounded-xl"
                  />

                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 -right-1 -z-10 h-full w-full rounded-[10px] border border-cyan-400/10 bg-cyan-400/[0.025] sm:rounded-xl"
                  />
                </motion.div>

                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold tracking-[0.11em] text-white sm:text-lg sm:tracking-[0.18em]">
                    HIRENEXUS
                  </div>

                  <div className="hidden text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500 sm:block">
                    AI Recruitment Intelligence
                  </div>
                </div>
              </motion.a>

              <nav className="hidden items-center gap-7 md:flex lg:gap-10">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.15 + index * 0.08,
                      duration: 0.45,
                    }}
                    className="group relative py-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-white"
                  >
                    {item.label}

                    <span className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-violet-400 to-cyan-300 transition-all duration-300 group-hover:w-full" />

                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300 opacity-0 blur-[2px] transition-opacity duration-300 group-hover:opacity-80" />
                  </motion.a>
                ))}
              </nav>

              <div className="hidden items-center gap-2.5 md:flex">
                <motion.a
                  href="/login"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Sign In
                </motion.a>

                <motion.a
                  href="/register"
                  whileHover={{
                    y: -2,
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="hn-gradient-button relative flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  <motion.span
                    animate={{
                      x: ["-120%", "160%"],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-y-0 w-12 bg-white/20 blur-md"
                  />

                  <span className="relative z-10">
                    Get Started
                  </span>

                  <motion.span
                    animate={{
                      x: [0, 3, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10"
                  >
                    <ArrowRight size={16} />
                  </motion.span>
                </motion.a>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMobileOpen((value) => !value)}
                aria-label={
                  mobileOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:bg-white/[0.08] md:hidden sm:h-11 sm:w-11 sm:rounded-xl"
              >
                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{
                        opacity: 0,
                        rotate: -90,
                        scale: 0.7,
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.7,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <X
                        size={18}
                        className="sm:h-5 sm:w-5"
                      />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{
                        opacity: 0,
                        rotate: 90,
                        scale: 0.7,
                      }}
                      animate={{
                        opacity: 1,
                        rotate: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        rotate: -90,
                        scale: 0.7,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <Menu
                        size={19}
                        className="sm:h-[21px] sm:w-[21px]"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <AnimatePresence>
              {mobileOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="overflow-hidden md:hidden"
                >
                  <motion.nav
                    initial={{
                      y: -10,
                    }}
                    animate={{
                      y: 0,
                    }}
                    exit={{
                      y: -10,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="border-t border-white/[0.08] px-3 py-3 sm:px-4 sm:py-4"
                  >
                    <div className="flex flex-col gap-1">
                      {navItems.map((item, index) => (
                        <motion.a
                          key={item.label}
                          href={item.href}
                          onClick={closeMobileMenu}
                          initial={{
                            opacity: 0,
                            x: -15,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.06,
                            duration: 0.3,
                          }}
                          className="flex min-h-10 items-center rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white sm:min-h-11 sm:px-4 sm:py-3 sm:text-sm"
                        >
                          {item.label}
                        </motion.a>
                      ))}
                    </div>

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.18,
                        duration: 0.3,
                      }}
                      className="mt-2.5 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-3 sm:mt-3 sm:gap-2.5 sm:pt-4"
                    >
                      <motion.a
                        href="/login"
                        onClick={closeMobileMenu}
                        whileTap={{ scale: 0.97 }}
                        className="flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-2.5 py-2.5 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white sm:min-h-11 sm:px-3 sm:py-3 sm:text-sm"
                      >
                        Sign In
                      </motion.a>

                      <motion.a
                        href="/register"
                        onClick={closeMobileMenu}
                        whileTap={{ scale: 0.97 }}
                        className="hn-gradient-button flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold sm:min-h-11 sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
                      >
                        Get Started

                        <ArrowRight
                          size={14}
                          className="sm:h-[15px] sm:w-[15px]"
                        />
                      </motion.a>
                    </motion.div>
                  </motion.nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <div
        className="h-[80px]"
        aria-hidden="true"
      />
    </>
  );
}

export default LandingNavbar;
