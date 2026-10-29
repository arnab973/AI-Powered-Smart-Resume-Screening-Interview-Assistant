
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  XCircle,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function goTo(path) {
  window.location.href = path;
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r/g, "").trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return cleanText(
            item.name || item.skill || item.title || ""
          );
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,|•/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function sectionLines(value) {
  return cleanText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getId(item) {
  return String(item?.id || item?._id || "");
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatScore(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const number = Number(value);
  return Number.isFinite(number)
    ? `${Math.max(0, Math.min(100, number)).toFixed(1)}%`
    : "—";
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Please check that FastAPI is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={20} />
        </div>
      </div>
    </GlassCard>
  );
}

function ProgressRing({ score, label, subtitle }) {
  const valid = score !== null && score !== undefined;
  const value = valid
    ? Math.max(0, Math.min(100, Number(score) || 0))
    : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      <svg
        viewBox="0 0 180 180"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#67e8f9"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (value / 100) * circumference
          }
          className="transition-all duration-700"
        />
      </svg>

      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="mt-2 text-4xl font-black text-white">
          {valid ? `${Math.round(value)}%` : "—"}
        </p>
        <p className="mt-1 text-xs text-cyan-300">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function TextCard({ title, value }) {
  const lines = sectionLines(value);

  return (
    <GlassCard className="p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-300">
        {title}
      </h3>

      {lines.length ? (
        <div className="space-y-3">
          {lines.map((line, index) => (
            <p
              key={index}
              className="whitespace-pre-wrap text-sm leading-7 text-slate-300"
            >
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Not detected in this resume.
        </p>
      )}
    </GlassCard>
  );
}

function SkillList({ title, skills, color = "cyan" }) {
  const items = normalizeArray(skills);
  const missing = color === "amber";

  return (
    <GlassCard className="p-6">
      <h3 className="mb-4 text-lg font-bold text-white">
        {title}
      </h3>

      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className={`rounded-full border px-3 py-2 text-xs ${
                missing
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No {missing ? "missing" : "matched"} skills reported.
        </p>
      )}
    </GlassCard>
  );
}

const SECTION_DEFINITIONS = [
  ["summary", "Professional Summary"],
  ["education", "Education"],
  ["skills", "Technical Skills"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["achievements", "Achievements"],
  ["certifications", "Certifications"],
];

function ResumeAnalysis() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [resume, setResume] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  const [screenings, setScreenings] = useState([]);
  const [selectedScreeningId, setSelectedScreeningId] =
    useState("");

  const [showRawText, setShowRawText] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const selectedScreening = useMemo(
    () =>
      screenings.find(
        (item) => getId(item) === selectedScreeningId
      ) || null,
    [screenings, selectedScreeningId]
  );

  const structuredData = resume?.structured_data || {};
  const personal = structuredData.personal_information || {};
  const skills = normalizeArray(structuredData.skills);

  const completeness = useMemo(() => {
    const results = SECTION_DEFINITIONS.map(([key, label]) => {
      const value = structuredData[key];
      const present = Array.isArray(value)
        ? value.length > 0
        : Boolean(cleanText(value));

      return { key, label, present };
    });

    const presentCount = results.filter(
      (item) => item.present
    ).length;

    return {
      results,
      presentCount,
      score: Math.round(
        (presentCount / SECTION_DEFINITIONS.length) * 100
      ),
    };
  }, [structuredData]);

  const resumeScreenings = useMemo(
    () =>
      screenings.filter(
        (item) => String(item.resume_id) === resumeId
      ),
    [screenings, resumeId]
  );

  const activeJob = jobs.find(
    (job) => getId(job) === jobId
  );

  const selectedJob = jobs.find(
    (job) => getId(job) === selectedScreening?.job_id
  );

  async function loadData(preferredResumeId = "") {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const results = await Promise.allSettled([
        apiRequest("/resume/my-resumes"),
        apiRequest("/screening"),
        apiRequest("/jobs/available"),
      ]);

      if (results[0].status !== "fulfilled") {
        throw results[0].reason;
      }

      const resumeList = Array.isArray(results[0].value.resumes)
        ? results[0].value.resumes
        : [];

      const screeningList =
        results[1].status === "fulfilled" &&
        Array.isArray(results[1].value)
          ? results[1].value
          : [];

      const jobsResponse =
        results[2].status === "fulfilled"
          ? results[2].value
          : null;

      const jobsList = Array.isArray(jobsResponse)
        ? jobsResponse
        : Array.isArray(jobsResponse?.jobs)
          ? jobsResponse.jobs
          : [];

      setResumes(resumeList);
      setScreenings(screeningList);
      setJobs(jobsList);

      if (!resumeList.length) {
        setResume(null);
        setResumeId("");
        return;
      }

      const storedId =
        preferredResumeId ||
        localStorage.getItem("resume_id") ||
        localStorage.getItem("latest_resume_id") ||
        "";

      const selected =
        resumeList.find(
          (item) => getId(item) === storedId
        ) || resumeList[0];

      await selectResume(selected, screeningList);

      if (results[1].status === "rejected") {
        setNotice(
          "Resume loaded, but saved screening history could not be retrieved."
        );
      } else if (results[2].status === "rejected") {
        setNotice(
          "Resume loaded, but available jobs could not be retrieved."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to load resume data.");
    } finally {
      setLoading(false);
    }
  }

  async function selectResume(
    selected,
    availableScreenings = screenings
  ) {
    const id = getId(selected);
    if (!id) return;

    setBusy(true);
    setError("");
    setNotice("");
    setSelectedScreeningId("");
    setJobId("");

    try {
      const response = await apiRequest(`/resume/${id}`);
      let fullResume = response.resume || selected;

      if (
        !fullResume.structured_data ||
        !Object.keys(fullResume.structured_data).length
      ) {
        const parsed = await apiRequest(
          `/resume/${id}/parse`,
          { method: "POST" }
        );
        fullResume = parsed.resume || fullResume;
      }

      setResume(fullResume);
      setResumeId(id);

      localStorage.setItem("resume_id", id);
      localStorage.setItem("latest_resume_id", id);

      const related = availableScreenings.filter(
        (item) => String(item.resume_id) === id
      );

      if (related.length) {
        setSelectedScreeningId(getId(related[0]));
        setJobId(String(related[0].job_id || ""));
      }
    } catch (err) {
      setError(
        err.message || "Unable to select this resume."
      );
    } finally {
      setBusy(false);
    }
  }

  async function runScreening() {
    if (!resumeId || !jobId) {
      setNotice("Please select a resume and a job first.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest("/screening", {
        method: "POST",
        body: JSON.stringify({
          resume_id: resumeId,
          job_id: jobId,
        }),
      });

      const updated = await apiRequest("/screening");

      const updatedList = Array.isArray(updated)
        ? updated
        : [];

      setScreenings(updatedList);

      const resultId = getId(result);

      if (resultId) {
        setSelectedScreeningId(resultId);
      } else {
        const matching = updatedList.find(
          (item) =>
            String(item.resume_id) === resumeId &&
            String(item.job_id) === jobId
        );

        if (matching) {
          setSelectedScreeningId(getId(matching));
        }
      }

      setNotice("ATS screening completed successfully.");
    } catch (err) {
      setError(err.message || "Screening failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const suggestions = normalizeArray(
    selectedScreening?.suggestions
  );

  const aiAnalysis = selectedScreening?.ai_analysis || {};

  const aiEntries = Object.entries(aiAnalysis).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  const jobLabel = (job) =>
    [
      job.title || job.job_title || "Untitled Job",
      job.company || job.company_name || "",
    ]
      .filter(Boolean)
      .join(" — ");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050812] text-white">
      <GlobalNightSky />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050812]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <button
              onClick={() => goTo("/candidate-dashboard")}
              className="flex items-center gap-3"
            >
              <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                <Zap size={18} />
              </span>

              <span className="text-left">
                <span className="block text-sm font-black tracking-[0.2em]">
                  HIRENEXUS
                </span>
                <span className="text-[10px] text-slate-500">
                  AI Recruitment Intelligence
                </span>
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(resumeId)}
                disabled={loading || busy}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              <button
                onClick={() => goTo("/candidate-dashboard")}
                className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950"
              >
                <ArrowLeft size={15} />
                Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
              <Loader2
                size={36}
                className="animate-spin text-cyan-300"
              />
              <p className="text-slate-400">
                Loading your resume intelligence...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                  <XCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              {notice && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-200">
                  <CircleAlert size={20} />
                  <p>{notice}</p>
                </div>
              )}

              {!resume ? (
                <GlassCard className="p-10 text-center">
                  <FileText
                    size={40}
                    className="mx-auto text-cyan-300"
                  />
                  <h1 className="mt-5 text-2xl font-bold">
                    No resume available
                  </h1>
                  <p className="mt-3 text-sm text-slate-400">
                    Upload your resume to start AI analysis.
                  </p>
                  <button
                    onClick={() => goTo("/resume")}
                    className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
                  >
                    Go to Resume Upload
                  </button>
                </GlassCard>
              ) : (
                <>
                  <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.03] to-transparent p-6 sm:p-10">
                    <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
                      <div>
                        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                          <Sparkles size={16} />
                          Resume Intelligence
                        </p>

                        <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                          Your resume,
                          <span className="text-cyan-300">
                            {" "}decoded by AI.
                          </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                          Explore your parsed profile, measure section
                          completeness, and screen your resume against
                          real job requirements.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <span className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-300">
                            {resume.original_filename || "Resume"}
                          </span>
                          <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-300">
                            <CheckCircle2
                              size={14}
                              className="mr-2 inline"
                            />
                            Parsed
                          </span>
                        </div>
                      </div>

                      <ProgressRing
                        score={completeness.score}
                        label="Section Completeness"
                        subtitle={`${completeness.presentCount}/7 sections`}
                      />
                    </div>
                  </section>

                  <section className="mt-8">
                    <SectionHeading
                      eyebrow="Resume Library"
                      title="Resume History"
                      description="Select an uploaded resume to view its analysis and saved screening results."
                    />

                    <GlassCard className="p-6">
                      <label className="mb-3 block text-xs uppercase tracking-widest text-slate-400">
                        Select Resume
                      </label>

                      <select
                        value={resumeId}
                        disabled={busy}
                        onChange={(event) => {
                          const selected = resumes.find(
                            (item) =>
                              getId(item) === event.target.value
                          );
                          if (selected) selectResume(selected);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                      >
                        {resumes.map((item) => (
                          <option key={getId(item)} value={getId(item)}>
                            {item.original_filename || "Resume"} —{" "}
                            {formatDate(item.uploaded_at)}
                          </option>
                        ))}
                      </select>

                      <p className="mt-3 text-xs text-slate-500">
                        {resumes.length} uploaded resume(s) found.
                      </p>
                    </GlassCard>
                  </section>

                  <section className="mt-8">
                    <SectionHeading
                      eyebrow="Candidate Profile"
                      title={personal.name || "Candidate"}
                      description="Information extracted from your selected resume."
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                      <MetricCard
                        title="Detected Skills"
                        value={skills.length}
                        subtitle="Extracted technical skills"
                        icon={Sparkles}
                      />
                      <MetricCard
                        title="Experience"
                        value={
                          cleanText(structuredData.experience)
                            ? "Detected"
                            : "Not Found"
                        }
                        subtitle="Professional experience"
                        icon={BriefcaseBusiness}
                      />
                      <MetricCard
                        title="Projects"
                        value={
                          cleanText(structuredData.projects)
                            ? "Detected"
                            : "Not Found"
                        }
                        subtitle="Project experience"
                        icon={FileText}
                      />
                    </div>
                  </section>

                  <section className="mt-8">
                    <SectionHeading
                      eyebrow="Identity Layer"
                      title="Candidate Information"
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          label: "Name",
                          value: personal.name,
                          icon: User,
                        },
                        {
                          label: "Email",
                          value: personal.email,
                          icon: Mail,
                        },
                        {
                          label: "Phone",
                          value: personal.phone,
                          icon: Phone,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <GlassCard key={label} className="p-5">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
                            <Icon size={15} />
                            {label}
                          </div>
                          <p className="mt-4 break-words text-sm font-semibold">
                            {value || "Not detected"}
                          </p>
                        </GlassCard>
                      ))}
                    </div>
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      eyebrow="Technical Intelligence"
                      title="Extracted Skills"
                    />
                    <SkillList
                      title={`${skills.length} Detected Skills`}
                      skills={skills}
                    />
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      eyebrow="Resume Structure"
                      title="Section Completeness"
                      description="This is a completeness indicator, not a job-specific ATS score."
                    />

                    <GlassCard className="p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {completeness.results.map((section) => (
                          <div
                            key={section.key}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] p-4"
                          >
                            <span className="text-sm text-slate-300">
                              {section.label}
                            </span>
                            {section.present ? (
                              <CheckCircle2
                                size={19}
                                className="text-emerald-300"
                              />
                            ) : (
                              <XCircle
                                size={19}
                                className="text-amber-300"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </section>

                  <section className="mt-10 grid gap-6 lg:grid-cols-2">
                    <TextCard
                      title="Professional Summary"
                      value={structuredData.summary}
                    />
                    <TextCard
                      title="Education"
                      value={structuredData.education}
                    />
                    <TextCard
                      title="Experience"
                      value={structuredData.experience}
                    />
                    <TextCard
                      title="Projects"
                      value={structuredData.projects}
                    />
                    <TextCard
                      title="Achievements"
                      value={structuredData.achievements}
                    />
                    <TextCard
                      title="Certifications"
                      value={structuredData.certifications}
                    />
                  </section>

                  <section className="mt-12">
                    <SectionHeading
                      eyebrow="ATS Intelligence"
                      title="Job-Specific Resume Screening"
                      description="Choose a job to calculate real ATS compatibility, skill matching and improvement suggestions."
                    />

                    <GlassCard className="p-6 sm:p-8">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                        <div>
                          <label className="mb-3 block text-xs uppercase tracking-widest text-slate-400">
                            Select Job
                          </label>

                          <select
                            value={jobId}
                            disabled={busy || !jobs.length}
                            onChange={(event) =>
                              setJobId(event.target.value)
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#101827] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                          >
                            <option value="">
                              {jobs.length
                                ? "Choose a job"
                                : "No jobs available"}
                            </option>

                            {jobs.map((job) => (
                              <option
                                key={getId(job)}
                                value={getId(job)}
                              >
                                {jobLabel(job)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={runScreening}
                          disabled={busy || !jobId}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Target size={17} />
                          )}
                          Run ATS Screening
                        </button>
                      </div>

                      {activeJob && (
                        <p className="mt-4 text-xs text-slate-400">
                          Selected job: {jobLabel(activeJob)}
                        </p>
                      )}
                    </GlassCard>
                  </section>

                  <section className="mt-10">
                    <SectionHeading
                      eyebrow="Saved Results"
                      title="Screening History"
                      description="Review previous ATS results for this resume."
                    />

                    <GlassCard className="p-6">
                      {resumeScreenings.length ? (
                        <div className="space-y-3">
                          {resumeScreenings.map((item) => {
                            const job = jobs.find(
                              (entry) =>
                                getId(entry) === String(item.job_id)
                            );

                            const active =
                              selectedScreeningId === getId(item);

                            return (
                              <button
                                key={getId(item)}
                                onClick={() => {
                                  setSelectedScreeningId(getId(item));
                                  setJobId(String(item.job_id || ""));
                                }}
                                className={`flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                                  active
                                    ? "border-cyan-400/30 bg-cyan-400/10"
                                    : "border-white/10 bg-white/[0.025] hover:border-cyan-400/20"
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {job
                                      ? jobLabel(job)
                                      : `Job ${String(
                                          item.job_id
                                        ).slice(-8)}`}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    ATS Screening Result
                                  </p>
                                </div>

                                <span className="text-xl font-bold text-cyan-300">
                                  {formatScore(item.ats_score)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">
                          No saved screening results for this resume.
                        </p>
                      )}
                    </GlassCard>
                  </section>

                  {selectedScreening && (
                    <motion.section
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-10"
                    >
                      <SectionHeading
                        eyebrow="AI Screening Results"
                        title="ATS Compatibility Analysis"
                        description={
                          selectedJob
                            ? `Results for ${jobLabel(selectedJob)}`
                            : "Results for the selected job"
                        }
                      />

                      <GlassCard className="p-6 sm:p-8">
                        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
                          <ProgressRing
                            score={selectedScreening.ats_score}
                            label="ATS Score"
                            subtitle="Job Compatibility"
                          />

                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400">
                              Required Skills Matched
                            </p>
                            <p className="mt-3 text-4xl font-black text-white">
                              {formatScore(
                                selectedScreening.matching_percentage
                              )}
                            </p>

                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      Number(
                                        selectedScreening.matching_percentage
                                      ) || 0
                                    )
                                  )}%`,
                                }}
                              />
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-400">
                              This percentage represents required skill
                              matching. ATS score is calculated separately
                              by the backend.
                            </p>
                          </div>
                        </div>
                      </GlassCard>

                      <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <SkillList
                          title="Matched Skills"
                          skills={selectedScreening.matched_skills}
                        />
                        <SkillList
                          title="Missing Skills"
                          skills={selectedScreening.missing_skills}
                          color="amber"
                        />
                      </div>

                      <div className="mt-6">
                        <GlassCard className="p-6">
                          <h3 className="flex items-center gap-2 text-lg font-bold">
                            <Sparkles
                              size={20}
                              className="text-cyan-300"
                            />
                            AI Resume Recommendations
                          </h3>

                          {suggestions.length ? (
                            <div className="mt-5 space-y-3">
                              {suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="flex gap-3 rounded-2xl border border-white/5 bg-white/[0.025] p-4"
                                >
                                  <CheckCircle2
                                    size={18}
                                    className="mt-1 shrink-0 text-cyan-300"
                                  />
                                  <p className="text-sm leading-6 text-slate-300">
                                    {suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-slate-400">
                              No additional recommendations were
                              returned by the screening engine.
                            </p>
                          )}
                        </GlassCard>
                      </div>

                      {aiEntries.length > 0 && (
                        <GlassCard className="mt-6 overflow-hidden">
                          <button
                            onClick={() =>
                              setShowAIAnalysis(!showAIAnalysis)
                            }
                            className="flex w-full items-center justify-between p-6 text-left"
                          >
                            <span className="flex items-center gap-2 font-bold">
                              <ShieldCheck
                                size={19}
                                className="text-cyan-300"
                              />
                              Detailed AI Analysis
                            </span>
                            {showAIAnalysis ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>

                          <AnimatePresence>
                            {showAIAnalysis && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border-t border-white/10"
                              >
                                <div className="space-y-4 p-6">
                                  {aiEntries.map(([key, value]) => (
                                    <div key={key}>
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                                        {key.replace(/_/g, " ")}
                                      </p>
                                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                        {typeof value === "string"
                                          ? value
                                          : JSON.stringify(
                                              value,
                                              null,
                                              2
                                            )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlassCard>
                      )}
                    </motion.section>
                  )}

                  <section className="mt-10">
                    <GlassCard className="overflow-hidden">
                      <button
                        onClick={() => setShowRawText(!showRawText)}
                        className="flex w-full items-center justify-between p-6 text-left"
                      >
                        <span>
                          <span className="block text-xs uppercase tracking-widest text-cyan-300">
                            Parser Output
                          </span>
                          <span className="mt-2 block text-lg font-bold">
                            Extracted Resume Text
                          </span>
                        </span>
                        {showRawText ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>

                      <AnimatePresence>
                        {showRawText && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/10"
                          >
                            <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words p-6 font-mono text-xs leading-6 text-slate-400">
                              {resume.extracted_text ||
                                "No extracted text available."}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </section>

                  <section className="mt-10 grid gap-5 sm:grid-cols-2">
                    <GlassCard className="p-6">
                      <BriefcaseBusiness
                        size={24}
                        className="text-cyan-300"
                      />
                      <h3 className="mt-4 text-lg font-bold">
                        Explore Job Matches
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Discover jobs and compare your resume against
                        their requirements.
                      </p>
                      <button
                        onClick={() => goTo("/jobs")}
                        className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950"
                      >
                        Explore Jobs <ArrowRight size={16} />
                      </button>
                    </GlassCard>

                    <GlassCard className="p-6">
                      <Clock3
                        size={24}
                        className="text-violet-300"
                      />
                      <h3 className="mt-4 text-lg font-bold">
                        AI Interview Preparation
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Practice technical, skill-gap and HR questions
                        using HireNexus AI.
                      </p>
                      <button
                        onClick={() => goTo("/interview")}
                        className="mt-5 flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-5 py-3 text-sm font-semibold text-violet-200"
                      >
                        Start Interview <ArrowRight size={16} />
                      </button>
                    </GlassCard>
                  </section>
                </>
              )}
            </>
          )}

          <footer className="py-12 text-center text-xs text-slate-600">
            HireNexus AI Recruitment Intelligence
          </footer>
        </main>
      </div>
    </div>
  );
}

export default ResumeAnalysis;
