import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  Orbit,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
  Send,
  Check,
  Eye,
  Clock3,
  Wallet,
  ListChecks,
  Star,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getResumeId() {
  return (
    localStorage.getItem("resume_id") ||
    localStorage.getItem("latest_resume_id") ||
    ""
  );
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function normalizeJobs(data) {
  const raw =
    data?.jobs ||
    data?.data ||
    data?.results ||
    data?.items ||
    (Array.isArray(data) ? data : []);

  if (!Array.isArray(raw)) return [];

  return raw
    .map((job, index) => {
      const id = getValue(
        job?.id,
        job?._id,
        job?.job_id,
        job?.jobId
      );

      const requiredSkills = normalizeArray(
        getValue(
          job?.required_skills,
          job?.requiredSkills,
          job?.skills
        )
      );

      const preferredSkills = normalizeArray(
        getValue(
          job?.preferred_skills,
          job?.preferredSkills
        )
      );

      const responsibilities = normalizeArray(
        getValue(
          job?.responsibilities,
          job?.responsibility,
          job?.job_responsibilities
        )
      );

      const requirements = normalizeArray(
        getValue(
          job?.requirements,
          job?.job_requirements,
          job?.qualifications
        )
      );

      return {
        id: String(id || index + 1),

        title: getValue(
          job?.title,
          job?.job_title,
          job?.jobTitle,
          "Untitled Position"
        ),

        company: getValue(
          job?.company,
          job?.company_name,
          job?.companyName,
          "Hiring Company"
        ),

        location: getValue(
          job?.location,
          job?.job_location,
          job?.jobLocation,
          "Remote"
        ),

        type: getValue(
          job?.type,
          job?.employment_type,
          job?.employmentType,
          "Full Time"
        ),

        description: getValue(
          job?.description,
          job?.job_description,
          job?.jobDescription,
          "No job description available."
        ),

        salary: getValue(
          job?.salary,
          job?.salary_range,
          job?.salaryRange,
          job?.ctc,
          "Not disclosed"
        ),

        experience: getValue(
          job?.experience,
          job?.experience_required,
          job?.experienceRequired,
          ""
        ),

        department: getValue(
          job?.department,
          job?.category,
          ""
        ),

        responsibilities,
        requirements,
        requiredSkills,
        preferredSkills,

        skills: [
          ...requiredSkills,
          ...preferredSkills,
        ],
      };
    })
    .filter((job) => job.id);
}

function normalizeMatch(data) {
  if (!data) return null;

  const matching =
    data?.matching ||
    data?.match ||
    data?.result ||
    {};

  const rawScore =
    data?.matching_percentage ??
    data?.match_percentage ??
    data?.match_score ??
    data?.matching_score ??
    data?.semantic_match ??
    data?.semantic_match_score ??
    data?.compatibility_score ??
    data?.compatibility_percentage ??
    matching?.matching_percentage ??
    matching?.match_percentage ??
    matching?.match_score ??
    matching?.matching_score ??
    matching?.semantic_match ??
    matching?.semantic_match_score ??
    matching?.compatibility_score ??
    matching?.compatibility_percentage ??
    data?.score ??
    matching?.score ??
    data?.similarity ??
    matching?.similarity;

  const parsedScore = Number(rawScore);

  const score = Number.isFinite(parsedScore)
    ? Math.max(0, Math.min(100, parsedScore))
    : 0;

  const matchedSkills = normalizeArray(
    data?.matched_skills ??
      data?.matchedSkills ??
      data?.skills_matched ??
      data?.skillsMatched ??
      matching?.matched_skills ??
      matching?.matchedSkills ??
      matching?.skills_matched
  );

  const missingSkills = normalizeArray(
    data?.missing_skills ??
      data?.missingSkills ??
      data?.skills_missing ??
      data?.skillsMissing ??
      matching?.missing_skills ??
      matching?.missingSkills ??
      matching?.skills_missing
  );

  const recommendationValue =
    data?.recommendations ??
    data?.suggestions ??
    matching?.recommendations ??
    matching?.suggestions;

  const recommendations = Array.isArray(
    recommendationValue
  )
    ? recommendationValue
    : normalizeArray(recommendationValue);

  const summary =
    data?.summary ||
    data?.analysis ||
    data?.message ||
    matching?.summary ||
    matching?.analysis ||
    "";

  return {
    ...data,
    score,
    matchedSkills,
    missingSkills,
    recommendations,
    summary,
  };
}

function formatSkill(skill) {
  if (typeof skill === "string") return skill;

  if (skill?.name) return skill.name;

  if (skill?.skill) return skill.skill;

  return JSON.stringify(skill);
}

function formatRecommendation(item) {
  if (typeof item === "string") return item;

  return (
    item?.text ||
    item?.message ||
    item?.recommendation ||
    JSON.stringify(item)
  );
}

function GlassPanel({
  children,
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#050816]/55 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-500/[0.07] blur-[90px]" />

      <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-cyan-400/[0.045] blur-[90px]" />

      <div className="relative">
        {children}
      </div>
    </div>
  );
}

function OrbitCore({ active = false }) {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 rounded-full border border-violet-400/20"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-3 rounded-full border border-cyan-300/20 border-dashed"
      />

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 25px rgba(139,92,246,.15)",
            "0 0 55px rgba(34,211,238,.3)",
            "0 0 25px rgba(139,92,246,.15)",
          ],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-violet-300/20 bg-gradient-to-br from-violet-600/30 via-fuchsia-500/15 to-cyan-400/20 sm:h-20 sm:w-20"
      >
        {active ? (
          <Target className="text-cyan-300" size={28} />
        ) : (
          <Brain className="text-violet-300" size={28} />
        )}
      </motion.div>

      <motion.span
        animate={{ rotate: 360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute right-1 top-5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.9)]"
      />

      <motion.span
        animate={{ rotate: -360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-5 left-2 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_16px_rgba(232,121,249,.9)]"
      />
    </div>
  );
}

