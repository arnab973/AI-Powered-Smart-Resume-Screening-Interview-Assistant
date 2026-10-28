
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Search,
  Users,
  Sparkles,
  FileText,
  ChevronRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
  Target,
  AlertTriangle,
  Play,
  X,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  try {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const [screeningId, setScreeningId] = useState("");
  const [screeningResults, setScreeningResults] = useState({});

  const [error, setError] = useState("");
  const [jobError, setJobError] = useState("");

  const getHeaders = () => {
    const token = getToken();

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/resume/candidates`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to retrieve candidates."
        );
      }

      setCandidates(
        Array.isArray(data?.candidates)
          ? data.candidates
          : []
      );
    } catch (err) {
      console.error(
        "Candidates fetch error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while loading candidates."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      setJobError("");

      const token = getToken();

      if (!token) {
        setJobError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/jobs`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to retrieve jobs."
        );
      }

      const jobList = Array.isArray(data)
        ? data
        : Array.isArray(data?.jobs)
        ? data.jobs
        : [];

      setJobs(jobList);

      if (jobList.length > 0) {
        setSelectedJobId(
          String(
            jobList[0]?.id ||
              jobList[0]?._id ||
              ""
          )
        );
      }
    } catch (err) {
      console.error(
        "Jobs fetch error:",
        err
      );

      setJobError(
        err?.message ||
          "Something went wrong while loading jobs."
      );
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      const searchableText = [
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.role,
        candidate.summary,
        candidate.education,
        candidate.experience,
        ...(Array.isArray(candidate.skills)
          ? candidate.skills
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [candidates, searchQuery]);

  const goBack = () => {
    window.location.assign("/hr-dashboard");
  };

  const openCandidate = (id) => {
    if (!id) {
      return;
    }

    window.location.assign(
      `/hr/candidate/${id}`
    );
  };

  const getCandidateId = (candidate) => {
    return (
      candidate.resume_id ||
      candidate.id ||
      ""
    );
  };

  const getJobId = (job) => {
    return (
      job?.id ||
      job?._id ||
      ""
    );
  };

  const runScreening = async (candidate) => {
    const resumeId =
      getCandidateId(candidate);

    if (!resumeId) {
      setError(
        "Candidate resume ID is missing."
      );
      return;
    }

    if (!selectedJobId) {
      setError(
        "Please select a job before starting AI screening."
      );
      return;
    }

    if (!candidate.parsed) {
      setError(
        "This candidate's resume must be parsed before screening."
      );
      return;
    }

    const screeningKey = `${resumeId}-${selectedJobId}`;

    if (screeningId === screeningKey) {
      return;
    }

    setError("");
    setScreeningId(screeningKey);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/screening`,
        {
          method: "POST",
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_id: resumeId,
            job_id: selectedJobId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "AI screening failed."
        );
      }

      setScreeningResults((current) => ({
        ...current,
        [screeningKey]: data,
      }));
    } catch (err) {
      console.error(
        "Screening error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while running AI screening."
      );
    } finally {
      setScreeningId("");
    }
  };

  const closeScreening = (
    candidate,
    jobId
  ) => {
    const resumeId =
      getCandidateId(candidate);

    const key = `${resumeId}-${jobId}`;

    setScreeningResults((current) => {
      const updated = {
        ...current,
      };

      delete updated[key];

      return updated;
    });
  };

  const getSelectedJob = () => {
    return jobs.find(
      (job) =>
        String(getJobId(job)) ===
        String(selectedJobId)
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-7xl -translate-x-1/2">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <ArrowLeft size={18} />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <BrainCircuit
                  size={19}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-wide">
                  HIRE
                  <span className="text-cyan-300">
                    NEXUS
                  </span>
                </p>

                <p className="hidden text-[10px] text-slate-500 sm:block">
                  AI Recruitment Intelligence
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-sm text-cyan-300">
                <Sparkles size={16} />

                AI Candidate Intelligence
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Candidates
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Review candidates, select a job and run
                AI-powered resume screening.
              </p>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search candidates..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.025] py-3 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-slate-600 focus:border-cyan-400/30"
                />
              </div>

              <div className="relative">
                <BriefcaseBusiness
                  size={18}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-violet-300"
                />

                <select
                  value={selectedJobId}
                  onChange={(event) => {
                    setSelectedJobId(
                      event.target.value
                    );
                    setScreeningResults({});
                  }}
                  disabled={
                    jobsLoading ||
                    jobs.length === 0
                  }
                  className="w-full appearance-none rounded-2xl border border-white/10 bg-[#07101f] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-violet-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {jobsLoading ? (
                    <option value="">
                      Loading jobs...
                    </option>
                  ) : jobs.length === 0 ? (
                    <option value="">
                      No jobs available
                    </option>
                  ) : (
                    <>
                      <option value="">
                        Select job for screening
                      </option>

                      {jobs.map((job) => (
                        <option
                          key={getJobId(job)}
                          value={getJobId(job)}
                        >
                          {job.title}
                          {job.company
                            ? ` — ${job.company}`
                            : ""}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3 backdrop-blur-xl">
                <div className="flex h-full items-center gap-3">
                  <Users
                    size={18}
                    className="text-cyan-300"
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Total Candidates
                    </p>

                    <p className="font-semibold">
                      {candidates.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedJobId &&
              getSelectedJob() && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.03] p-4 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                        <Target
                          size={18}
                          className="text-violet-300"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/60">
                          Active Screening Job
                        </p>

                        <h2 className="mt-1 text-sm font-semibold">
                          {getSelectedJob()?.title}
                        </h2>

                        {getSelectedJob()?.company && (
                          <p className="mt-1 text-xs text-slate-500">
                            {getSelectedJob()?.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Select a candidate below to run
                      semantic AI screening.
                    </div>
                  </div>
                </motion.div>
              )}

            {jobError && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-300"
                />

                <div>
                  <p className="text-sm font-medium text-amber-200">
                    Jobs unavailable
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {jobError}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-4"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">
                    Screening Error
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-slate-600 transition hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  size={32}
                  className="animate-spin text-cyan-300"
                />

                <p className="mt-4 text-sm text-slate-400">
                  Loading candidates...
                </p>
              </div>
            )}

            {!loading && error && candidates.length === 0 && (
              <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <div>
                    <h2 className="font-semibold text-red-300">
                      Unable to load candidates
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchCandidates}
                      className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading &&
              candidates.length > 0 &&
              filteredCandidates.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-center backdrop-blur-xl">
                  <Users
                    size={34}
                    className="mx-auto text-slate-600"
                  />

                  <h2 className="mt-4 text-lg font-semibold">
                    No candidates found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Try a different search term.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              filteredCandidates.length > 0 && (
                <section className="space-y-4">
                  {filteredCandidates.map(
                    (candidate, index) => {
                      const initial =
                        candidate.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "C";

                      const skills =
                        Array.isArray(
                          candidate.skills
                        )
                          ? candidate.skills
                          : [];

                      const resumeId =
                        getCandidateId(
                          candidate
                        );

                      const screeningKey = `${resumeId}-${selectedJobId}`;

                      const screening =
                        screeningResults[
                          screeningKey
                        ];

                      const isScreening =
                        screeningId ===
                        screeningKey;

                      return (
                        <motion.div
                          key={
                            candidate.resume_id ||
                            candidate.id ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.4,
                            delay:
                              index * 0.05,
                          }}
                          className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-cyan-400/20 sm:p-6"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                              <span className="text-xl font-bold text-cyan-300">
                                {initial}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <h2 className="truncate text-lg font-semibold">
                                  {candidate.name ||
                                    "Unknown Candidate"}
                                </h2>

                                <span
                                  className={`w-fit rounded-full border px-2.5 py-1 text-[11px] ${
                                    candidate.parsed
                                      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                                      : "border-amber-400/20 bg-amber-400/5 text-amber-300"
                                  }`}
                                >
                                  {candidate.parsed
                                    ? "Parsed"
                                    : "Pending Parse"}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-cyan-300">
                                {candidate.role ||
                                  "Candidate"}
                              </p>

                              <p className="mt-1 break-all text-sm text-slate-500">
                                {candidate.email ||
                                  "Email unavailable"}
                              </p>

                              {candidate.phone && (
                                <p className="mt-1 text-xs text-slate-600">
                                  {candidate.phone}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:flex">
                              <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center">
                                <p className="text-xs text-slate-500">
                                  Skills
                                </p>

                                <p className="text-xl font-bold text-cyan-300">
                                  {skills.length}
                                </p>
                              </div>

                              <div className="min-w-[110px] rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center">
                                <p className="text-xs text-slate-500">
                                  Resume
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-300">
                                  {candidate.parsed
                                    ? "Ready"
                                    : "Pending"}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() =>
                                  openCandidate(
                                    resumeId
                                  )
                                }
                                className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
                              >
                                <FileText
                                  size={16}
                                />

                                View

                                <ChevronRight
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isScreening ||
                                  !selectedJobId ||
                                  !candidate.parsed
                                }
                                onClick={() =>
                                  runScreening(
                                    candidate
                                  )
                                }
                                className="flex items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-5 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isScreening ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />

                                    Screening...
                                  </>
                                ) : (
                                  <>
                                    <BrainCircuit
                                      size={16}
                                    />

                                    AI Screen
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 border-t border-white/5 pt-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <CheckCircle2
                                size={14}
                                className={
                                  candidate.parsed
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }
                              />

                              <span>
                                {candidate.parsed
                                  ? "Resume parsed successfully"
                                  : "Resume uploaded but not parsed"}
                              </span>

                              {candidate.original_filename && (
                                <>
                                  <span className="text-slate-700">
                                    •
                                  </span>

                                  <span className="max-w-[260px] truncate">
                                    {
                                      candidate.original_filename
                                    }
                                  </span>
                                </>
                              )}
                            </div>

                            {candidate.summary && (
                              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                                {candidate.summary}
                              </p>
                            )}
                          </div>

                          <AnimatePresence>
                            {screening && (
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
                                className="overflow-hidden"
                              >
                                <div className="mt-6 border-t border-violet-400/10 pt-6">
                                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                                        <BrainCircuit
                                          size={19}
                                          className="text-violet-300"
                                        />
                                      </div>

                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-violet-300/60">
                                          AI Screening Result
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">
                                          {getSelectedJob()
                                            ?.title ||
                                            "Selected Job"}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        closeScreening(
                                          candidate,
                                          selectedJobId
                                        )
                                      }
                                      className="flex items-center gap-2 self-start rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-500 transition hover:border-white/20 hover:text-white"
                                    >
                                      <X size={14} />

                                      Close
                                    </button>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.03] p-4">
                                      <p className="text-xs text-slate-500">
                                        ATS Score
                                      </p>

                                      <p className="mt-2 text-3xl font-bold text-cyan-300">
                                        {Number(
                                          screening.ats_score ||
                                            0
                                        ).toFixed(2)}
                                        %
                                      </p>
                                    </div>

                                    <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.03] p-4">
                                      <p className="text-xs text-slate-500">
                                        Job Match
                                      </p>

                                      <p className="mt-2 text-3xl font-bold text-violet-300">
                                        {Number(
                                          screening.matching_percentage ||
                                            0
                                        ).toFixed(2)}
                                        %
                                      </p>
                                    </div>

                                    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.03] p-4">
                                      <p className="text-xs text-slate-500">
                                        Matched Skills
                                      </p>

                                      <p className="mt-2 text-3xl font-bold text-emerald-300">
                                        {Array.isArray(
                                          screening.matched_skills
                                        )
                                          ? screening
                                              .matched_skills
                                              .length
                                          : 0}
                                      </p>
                                    </div>

                                    <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
                                      <p className="text-xs text-slate-500">
                                        Missing Skills
                                      </p>

                                      <p className="mt-2 text-3xl font-bold text-amber-300">
                                        {Array.isArray(
                                          screening.missing_skills
                                        )
                                          ? screening
                                              .missing_skills
                                              .length
                                          : 0}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2
                                          size={16}
                                          className="text-emerald-300"
                                        />

                                        <h3 className="text-sm font-semibold">
                                          Matched Skills
                                        </h3>
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {Array.isArray(
                                          screening.matched_skills
                                        ) &&
                                        screening
                                          .matched_skills
                                          .length > 0 ? (
                                          screening.matched_skills.map(
                                            (skill) => (
                                              <span
                                                key={
                                                  skill
                                                }
                                                className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5 text-xs text-emerald-200/80"
                                              >
                                                {skill}
                                              </span>
                                            )
                                          )
                                        ) : (
                                          <span className="text-xs text-slate-600">
                                            No matched skills found.
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5">
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle
                                          size={16}
                                          className="text-amber-300"
                                        />

                                        <h3 className="text-sm font-semibold">
                                          Missing Skills
                                        </h3>
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {Array.isArray(
                                          screening.missing_skills
                                        ) &&
                                        screening
                                          .missing_skills
                                          .length > 0 ? (
                                          screening.missing_skills.map(
                                            (skill) => (
                                              <span
                                                key={
                                                  skill
                                                }
                                                className="rounded-full border border-amber-400/15 bg-amber-400/[0.04] px-3 py-1.5 text-xs text-amber-200/80"
                                              >
                                                {skill}
                                              </span>
                                            )
                                          )
                                        ) : (
                                          <span className="text-xs text-slate-600">
                                            No missing skills detected.
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {Array.isArray(
                                    screening.suggestions
                                  ) &&
                                    screening.suggestions
                                      .length > 0 && (
                                      <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.02] p-5">
                                        <div className="flex items-center gap-2">
                                          <Sparkles
                                            size={16}
                                            className="text-cyan-300"
                                          />

                                          <h3 className="text-sm font-semibold">
                                            AI Recommendations
                                          </h3>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                          {screening.suggestions.map(
                                            (
                                              suggestion,
                                              suggestionIndex
                                            ) => (
                                              <div
                                                key={
                                                  `${suggestion}-${suggestionIndex}`
                                                }
                                                className="flex items-start gap-3"
                                              >
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />

                                                <p className="text-xs leading-5 text-slate-400">
                                                  {
                                                    suggestion
                                                  }
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    }
                  )}
                </section>
              )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Candidates;
