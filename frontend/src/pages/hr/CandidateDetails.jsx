
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function CandidateDetails() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shortlisted, setShortlisted] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewMessage, setInterviewMessage] = useState("");

  const resumeId = useMemo(() => {
    const parts = window.location.pathname
      .split("/")
      .filter(Boolean);

    return parts[parts.length - 1] || "";
  }, []);

  useEffect(() => {
    loadCandidate();
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId) return;

    const saved = localStorage.getItem(
      `shortlisted_${resumeId}`
    );

    setShortlisted(saved === "true");
  }, [resumeId]);

  async function loadCandidate() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      if (!resumeId) {
        throw new Error("Resume ID not found.");
      }

      const response = await fetch(
        `${API_URL}/resume/candidates`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to retrieve candidates."
        );
      }

      const candidates = Array.isArray(data?.candidates)
        ? data.candidates
        : [];

      const matchedCandidate = candidates.find(
        (item) =>
          String(item.resume_id) === String(resumeId) ||
          String(item.id) === String(resumeId)
      );

      if (!matchedCandidate) {
        throw new Error(
          "Candidate information not found for this resume."
        );
      }

      setCandidate(matchedCandidate);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load candidate."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleViewResume() {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API_URL}/resume/${resumeId}/file`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => null);

        throw new Error(
          data?.detail || "Unable to open resume."
        );
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      window.open(
        blobUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to open resume."
      );
    }
  }

  function handleShortlist() {
    const nextValue = !shortlisted;

    setShortlisted(nextValue);

    localStorage.setItem(
      `shortlisted_${resumeId}`,
      String(nextValue)
    );
  }

  function handleScheduleInterview() {
    if (!interviewDate) {
      setInterviewMessage(
        "Please select an interview date and time."
      );
      return;
    }

    const formattedDate = new Date(
      interviewDate
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    localStorage.setItem(
      `interview_${resumeId}`,
      formattedDate
    );

    setInterviewMessage(
      `Interview scheduled for ${formattedDate}.`
    );
  }

  function goBack() {
    window.location.href = "/hr/candidates";
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 z-0">
          <GlobalNightSky />
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="relative mx-auto mb-7 h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/20" />
            <div className="absolute inset-2 animate-spin rounded-full border border-transparent border-t-cyan-400 border-r-purple-400" />
            <div className="absolute inset-5 flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
              <Sparkles
                size={26}
                className="text-cyan-300"
              />
            </div>
          </div>

          <p className="text-sm font-medium tracking-[0.25em] text-cyan-300">
            ANALYZING CANDIDATE
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Loading recruitment intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 z-0">
          <GlobalNightSky />
        </div>

        <div className="relative z-20 flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-lg rounded-[2rem] border border-red-400/20 bg-slate-950/75 p-8 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
              <X
                size={30}
                className="text-red-400"
              />
            </div>

            <h1 className="text-xl font-semibold">
              Candidate Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error ||
                "Candidate information could not be loaded."}
            </p>

            <button
              type="button"
              onClick={goBack}
              className="relative z-[200] mt-7 inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              <ArrowLeft size={17} />
              Back to Candidates
            </button>
          </div>
        </div>
      </div>
    );
  }

  const name = candidate.name || "Candidate";

  const email =
    candidate.email || "Not available";

  const phone =
    candidate.phone || "Not available";

  const role =
    candidate.role || "Candidate";

  const summary =
    candidate.summary ||
    "No professional summary available.";

  const education =
    candidate.education ||
    "Education information not available.";

  const experience =
    candidate.experience ||
    "Experience information not available.";

  const projects = candidate.projects || "";

  const achievements =
    candidate.achievements || "";

  const certifications =
    candidate.certifications || "";

  const skills = Array.isArray(candidate.skills)
    ? candidate.skills
    : [];

  const skillCount = skills.length;

  const projectCount = projects
    ? projects
        .split(/\n(?=[A-Z])/)
        .filter(Boolean).length
    : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <GlobalNightSky />
      </div>

      <div className="pointer-events-none absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[5%] top-[40%] h-80 w-80 rounded-full bg-purple-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[35%] h-64 w-64 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-20 min-h-screen">
        <header className="sticky top-0 z-[100] border-b border-white/[0.08] bg-[#020617]/75 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="relative z-[200] flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <ArrowLeft size={17} />
              <span>Candidates</span>
            </button>

            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                <Sparkles
                  size={16}
                  className="text-cyan-300"
                />
              </div>

              <span className="hidden text-sm font-bold tracking-[0.2em] text-slate-200 sm:block">
                HIRENEXUS
              </span>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium tracking-[0.18em] text-emerald-300">
                AI HR CONSOLE
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/55 shadow-[0_25px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(168,85,247,0.1),transparent_35%)]" />

            <div className="pointer-events-none absolute right-10 top-8 hidden opacity-20 lg:block">
              <div className="relative h-44 w-44 animate-[spin_20s_linear_infinite] rounded-full border border-cyan-400/30">
                <div className="absolute inset-4 rounded-full border border-purple-400/20" />
                <div className="absolute inset-10 rounded-full border border-cyan-400/20" />
                <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,1)]" />
                <div className="absolute bottom-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-purple-300 shadow-[0_0_20px_rgba(168,85,247,1)]" />
              </div>
            </div>

            <div className="relative p-5 sm:p-7 lg:p-9">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-2 animate-pulse rounded-[1.7rem] bg-cyan-400/10 blur-xl" />

                    <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-purple-500/10 shadow-[inset_0_0_30px_rgba(34,211,238,0.08)]">
                      <UserRound
                        size={40}
                        className="text-cyan-300"
                      />

                      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-[#06111d]">
                        <CheckCircle2
                          size={17}
                          className="text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-cyan-300">
                        CANDIDATE PROFILE
                      </span>

                      {shortlisted && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-300">
                          <Check size={12} />
                          SHORTLISTED
                        </span>
                      )}
                    </div>

                    <h1 className="truncate text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                      {name}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                      <span className="flex items-center gap-2">
                        <BriefcaseBusiness
                          size={15}
                          className="text-cyan-400"
                        />
                        {role}
                      </span>

                      <span className="flex items-center gap-2">
                        <MapPin
                          size={15}
                          className="text-purple-400"
                        />
                        Kolkata, India
                      </span>

                      <span className="flex items-center gap-2">
                        <FileText
                          size={15}
                          className="text-emerald-400"
                        />
                        {candidate.original_filename}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-[200] flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleViewResume}
                    className="group relative inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 active:scale-95"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Download size={17} />
                    View Resume
                  </button>

                  <button
                    type="button"
                    onClick={handleShortlist}
                    className={`inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition active:scale-95 ${
                      shortlisted
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
                    }`}
                  >
                    <CheckCircle2 size={17} />
                    {shortlisted
                      ? "Shortlisted"
                      : "Shortlist"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInterviewMessage("");
                      setShowInterviewModal(true);
                    }}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 text-sm font-semibold text-purple-300 transition hover:border-purple-300/60 hover:bg-purple-400/20 active:scale-95"
                  >
                    <CalendarDays size={17} />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              icon={<Code2 size={19} />}
              label="Skills"
              value={skillCount}
              accent="cyan"
            />

            <MetricCard
              icon={<Rocket size={19} />}
              label="Projects"
              value={projectCount || "4+"}
              accent="purple"
            />

            <MetricCard
              icon={<Award size={19} />}
              label="Certifications"
              value={
                certifications
                  ? certifications
                      .split("\n")
                      .filter(Boolean).length
                  : 0
              }
              accent="blue"
            />

            <MetricCard
              icon={<Trophy size={19} />}
              label="Status"
              value={candidate.parsed ? "Parsed" : "Pending"}
              accent="emerald"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <GlassCard>
                <SectionHeading
                  icon={<UserRound size={18} />}
                  title="Identity"
                  eyebrow="CONTACT NODE"
                  accent="cyan"
                />

                <div className="space-y-5">
                  <InfoRow
                    icon={<Mail size={17} />}
                    label="Email"
                    value={email}
                    accent="cyan"
                  />

                  <InfoRow
                    icon={<Phone size={17} />}
                    label="Phone"
                    value={phone}
                    accent="purple"
                  />

                  <InfoRow
                    icon={<MapPin size={17} />}
                    label="Location"
                    value="Kolkata, West Bengal, India"
                    accent="blue"
                  />

                  <InfoRow
                    icon={<ShieldCheck size={17} />}
                    label="Profile Status"
                    value={
                      candidate.parsed
                        ? "Resume Parsed"
                        : "Parsing Pending"
                    }
                    accent="emerald"
                  />
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeading
                  icon={<Zap size={18} />}
                  title="Skill Matrix"
                  eyebrow="TECH STACK"
                  accent="purple"
                />

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={`${skill}-${index}`}
                      className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-200"
                    >
                      <span className="relative z-10">
                        {skill}
                      </span>

                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeading
                  icon={<ShieldCheck size={18} />}
                  title="AI Screening"
                  eyebrow="INTELLIGENCE"
                  accent="emerald"
                />

                <div className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-3xl" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        Resume Status
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-300">
                        {candidate.parsed
                          ? "READY"
                          : "PENDING"}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                      <Sparkles
                        size={20}
                        className="text-emerald-300"
                      />
                    </div>
                  </div>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${
                        candidate.parsed
                          ? "w-full bg-emerald-400"
                          : "w-1/3 bg-amber-400"
                      }`}
                    />
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-slate-500">
                    ATS and semantic matching scores will
                    appear after the screening pipeline runs.
                  </p>
                </div>
              </GlassCard>
            </aside>

            <div className="min-w-0 space-y-6">
              <GlassCard large>
                <SectionHeading
                  icon={<Sparkles size={19} />}
                  title="Professional Intelligence"
                  eyebrow="AI EXTRACTED PROFILE"
                  accent="cyan"
                />

                <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.05] to-transparent p-5 sm:p-6">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

                  <p className="relative whitespace-pre-line text-sm leading-7 text-slate-300">
                    {summary}
                  </p>
                </div>
              </GlassCard>

              <GlassCard>
                <SectionHeading
                  icon={<GraduationCap size={19} />}
                  title="Education"
                  eyebrow="ACADEMIC HISTORY"
                  accent="blue"
                />

                <TimelineText
                  text={education}
                  icon={<GraduationCap size={17} />}
                  accent="blue"
                />
              </GlassCard>

              <GlassCard>
                <SectionHeading
                  icon={<BriefcaseBusiness size={19} />}
                  title="Professional Experience"
                  eyebrow="CAREER TIMELINE"
                  accent="emerald"
                />

                <TimelineText
                  text={experience}
                  icon={<BriefcaseBusiness size={17} />}
                  accent="emerald"
                />
              </GlassCard>

              {projects && (
                <GlassCard>
                  <SectionHeading
                    icon={<Rocket size={19} />}
                    title="Projects"
                    eyebrow="BUILD PORTFOLIO"
                    accent="purple"
                  />

                  <ContentBlock
                    text={projects}
                    accent="purple"
                  />
                </GlassCard>
              )}

              {achievements && (
                <GlassCard>
                  <SectionHeading
                    icon={<Trophy size={19} />}
                    title="Achievements"
                    eyebrow="RECOGNITION"
                    accent="amber"
                  />

                  <ContentBlock
                    text={achievements}
                    accent="amber"
                  />
                </GlassCard>
              )}

              {certifications && (
                <GlassCard>
                  <SectionHeading
                    icon={<Award size={19} />}
                    title="Certifications"
                    eyebrow="VERIFIED LEARNING"
                    accent="blue"
                  />

                  <ContentBlock
                    text={certifications}
                    accent="blue"
                  />
                </GlassCard>
              )}

              <div className="flex items-center justify-center gap-3 py-5 text-[10px] tracking-[0.2em] text-slate-600">
                <Star size={11} />
                HIRENEXUS RECRUITMENT INTELLIGENCE
                <Star size={11} />
              </div>
            </div>
          </section>
        </main>
      </div>

      {showInterviewModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
          <div className="relative z-[501] w-full max-w-md overflow-hidden rounded-[2rem] border border-purple-400/20 bg-[#07101f]/95 shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative border-b border-white/[0.08] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10">
                      <CalendarDays
                        size={17}
                        className="text-purple-300"
                      />
                    </div>

                    <span className="text-[10px] font-semibold tracking-[0.2em] text-purple-300">
                      INTERVIEW NODE
                    </span>
                  </div>

                  <h2 className="text-xl font-bold">
                    Schedule Interview
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowInterviewModal(false)
                  }
                  className="relative z-[600] flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative p-6">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Interview Date & Time
              </label>

              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(event) =>
                  setInterviewDate(event.target.value)
                }
                className="relative z-[600] min-h-[48px] w-full cursor-text rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/50 focus:bg-purple-400/[0.04]"
              />

              {interviewMessage && (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                  {interviewMessage}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowInterviewModal(false)
                  }
                  className="relative z-[600] min-h-[46px] flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleScheduleInterview}
                  className="relative z-[600] flex min-h-[46px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-400/20"
                >
                  <CalendarDays size={16} />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GlassCard({
  children,
  large = false,
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[1.7rem] border border-white/[0.08] bg-slate-950/55 backdrop-blur-2xl ${
        large ? "p-5 sm:p-7" : "p-5 sm:p-6"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      {children}
    </section>
  );
}

function SectionHeading({
  icon,
  title,
  eyebrow,
  accent,
}) {
  const accentClasses = {
    cyan: {
      box: "border-cyan-400/15 bg-cyan-400/10",
      icon: "text-cyan-300",
      text: "text-cyan-300",
    },
    purple: {
      box: "border-purple-400/15 bg-purple-400/10",
      icon: "text-purple-300",
      text: "text-purple-300",
    },
    blue: {
      box: "border-blue-400/15 bg-blue-400/10",
      icon: "text-blue-300",
      text: "text-blue-300",
    },
    emerald: {
      box: "border-emerald-400/15 bg-emerald-400/10",
      icon: "text-emerald-300",
      text: "text-emerald-300",
    },
    amber: {
      box: "border-amber-400/15 bg-amber-400/10",
      icon: "text-amber-300",
      text: "text-amber-300",
    },
  };

  const style =
    accentClasses[accent] ||
    accentClasses.cyan;

  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.box}`}
      >
        <span className={style.icon}>
          {icon}
        </span>
      </div>

      <div className="min-w-0">
        <p
          className={`text-[9px] font-bold tracking-[0.22em] ${style.text}`}
        >
          {eyebrow}
        </p>

        <h2 className="mt-1 truncate text-lg font-bold text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  accent,
}) {
  const colors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
  };

  return (
    <div className="flex gap-3">
      <div
        className={`mt-0.5 shrink-0 ${colors[accent] || colors.cyan}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium tracking-wide text-slate-600">
          {label}
        </p>

        <p className="mt-1 break-words text-sm leading-5 text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function TimelineText({
  text,
  icon,
  accent,
}) {
  const colors = {
    cyan: {
      border: "border-cyan-400/20",
      bg: "bg-cyan-400/5",
      text: "text-cyan-300",
      line: "bg-cyan-400/20",
    },
    blue: {
      border: "border-blue-400/20",
      bg: "bg-blue-400/5",
      text: "text-blue-300",
      line: "bg-blue-400/20",
    },
    emerald: {
      border: "border-emerald-400/20",
      bg: "bg-emerald-400/5",
      text: "text-emerald-300",
      line: "bg-emerald-400/20",
    },
  };

  const style =
    colors[accent] || colors.cyan;

  return (
    <div className="relative">
      <div
        className={`absolute bottom-2 left-[13px] top-2 w-px ${style.line}`}
      />

      <div className="relative flex gap-4">
        <div
          className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${style.border} ${style.bg}`}
        >
          <span className={style.text}>
            {icon}
          </span>
        </div>

        <div className="min-w-0 flex-1 pb-1">
          <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContentBlock({
  text,
  accent,
}) {
  const borderClasses = {
    purple: "border-purple-400/10 bg-purple-400/[0.025]",
    amber: "border-amber-400/10 bg-amber-400/[0.025]",
    blue: "border-blue-400/10 bg-blue-400/[0.025]",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${
        borderClasses[accent] ||
        borderClasses.purple
      }`}
    >
      <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
        {text}
      </p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  accent,
}) {
  const styles = {
    cyan: {
      border: "border-cyan-400/15",
      bg: "bg-cyan-400/5",
      icon: "text-cyan-300",
    },
    purple: {
      border: "border-purple-400/15",
      bg: "bg-purple-400/5",
      icon: "text-purple-300",
    },
    blue: {
      border: "border-blue-400/15",
      bg: "bg-blue-400/5",
      icon: "text-blue-300",
    },
    emerald: {
      border: "border-emerald-400/15",
      bg: "bg-emerald-400/5",
      icon: "text-emerald-300",
    },
  };

  const style =
    styles[accent] || styles.cyan;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1`}
    >
      <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/[0.02] blur-xl transition group-hover:bg-white/[0.05]" />

      <div className="relative">
        <div className={style.icon}>
          {icon}
        </div>

        <p className="mt-3 text-[10px] font-medium tracking-[0.12em] text-slate-600">
          {label}
        </p>

        <p className="mt-1 truncate text-xl font-black text-white sm:text-2xl">
          {value}
        </p>
      </div>
    </div>
  );
}

export default CandidateDetails;