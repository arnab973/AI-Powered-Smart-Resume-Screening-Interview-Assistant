import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed. Please try again."
        );
      }

      window.location.href = "/login";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute left-[5%] top-[15%] h-64 w-64 rounded-full bg-violet-600/[0.07] blur-[120px]" />

        <div className="absolute bottom-[10%] right-[5%] h-72 w-72 rounded-full bg-cyan-500/[0.05] blur-[130px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:h-screen lg:py-4">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex h-auto flex-col items-center justify-center lg:h-[calc(100vh-32px)]"
          >
            <div className="relative flex h-[255px] w-full max-w-[430px] items-center justify-center sm:h-[300px] lg:h-[330px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 28,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[220px] w-[220px] rounded-full border border-violet-400/20 sm:h-[270px] sm:w-[270px] lg:h-[290px] lg:w-[290px]"
              />

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[165px] w-[165px] rounded-full border border-cyan-400/20 border-dashed sm:h-[205px] sm:w-[205px] lg:h-[220px] lg:w-[220px]"
              />

              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  opacity: [0.65, 1, 0.65],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute h-32 w-32 rounded-full bg-violet-600/[0.09] blur-3xl sm:h-40 sm:w-40"
              />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.045] shadow-[0_0_70px_rgba(124,58,237,0.28)] backdrop-blur-xl sm:h-28 sm:w-28">
                <BrainCircuit
                  size={48}
                  strokeWidth={1.2}
                  className="text-violet-300 sm:h-[58px] sm:w-[58px]"
                />

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-[-13px] rounded-full border border-cyan-400/20 border-t-cyan-300/70"
                />
              </div>

              <motion.div
                animate={{ y: [-7, 7, -7] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1 top-7 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[10px] text-slate-300 backdrop-blur-xl sm:left-4 sm:top-10 sm:px-3 sm:text-xs"
              >
                <Sparkles size={12} className="text-cyan-300" />
                AI Intelligence
              </motion.div>

              <motion.div
                animate={{ y: [7, -7, 7] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-5 right-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[10px] text-slate-300 backdrop-blur-xl sm:right-2 sm:bottom-8 sm:px-3 sm:text-xs"
              >
                <Zap size={12} className="text-violet-300" />
                Smart Recruitment
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-0 max-w-xl px-2 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400 sm:text-xs sm:tracking-[0.3em]">
                AI Recruitment Intelligence
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Join{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  HireNexus
                </span>
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-400 sm:mt-3 sm:text-sm sm:leading-6">
                Build smarter hiring workflows with AI-powered resume
                screening, semantic matching and interview intelligence.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex w-full items-center justify-center"
          >
            <div className="w-full max-w-[430px]">
              <div className="rounded-[26px] border border-white/10 bg-[#080b14]/75 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                      <Sparkles
                        size={18}
                        className="text-violet-300"
                      />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Create account
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Start your AI recruitment journey.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleRegister}
                  className="space-y-3"
                >
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Full name
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Your full name"
                        autoComplete="name"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.05]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (value) => !value
                          )
                        }
                        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Account type
                    </label>

                    <select
                      value={role}
                      onChange={(event) =>
                        setRole(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#0b0e18] px-3.5 text-sm text-white outline-none transition focus:border-violet-400/50"
                    >
                      <option value="candidate">
                        Candidate
                      </option>

                      <option value="hr">
                        HR / Recruiter
                      </option>
                    </select>
                  </div>

                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Creating account..."
                      : "Create account"}

                    {!loading && (
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-[10px] text-slate-600">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <p className="text-center text-xs text-slate-400">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    Sign in
                  </a>
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="mt-3 w-full text-center text-[11px] text-slate-500 transition hover:text-slate-300"
                >
                  ← Back to home
                </button>
              </div>

              <p className="mt-3 text-center text-[9px] tracking-[0.15em] text-slate-600">
                HIRENEXUS • AI RECRUITMENT INTELLIGENCE
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;