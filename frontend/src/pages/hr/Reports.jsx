
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  BarChart3,
  Users,
  FileCheck2,
  Target,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FileText,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  BriefcaseBusiness,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = "http://127.0.0.1:8000";

function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => {
    window.location.assign("/hr-dashboard");
  };

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/report/hr-analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to load HR analytics."
        );
      }

      setAnalytics(data);
    } catch (err) {
      setError(
        err?.message || "Unable to load HR analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatNumber = (value) => {
    if (value === null || value === undefined) {
      return "0";
    }

    return Number(value).toLocaleString();
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) {
      return "0%";
    }

    return `${Number(value).toFixed(2)}%`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSkillPercentage = (count) => {
    const total = analytics?.total_screenings || 0;

    if (!total) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((count / total) * 100)
    );
  };

  const getATSWidth = (count) => {
    const total =
      analytics?.ats_distribution?.excellent +
      analytics?.ats_distribution?.strong +
      analytics?.ats_distribution?.average +
      analytics?.ats_distribution?.low;

    if (!total) {
      return 0;
    }

    return Math.round((count / total) * 100);
  };

  const stats = analytics
    ? [
        {
          label: "Total Candidates",
          value: formatNumber(analytics.total_candidates),
          icon: Users,
          description: "Unique candidates",
        },
        {
          label: "Total Resumes",
          value: formatNumber(analytics.total_resumes),
          icon: FileText,
          description: `${formatNumber(
            analytics.parsed_resumes
          )} parsed resumes`,
        },
        {
          label: "Average ATS",
          value: formatPercentage(analytics.average_ats),
          icon: Target,
          description: "Average resume score",
        },
        {
          label: "Screenings",
          value: formatNumber(analytics.total_screenings),
          icon: FileCheck2,
          description: "AI screenings completed",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-7xl">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-2xl">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
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
                  HIRE<span className="text-cyan-300">NEXUS</span>
                </p>

                <p className="hidden sm:block text-[10px] text-slate-500">
                  AI Recruitment Intelligence
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchAnalytics(true)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-400/20 transition disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-2 text-cyan-300 text-sm mb-3">
                <Sparkles size={16} />
                AI Recruitment Analytics
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    Reports & Analytics
                  </h1>

                  <p className="mt-2 text-slate-400 max-w-2xl">
                    Monitor recruitment activity, resume screening,
                    candidate matching and AI-powered recruitment
                    intelligence.
                  </p>
                </div>

                {analytics && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2
                      size={14}
                      className="text-emerald-400"
                    />
                    Live analytics connected
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-8 text-center">
                <RefreshCw
                  size={30}
                  className="mx-auto text-cyan-300 animate-spin"
                />

                <p className="mt-4 text-slate-300">
                  Loading HR analytics...
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  Fetching recruitment intelligence from HireNexus AI.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.04] backdrop-blur-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-2xl border border-red-400/20 bg-red-400/10 flex items-center justify-center">
                    <AlertTriangle
                      size={20}
                      className="text-red-300"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold text-red-200">
                      Analytics unavailable
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => fetchAnalytics(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.08] transition"
                    >
                      <RefreshCw size={15} />
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && analytics && (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                      <motion.div
                        key={stat.label}
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
                          delay: index * 0.08,
                        }}
                        className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-11 w-11 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
                            <Icon
                              size={20}
                              className="text-cyan-300"
                            />
                          </div>

                          <BarChart3
                            size={17}
                            className="text-slate-600"
                          />
                        </div>

                        <p className="text-sm text-slate-500 mt-5">
                          {stat.label}
                        </p>

                        <p className="text-3xl font-bold mt-1">
                          {stat.value}
                        </p>

                        <p className="text-xs text-slate-600 mt-2">
                          {stat.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-emerald-400/20 bg-emerald-400/10 flex items-center justify-center">
                        <TrendingUp
                          size={18}
                          className="text-emerald-300"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Job Matching
                        </p>

                        <p className="text-xl font-bold">
                          {formatPercentage(
                            analytics.average_matching
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-violet-400/20 bg-violet-400/10 flex items-center justify-center">
                        <UserCheck
                          size={18}
                          className="text-violet-300"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Evaluations
                        </p>

                        <p className="text-xl font-bold">
                          {formatNumber(
                            analytics.total_evaluations
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-amber-400/20 bg-amber-400/10 flex items-center justify-center">
                        <Target
                          size={18}
                          className="text-amber-300"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Interview Score
                        </p>

                        <p className="text-xl font-bold">
                          {analytics.average_interview_score !== null &&
                          analytics.average_interview_score !== undefined
                            ? Number(
                                analytics.average_interview_score
                              ).toFixed(1)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
                        <FileCheck2
                          size={18}
                          className="text-cyan-300"
                        />
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Parsed Resumes
                        </p>

                        <p className="text-xl font-bold">
                          {formatNumber(
                            analytics.parsed_resumes
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold">
                          ATS Score Distribution
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          AI resume compatibility breakdown
                        </p>
                      </div>

                      <BarChart3
                        size={20}
                        className="text-cyan-300"
                      />
                    </div>

                    <div className="space-y-5">
                      {[
                        {
                          label: "Excellent",
                          value:
                            analytics.ats_distribution?.excellent ||
                            0,
                          color: "bg-emerald-400",
                          text: "text-emerald-300",
                        },
                        {
                          label: "Strong",
                          value:
                            analytics.ats_distribution?.strong ||
                            0,
                          color: "bg-cyan-400",
                          text: "text-cyan-300",
                        },
                        {
                          label: "Average",
                          value:
                            analytics.ats_distribution?.average ||
                            0,
                          color: "bg-amber-400",
                          text: "text-amber-300",
                        },
                        {
                          label: "Low",
                          value:
                            analytics.ats_distribution?.low ||
                            0,
                          color: "bg-red-400",
                          text: "text-red-300",
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">
                              {item.label}
                            </span>

                            <span className={item.text}>
                              {item.value}
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{
                                width: 0,
                              }}
                              animate={{
                                width: `${getATSWidth(
                                  item.value
                                )}%`,
                              }}
                              transition={{
                                duration: 0.8,
                              }}
                              className={`h-full rounded-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-11 w-11 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
                        <BrainCircuit
                          size={20}
                          className="text-cyan-300"
                        />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold">
                          AI Insights
                        </h2>

                        <p className="text-sm text-slate-500">
                          Recruitment intelligence
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {analytics.ai_insights?.length > 0 ? (
                        analytics.ai_insights.map(
                          (insight, index) => (
                            <div
                              key={`${insight}-${index}`}
                              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                                  <Sparkles
                                    size={14}
                                    className="text-cyan-300"
                                  />
                                </div>

                                <p className="text-sm text-slate-300 leading-6">
                                  {insight}
                                </p>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500">
                          No AI insights available yet.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Top Matched Skills
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          Skills frequently matched by screened resumes
                        </p>
                      </div>

                      <CheckCircle2
                        size={20}
                        className="text-emerald-300"
                      />
                    </div>

                    <div className="space-y-4">
                      {analytics.top_matched_skills?.length > 0 ? (
                        analytics.top_matched_skills.map(
                          (skill, index) => (
                            <div key={skill.skill}>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600">
                                    #{index + 1}
                                  </span>

                                  <span className="text-sm text-slate-300">
                                    {skill.skill}
                                  </span>
                                </div>

                                <span className="text-xs text-cyan-300">
                                  {skill.count} matches
                                </span>
                              </div>

                              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  initial={{
                                    width: 0,
                                  }}
                                  animate={{
                                    width: `${getSkillPercentage(
                                      skill.count
                                    )}%`,
                                  }}
                                  transition={{
                                    duration: 0.7,
                                    delay: index * 0.05,
                                  }}
                                  className="h-full rounded-full bg-cyan-400"
                                />
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500">
                          No matched skills available yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Top Missing Skills
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          Common skill gaps across screened candidates
                        </p>
                      </div>

                      <AlertTriangle
                        size={20}
                        className="text-amber-300"
                      />
                    </div>

                    <div className="space-y-4">
                      {analytics.top_missing_skills?.length > 0 ? (
                        analytics.top_missing_skills.map(
                          (skill, index) => (
                            <div key={skill.skill}>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-600">
                                    #{index + 1}
                                  </span>

                                  <span className="text-sm text-slate-300">
                                    {skill.skill}
                                  </span>
                                </div>

                                <span className="text-xs text-amber-300">
                                  {skill.count} gaps
                                </span>
                              </div>

                              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                  initial={{
                                    width: 0,
                                  }}
                                  animate={{
                                    width: `${getSkillPercentage(
                                      skill.count
                                    )}%`,
                                  }}
                                  transition={{
                                    duration: 0.7,
                                    delay: index * 0.05,
                                  }}
                                  className="h-full rounded-full bg-amber-400"
                                />
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-slate-500">
                          No missing skills recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Recent Screening Activity
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Latest AI-powered candidate screenings
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={14} />
                      Latest activity
                    </div>
                  </div>

                  {analytics.recent_screenings?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4">
                              Candidate
                            </th>

                            <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4">
                              Position
                            </th>

                            <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4">
                              ATS
                            </th>

                            <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4">
                              Matching
                            </th>

                            <th className="text-left text-xs font-medium text-slate-500 pb-3">
                              Date
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {analytics.recent_screenings.map(
                            (screening) => (
                              <tr
                                key={screening.id}
                                className="border-b border-white/[0.06] last:border-0"
                              >
                                <td className="py-4 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
                                      <Users
                                        size={15}
                                        className="text-cyan-300"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {screening.candidate_name ||
                                          "Unknown Candidate"}
                                      </p>

                                      <p className="text-[11px] text-slate-600">
                                        Screening ID:{" "}
                                        {screening.id?.slice(
                                          -8
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 pr-4">
                                  <div className="flex items-center gap-2">
                                    <BriefcaseBusiness
                                      size={14}
                                      className="text-slate-600"
                                    />

                                    <div>
                                      <p className="text-sm text-slate-300">
                                        {screening.job_title ||
                                          "Unknown Position"}
                                      </p>

                                      <p className="text-xs text-slate-600">
                                        {screening.company ||
                                          "Unknown Company"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4 pr-4">
                                  <span className="inline-flex rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                                    {formatPercentage(
                                      screening.ats_score
                                    )}
                                  </span>
                                </td>

                                <td className="py-4 pr-4">
                                  <span className="inline-flex rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {formatPercentage(
                                      screening.matching_percentage
                                    )}
                                  </span>
                                </td>

                                <td className="py-4">
                                  <span className="text-xs text-slate-500">
                                    {formatDate(
                                      screening.created_at
                                    )}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <FileCheck2
                        size={30}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        No screening activity available yet.
                      </p>
                    </div>
                  )}
                </section>

                <section className="mt-6">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl border border-violet-400/20 bg-violet-400/10 flex items-center justify-center">
                          <TrendingUp
                            size={20}
                            className="text-violet-300"
                          />
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold">
                            Recruitment Performance
                          </h2>

                          <p className="text-sm text-slate-500">
                            Current AI screening pipeline metrics
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs text-slate-600">
                          Average ATS
                        </p>

                        <p className="text-2xl font-bold mt-1">
                          {formatPercentage(
                            analytics.average_ats
                          )}
                        </p>

                        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{
                              width: `${Math.min(
                                100,
                                Number(
                                  analytics.average_ats || 0
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs text-slate-600">
                          Average Job Matching
                        </p>

                        <p className="text-2xl font-bold mt-1">
                          {formatPercentage(
                            analytics.average_matching
                          )}
                        </p>

                        <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400"
                            style={{
                              width: `${Math.min(
                                100,
                                Number(
                                  analytics.average_matching || 0
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-xs text-slate-600">
                          Interview Evaluations
                        </p>

                        <p className="text-2xl font-bold mt-1">
                          {formatNumber(
                            analytics.total_evaluations
                          )}
                        </p>

                        <p className="text-xs text-slate-600 mt-3">
                          Avg score:{" "}
                          {analytics.average_interview_score !==
                            null &&
                          analytics.average_interview_score !==
                            undefined
                            ? Number(
                                analytics.average_interview_score
                              ).toFixed(1)
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Reports;
