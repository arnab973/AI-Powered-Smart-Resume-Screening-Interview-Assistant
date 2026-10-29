
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Code2,
  Loader2,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const SESSION_KEY = "hirenexus_interview_session_v2";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");

const getResumeId = () =>
  localStorage.getItem("resume_id") ||
  localStorage.getItem("latest_resume_id") ||
  localStorage.getItem("resumeId");

const getJobId = () => {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("job_id") ||
    localStorage.getItem("selected_job_id") ||
    localStorage.getItem("latest_job_id") ||
    localStorage.getItem("job_id")
  );
};

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function questionKey(question, index) {
  return String(question?.question_number ?? index + 1);
}

function normalizeQuestions(data) {
  const source = data?.interview || data;
  const questions = Array.isArray(source?.questions)
    ? source.questions
    : [
        ...(source?.technical_questions || []),
        ...(source?.skill_gap_questions || []),
        ...(source?.hr_questions || []),
      ];

  return questions
    .filter((item) => item && item.question)
    .map((item, index) => ({
      ...item,
      question_number: item.question_number ?? index + 1,
    }));
}

function questionType(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("technical")) return "Technical";
  if (value.includes("skill")) return "Skill Gap";
  if (value.includes("hr")) return "HR";
  return type || "Interview";
}

function TypeIcon({ type, size = 18 }) {
  const value = String(type || "").toLowerCase();
  if (value.includes("technical")) return <Code2 size={size} />;
  if (value.includes("skill")) return <Target size={size} />;
  if (value.includes("hr")) return <UserRound size={size} />;
  return <Brain size={size} />;
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error("Please login first.");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((e) => e.msg).join(", ")
        : `Request failed (${response.status})`
    );
  }

  return data;
}

function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-cyan-950/10 backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

function ScoreRing({ score = 0, size = 176 }) {
  const value = Math.max(0, Math.min(10, Number(score) || 0));
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 10);

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="hireScoreGradient">
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
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#hireScoreGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">
          {value.toFixed(1)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
          Score / 10
        </span>
      </div>
    </div>
  );
}

