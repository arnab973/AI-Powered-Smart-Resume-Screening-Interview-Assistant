
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Cpu,
  Gauge,
  Lightbulb,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";
const SESSION_KEY = "hirenexus_interview_session_v2";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

const getReportId = (report) =>
  String(report?.id || report?._id || "");

const hasScore = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value));

const clampScore = (value) =>
  hasScore(value)
    ? Math.max(0, Math.min(10, Number(value)))
    : null;

const scoreText = (value) => {
  const score = clampScore(value);
  return score === null ? "N/A" : score.toFixed(1);
};

function scoreColor(value) {
  const score = clampScore(value);
  if (score === null) return "text-white/40";
  if (score >= 8) return "text-emerald-300";
  if (score >= 6) return "text-cyan-300";
  if (score >= 4) return "text-amber-300";
  return "text-rose-300";
}

function performanceTone(level) {
  const value = String(level || "").toLowerCase();

  if (value.includes("excellent")) {
    return {
      text: "text-emerald-300",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    };
  }

  if (value.includes("good")) {
    return {
      text: "text-cyan-300",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    };
  }

  if (value.includes("average")) {
    return {
      text: "text-amber-300",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    };
  }

  return {
    text: "text-violet-300",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  };
}

function getReportTimestamp(report) {
  const dates = [
    report?.created_at,
    report?.updated_at,
    report?.createdAt,
    report?.updatedAt,
    report?.metadata?.created_at,
  ];

  for (const date of dates) {
    if (!date) continue;
    const timestamp = new Date(date).getTime();
    if (Number.isFinite(timestamp)) return timestamp;
  }

  return 0;
}

function formatReportDate(report) {
  const timestamp = getReportTimestamp(report);
  if (!timestamp) return "Date unavailable";

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function apiRequest(path, signal) {
  const token = getToken();

  if (!token) {
    throw new Error("Your session has expired. Please login again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((item) => item.msg).join(", ")
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

function FloatingOrb({
  className = "",
  color = "cyan",
  size = "h-40 w-40",
}) {
  const colors = {
    cyan: "bg-cyan-400/10",
    violet: "bg-violet-500/10",
    pink: "bg-fuchsia-500/10",
    emerald: "bg-emerald-400/10",
  };

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${size} ${
        colors[color] || colors.cyan
      } ${className}`}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.035] shadow-xl backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function ScoreRing({ score }) {
  const normalized = clampScore(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const percentage = normalized === null ? 0 : normalized * 10;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="relative h-56 w-56 sm:h-64 sm:w-64">
      <motion.div
        className="absolute inset-5 rounded-full bg-cyan-400/10 blur-2xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        className="relative h-full w-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient
            id="reportScoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6"
        />

        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#reportScoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        <circle
          cx="50"
          cy="50"
          r="35"
          fill="rgba(2,6,23,0.7)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.7"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          <Sparkles size={13} className="text-cyan-300" />
          <span
            className={`text-5xl font-black tracking-tight ${scoreColor(
              normalized
            )}`}
          >
            {scoreText(normalized)}
          </span>
        </div>

        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.35em] text-white/30">
          Score / 10
        </span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, description }) {
  const score = clampScore(value);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl backdrop-blur-2xl"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition group-hover:bg-cyan-400/10" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
            <Icon size={18} className="text-cyan-300" />
          </div>

          <span className={`text-2xl font-black ${scoreColor(score)}`}>
            {scoreText(score)}
          </span>
        </div>

        <div className="mt-4 text-sm font-bold text-white/80">
          {label}
        </div>

        <div className="mt-1 text-[10px] text-white/30">
          {description}
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${score === null ? 0 : score * 10}%`,
            }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
          />
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({
  title,
  icon: Icon,
  items,
  tone = "cyan",
}) {
  const tones = {
    cyan: {
      border: "border-cyan-400/10",
      bg: "bg-cyan-400/[0.035]",
      iconBg: "bg-cyan-400/10",
      icon: "text-cyan-300",
      bullet: "bg-cyan-300",
    },
    emerald: {
      border: "border-emerald-400/10",
      bg: "bg-emerald-400/[0.035]",
      iconBg: "bg-emerald-400/10",
      icon: "text-emerald-300",
      bullet: "bg-emerald-300",
    },
    rose: {
      border: "border-rose-400/10",
      bg: "bg-rose-400/[0.035]",
      iconBg: "bg-rose-400/10",
      icon: "text-rose-300",
      bullet: "bg-rose-300",
    },
    violet: {
      border: "border-violet-400/10",
      bg: "bg-violet-400/[0.035]",
      iconBg: "bg-violet-400/10",
      icon: "text-violet-300",
      bullet: "bg-violet-300",
    },
    amber: {
      border: "border-amber-400/10",
      bg: "bg-amber-400/[0.035]",
      iconBg: "bg-amber-400/10",
      icon: "text-amber-300",
      bullet: "bg-amber-300",
    },
  };

  const style = tones[tone] || tones.cyan;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border ${style.border} ${style.bg} p-5 shadow-xl backdrop-blur-2xl sm:p-6`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          <Icon size={18} className={style.icon} />
        </div>

        <div>
          <div className="text-sm font-black text-white">
            {title}
          </div>

          <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-white/25">
            AI Insight
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {safeItems.length ? (
          safeItems.map((item, index) => (
            <div
              key={index}
              className="flex gap-3 text-sm leading-6 text-white/55"
            >
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${style.bullet}`}
              />
              <span>{String(item)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/30">
            No additional insights available.
          </p>
        )}
      </div>
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300/60">
        <span className="h-1 w-1 rounded-full bg-cyan-300" />
        {eyebrow}
      </div>

      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
          {description}
        </p>
      )}
    </div>
  );
}