function MatchRing({ score }) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const circumference = 2 * Math.PI * 82;

  return (
    <div className="relative flex h-44 w-44 items-center justify-center sm:h-52 sm:w-52">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="rgba(255,255,255,.055)"
          strokeWidth="8"
        />

        <motion.circle
          cx="100"
          cy="100"
          r="82"
          fill="none"
          stroke="url(#matchGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          animate={{
            strokeDashoffset:
              circumference *
              (1 - safeScore / 100),
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />

        <defs>
          <linearGradient
            id="matchGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#8b5cf6"
            />
            <stop
              offset="50%"
              stopColor="#d946ef"
            />
            <stop
              offset="100%"
              stopColor="#22d3ee"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative text-center">
        <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          {safeScore.toFixed(0)}
          <span className="text-xl text-cyan-300">
            %
          </span>
        </p>

        <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.25em] text-slate-500">
          AI Match
        </p>
      </div>
    </div>
  );
}

function SkillPill({
  children,
  missing = false,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold ${
        missing
          ? "border-fuchsia-300/15 bg-fuchsia-400/[0.05] text-fuchsia-200"
          : "border-cyan-300/15 bg-cyan-400/[0.045] text-cyan-200"
      }`}
    >
      {missing ? (
        <X size={10} />
      ) : (
        <CheckCircle2 size={10} />
      )}

      {children}
    </span>
  );
}

function JobCard({
  job,
  selected,
  onSelect,
  onDetails,
  index,
  applied,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
      }}
      whileHover={{ y: -5 }}
      className={`group relative w-full overflow-hidden rounded-2xl border p-4 transition sm:p-5 ${
        selected
          ? "border-violet-400/30 bg-gradient-to-br from-violet-500/[0.11] via-white/[0.025] to-cyan-400/[0.055] shadow-[0_0_40px_rgba(139,92,246,.10)]"
          : "border-white/[0.07] bg-white/[0.018] hover:border-cyan-300/15 hover:bg-white/[0.03]"
      }`}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-500/[0.04] blur-[45px]" />

      <div className="relative flex gap-3">
        <button
          type="button"
          onClick={() => onSelect(job)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-violet-300/20 hover:text-violet-200"
        >
          <BriefcaseBusiness size={19} />
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onSelect(job)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-white">
                  {job.title}
                </h3>

                <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                  {job.company}
                </p>
              </div>

              <ChevronRight
                size={15}
                className={`shrink-0 transition ${
                  selected
                    ? "translate-x-1 text-cyan-300"
                    : "text-slate-700 group-hover:translate-x-1 group-hover:text-cyan-300"
                }`}
              />
            </div>
          </button>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
              <MapPin size={10} />
              {job.location}
            </span>

            <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
              <Code2 size={10} />
              {job.type}
            </span>

            {job.salary && (
              <span className="inline-flex items-center gap-1 text-[9px] text-slate-600">
                <Wallet size={10} />
                {job.salary}
              </span>
            )}
          </div>

          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skills
                .slice(0, 5)
                .map((skill, skillIndex) => (
                  <span
                    key={`${formatSkill(
                      skill
                    )}-${skillIndex}`}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[8px] font-semibold text-slate-600"
                  >
                    {formatSkill(skill)}
                  </span>
                ))}

              {job.skills.length > 5 && (
                <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[8px] font-semibold text-slate-700">
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDetails(job)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/10 bg-cyan-400/[0.035] px-3 py-2 text-[8px] font-bold text-cyan-300 transition hover:border-cyan-300/25 hover:bg-cyan-400/[0.07]"
            >
              <Eye size={11} />
              View Details
            </button>

            {applied && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-400/[0.05] px-2.5 py-1 text-[8px] font-bold text-emerald-300">
                <Check size={10} />
                Applied
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function JobDetailsModal({
  job,
  match,
  applied,
  onClose,
  onApply,
  onInterview,
}) {
  if (!job) return null;

  const matchScore = Number(match?.score) || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-md sm:px-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex min-h-full items-center justify-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 15,
              scale: 0.98,
            }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-violet-300/15 bg-[#050816]/95 shadow-[0_35px_120px_rgba(0,0,0,.7)] backdrop-blur-3xl"
          >
            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-violet-500/[0.07] blur-[90px]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5 sm:p-7">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/10 bg-violet-500/[0.04] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-violet-300">
                    <BriefcaseBusiness size={10} />
                    Job Details
                  </div>

                  <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                    {job.title}
                  </h2>

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {job.company}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[9px] text-slate-400">
                      <MapPin size={11} />
                      {job.location}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[9px] text-slate-400">
                      <Clock3 size={11} />
                      {job.type}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[9px] text-slate-400">
                      <Wallet size={11} />
                      {job.salary}
                    </span>

                    {job.experience && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[9px] text-slate-400">
                        <Target size={11} />
                        {job.experience}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-white/15 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-7">
                <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-5">
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={15}
                          className="text-cyan-300"
                        />

                        <h3 className="text-sm font-black text-white">
                          About the Role
                        </h3>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-xs leading-6 text-slate-500">
                        {job.description}
                      </p>
                    </section>

                    {job.responsibilities.length > 0 && (
                      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
                        <div className="flex items-center gap-2">
                          <ListChecks
                            size={15}
                            className="text-violet-300"
                          />

                          <h3 className="text-sm font-black text-white">
                            Responsibilities
                          </h3>
                        </div>

                        <div className="mt-4 space-y-3">
                          {job.responsibilities.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex gap-3 text-xs leading-5 text-slate-500"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />

                                <span>
                                  {formatSkill(item)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}

                    {job.requirements.length > 0 && (
                      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            size={15}
                            className="text-cyan-300"
                          />

                          <h3 className="text-sm font-black text-white">
                            Requirements
                          </h3>
                        </div>

                        <div className="mt-4 space-y-3">
                          {job.requirements.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="flex gap-3 text-xs leading-5 text-slate-500"
                              >
                                <CheckCircle2
                                  size={13}
                                  className="mt-1 shrink-0 text-cyan-300"
                                />

                                <span>
                                  {formatSkill(item)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}

                    <section className="rounded-2xl border border-cyan-300/10 bg-cyan-400/[0.02] p-5">
                      <div className="flex items-center gap-2">
                        <Code2
                          size={15}
                          className="text-cyan-300"
                        />

                        <h3 className="text-sm font-black text-white">
                          Required Skills
                        </h3>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requiredSkills.length > 0 ? (
                          job.requiredSkills.map(
                            (skill, index) => (
                              <SkillPill
                                key={`${formatSkill(
                                  skill
                                )}-${index}`}
                              >
                                {formatSkill(skill)}
                              </SkillPill>
                            )
                          )
                        ) : (
                          <p className="text-[10px] text-slate-600">
                            No required skills listed.
                          </p>
                        )}
                      </div>
                    </section>

                    {job.preferredSkills.length > 0 && (
                      <section className="rounded-2xl border border-violet-300/10 bg-violet-500/[0.02] p-5">
                        <div className="flex items-center gap-2">
                          <Star
                            size={15}
                            className="text-violet-300"
                          />

                          <h3 className="text-sm font-black text-white">
                            Preferred Skills
                          </h3>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.preferredSkills.map(
                            (skill, index) => (
                              <span
                                key={`${formatSkill(
                                  skill
                                )}-${index}`}
                                className="rounded-full border border-violet-300/15 bg-violet-400/[0.045] px-3 py-1.5 text-[9px] font-bold text-violet-200"
                              >
                                {formatSkill(skill)}
                              </span>
                            )
                          )}
                        </div>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-violet-300/10 bg-violet-500/[0.035] p-5">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={15}
                          className="text-violet-300"
                        />

                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">
                          Your AI Match
                        </span>
                      </div>

                      <div className="mt-5 flex justify-center">
                        <MatchRing score={matchScore} />
                      </div>

                      <p className="mt-3 text-center text-[9px] leading-5 text-slate-600">
                        {match
                          ? "Based on your current analyzed resume."
                          : "Run AI Match from the job list to calculate your compatibility."}
                      </p>
                    </div>

                    {match && (
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
                        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-600">
                          Match Intelligence
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-cyan-300/10 bg-cyan-400/[0.025] p-3">
                            <p className="text-[8px] text-slate-600">
                              Matched
                            </p>

                            <p className="mt-1 text-xl font-black text-cyan-300">
                              {match.matchedSkills.length}
                            </p>
                          </div>

                          <div className="rounded-xl border border-fuchsia-300/10 bg-fuchsia-400/[0.025] p-3">
                            <p className="text-[8px] text-slate-600">
                              Skill Gaps
                            </p>

                            <p className="mt-1 text-xl font-black text-fuchsia-300">
                              {match.missingSkills.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Application
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        {applied ? (
                          <>
                            <CheckCircle2
                              size={15}
                              className="text-emerald-300"
                            />

                            <span className="text-xs font-bold text-emerald-300">
                              Already Applied
                            </span>
                          </>
                        ) : (
                          <>
                            <Send
                              size={15}
                              className="text-cyan-300"
                            />

                            <span className="text-xs font-bold text-white">
                              Application Available
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="border-t border-white/[0.06] bg-black/20 p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={onApply}
                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black transition ${
                      applied
                        ? "border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300 hover:bg-emerald-400/[0.1]"
                        : "border-cyan-300/20 bg-cyan-400/[0.055] text-cyan-200 hover:-translate-y-0.5 hover:border-cyan-300/35"
                    }`}
                  >
                    {applied ? (
                      <>
                        <CheckCircle2 size={14} />
                        Already Applied
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Apply Now
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onInterview}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-[10px] font-black text-white shadow-[0_10px_35px_rgba(124,58,237,.2)] transition hover:-translate-y-0.5"
                  >
                    <Brain size={14} />
                    AI Interview Practice
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-center">
                  <Sparkles
                    size={11}
                    className="text-violet-300"
                  />

                  <p className="text-[8px] text-slate-600">
                    Applying and AI Interview are completely independent.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] =
    useState(null);

  const [match, setMatch] = useState(null);

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [matching, setMatching] =
    useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [applications, setApplications] =
    useState([]);

  const [loadingApplications, setLoadingApplications] =
    useState(true);

  const [applicationModalOpen, setApplicationModalOpen] =
    useState(false);

  const [jobDetailsOpen, setJobDetailsOpen] =
    useState(false);

  const [coverLetter, setCoverLetter] =
    useState(
      "I am interested in this opportunity and believe my full-stack development and AI/ML skills make me a suitable candidate."
    );

  const [submittingApplication, setSubmittingApplication] =
    useState(false);

  const [applicationMessage, setApplicationMessage] =
    useState("");

  const [applicationSuccess, setApplicationSuccess] =
    useState(false);

  const [applicationError, setApplicationError] =
    useState("");

  const resumeId = useMemo(
    () => getResumeId(),
    []
  );

  function isJobApplied(jobId) {
    if (!jobId) return false;

    return applications.some(
      (application) =>
        String(
          application?.job_id ??
            application?.jobId ??
            application?.job?.id ??
            application?.job?._id
        ) === String(jobId) &&
        application?.status !== "Withdrawn"
    );
  }

  async function fetchApplications() {
    const token = getToken();

    if (!token) {
      setLoadingApplications(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/applications/my-applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) return;

      const list =
        data?.applications ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      setApplications(
        Array.isArray(list) ? list : []
      );
    } catch {
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }

  async function fetchJobs() {
    setLoadingJobs(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Please login first."
        );
      }

      const response = await fetch(
        `${API_URL}/jobs/available`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to load available jobs."
        );
      }

      const normalized = normalizeJobs(data);

      setJobs(normalized);
      setLastUpdated(new Date());

      if (
        selectedJob &&
        !normalized.some(
          (job) =>
            job.id === selectedJob.id
        )
      ) {
        setSelectedJob(null);
        setMatch(null);
      }
    } catch (err) {
      setJobs([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available jobs from server."
      );
    } finally {
      setLoadingJobs(false);
    }
  }

  async function runMatching(job) {
    setSelectedJob(job);
    setMatch(null);
    setError("");
    setApplicationMessage("");
    setApplicationError("");
    setApplicationSuccess(false);

    if (job?.id) {
      const selectedJobId = String(job.id);

      localStorage.setItem(
        "latest_job_id",
        selectedJobId
      );

      localStorage.setItem(
        "selected_job_id",
        selectedJobId
      );

      localStorage.setItem(
        "job_id",
        selectedJobId
      );
    }

    setMatching(true);

    if (!resumeId) {
      setMatching(false);

      setError(
        "No resume found. Please upload and analyze your resume first."
      );

      return;
    }

    if (!job?.id) {
      setMatching(false);

      setError(
        "Selected job does not have a valid job ID."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setMatching(false);
      setError("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/screening`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resume_id: String(resumeId),
            job_id: String(job.id),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to calculate job match."
        );
      }

      const normalized =
        normalizeMatch(data);

      setMatch(normalized);

      const screeningId =
        data?.id ||
        data?._id ||
        data?.screening_id ||
        data?.screeningId ||
        normalized?.id ||
        normalized?._id ||
        "";

      if (screeningId) {
        localStorage.setItem(
          "latest_screening_id",
          String(screeningId)
        );
      }
    } catch (err) {
      setMatch(null);

      setError(
        err instanceof Error
          ? err.message
          : "Job matching failed."
      );
    } finally {
      setMatching(false);
    }
  }

  function openJobDetails(job) {
    setSelectedJob(job);

    if (job?.id) {
      const selectedJobId = String(job.id);

      localStorage.setItem(
        "latest_job_id",
        selectedJobId
      );

      localStorage.setItem(
        "selected_job_id",
        selectedJobId
      );

      localStorage.setItem(
        "job_id",
        selectedJobId
      );
    }

    setJobDetailsOpen(true);
  }

  function closeJobDetails() {
    setJobDetailsOpen(false);
  }

  function openApplicationModal() {
    if (!selectedJob?.id) {
      setApplicationError(
        "Please select a job first."
      );
      return;
    }

    setApplicationError("");
    setApplicationMessage("");
    setApplicationSuccess(false);

    if (isJobApplied(selectedJob.id)) {
      setApplicationMessage(
        "You have already applied for this job."
      );
      return;
    }

    setJobDetailsOpen(false);
    setApplicationModalOpen(true);
  }

  function closeApplicationModal() {
    if (submittingApplication) return;

    setApplicationModalOpen(false);
    setApplicationError("");
  }

  async function submitApplication() {
    if (!selectedJob?.id) {
      setApplicationError(
        "Please select a job first."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setApplicationError(
        "Please login first."
      );
      return;
    }

    if (isJobApplied(selectedJob.id)) {
      setApplicationModalOpen(false);

      setApplicationMessage(
        "You have already applied for this job."
      );

      return;
    }

    setSubmittingApplication(true);
    setApplicationError("");
    setApplicationMessage("");

    try {
      const response = await fetch(
        `${API_URL}/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: String(
              selectedJob.id
            ),
            cover_letter:
              coverLetter.trim(),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to submit your application."
        );
      }

      const newApplication =
        data?.application ||
        data?.data ||
        data;

      setApplications((previous) => [
        ...previous,
        newApplication,
      ]);

      setApplicationSuccess(true);

      setApplicationMessage(
        "Application submitted successfully."
      );

      setApplicationModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Application submission failed.";

      setApplicationError(message);
    } finally {
      setSubmittingApplication(false);
    }
  }

  function goDashboard() {
    window.location.href = "/dashboard";
  }

  function goResumeAnalysis() {
    window.location.href =
      "/resume-analysis";
  }

  function goApplications() {
    window.location.href =
      "/applications";
  }

  function goInterview() {
    const jobId =
      localStorage.getItem(
        "latest_job_id"
      ) ||
      localStorage.getItem(
        "selected_job_id"
      ) ||
      localStorage.getItem("job_id");

    if (!jobId) {
      setError(
        "Please select a job before starting the AI interview."
      );

      return;
    }

    setJobDetailsOpen(false);

    window.location.href = "/interview";
  }

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const displayScore =
    Number.isFinite(Number(match?.score))
      ? Number(match.score)
      : 0;

  const matchedSkills =
    match?.matchedSkills || [];

  const missingSkills =
    match?.missingSkills || [];

  const selectedJobApplied =
    selectedJob
      ? isJobApplied(selectedJob.id)
      : false;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        <header className="fixed left-0 right-0 top-0 z-[60]">
          <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-violet-300/[0.12] bg-[#020611]/45 shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:mx-5 lg:mx-6">
            <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
              <button
                type="button"
                onClick={goDashboard}
                className="group flex items-center gap-3"
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-[0_0_30px_rgba(124,58,237,.25)]">
                  <Sparkles size={19} />
                </div>

                <div className="hidden text-left sm:block">
                  <div className="text-lg font-black tracking-tight">
                    <span className="text-white">
                      Hire
                    </span>
                    <span className="text-cyan-300">
                      Nexus
                    </span>
                  </div>

                  <p className="text-[8px] uppercase tracking-[0.2em] text-slate-600">
                    AI Career Intelligence
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-cyan-400/[0.12] bg-cyan-400/[0.025] px-3 py-1.5 sm:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                  </span>

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Matching Engine Online
                  </span>
                </div>

                <button
                  type="button"
                  onClick={goDashboard}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-cyan-300/20 hover:text-white sm:px-4"
                >
                  <ArrowLeft size={13} />

                  <span className="hidden sm:inline">
                    Dashboard
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1250px] px-4 pb-14 pt-[105px] sm:px-6 lg:px-8">
          <section className="relative py-7 sm:py-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-[10%] h-64 w-64 rounded-full bg-violet-600/[0.05] blur-[120px]" />
              <div className="absolute right-[5%] top-[25%] h-72 w-72 rounded-full bg-cyan-500/[0.04] blur-[130px]" />
              <div className="absolute bottom-0 left-[45%] h-60 w-60 rounded-full bg-fuchsia-500/[0.025] blur-[120px]" />
            </div>

            <div className="relative text-center">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/[0.035] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-200"
              >
                <Orbit size={13} />
                Semantic Career Intelligence
              </motion.div>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{ delay: 0.08 }}
                className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
              >
                Find your{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  perfect match
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
                className="mx-auto mt-4 max-w-2xl text-xs leading-6 text-slate-500 sm:text-sm"
              >
                HireNexus compares your resume
                intelligence with job requirements
                using semantic matching, skill
                analysis and AI-powered relevance
                scoring.
              </motion.p>
            </div>

            <div className="mx-auto mt-10 flex justify-center">
              <GlassPanel className="w-full max-w-3xl p-5 sm:p-7">
                <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                  <OrbitCore
                    active={Boolean(selectedJob)}
                  />

                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <Zap
                        size={14}
                        className="text-violet-300"
                      />

                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">
                        AI Matching Core
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-black text-white sm:text-2xl">
                      Resume → Job Intelligence
                    </h2>

                    <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">
                      Select an opportunity and let
                      the matching engine calculate
                      your compatibility.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <span className="rounded-full border border-violet-300/10 bg-violet-500/[0.04] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-violet-300">
                        NLP
                      </span>

                      <span className="rounded-full border border-cyan-300/10 bg-cyan-500/[0.04] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300">
                        Semantic AI
                      </span>

                      <span className="rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.04] px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-fuchsia-300">
                        Skill Gap
                      </span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </section>

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
              className="mb-5 flex items-start gap-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/[0.045] p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10">
                <X
                  size={15}
                  className="text-fuchsia-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-fuchsia-200">
                  Matching service notice
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchJobs}
                disabled={loadingJobs}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/20 hover:text-white disabled:opacity-40"
              >
                <RefreshCw
                  size={12}
                  className={
                    loadingJobs
                      ? "animate-spin"
                      : ""
                  }
                />
                Retry
              </button>
            </motion.div>
          )}

          {applicationMessage && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.045] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-400/[0.08]">
                <CheckCircle2
                  size={16}
                  className="text-emerald-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-emerald-200">
                  Application Status
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-400">
                  {applicationMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={goApplications}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.06] px-3 py-2 text-[9px] font-bold text-emerald-300 transition hover:bg-emerald-400/[0.1]"
              >
                My Applications
                <ArrowRight size={11} />
              </button>
            </motion.div>
          )}

          {applicationError && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-5 flex items-center gap-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/[0.045] p-4"
            >
              <X
                size={16}
                className="shrink-0 text-fuchsia-300"
              />

              <p className="flex-1 text-[10px] leading-5 text-slate-400">
                {applicationError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setApplicationError("")
                }
                className="text-slate-600 transition hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
            <GlassPanel className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness
                      size={16}
                      className="text-cyan-300"
                    />

                    <h2 className="text-sm font-black text-white">
                      Opportunities
                    </h2>
                  </div>

                  <p className="mt-1 text-[9px] text-slate-700">
                    Select a role to calculate
                    your match.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchJobs}
                    disabled={loadingJobs}
                    title="Refresh jobs"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-slate-600 transition hover:border-cyan-300/20 hover:text-cyan-300 disabled:opacity-40"
                  >
                    <RefreshCw
                      size={12}
                      className={
                        loadingJobs
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  <span className="rounded-full border border-cyan-300/10 bg-cyan-400/[0.035] px-2.5 py-1 text-[9px] font-bold text-cyan-300">
                    {jobs.length} roles
                  </span>
                </div>
              </div>

              {lastUpdated && (
                <p className="mt-3 text-[8px] text-slate-800">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              )}

              <div className="mt-5 space-y-3">
                {loadingJobs ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <div className="text-center">
                      <Loader2
                        size={27}
                        className="mx-auto animate-spin text-cyan-300"
                      />

                      <p className="mt-3 text-[10px] text-slate-600">
                        Scanning opportunities...
                      </p>
                    </div>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                    <BriefcaseBusiness
                      size={28}
                      className="text-slate-700"
                    />

                    <p className="mt-4 text-xs font-bold text-slate-400">
                      No opportunities available
                    </p>

                    <p className="mt-2 max-w-xs text-[10px] leading-5 text-slate-600">
                      No active jobs were returned
                      by the recruitment system.
                    </p>

                    <button
                      type="button"
                      onClick={fetchJobs}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-400/[0.035] px-4 py-2 text-[9px] font-bold text-cyan-300"
                    >
                      <RefreshCw size={12} />
                      Reload Jobs
                    </button>
                  </div>
                ) : (
                  jobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      selected={
                        selectedJob?.id ===
                        job.id
                      }
                      onSelect={runMatching}
                      onDetails={
                        openJobDetails
                      }
                      index={index}
                      applied={isJobApplied(
                        job.id
                      )}
                    />
                  ))
                )}
              </div>
            </GlassPanel>

            <div className="space-y-5">
              <GlassPanel className="min-h-[450px] p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {!selectedJob ? (
                    <motion.div
                      key="empty"
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="flex min-h-[410px] flex-col items-center justify-center text-center"
                    >
                      <OrbitCore />

                      <h2 className="mt-7 text-xl font-black text-white">
                        Select a job
                      </h2>

                      <p className="mt-2 max-w-md text-xs leading-5 text-slate-600">
                        Choose one of the
                        opportunities on the left.
                        HireNexus will calculate
                        your resume-to-job
                        compatibility.
                      </p>
                    </motion.div>
                  ) : matching ? (
                    <motion.div
                      key="matching"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex min-h-[410px] flex-col items-center justify-center text-center"
                    >
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="flex h-24 w-24 items-center justify-center rounded-full border border-violet-300/20 bg-violet-500/[0.06]"
                      >
                        <Brain
                          size={35}
                          className="text-violet-300"
                        />
                      </motion.div>

                      <h2 className="mt-7 text-xl font-black text-white">
                        Analyzing compatibility
                      </h2>

                      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">
                        Comparing your resume
                        against{" "}
                        <span className="text-violet-300">
                          {selectedJob.title}
                        </span>
                        ...
                      </p>

                      <div className="mt-7 h-1.5 w-56 overflow-hidden rounded-full bg-white/[0.05]">
                        <motion.div
                          animate={{
                            x: [
                              "-100%",
                              "220%",
                            ],
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={15}
                              className="text-cyan-300"
                            />

                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                              Match Result
                            </span>
                          </div>

                          <h2 className="mt-2 truncate text-xl font-black text-white sm:text-2xl">
                            {selectedJob.title}
                          </h2>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {selectedJob.company}
                            {" · "}
                            {selectedJob.location}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-400/[0.035] px-3 py-1.5 text-[9px] font-bold text-cyan-300">
                          <CheckCircle2 size={11} />
                          AI Analysis Complete
                        </span>
                      </div>

                      <div className="mt-7 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
                        <div className="flex justify-center">
                          <MatchRing
                            score={displayScore}
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-700">
                            Compatibility
                          </p>

                          <h3 className="mt-2 text-2xl font-black text-white">
                            {displayScore >= 80
                              ? "Strong alignment"
                              : displayScore >= 60
                              ? "Good alignment"
                              : displayScore >= 40
                              ? "Partial alignment"
                              : "Skills can improve"}
                          </h3>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {match?.summary ||
                              "The screening engine completed the comparison. Review the matched and missing skills below."}
                          </p>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                              <div className="flex items-center gap-2">
                                <TrendingUp
                                  size={14}
                                  className="text-cyan-300"
                                />

                                <span className="text-[9px] text-slate-600">
                                  Match
                                </span>
                              </div>

                              <p className="mt-2 text-lg font-black text-cyan-300">
                                {displayScore.toFixed(
                                  0
                                )}
                                %
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                              <div className="flex items-center gap-2">
                                <Target
                                  size={14}
                                  className="text-violet-300"
                                />

                                <span className="text-[9px] text-slate-600">
                                  Skills
                                </span>
                              </div>

                              <p className="mt-2 text-lg font-black text-violet-300">
                                {
                                  matchedSkills.length
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-cyan-300/10 bg-cyan-400/[0.025] p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              size={15}
                              className="text-cyan-300"
                            />

                            <h3 className="text-xs font-black text-white">
                              Matched Skills
                            </h3>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {matchedSkills.length >
                            0 ? (
                              matchedSkills.map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <SkillPill
                                    key={`${formatSkill(
                                      skill
                                    )}-${index}`}
                                  >
                                    {formatSkill(
                                      skill
                                    )}
                                  </SkillPill>
                                )
                              )
                            ) : (
                              <p className="text-[10px] text-slate-600">
                                No matched skills
                                returned.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-fuchsia-300/10 bg-fuchsia-400/[0.02] p-4">
                          <div className="flex items-center gap-2">
                            <X
                              size={15}
                              className="text-fuchsia-300"
                            />

                            <h3 className="text-xs font-black text-white">
                              Skill Gaps
                            </h3>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {missingSkills.length >
                            0 ? (
                              missingSkills.map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <SkillPill
                                    key={`${formatSkill(
                                      skill
                                    )}-${index}`}
                                    missing
                                  >
                                    {formatSkill(
                                      skill
                                    )}
                                  </SkillPill>
                                )
                              )
                            ) : (
                              <p className="text-[10px] text-slate-600">
                                No missing skills
                                returned.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {match?.recommendations
                        ?.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-violet-300/10 bg-violet-500/[0.025] p-4">
                          <div className="flex items-center gap-2">
                            <Sparkles
                              size={15}
                              className="text-violet-300"
                            />

                            <h3 className="text-xs font-black text-white">
                              AI Recommendations
                            </h3>
                          </div>

                          <div className="mt-3 space-y-2">
                            {match.recommendations.map(
                              (
                                recommendation,
                                index
                              ) => (
                                <div
                                  key={index}
                                  className="flex gap-2 text-[10px] leading-5 text-slate-500"
                                >
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-300" />

                                  <span>
                                    {formatRecommendation(
                                      recommendation
                                    )}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <div className="flex flex-col gap-4">
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Selected Opportunity
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-white">
                                {selectedJob.title}
                              </p>

                              {selectedJobApplied && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-2 py-1 text-[8px] font-bold text-emerald-300">
                                  <Check size={9} />
                                  Applied
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[9px] text-slate-600">
                              {selectedJob.company}
                              {" · "}
                              {selectedJob.location}
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <button
                              type="button"
                              onClick={() =>
                                openJobDetails(
                                  selectedJob
                                )
                              }
                              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-500/[0.045] px-4 py-3 text-[10px] font-black text-violet-200 transition hover:-translate-y-0.5 hover:border-violet-300/30"
                            >
                              <Eye size={14} />
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={
                                selectedJobApplied
                                  ? goApplications
                                  : openApplicationModal
                              }
                              className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-black transition ${
                                selectedJobApplied
                                  ? "border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300"
                                  : "border-cyan-300/20 bg-cyan-400/[0.055] text-cyan-200 hover:-translate-y-0.5 hover:border-cyan-300/35"
                              }`}
                            >
                              {selectedJobApplied ? (
                                <>
                                  <CheckCircle2
                                    size={14}
                                  />
                                  Already Applied
                                </>
                              ) : (
                                <>
                                  <Send size={14} />
                                  Apply Now
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={
                                goInterview
                              }
                              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-[10px] font-black text-white shadow-[0_10px_35px_rgba(124,58,237,.18)] transition hover:-translate-y-0.5"
                            >
                              <Brain size={14} />
                              AI Interview
                              <ArrowRight
                                size={13}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-center gap-2 border-t border-white/[0.05] pt-3 text-center">
                            <Sparkles
                              size={11}
                              className="text-violet-300"
                            />

                            <p className="text-[8px] leading-4 text-slate-600">
                              You can practice the AI
                              interview without applying
                              for this job.
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                runMatching(
                                  selectedJob
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] px-4 py-2.5 text-[9px] font-bold text-slate-500 transition hover:border-cyan-300/20 hover:text-white"
                            >
                              <RefreshCw size={12} />
                              Recalculate Match
                            </button>

                            {selectedJobApplied && (
                              <button
                                type="button"
                                onClick={
                                  goApplications
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-400/[0.035] px-4 py-2.5 text-[9px] font-bold text-emerald-300 transition hover:border-emerald-300/20"
                              >
                                View My Application
                                <ArrowRight
                                  size={11}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassPanel>

              <div className="grid gap-4 sm:grid-cols-3">
                <GlassPanel className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                      <FileText
                        size={16}
                        className="text-violet-300"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-700">
                        Resume
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-white">
                        AI Profile
                      </p>
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
                      <Database
                        size={16}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-700">
                        Engine
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-white">
                        Semantic Match
                      </p>
                    </div>
                  </div>
                </GlassPanel>

                <GlassPanel className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10">
                      <Globe2
                        size={16}
                        className="text-fuchsia-300"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-700">
                        Intelligence
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-white">
                        AI Powered
                      </p>
                    </div>
                  </div>
                </GlassPanel>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={goResumeAnalysis}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.018] px-5 py-3 text-[10px] font-bold text-slate-500 transition hover:border-violet-300/20 hover:text-white"
                >
                  <ArrowLeft size={13} />
                  Resume Analysis
                </button>

                <button
                  type="button"
                  onClick={goInterview}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-3 text-[10px] font-black text-white shadow-[0_10px_35px_rgba(124,58,237,.18)] transition hover:-translate-y-0.5"
                >
                  Continue to AI Interview
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </section>

          <footer className="py-8 text-center text-[9px] uppercase tracking-[0.25em] text-slate-800">
            HireNexus • AI Recruitment Intelligence
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {jobDetailsOpen && (
          <JobDetailsModal
            job={selectedJob}
            match={match}
            applied={selectedJobApplied}
            onClose={closeJobDetails}
            onApply={
              selectedJobApplied
                ? goApplications
                : openApplicationModal
            }
            onInterview={goInterview}
          />
        )}

        {applicationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-md"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeApplicationModal();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 15,
                scale: 0.98,
              }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#050816]/95 shadow-[0_30px_100px_rgba(0,0,0,.65)] backdrop-blur-3xl"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[80px]" />

              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/[0.07] blur-[80px]" />

              <div className="relative p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-400/[0.035] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      <Send size={10} />
                      Job Application
                    </div>

                    <h2 className="mt-4 truncate text-xl font-black text-white sm:text-2xl">
                      Apply for{" "}
                      {selectedJob?.title}
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {selectedJob?.company}
                      {" · "}
                      {selectedJob?.location}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeApplicationModal
                    }
                    disabled={
                      submittingApplication
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-white/15 hover:text-white disabled:opacity-40"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-500/[0.06]">
                      <FileText
                        size={17}
                        className="text-violet-300"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                        Resume
                      </p>

                      <p className="mt-1 text-xs font-bold text-white">
                        Latest analyzed resume
                      </p>
                    </div>

                    <CheckCircle2
                      size={16}
                      className="ml-auto text-emerald-300"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="cover-letter"
                      className="text-xs font-black text-white"
                    >
                      Cover Letter
                    </label>

                    <span className="text-[8px] text-slate-600">
                      Optional
                    </span>
                  </div>

                  <textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(event) =>
                      setCoverLetter(
                        event.target.value
                      )
                    }
                    maxLength={5000}
                    rows={7}
                    disabled={
                      submittingApplication
                    }
                    placeholder="Write a short message for the recruiter..."
                    className="mt-3 w-full resize-none rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs leading-6 text-slate-300 outline-none transition placeholder:text-slate-700 focus:border-cyan-300/25 focus:bg-white/[0.025] disabled:opacity-50"
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="text-[8px] text-slate-700">
                      {coverLetter.length}/5000
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-violet-300/10 bg-violet-500/[0.025] p-4">
                  <div className="flex gap-3">
                    <Sparkles
                      size={15}
                      className="mt-0.5 shrink-0 text-violet-300"
                    />

                    <p className="text-[9px] leading-5 text-slate-500">
                      Submitting this application
                      will save it to your My
                      Applications section. AI Interview
                      Practice remains available
                      independently.
                    </p>
                  </div>
                </div>

                {applicationError && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-fuchsia-300/15 bg-fuchsia-500/[0.045] p-3">
                    <X
                      size={14}
                      className="mt-0.5 shrink-0 text-fuchsia-300"
                    />

                    <p className="text-[9px] leading-5 text-fuchsia-200">
                      {applicationError}
                    </p>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={
                      closeApplicationModal
                    }
                    disabled={
                      submittingApplication
                    }
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[10px] font-bold text-slate-500 transition hover:border-white/15 hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      submitApplication
                    }
                    disabled={
                      submittingApplication
                    }
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-3 text-[10px] font-black text-white shadow-[0_10px_35px_rgba(124,58,237,.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingApplication ? (
                      <>
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default JobMatching;