function EvaluationCard({ evaluation }) {
  if (!evaluation) return null;

  const metrics = [
    ["Technical", evaluation.technical_score],
    ["Relevance", evaluation.relevance_score],
    ["Clarity", evaluation.clarity_score],
    ["Completeness", evaluation.completeness_score],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5"
    >
      <Panel className="p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
          <ScoreRing score={evaluation.overall_score} />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                AI Evaluation
              </span>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                {evaluation.performance_level || "Evaluated"}
              </span>
            </div>

            <h3 className="text-xl font-black">AI Feedback</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/60">
              {evaluation.feedback || "Evaluation completed."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {metrics.map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="text-[10px] text-white/40">
                    {label}
                  </div>
                  <div className="mt-1 text-xl font-black text-cyan-300">
                    {Number(score || 0).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
            <h4 className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 size={17} /> Strengths
            </h4>
            <div className="mt-3 space-y-2">
              {(evaluation.strengths || []).length ? (
                evaluation.strengths.map((item, index) => (
                  <p
                    key={index}
                    className="flex gap-2 text-sm leading-6 text-white/60"
                  >
                    <Check size={15} className="mt-1 shrink-0 text-emerald-300" />
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-sm text-white/35">
                  No specific strengths returned.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-5">
            <h4 className="flex items-center gap-2 font-bold text-rose-300">
              <Target size={17} /> Areas to Improve
            </h4>
            <div className="mt-3 space-y-2">
              {(evaluation.weaknesses || []).length ? (
                evaluation.weaknesses.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm leading-6 text-white/60"
                  >
                    • {item}
                  </p>
                ))
              ) : (
                <p className="text-sm text-white/35">
                  No specific weaknesses returned.
                </p>
              )}
            </div>
          </div>
        </div>

        {evaluation.improvement && (
          <div className="mt-4 rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] p-5">
            <h4 className="font-bold text-violet-300">
              Improvement Advice
            </h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">
              {evaluation.improvement}
            </p>
          </div>
        )}

        {Array.isArray(evaluation.improvement_plan) &&
          evaluation.improvement_plan.length > 0 && (
            <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
              <h4 className="font-bold text-cyan-300">
                AI Improvement Plan
              </h4>
              <div className="mt-3 space-y-2">
                {evaluation.improvement_plan.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm leading-6 text-white/60"
                  >
                    <span className="mr-2 font-bold text-cyan-300">
                      {index + 1}.
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          )}

        {evaluation.interview_tip && (
          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
            <h4 className="flex items-center gap-2 font-bold text-amber-300">
              <Sparkles size={17} /> Interview Tip
            </h4>
            <p className="mt-2 text-sm leading-7 text-white/60">
              {evaluation.interview_tip}
            </p>
          </div>
        )}
      </Panel>
    </motion.div>
  );
}

export default function Interview() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobs, setJobs] = useState([]);

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const evaluateLock = useRef(false);
  const reportLock = useRef(false);
  const restored = useRef(false);

  const currentQuestion = questions[currentIndex];
  const currentKey = currentQuestion
    ? questionKey(currentQuestion, currentIndex)
    : "";

  const currentAnswer = answers[currentKey] || "";
  const currentEvaluation = evaluations[currentKey];

  const evaluatedCount = questions.filter(
    (question, index) => !!evaluations[questionKey(question, index)]
  ).length;

  const answeredCount = questions.filter(
    (question, index) =>
      !!String(answers[questionKey(question, index)] || "").trim()
  ).length;

  const interviewComplete =
    questions.length > 0 && evaluatedCount === questions.length;

  const averageScore = useMemo(() => {
    const values = Object.values(evaluations)
      .map((item) => Number(item?.overall_score))
      .filter(Number.isFinite);

    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : 0;
  }, [evaluations]);

  const progress = questions.length
    ? (evaluatedCount / questions.length) * 100
    : 0;

  useEffect(() => {
    async function initialize() {
      try {
        const token = getToken();
        if (!token) throw new Error("Please login first.");

        const savedResume = getResumeId();
        const savedJob = getJobId();

        setResumeId(savedResume || "");

        let restoredSession = null;

        try {
          const raw = sessionStorage.getItem(SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);

            if (
              parsed?.started &&
              Array.isArray(parsed?.questions) &&
              parsed.questions.length &&
              parsed?.userTokenMarker === token.slice(-12)
            ) {
              restoredSession = parsed;
            }
          }
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
        }

        const data = await apiRequest("/jobs/available");
        const availableJobs = Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
          ? data.jobs
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setJobs(availableJobs);

        const validIds = availableJobs
          .map((job) => String(job.id || job._id || ""))
          .filter(Boolean);

        const preferredJob =
          restoredSession?.jobId || savedJob || "";

        const validJob =
          validIds.includes(String(preferredJob))
            ? String(preferredJob)
            : validIds.length === 1
            ? validIds[0]
            : "";

        setJobId(validJob);

        if (restoredSession) {
          setInterview(restoredSession.interview);
          setQuestions(restoredSession.questions);
          setCurrentIndex(
            Math.min(
              Math.max(0, Number(restoredSession.currentIndex) || 0),
              restoredSession.questions.length - 1
            )
          );
          setAnswers(restoredSession.answers || {});
          setEvaluations(restoredSession.evaluations || {});
          setStarted(true);
          setFinished(!!restoredSession.finished);
          setSessionStart(
            restoredSession.sessionStart || Date.now()
          );
          setNotice("Your interview session was restored.");
        }

        if (!validJob && !restoredSession) {
          setNotice(
            "Select a target job before generating your interview."
          );
        }
      } catch (err) {
        setError(err.message || "Failed to initialize interview.");
      } finally {
        restored.current = true;
        setLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if (!started || !sessionStart) return;

    const update = () =>
      setElapsed(
        Math.max(0, Math.floor((Date.now() - sessionStart) / 1000))
      );

    update();
    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [started, sessionStart]);

  useEffect(() => {
    if (!restored.current) return;

    if (!started || !questions.length) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    const session = {
      userTokenMarker: (getToken() || "").slice(-12),
      interview,
      questions,
      currentIndex,
      answers,
      evaluations,
      started,
      finished,
      sessionStart,
      jobId,
      resumeId,
    };

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Session storage may be unavailable or full.
    }
  }, [
    interview,
    questions,
    currentIndex,
    answers,
    evaluations,
    started,
    finished,
    sessionStart,
    jobId,
    resumeId,
  ]);

  function saveJob(value) {
    setJobId(value);
    localStorage.setItem("selected_job_id", value);
    localStorage.setItem("latest_job_id", value);
    localStorage.setItem("job_id", value);
    setError("");
  }

  async function generateInterview() {
    if (generating) return;

    if (!resumeId) {
      setError("Please upload and parse your resume first.");
      return;
    }

    if (!jobId) {
      setError("Please select a job first.");
      return;
    }

    setGenerating(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest("/interview", {
        method: "POST",
        body: JSON.stringify({
          resume_id: resumeId,
          job_id: jobId,
          technical_question_count: 5,
          skill_gap_question_count: 1,
          hr_question_count: 3,
        }),
      });

      const generated = normalizeQuestions(data);

      if (!generated.length) {
        throw new Error(
          "Interview was created, but no questions were returned."
        );
      }

      setInterview(data);
      setQuestions(generated);
      setCurrentIndex(0);
      setAnswers({});
      setEvaluations({});
      setStarted(true);
      setFinished(false);
      setSessionStart(Date.now());
      setElapsed(0);

      const interviewId = data?.id || data?.interview?.id;

      if (interviewId) {
        localStorage.setItem("latest_interview_id", interviewId);
      }

      setNotice(`${generated.length} AI questions generated.`);
    } catch (err) {
      setError(err.message || "Interview generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  function updateAnswer(value) {
    if (!currentQuestion || currentEvaluation) return;

    setAnswers((previous) => ({
      ...previous,
      [currentKey]: value,
    }));

    if (error) setError("");
  }

  async function evaluateAnswer() {
    if (
      evaluateLock.current ||
      evaluating ||
      !currentQuestion ||
      currentEvaluation
    ) {
      return;
    }

    const answer = currentAnswer.trim();

    if (!answer) {
      setError("Please write your answer first.");
      return;
    }

    evaluateLock.current = true;
    setEvaluating(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest("/evaluation", {
        method: "POST",
        body: JSON.stringify({
          question: currentQuestion.question,
          answer,
          skill: currentQuestion.skill || null,
        }),
      });

      setEvaluations((previous) => ({
        ...previous,
        [currentKey]: data,
      }));

      setNotice("Answer evaluated successfully.");
    } catch (err) {
      setError(err.message || "Evaluation failed.");
    } finally {
      evaluateLock.current = false;
      setEvaluating(false);
    }
  }

  function goPrevious() {
    if (evaluating || currentIndex === 0) return;
    setCurrentIndex((index) => index - 1);
    setError("");
    setNotice("");
  }

  function goNext() {
    if (evaluating) return;

    if (!currentEvaluation) {
      setError("Please evaluate this answer before continuing.");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setError("");
      setNotice("");
      return;
    }

    finishInterview();
  }

  function finishInterview() {
    if (!interviewComplete) {
      const nextUnanswered = questions.findIndex(
        (question, index) =>
          !evaluations[questionKey(question, index)]
      );

      if (nextUnanswered >= 0) {
        setCurrentIndex(nextUnanswered);
      }

      setError(
        "Evaluate all questions before completing the interview."
      );
      return;
    }

    setFinished(true);
    setError("");
    setNotice("Congratulations! Interview completed.");
  }

  function resetInterview() {
    if (generating || evaluating || reportLoading) return;

    if (
      started &&
      !finished &&
      !window.confirm(
        "Start a new interview? Current answers and progress will be cleared."
      )
    ) {
      return;
    }

    sessionStorage.removeItem(SESSION_KEY);
    setInterview(null);
    setQuestions([]);
    setAnswers({});
    setEvaluations({});
    setCurrentIndex(0);
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setSessionStart(null);
    setError("");
    setNotice("");
  }

  async function generateReport() {
    if (!interviewComplete) {
      setError("Complete every question before generating a report.");
      return;
    }

    if (reportLock.current || reportLoading) return;

    reportLock.current = true;
    setReportLoading(true);
    setError("");

    try {
      const data = await apiRequest("/report", {
        method: "POST",
      });

      if (!data?.id) {
        throw new Error("Report ID was not returned.");
      }

      localStorage.setItem("latest_report_id", data.id);
      window.location.href = "/interview-report";
    } catch (err) {
      setError(err.message || "Report generation failed.");
    } finally {
      reportLock.current = false;
      setReportLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] text-white">
        <GlobalNightSky />
        <Panel className="relative z-10 mx-4 max-w-md p-10 text-center">
          <Brain size={52} className="mx-auto text-cyan-300" />
          <Loader2
            size={24}
            className="mx-auto mt-6 animate-spin text-violet-300"
          />
          <h2 className="mt-5 text-2xl font-black">
            AI Interview Engine
          </h2>
          <p className="mt-3 text-sm text-white/45">
            Initializing your personalized interview...
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <GlobalNightSky />

      <div className="pointer-events-none absolute left-0 top-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-80 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
          <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => (window.location.href = "/jobs")}
              className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              <ChevronLeft size={19} />
              <span className="hidden sm:inline">
                Back to Job Matching
              </span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
                <Brain size={19} />
              </div>
              <div>
                <div className="text-xs font-black tracking-[0.2em]">
                  HIRENEXUS
                </div>
                <div className="text-[9px] uppercase tracking-wider text-cyan-300/50">
                  AI Interview Intelligence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
              <Clock3 size={14} className="text-cyan-300" />
              <span className="font-mono">
                {started ? formatTime(elapsed) : "00:00:00"}
              </span>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          {!started && (
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-6xl"
            >
              <Panel className="relative overflow-hidden p-6 sm:p-10 lg:p-14">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative grid gap-10 lg:grid-cols-[1fr_280px] lg:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                      <Zap size={14} />
                      AI Interview Engine
                    </span>

                    <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                      Your interview.
                      <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                        Powered by AI.
                      </span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                      Practice a personalized interview based on
                      your resume, target role and skills. Get
                      instant AI feedback after every answer.
                    </p>

                    <div className="mt-7 grid grid-cols-3 gap-3">
                      {[
                        { icon: Code2, count: 5, name: "Technical" },
                        { icon: Target, count: 1, name: "Skill Gap" },
                        { icon: UserRound, count: 3, name: "HR" },
                      ].map(({ icon: Icon, count, name }) => (
                        <div
                          key={name}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4"
                        >
                          <Icon size={19} className="text-cyan-300" />
                          <div className="mt-3 text-2xl font-black">
                            {count}
                          </div>
                          <div className="text-xs text-white/40">
                            {name}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                        Target Job
                      </label>

                      <select
                        value={jobId}
                        onChange={(event) => saveJob(event.target.value)}
                        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#10172c] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      >
                        <option value="">Select a job</option>
                        {jobs.map((job) => {
                          const id = String(job.id || job._id || "");
                          return (
                            <option key={id} value={id}>
                              {job.title || job.job_title || "Untitled Job"}
                              {" — "}
                              {job.company || job.company_name || "Company"}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-emerald-300" />
                        Resume-aware
                      </span>
                      <span className="flex items-center gap-2">
                        <Brain size={15} className="text-violet-300" />
                        AI Evaluated
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock3 size={15} className="text-cyan-300" />
                        Session Timer
                      </span>
                    </div>

                    <PrimaryButton
                      onClick={generateInterview}
                      disabled={generating || !jobId || !resumeId}
                      className="mt-8 w-full sm:w-auto"
                    >
                      {generating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating Interview...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate AI Interview
                          <ArrowRight size={17} />
                        </>
                      )}
                    </PrimaryButton>
                  </div>

                  <div className="hidden lg:flex lg:justify-center">
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative flex h-60 w-60 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-violet-500/10 to-fuchsia-500/10 shadow-[0_0_100px_rgba(34,211,238,0.12)]"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-3 rounded-full border border-dashed border-cyan-300/20"
                      />
                      <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10">
                        <Brain size={65} className="text-cyan-200" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Panel>
            </motion.section>
          )}

          {started && !finished && currentQuestion && (
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cyan-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Live AI Interview
                  </div>
                  <h1 className="mt-2 text-3xl font-black">
                    Question {currentIndex + 1}
                    <span className="ml-2 text-white/25">
                      / {questions.length}
                    </span>
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">
                    {evaluatedCount}/{questions.length} Evaluated
                  </span>
                  <SecondaryButton onClick={resetInterview}>
                    <RotateCcw size={15} />
                    Restart
                  </SecondaryButton>
                </div>
              </div>

              <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500"
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
                <div className="min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentKey}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Panel className="relative overflow-hidden p-5 sm:p-8 lg:p-10">
                        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

                        <div className="relative">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300">
                              <TypeIcon type={currentQuestion.type} size={15} />
                              {questionType(currentQuestion.type)}
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
                              {currentQuestion.difficulty || "Adaptive"}
                            </span>

                            {currentQuestion.skill && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-300">
                                <Star size={12} />
                                {currentQuestion.skill}
                              </span>
                            )}
                          </div>

                          <h2 className="mt-8 text-xl font-black leading-relaxed sm:text-2xl lg:text-3xl">
                            {currentQuestion.question}
                          </h2>

                          <div className="mt-8 flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/45">
                              Your Answer
                            </label>
                            <span className="text-xs text-white/30">
                              {currentAnswer.length} characters
                            </span>
                          </div>

                          <textarea
                            value={currentAnswer}
                            onChange={(event) =>
                              updateAnswer(event.target.value)
                            }
                            disabled={evaluating || !!currentEvaluation}
                            rows={8}
                            placeholder="Explain your answer clearly. Include examples, reasoning and relevant experience..."
                            className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-60"
                          />

                          <div className="mt-5 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                            <SecondaryButton
                              onClick={goPrevious}
                              disabled={currentIndex === 0 || evaluating}
                            >
                              <ArrowLeft size={16} />
                              Previous
                            </SecondaryButton>

                            {!currentEvaluation ? (
                              <PrimaryButton
                                onClick={evaluateAnswer}
                                disabled={
                                  evaluating || !currentAnswer.trim()
                                }
                              >
                                {evaluating ? (
                                  <>
                                    <Loader2
                                      size={17}
                                      className="animate-spin"
                                    />
                                    AI Evaluating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={17} />
                                    Evaluate Answer
                                  </>
                                )}
                              </PrimaryButton>
                            ) : (
                              <PrimaryButton onClick={goNext}>
                                {currentIndex === questions.length - 1 ? (
                                  <>
                                    <Trophy size={17} />
                                    Finish Interview
                                  </>
                                ) : (
                                  <>
                                    Next Question
                                    <ArrowRight size={17} />
                                  </>
                                )}
                              </PrimaryButton>
                            )}
                          </div>
                        </div>
                      </Panel>

                      <EvaluationCard evaluation={currentEvaluation} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <aside className="space-y-4">
                  <Panel className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-violet-400/10 p-2 text-violet-300">
                        <Brain size={19} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">
                          AI Interview Agent
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-emerald-300/60">
                          Session Active
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {questions.map((question, index) => {
                        const key = questionKey(question, index);
                        const evaluated = !!evaluations[key];
                        const answered = !!String(
                          answers[key] || ""
                        ).trim();
                        const active = index === currentIndex;

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={evaluating}
                            onClick={() => {
                              setCurrentIndex(index);
                              setError("");
                              setNotice("");
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                              active
                                ? "border-cyan-400/30 bg-cyan-400/10"
                                : "border-transparent bg-white/[0.025] hover:bg-white/[0.07]"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                evaluated
                                  ? "bg-emerald-400/15 text-emerald-300"
                                  : active
                                  ? "bg-cyan-400/15 text-cyan-300"
                                  : answered
                                  ? "bg-amber-400/15 text-amber-300"
                                  : "bg-white/5 text-white/40"
                              }`}
                            >
                              {evaluated ? <Check size={16} /> : index + 1}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-white/70">
                                {questionType(question.type)}
                              </span>
                              <span className="block truncate text-[10px] text-white/35">
                                {evaluated
                                  ? "Evaluated"
                                  : answered
                                  ? "Draft saved"
                                  : "Not answered"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Panel>

                  <Panel className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300/70">
                        Session Progress
                      </h3>
                      <ShieldCheck
                        size={16}
                        className="text-emerald-300"
                      />
                    </div>

                    <div className="mt-4 text-3xl font-black">
                      {evaluatedCount}
                      <span className="text-white/20">
                        /{questions.length}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-white/40">
                      Answers evaluated
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-black/20 p-3">
                        <div className="text-lg font-black text-cyan-300">
                          {answeredCount}
                        </div>
                        <div className="text-[10px] text-white/40">
                          Answered
                        </div>
                      </div>
                      <div className="rounded-xl bg-black/20 p-3">
                        <div className="text-lg font-black text-violet-300">
                          {averageScore.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-white/40">
                          Average Score
                        </div>
                      </div>
                    </div>

                    {interviewComplete && (
                      <PrimaryButton
                        onClick={finishInterview}
                        className="mt-5 w-full"
                      >
                        <Trophy size={16} />
                        Complete Interview
                      </PrimaryButton>
                    )}
                  </Panel>

                  <Panel className="p-5">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Clock3 size={17} className="text-cyan-300" />
                      Session Timer
                    </div>
                    <div className="mt-3 font-mono text-2xl font-black tracking-wider text-white">
                      {formatTime(elapsed)}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      Timer tracks elapsed time. There is no automatic
                      timeout, so focus on answer quality.
                    </p>
                  </Panel>
                </aside>
              </div>
            </section>
          )}

          {finished && (
            <motion.section
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-5xl"
            >
              <Panel className="relative overflow-hidden p-6 text-center sm:p-10 lg:p-14">
                <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 180 }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10"
                  >
                    <Trophy size={36} className="text-emerald-300" />
                  </motion.div>

                  <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
                    Interview Completed
                  </p>

                  <h1 className="mt-3 text-3xl font-black sm:text-5xl">
                    Your AI Interview Report
                  </h1>

                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/45">
                    Your interview answers have been evaluated by
                    the HireNexus AI evaluation engine.
                  </p>

                  <div className="mt-8">
                    <ScoreRing score={averageScore} size={200} />
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-widest text-white/35">
                    Current Interview Average Score
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        icon: MessageSquare,
                        value: questions.length,
                        label: "Questions",
                      },
                      {
                        icon: CheckCircle2,
                        value: evaluatedCount,
                        label: "Evaluated",
                      },
                      {
                        icon: Star,
                        value: averageScore.toFixed(1),
                        label: "Average Score",
                      },
                    ].map(({ icon: Icon, value, label }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5"
                      >
                        <Icon
                          size={20}
                          className="mx-auto text-cyan-300"
                        />
                        <div className="mt-3 text-2xl font-black">
                          {value}
                        </div>
                        <div className="mt-1 text-xs text-white/40">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mx-auto mt-6 max-w-xl text-xs leading-6 text-amber-200/60">
                    Note: The backend performance report may include
                    evaluations from previous interviews because the
                    current report API uses all saved user evaluations.
                  </p>

                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <PrimaryButton
                      onClick={generateReport}
                      disabled={reportLoading}
                    >
                      {reportLoading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <Trophy size={17} />
                          View Performance Reports
                        </>
                      )}
                    </PrimaryButton>

                    <SecondaryButton onClick={resetInterview}>
                      <RotateCcw size={17} />
                      New AI Interview
                    </SecondaryButton>
                  </div>
                </div>
              </Panel>

              <div className="mt-6 space-y-5">
                {questions.map((question, index) => {
                  const key = questionKey(question, index);
                  return (
                    <Panel key={key} className="p-5 sm:p-7">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-300">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-violet-300">
                            {questionType(question.type)}
                          </span>

                          <h3 className="mt-3 text-base font-bold leading-7 text-white">
                            {question.question}
                          </h3>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-xs font-bold text-cyan-300">
                              Your Answer
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">
                              {answers[key] || "No answer provided."}
                            </p>
                          </div>

                          <EvaluationCard
                            evaluation={evaluations[key]}
                          />
                        </div>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </motion.section>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mx-auto mt-6 max-w-5xl rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] p-4 text-sm text-rose-200"
            >
              {error}
            </motion.div>
          )}

          {notice && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-6 flex max-w-5xl items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-200"
            >
              <CheckCircle2 size={17} />
              {notice}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
