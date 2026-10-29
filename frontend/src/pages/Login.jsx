
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// =========================================================
// ERROR MESSAGE HELPER
// =========================================================

function getErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.msg) {
          return item.msg;
        }

        return JSON.stringify(item);
      })
      .join(", ");
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  return fallback;
}

// =========================================================
// LOGIN COMPONENT
// =========================================================

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // COMPLETE SIGN IN - SHARED BY EMAIL AND GOOGLE
  // =========================================================

  const completeSignIn = async (authData) => {
    const token = authData?.access_token;

    if (
      !token ||
      typeof token !== "string" ||
      token.trim() === ""
    ) {
      throw new Error(
        "Login successful, but no access token was received."
      );
    }

    const cleanToken = token.trim();

    try {
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: "application/json",
        },
      });

      const userDataResponse = await meResponse
        .json()
        .catch(() => ({}));

      if (!meResponse.ok) {
        throw new Error(
          getErrorMessage(
            userDataResponse,
            "Unable to load user information."
          )
        );
      }

      const user = userDataResponse?.user;

      if (!user) {
        throw new Error(
          "Unable to load authenticated user information."
        );
      }

      // Save session after backend verification.
      localStorage.setItem("access_token", cleanToken);
      localStorage.setItem("token", cleanToken);
      localStorage.setItem("user", JSON.stringify(user));

      const role = String(user.role || "").toLowerCase();

      if (role === "hr" || role === "recruiter") {
        window.location.replace("/hr-dashboard");
      } else {
        window.location.replace("/candidate-dashboard");
      }
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw err;
    }
  };

  // =========================================================
  // EMAIL / PASSWORD LOGIN
  // =========================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (loading || googleLoading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const loginData = await loginResponse
        .json()
        .catch(() => ({}));

      if (!loginResponse.ok) {
        throw new Error(
          getErrorMessage(
            loginData,
            "Invalid email or password."
          )
        );
      }

      await completeSignIn(loginData);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE SIGN IN
  // =========================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading || googleLoading) {
      return;
    }

    const credential = credentialResponse?.credential;

    if (!credential) {
      setError(
        "Google did not return a valid sign-in credential."
      );
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Google sign-in failed."
          )
        );
      }

      await completeSignIn(data);
    } catch (err) {
      console.error("Google sign-in error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google sign-in failed. Please try again."
    );
  };

  // =========================================================
  // LOGIN PAGE UI
  // =========================================================

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute left-[5%] top-[15%] h-64 w-64 rounded-full bg-violet-600/[0.07] blur-[120px]" />

        <div className="absolute bottom-[10%] right-[5%] h-72 w-72 rounded-full bg-cyan-500/[0.05] blur-[130px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:h-screen lg:py-4">
        <div className="grid w-full max-w-6xl items-center gap-6 lg:grid-cols-2 lg:gap-10">

          {/* =====================================================
              LEFT SIDE - ANIMATED AI VISUAL
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex h-auto flex-col items-center justify-center lg:h-[calc(100vh-32px)]"
          >
            <div className="relative flex h-[255px] w-full max-w-[430px] items-center justify-center sm:h-[300px] lg:h-[330px]">

              {/* Outer Orbit */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 28,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[220px] w-[220px] rounded-full border border-violet-400/20 sm:h-[270px] sm:w-[270px] lg:h-[290px] lg:w-[290px]"
              />

              {/* Inner Orbit */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute h-[165px] w-[165px] rounded-full border border-cyan-400/20 border-dashed sm:h-[205px] sm:w-[205px] lg:h-[220px] lg:w-[220px]"
              />

              {/* Animated Glow */}
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

              {/* Center AI Icon */}
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.045] shadow-[0_0_70px_rgba(124,58,237,0.28)] backdrop-blur-xl sm:h-28 sm:w-28 lg:h-28 lg:w-28">
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

              {/* AI Intelligence Badge */}
              <motion.div
                animate={{ y: [-7, 7, -7] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1 top-7 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[10px] text-slate-300 backdrop-blur-xl sm:left-4 sm:top-10 sm:px-3 sm:text-xs"
              >
                <Sparkles
                  size={12}
                  className="text-cyan-300"
                />
                AI Intelligence
              </motion.div>

              {/* Secure Access Badge */}
              <motion.div
                animate={{ y: [7, -7, 7] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-5 right-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[10px] text-slate-300 backdrop-blur-xl sm:right-2 sm:bottom-8 sm:px-3 sm:text-xs"
              >
                <Zap
                  size={12}
                  className="text-violet-300"
                />
                Secure Access
              </motion.div>
            </div>

            {/* Branding */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-0 max-w-xl px-2 text-center sm:mt-1"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400 sm:text-xs sm:tracking-[0.3em]">
                AI Recruitment Intelligence
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  HireNexus
                </span>
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-400 sm:mt-3 sm:text-sm sm:leading-6">
                Resume intelligence, semantic matching and AI-powered
                interview evaluation in one platform.
              </p>
            </motion.div>
          </motion.div>

          {/* =====================================================
              RIGHT SIDE - LOGIN FORM
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, x: 35, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex w-full items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7">

                {/* Login Heading */}
                <div className="mb-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Lock
                      size={19}
                      className="text-violet-300"
                    />
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight">
                    Sign in
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Access your AI recruitment workspace.
                  </p>
                </div>

                {/* =================================================
                    EMAIL / PASSWORD FORM
                ================================================= */}

                <form
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.06]"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="login-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.06]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
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
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Signing in..."
                      : "Sign in"}

                    {!loading && (
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-xs text-slate-600">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* =================================================
                    GOOGLE SIGN IN BUTTON
                ================================================= */}

                <div className="flex w-full flex-col items-center gap-3">
                  {googleLoading && (
                    <p
                      className="text-xs text-cyan-300"
                      role="status"
                    >
                      Signing in with Google...
                    </p>
                  )}

                  <div
                    className={
                      loading || googleLoading
                        ? "pointer-events-none opacity-60"
                        : ""
                    }
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="filled_black"
                      size="large"
                      shape="pill"
                      text="continue_with"
                      width="320"
                    />
                  </div>
                </div>

                {/* Register Link */}
                <p className="mt-5 text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    Create account
                  </a>
                </p>

                {/* Back Home */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="mt-4 w-full text-center text-xs text-slate-500 transition hover:text-slate-300"
                >
                  ← Back to home
                </button>
              </div>

              {/* Footer */}
              <p className="mt-3 text-center text-[10px] tracking-wide text-slate-600">
                HIRENEXUS • AI RECRUITMENT INTELLIGENCE
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