export default function InterviewReport() {
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const performance = useMemo(
    () => performanceTone(report?.performance_level),
    [report?.performance_level]
  );

  const loadReports = useCallback(async (signal) => {
    const data = await apiRequest("/report", signal);
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.reports)
      ? data.reports
      : [];
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function initialize() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const token = getToken();

        if (!token) {
          window.location.href = "/login";
          return;
        }

        const allReports = await loadReports(controller.signal);

        if (!allReports.length) {
          throw new Error(
            "No performance report found. Complete an AI interview and generate your report first."
          );
        }

        const sortedReports = [...allReports].sort(
          (a, b) =>
            getReportTimestamp(b) - getReportTimestamp(a)
        );

        if (!active) return;
        setReports(sortedReports);

        const storedId =
          localStorage.getItem("latest_report_id") || "";

        const savedReport = sortedReports.find(
          (item) => getReportId(item) === storedId
        );

        const selected = savedReport || sortedReports[0];
        const id = getReportId(selected);

        let fullReport = selected;

        if (id) {
          try {
            fullReport = await apiRequest(
              `/report/${encodeURIComponent(id)}`,
              controller.signal
            );
          } catch (detailError) {
            if (controller.signal.aborted) return;
            fullReport = selected;
            if (active) {
              setNotice(
                "Full report details were unavailable. Showing saved report data."
              );
            }
          }
        }

        if (!active) return;

        setReport(fullReport);
        setSelectedReportId(id);

        if (id) {
          localStorage.setItem("latest_report_id", id);
        }
      } catch (err) {
        if (controller.signal.aborted || !active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load performance report."
        );
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
      controller.abort();
    };
  }, [loadReports, reloadKey]);

  async function changeReport(id) {
    if (!id || switching || id === selectedReportId) return;

    setSwitching(true);
    setError("");
    setNotice("");

    try {
      const selected = reports.find(
        (item) => getReportId(item) === id
      );

      const data = await apiRequest(
        `/report/${encodeURIComponent(id)}`
      );

      setReport(data || selected);
      setSelectedReportId(id);
      localStorage.setItem("latest_report_id", id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to switch performance report."
      );
    } finally {
      setSwitching(false);
    }
  }

  function refreshReports() {
    if (loading || refreshing || switching) return;
    setRefreshing(true);
    setReloadKey((value) => value + 1);
  }

  function goDashboard() {
    window.location.href = "/candidate-dashboard";
  }

  function goInterview() {
    window.location.href = "/interview";
  }

  function startNewInterview() {
    // Remove the saved frontend interview session.
    // The existing backend interview history remains intact.
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "/interview";
  }

  function goJobs() {
    window.location.href = "/jobs";
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <GlobalNightSky />

        <div className="relative flex min-h-screen items-center justify-center px-5">
          <FloatingOrb
            color="cyan"
            className="left-[8%] top-[20%]"
          />
          <FloatingOrb
            color="violet"
            className="bottom-[15%] right-[8%]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-2xl backdrop-blur-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10"
            >
              <Brain size={34} className="text-cyan-300" />
            </motion.div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300/70">
              <Loader2 size={14} className="animate-spin" />
              Loading Report
            </div>

            <h2 className="mt-3 text-2xl font-black">
              AI Performance Intelligence
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/35">
              Fetching your interview analysis and performance insights...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <GlobalNightSky />

        <div className="relative flex min-h-screen items-center justify-center px-5">
          <FloatingOrb
            color="pink"
            className="left-[10%] top-[20%]"
          />

          <div className="relative w-full max-w-lg rounded-[2rem] border border-rose-400/15 bg-white/[0.045] p-7 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10">
              <CircleAlert size={28} className="text-rose-300" />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Report Unavailable
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/40">
              {error || "The performance report could not be loaded."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={refreshReports}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-black"
              >
                <RefreshCw size={17} />
                Retry
              </button>

              <button
                type="button"
                onClick={goInterview}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-white/60"
              >
                Back to Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageScore = clampScore(report.average_score);
  const totalQuestions = Number(report.total_questions) || 0;

  const metadataCount = Number(
    report?.metadata?.evaluation_count
  );

  const evaluationCount =
    Number.isFinite(metadataCount) && metadataCount > 0
      ? metadataCount
      : Array.isArray(report.evaluation_ids)
      ? report.evaluation_ids.length
      : totalQuestions;

  const metrics = [
    {
      label: "Technical Knowledge",
      shortLabel: "Technical",
      value: report.average_technical_score,
      icon: Cpu,
      description: "Technical knowledge",
    },
    {
      label: "Answer Relevance",
      shortLabel: "Relevance",
      value: report.average_relevance_score,
      icon: Target,
      description: "Answer relevance",
    },
    {
      label: "Communication Clarity",
      shortLabel: "Clarity",
      value: report.average_clarity_score,
      icon: MessageSquare,
      description: "Communication quality",
    },
    {
      label: "Answer Completeness",
      shortLabel: "Completeness",
      value: report.average_completeness_score,
      icon: BarChart3,
      description: "Answer coverage",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <GlobalNightSky />

      <FloatingOrb
        color="cyan"
        className="left-[3%] top-36"
        size="h-48 w-48"
      />

      <FloatingOrb
        color="violet"
        className="right-[2%] top-[35%]"
        size="h-60 w-60"
      />

      <FloatingOrb
        color="pink"
        className="bottom-20 left-[15%]"
        size="h-44 w-44"
      />

      <div className="relative z-10 min-h-screen">
        <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#020617]/80 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={goInterview}
              className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={17} />
              <span className="hidden sm:inline">
                Back to Interview
              </span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <Brain size={18} className="text-cyan-300" />
                <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </div>

              <div className="hidden sm:block">
                <div className="text-xs font-black tracking-[0.22em]">
                  HIRENEXUS
                </div>
                <div className="text-[9px] uppercase tracking-widest text-cyan-300/50">
                  AI Performance Intelligence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
              <CheckCircle2 size={13} className="text-emerald-300" />
              <span className="text-[10px] font-bold text-emerald-300/70">
                Report Ready
              </span>
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-14">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Clock3 size={15} />
                Performance Report History
              </div>
              <p className="mt-1 text-xs text-white/35">
                View previously generated reports.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <select
                  value={selectedReportId}
                  onChange={(event) =>
                    changeReport(event.target.value)
                  }
                  disabled={switching || refreshing}
                  aria-label="Select performance report"
                  className="min-h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#10172c] py-2 pl-4 pr-10 text-xs font-semibold text-white outline-none focus:border-cyan-400/40 disabled:opacity-50 sm:min-w-64"
                >
                  {reports.map((item, index) => {
                    const id = getReportId(item);
                    if (!id) return null;

                    return (
                      <option key={id} value={id}>
                        Report {index + 1} — {formatReportDate(item)}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                />
              </div>

              <button
                type="button"
                onClick={refreshReports}
                disabled={refreshing || switching}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white/60 transition hover:bg-white/10 disabled:opacity-40"
              >
                {refreshing || switching ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-200"
            >
              <CircleAlert size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-6 text-amber-200/70">
              {notice}
            </div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:rounded-[2.5rem]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.09),transparent_30%),radial-gradient(circle_at_20%_90%,rgba(139,92,246,0.09),transparent_30%)]" />

            <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center lg:p-14">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  <Award size={13} />
                  Performance Analysis Ready
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Your AI
                  <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                    Performance Report
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                  Your saved interview evaluations have been analyzed
                  across technical knowledge, relevance, clarity and
                  completeness. Explore your performance insights
                  and personalized improvement roadmap.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <div
                    className={`rounded-full border px-4 py-2 text-xs font-black ${performance.border} ${performance.bg} ${performance.text}`}
                  >
                    {report.performance_level || "Evaluated"}
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/50">
                    {totalQuestions} Questions
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/50">
                    {evaluationCount} Evaluated
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-white/35">
                  <Clock3 size={14} />
                  {formatReportDate(report)}
                </div>
              </div>

              <div className="flex justify-center">
                <ScoreRing score={averageScore} />
              </div>
            </div>
          </motion.section>

          <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                icon={metric.icon}
                label={metric.shortLabel}
                value={metric.value}
                description={metric.description}
              />
            ))}
          </section>

          <section className="mt-12">
            <SectionTitle
              eyebrow="AI Analysis"
              title="Performance Summary"
              description="A high-level interpretation of your saved interview evaluations."
            />

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <Panel className="relative overflow-hidden p-6 sm:p-7">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                      <Brain size={20} className="text-cyan-300" />
                    </div>

                    <div>
                      <div className="text-sm font-black">
                        Overall AI Feedback
                      </div>

                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Performance Interpretation
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 whitespace-pre-wrap text-sm leading-8 text-white/55 sm:text-base">
                    {report.overall_feedback ||
                      "No overall feedback is available."}
                  </p>
                </div>
              </Panel>

              <Panel className="border-violet-400/10 bg-violet-400/[0.035] p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10">
                  <Gauge size={20} className="text-violet-300" />
                </div>

                <div className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-violet-300/60">
                  Performance Level
                </div>

                <div
                  className={`mt-2 text-3xl font-black ${performance.text}`}
                >
                  {report.performance_level || "Evaluated"}
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        averageScore === null
                          ? 0
                          : averageScore * 10
                      }%`,
                    }}
                    transition={{ duration: 1.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500"
                  />
                </div>

                <div className="mt-2 flex justify-between text-[9px] text-white/25">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </Panel>
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle
              eyebrow="Candidate Intelligence"
              title="Strengths & Growth Areas"
              description="Use these insights to improve your next technical or HR interview."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <InsightCard
                title="Your Strengths"
                icon={CheckCircle2}
                items={report.strengths}
                tone="emerald"
              />

              <InsightCard
                title="Areas to Improve"
                icon={TrendingUp}
                items={report.weaknesses}
                tone="rose"
              />
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle
              eyebrow="Next Step"
              title="AI Improvement Roadmap"
              description="Actionable recommendations generated from your saved evaluations."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <InsightCard
                title="Improvement Recommendations"
                icon={Lightbulb}
                items={report.improvement_recommendations}
                tone="violet"
              />

              <InsightCard
                title="Interview Tips"
                icon={Zap}
                items={report.interview_tips}
                tone="amber"
              />
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle
              eyebrow="Score Intelligence"
              title="Detailed Score Breakdown"
              description="Understand how the AI evaluated different dimensions of your answers."
            />

            <Panel className="p-5 sm:p-7">
              <div className="space-y-6">
                {metrics.map(({ label, value, icon: Icon }) => {
                  const score = clampScore(value);

                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                            <Icon
                              size={16}
                              className="text-cyan-300"
                            />
                          </div>

                          <span className="truncate text-sm font-bold text-white/65">
                            {label}
                          </span>
                        </div>

                        <span
                          className={`shrink-0 text-sm font-black ${scoreColor(
                            score
                          )}`}
                        >
                          {scoreText(score)}
                          {score !== null ? "/10" : ""}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              score === null ? 0 : score * 10
                            }%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.15,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </section>

          <section className="mt-12">
            <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-200/80">
                <CircleAlert size={16} />
                Report Scope
              </div>

              <p className="mt-2 text-xs leading-6 text-white/40">
                The current HireNexus backend generates performance
                reports using saved evaluations belonging to your
                account. A generated report may therefore contain
                results from multiple interview sessions, rather
                than only your latest interview.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] via-white/[0.035] to-violet-500/[0.07] p-6 shadow-2xl backdrop-blur-2xl sm:p-10"
            >
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300/60">
                    <Sparkles size={12} />
                    Continue Your Journey
                  </div>

                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    Ready for another round?
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
                    Practice again, explore another role, and
                    improve your interview performance with
                    HireNexus AI.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startNewInterview}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 text-sm font-black shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5"
                  >
                    <RotateCcw size={17} />
                    New Interview
                  </button>

                  <button
                    type="button"
                    onClick={goJobs}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    Explore Jobs
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={goDashboard}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-6 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    Dashboard
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </section>

          <div className="pb-8 pt-8 text-center text-[9px] uppercase tracking-[0.3em] text-white/15">
            HIRENEXUS • AI RECRUITMENT INTELLIGENCE
          </div>
        </main>
      </div>
    </div>
  );
}
