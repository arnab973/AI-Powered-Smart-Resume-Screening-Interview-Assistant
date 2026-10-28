import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";

function goTo(path) {
  window.location.href = path;
}

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  placeholder = "Not provided",
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-violet-300/15 hover:bg-white/[0.025]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon size={17} className="text-violet-300" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
            {label}
          </p>

          <p className="mt-1.5 truncate text-sm font-semibold text-slate-200">
            {value || placeholder}
          </p>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to load profile."
        );
      }

      const currentUser = data?.user || data;

      setUser(currentUser);

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );
    } catch (err) {
      console.error("Profile loading error:", err);

      try {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "null"
        );

        if (storedUser) {
          setUser(storedUser);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load profile."
          );
        }
      } catch {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const name =
    user?.name ||
    user?.full_name ||
    "Candidate";

  const email =
    user?.email ||
    "Not provided";

  const role =
    user?.role ||
    "candidate";

  const profileImage =
    user?.profile_image ||
    null;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        <main className="mx-auto w-full max-w-[1250px] px-4 pb-12 pt-8 sm:px-6 lg:px-8">

          {/* Back */}
          <button
            type="button"
            onClick={() => goTo("/candidate-dashboard")}
            className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-cyan-300/20 hover:bg-white/[0.035] hover:text-white"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Dashboard
          </button>

          {/* Header */}
          <section className="relative overflow-hidden rounded-3xl border border-violet-300/[0.10] bg-gradient-to-br from-violet-500/[0.07] via-white/[0.015] to-cyan-500/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-8">

            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-[100px]" />

            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-[100px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-5">

                {/* Profile avatar */}
                <div className="relative shrink-0">

                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 shadow-[0_0_40px_rgba(34,211,238,0.10)] sm:h-28 sm:w-28">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${name} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-cyan-200">
                        {initials || "C"}
                      </span>
                    )}

                  </div>

                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#03050d] bg-cyan-400">
                    <CheckCircle2
                      size={15}
                      className="text-slate-950"
                    />
                  </div>

                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.035] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    <Sparkles size={11} />
                    Candidate Profile
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {loading ? (
                      <span className="text-slate-500">
                        Loading...
                      </span>
                    ) : (
                      <>
                        {name}
                      </>
                    )}
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    {email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <span className="rounded-full border border-violet-400/15 bg-violet-500/[0.06] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-300">
                      {role}
                    </span>

                    <span className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.035] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                      Account Active
                    </span>

                  </div>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() => goTo("/settings")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:border-violet-300/20 hover:bg-white/[0.035] hover:text-white"
                >
                  <Pencil size={14} />
                  Edit Profile
                </button>

              </div>

            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-500/[0.04] p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Main content */}
          <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">

            {/* Personal Information */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                  <User
                    size={19}
                    className="text-violet-300"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Your account information
                  </p>
                </div>

              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <ProfileField
                  icon={User}
                  label="Full Name"
                  value={name}
                />

                <ProfileField
                  icon={Mail}
                  label="Email Address"
                  value={email}
                />

                <ProfileField
                  icon={BriefcaseBusiness}
                  label="Account Type"
                  value={
                    role.charAt(0).toUpperCase() +
                    role.slice(1)
                  }
                />

                <ProfileField
                  icon={ShieldCheck}
                  label="Account Status"
                  value="Active"
                />

              </div>

              <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <ShieldCheck
                      size={16}
                      className="text-cyan-300"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Account information is secure
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-600">
                      Your profile information is loaded from
                      your authenticated HireNexus account.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Career Profile */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                  <GraduationCap
                    size={19}
                    className="text-cyan-300"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    Career Profile
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-600">
                    AI career workspace
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-3">

                <button
                  type="button"
                  onClick={() => goTo("/resume")}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.012] p-4 text-left transition hover:border-violet-300/15 hover:bg-white/[0.03]"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                    <FileText
                      size={17}
                      className="text-violet-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200">
                      Resume Analysis
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Analyze and improve your resume
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                  />

                </button>

                <button
                  type="button"
                  onClick={() => goTo("/jobs")}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.012] p-4 text-left transition hover:border-cyan-300/15 hover:bg-white/[0.03]"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                    <BriefcaseBusiness
                      size={17}
                      className="text-cyan-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200">
                      Job Matching
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Discover matching opportunities
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                  />

                </button>

                <button
                  type="button"
                  onClick={() => goTo("/interview-report")}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.012] p-4 text-left transition hover:border-fuchsia-300/15 hover:bg-white/[0.03]"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                    <Sparkles
                      size={17}
                      className="text-fuchsia-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200">
                      Interview Reports
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      Review your AI interview performance
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                  />

                </button>

              </div>

            </div>

          </section>

          {/* Contact / Additional information */}
          <section className="mt-5 rounded-3xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <MapPin
                  size={19}
                  className="text-blue-300"
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">
                  Additional Information
                </h2>

                <p className="mt-1 text-[10px] text-slate-600">
                  Career information can be expanded here
                </p>
              </div>

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              <ProfileField
                icon={Phone}
                label="Phone"
                value={user?.phone}
              />

              <ProfileField
                icon={MapPin}
                label="Location"
                value={user?.location}
              />

              <ProfileField
                icon={GraduationCap}
                label="Education"
                value={user?.education}
              />

            </div>

          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-[9px] uppercase tracking-[0.25em] text-slate-800">
            HireNexus • AI Recruitment Intelligence
          </footer>

        </main>
      </div>
    </div>
  );
}

export default Profile;