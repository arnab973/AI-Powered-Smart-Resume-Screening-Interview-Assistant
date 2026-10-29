
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bell,
  Brain,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  Mic,
  Orbit,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const goTo = (path) => {
  window.location.href = path;
};

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getReportScore(report) {
  const value =
    report?.average_score ??
    report?.averageScore ??
    report?.score ??
    report?.overall_score ??
    report?.overallScore;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function scoreToPercent(score) {
  if (score === null || score === undefined) return null;

  const number = Number(score);
  if (!Number.isFinite(number)) return null;

  return Math.max(
    0,
    Math.min(100, Math.round(number <= 10 ? number * 10 : number))
  );
}

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/* =========================================================
   AI ROBOT — EXISTING FUTURISTIC DESIGN
========================================================= */

function AIBot() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        angle: (index / 28) * Math.PI * 2,
        radius: 125 + (index % 6) * 16,
        delay: `${index * 0.1}s`,
        size: 2 + (index % 3),
      })),
    []
  );

  return (
    <div className="relative flex h-[350px] w-[350px] items-center justify-center sm:h-[430px] sm:w-[430px]">
      <div className="absolute h-[290px] w-[290px] rounded-full bg-violet-600/[0.08] blur-[105px]" />
      <div className="absolute h-[230px] w-[230px] rounded-full bg-cyan-500/[0.08] blur-[80px]" />

      <div className="absolute h-[310px] w-[310px] rounded-full border border-violet-400/[0.12] border-t-violet-300/70 border-r-cyan-300/30 animate-[spin_20s_linear_infinite]" />

      <div className="absolute h-[270px] w-[270px] rounded-full border border-cyan-300/[0.10] border-b-cyan-300/70 border-l-violet-300/40 animate-[spin_14s_linear_infinite_reverse]" />

      <div className="absolute h-[235px] w-[235px] rotate-45 rounded-[45%] border border-white/[0.08] animate-[spin_16s_linear_infinite]" />

      <div className="absolute h-[235px] w-[235px] -rotate-45 rounded-[45%] border border-fuchsia-300/[0.08] animate-[spin_13s_linear_infinite_reverse]" />

      <div className="absolute bottom-[38px] h-[45px] w-[210px] rounded-[50%] border border-cyan-300/40 bg-cyan-400/[0.025] shadow-[0_0_50px_rgba(34,211,238,0.28)]" />

      <div className="absolute bottom-[48px] h-[24px] w-[150px] rounded-[50%] bg-cyan-400/20 blur-md" />

      <motion.div
        animate={{
          y: [-9, 9, -9],
          rotateZ: [-1.2, 1.2, -1.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-20 h-[205px] w-[175px]"
      >
        <div className="absolute left-1/2 top-0 h-[115px] w-[145px] -translate-x-1/2 rounded-[46px] border border-cyan-100/30 bg-gradient-to-br from-slate-100 via-white to-slate-400 shadow-[0_0_55px_rgba(56,189,248,0.25)]">
          <div className="absolute left-1/2 top-[19px] h-[73px] w-[116px] -translate-x-1/2 rounded-[31px] border border-cyan-400/30 bg-[#020611] shadow-[inset_0_0_38px_rgba(34,211,238,0.18)]">
            <div className="absolute left-[25px] top-[27px] h-[14px] w-[14px] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)] animate-pulse" />

            <div className="absolute right-[25px] top-[27px] h-[14px] w-[14px] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)] animate-pulse" />

            <div className="absolute bottom-[14px] left-1/2 h-[11px] w-[36px] -translate-x-1/2 rounded-b-full border-b-2 border-cyan-300" />
          </div>

          <div className="absolute -left-[14px] top-[34px] h-[50px] w-[23px] rounded-full border border-cyan-300/35 bg-slate-300 shadow-[0_0_20px_rgba(34,211,238,0.16)]" />

          <div className="absolute -right-[14px] top-[34px] h-[50px] w-[23px] rounded-full border border-cyan-300/35 bg-slate-300 shadow-[0_0_20px_rgba(34,211,238,0.16)]" />
        </div>

        <div className="absolute left-1/2 top-[103px] h-[87px] w-[116px] -translate-x-1/2 rounded-[31px] border border-white/20 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-500 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
          <div className="absolute left-1/2 top-[20px] flex h-[43px] w-[43px] -translate-x-1/2 items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-400/15 shadow-[0_0_30px_rgba(34,211,238,0.45)]">
            <div className="h-[20px] w-[20px] rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]" />
          </div>
        </div>

        <div className="absolute left-[5px] top-[118px] h-[62px] w-[21px] rotate-[18deg] rounded-full border border-cyan-200/30 bg-slate-300 shadow-[0_0_18px_rgba(34,211,238,0.15)]" />

        <div className="absolute right-[5px] top-[115px] h-[62px] w-[21px] -rotate-[22deg] rounded-full border border-cyan-200/30 bg-slate-300 shadow-[0_0_18px_rgba(34,211,238,0.15)]" />
      </motion.div>

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute z-30 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)] animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            width: particle.size,
            height: particle.size,
            transform: `translate(${
              Math.cos(particle.angle) * particle.radius
            }px, ${
              Math.sin(particle.angle) * particle.radius
            }px)`,
            animationDelay: particle.delay,
          }}
        />
      ))}

      <div className="absolute bottom-[2px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.28em] text-cyan-300/70">
        AI Intelligence Core
      </div>
    </div>
  );
}

/* =========================================================
   FLOATING HOLOGRAM CARDS
========================================================= */

function HologramCard({
  type,
  atsScore,
  jobsCount,
  interviewScore,
}) {
  if (type === "resume") {
    return (
      <motion.button
        type="button"
        onClick={() => goTo("/resume")}
        animate={{ y: [-5, 5, -5], rotate: [-1, 1, -1] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[0%] top-[48px] z-30 hidden w-[145px] rounded-2xl border border-cyan-300/20 bg-[#020611]/35 p-3 text-left shadow-[0_0_35px_rgba(34,211,238,0.10)] backdrop-blur-xl transition hover:border-cyan-300/40 sm:block"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-300">
          <FileText size={14} />
          Resume Analysis
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
            style={{ width: `${atsScore ?? 0}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[8px] text-slate-500">
          <span>Interview Score</span>
          <span className="font-bold text-cyan-300">
            {atsScore === null ? "—" : `${atsScore}%`}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[8px] text-cyan-300/70">
          <CheckCircle2 size={10} />
          {atsScore === null
            ? "Awaiting report"
            : "Performance tracked"}
        </div>
      </motion.button>
    );
  }

  if (type === "jobs") {
    return (
      <motion.div
        animate={{ y: [5, -5, 5], rotate: [1, -1, 1] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[0%] top-[25px] z-30 hidden w-[150px] rounded-2xl border border-violet-300/20 bg-[#020611]/35 p-3 shadow-[0_0_35px_rgba(139,92,246,0.12)] backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold text-violet-300">
          <Target size={14} />
          Available Jobs
        </div>

        <div className="mt-4 text-3xl font-black text-white">
          {jobsCount}
        </div>

        <div className="mt-1 text-[8px] text-slate-500">
          opportunities currently available
        </div>

        <div className="mt-3 h-1 rounded-full bg-white/[0.06]">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ y: [-4, 5, -4], rotate: [-1, 1, -1] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute bottom-[45px] right-[0%] z-30 hidden w-[150px] rounded-2xl border border-fuchsia-300/15 bg-[#020611]/35 p-3 shadow-[0_0_35px_rgba(217,70,239,0.10)] backdrop-blur-xl sm:block"
    >
      <div className="flex items-center gap-2 text-[10px] font-bold text-fuchsia-300">
        <Mic size={14} />
        Interview Ready
      </div>

      <div className="mt-4 flex h-7 items-end gap-1">
        {[12, 20, 9, 25, 16, 28, 14, 23, 12].map(
          (height, index) => (
            <span
              key={index}
              className="w-1.5 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-300 animate-pulse"
              style={{
                height,
                animationDelay: `${index * 0.12}s`,
              }}
            />
          )
        )}
      </div>

      <div className="mt-2 text-[8px] text-slate-500">
        {interviewScore === null
          ? "No interview report yet"
          : `Latest score: ${interviewScore}%`}
      </div>
    </motion.div>
  );
}

/* =========================================================
   SIDEBAR — SCROLLING FIX
========================================================= */

function Sidebar({ open, setOpen }) {
  const items = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      active: true,
    },
    {
      label: "Resume Analysis",
      icon: FileText,
      path: "/resume",
    },
    {
      label: "Job Search",
      icon: Search,
      path: "/jobs",
    },
    {
      label: "Interview Prep",
      icon: MessageSquareText,
      path: "/interview",
    },
    {
      label: "Interview Reports",
      icon: TrendingUp,
      path: "/interview-report",
    },
    {
      label: "My Applications",
      icon: BriefcaseBusiness,
      path: "/applications",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[250px] flex-col border-r border-violet-300/[0.08] bg-[#020611]/50 px-4 py-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-2">
          <button
            type="button"
            onClick={() => goTo("/")}
            className="flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-[0_0_28px_rgba(124,58,237,0.28)]">
              <Sparkles size={20} className="text-white" />
            </div>

            <div className="text-left">
              <div className="text-xl font-black tracking-tight">
                <span className="text-white">Hire</span>
                <span className="text-cyan-300">Nexus</span>
              </div>

              <div className="text-[8px] uppercase tracking-[0.17em] text-slate-600">
                AI Career Intelligence
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable sidebar content */}
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#43386b_transparent]">
          <div className="mt-4">
            <p className="px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-700">
              Workspace
            </p>

            <nav className="mt-3 space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      item.active
                        ? "border border-violet-400/10 bg-gradient-to-r from-violet-600/30 via-violet-500/15 to-cyan-500/[0.04] text-white shadow-[0_8px_30px_rgba(124,58,237,0.10)]"
                        : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        item.active
                          ? "text-cyan-300"
                          : "text-slate-600 group-hover:text-cyan-300"
                      }
                    />

                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] via-white/[0.012] to-cyan-500/[0.035] p-4 backdrop-blur-xl">
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Sparkles size={17} className="text-violet-300" />
            </div>

            <p className="text-lg font-black leading-tight text-white">
              Better Skills
              <br />
              Bigger Dreams
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Let AI power your career journey.
            </p>

            <button
              type="button"
              onClick={() => goTo("/resume")}
              className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-[0_0_22px_rgba(34,211,238,0.2)]"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => goTo("/")}
            className="mt-4 flex w-full items-center gap-3 px-3 py-2 text-xs text-slate-700 transition hover:text-slate-300"
          >
            <LogOut size={15} />
            Back to website
          </button>

          <div className="h-3" />
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   NOTIFICATION DROPDOWN
========================================================= */

function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClear,
  onClose,
}) {
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const iconColors = {
    violet: "bg-violet-500/10 text-violet-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-300",
    blue: "bg-blue-500/10 text-blue-300",
  };

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-[76px] z-[100] w-[calc(100vw-24px)] max-w-[390px] overflow-hidden rounded-2xl border border-violet-300/20 bg-[#080d20]/95 shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:right-2"
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold text-violet-200">
                {unreadCount}
              </span>
            )}
          </div>

          <p className="mt-1 text-[10px] text-slate-500">
            Your latest career updates
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.07]">
              <Bell size={24} className="text-violet-300" />
            </div>

            <p className="mt-4 text-sm font-semibold text-white">
              All caught up!
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Your new career updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon || Bell;

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className={`flex w-full gap-3 border-b border-white/[0.05] px-5 py-4 text-left transition hover:bg-white/[0.045] ${
                  notification.read
                    ? ""
                    : "bg-violet-500/[0.065]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    iconColors[notification.type] ||
                    iconColors.violet
                  }`}
                >
                  <Icon size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    {notification.description}
                  </p>

                  <p className="mt-2 text-[9px] font-semibold text-cyan-300/70">
                    {notification.time}
                  </p>
                </div>

                {!notification.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.7)]" />
                )}
              </button>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 transition hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={13} />
            Mark all read
          </button>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 transition hover:text-red-300"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TOPBAR WITH WORKING NOTIFICATION BELL
========================================================= */

function Topbar({
  setOpen,
  user,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearNotifications,
}) {
  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const displayName =
    user?.name || user?.full_name || "Candidate";

  const role = user?.role
    ? String(user.role).charAt(0).toUpperCase() +
      String(user.role).slice(1)
    : "Candidate";

  useEffect(() => {
    if (!notificationOpen) return;

    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] lg:left-[250px]">
      <div className="mx-3 mt-3 rounded-2xl border border-violet-300/[0.12] bg-[#020611]/40 shadow-[0_8px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:mx-5 lg:mx-6">
        <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-2.5 text-slate-300 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-cyan-400/[0.12] bg-cyan-400/[0.025] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                AI System Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div ref={notificationRef} className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() =>
                  setNotificationOpen((previous) => !previous)
                }
                className={`relative rounded-xl border p-2.5 transition ${
                  notificationOpen
                    ? "border-violet-400/30 bg-violet-500/15 text-cyan-300"
                    : "border-white/[0.07] bg-white/[0.025] text-slate-400 hover:border-cyan-300/20 hover:text-white"
                }`}
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                )}
              </button>

              {notificationOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={onMarkRead}
                  onMarkAllRead={onMarkAllRead}
                  onClear={onClearNotifications}
                  onClose={() => setNotificationOpen(false)}
                />
              )}
            </div>

            <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />

            <button
              type="button"
              onClick={() => goTo("/profile")}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.035]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-300/20 bg-gradient-to-br from-violet-500/20 to-cyan-400/15">
                <User size={17} className="text-cyan-200" />
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[150px] truncate text-xs font-bold text-white">
                  {displayName}
                </p>

                <p className="text-[9px] text-slate-600">
                  {role}
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-600 sm:block"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  type,
  loading,
}) {
  const themes = {
    violet: {
      icon: "bg-violet-500/10 text-violet-300",
      glow: "bg-violet-500/[0.045]",
      line: "from-violet-500/0 via-violet-400/60 to-cyan-400/0",
    },
    cyan: {
      icon: "bg-cyan-500/10 text-cyan-300",
      glow: "bg-cyan-500/[0.04]",
      line: "from-cyan-500/0 via-cyan-400/60 to-violet-400/0",
    },
    fuchsia: {
      icon: "bg-fuchsia-500/10 text-fuchsia-300",
      glow: "bg-fuchsia-500/[0.04]",
      line: "from-fuchsia-500/0 via-fuchsia-400/60 to-violet-400/0",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-300",
      glow: "bg-blue-500/[0.04]",
      line: "from-blue-500/0 via-cyan-400/60 to-violet-400/0",
    },
  };

  const theme = themes[type] || themes.violet;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl transition hover:border-violet-300/15 hover:bg-white/[0.025]"
    >
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 ${theme.glow} rounded-full blur-3xl`}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.icon}`}
        >
          <Icon size={20} />
        </div>

        <TrendingUp
          size={15}
          className="text-cyan-300/70"
        />
      </div>

      <p className="relative mt-5 text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="relative mt-1 flex items-end justify-between">
        <p className="text-3xl font-black tracking-tight text-white">
          {loading ? (
            <Loader2
              size={25}
              className="animate-spin text-cyan-300"
            />
          ) : (
            value
          )}
        </p>

        <span className="mb-1 text-[10px] font-bold text-cyan-300">
          {trend}
        </span>
      </div>

      <p className="relative mt-1 text-[9px] text-slate-700">
        Live from your account
      </p>

      <div
        className={`absolute bottom-0 left-0 h-px w-full bg-gradient-to-r ${theme.line}`}
      />
    </motion.div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  type,
  path,
}) {
  const themes = {
    violet: "text-violet-300 bg-violet-500/10",
    cyan: "text-cyan-300 bg-cyan-500/10",
    fuchsia: "text-fuchsia-300 bg-fuchsia-500/10",
    blue: "text-blue-300 bg-blue-500/10",
  };

  return (
    <button
      type="button"
      onClick={() => goTo(path)}
      className="group flex w-full items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.012] p-3 text-left transition hover:border-violet-300/15 hover:bg-white/[0.03]"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          themes[type] || themes.violet
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-200">
          {title}
        </p>

        <p className="mt-1 truncate text-[10px] text-slate-600">
          {description}
        </p>
      </div>

      <ArrowRight
        size={14}
        className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
      />
    </button>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  type,
}) {
  const themes = {
    violet: "bg-violet-500/10 text-violet-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-300",
    blue: "bg-blue-500/10 text-blue-300",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/[0.02]">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          themes[type] || themes.violet
        }`}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-300">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-700">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-[9px] text-slate-700">
        {time}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN CANDIDATE DASHBOARD
========================================================= */

export default function CandidateDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [readNotifications, setReadNotifications] =
    useState(() =>
      readStoredArray("hirenexus_read_notifications")
    );

  const [clearedNotifications, setClearedNotifications] =
    useState(() =>
      readStoredArray("hirenexus_cleared_notifications")
    );

  /* =======================================================
     LOAD DASHBOARD API DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardData() {
      const token = getToken();

      if (!token) {
        goTo("/login");
        return;
      }

      setLoading(true);
      setDashboardError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const requests = await Promise.allSettled([
          fetch(`${API_URL}/auth/me`, { headers }),
          fetch(`${API_URL}/resume/my-resumes`, { headers }),
          fetch(`${API_URL}/jobs/available`, { headers }),
          fetch(`${API_URL}/applications/my-applications`, {
            headers,
          }),
          fetch(`${API_URL}/report`, { headers }),
        ]);

        if (!mounted) return;

        const [
          userResult,
          resumeResult,
          jobsResult,
          applicationsResult,
          reportsResult,
        ] = requests;

        async function getData(result) {
          if (
            result.status !== "fulfilled" ||
            !result.value.ok
          ) {
            return null;
          }

          try {
            return await result.value.json();
          } catch {
            return null;
          }
        }

        const [
          userData,
          resumeData,
          jobsData,
          applicationData,
          reportData,
        ] = await Promise.all(
          requests.map((result) => getData(result))
        );

        if (!mounted) return;

        if (userData) {
          const currentUser = userData.user || userData;
          setUser(currentUser);

          try {
            localStorage.setItem(
              "user",
              JSON.stringify(currentUser)
            );
          } catch {
            // Storage may be unavailable.
          }
        } else {
          try {
            setUser(
              JSON.parse(localStorage.getItem("user") || "null")
            );
          } catch {
            setUser(null);
          }
        }

        setResumes(
          safeArray(
            resumeData?.resumes ||
              resumeData?.data ||
              resumeData
          )
        );

        setJobs(
          safeArray(
            jobsData?.jobs ||
              jobsData?.data ||
              jobsData
          )
        );

        setApplications(
          safeArray(
            applicationData?.applications ||
              applicationData?.data ||
              applicationData
          )
        );

        setReports(
          safeArray(
            reportData?.reports ||
              reportData?.data ||
              reportData
          )
        );

        const allFailed = requests.every(
          (result) =>
            result.status === "rejected" ||
            !result.value.ok
        );

        if (allFailed) {
          setDashboardError(
            "Unable to load dashboard data. Please refresh and try again."
          );
        }
      } catch (error) {
        if (!mounted) return;

        console.error("Dashboard loading failed:", error);

        setDashboardError(
          "Some dashboard data could not be loaded."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     DASHBOARD CALCULATIONS
  ======================================================= */

  const firstName =
    user?.name?.split(" ")[0] ||
    user?.full_name?.split(" ")[0] ||
    "Candidate";

  const parsedResumeCount = resumes.filter(
    (resume) => resume?.parsed === true
  ).length;

  const latestResume = useMemo(
    () =>
      [...resumes].sort(
        (a, b) =>
          new Date(
            b.updated_at || b.uploaded_at || 0
          ).getTime() -
          new Date(
            a.updated_at || a.uploaded_at || 0
          ).getTime()
      )[0] || null,
    [resumes]
  );

  const latestReport = useMemo(
    () =>
      [...reports].sort(
        (a, b) =>
          new Date(
            b.created_at || b.updated_at || 0
          ).getTime() -
          new Date(
            a.created_at || a.updated_at || 0
          ).getTime()
      )[0] || null,
    [reports]
  );

  const latestScore = getReportScore(latestReport);
  const latestScorePercent = scoreToPercent(latestScore);

  const validReportScores = reports
    .map(getReportScore)
    .filter((score) => score !== null);

  const averageReportScore = validReportScores.length
    ? validReportScores.reduce(
        (total, score) => total + score,
        0
      ) / validReportScores.length
    : null;

  const averageScorePercent =
    scoreToPercent(averageReportScore);

  /* =======================================================
     NOTIFICATIONS FROM EXISTING ACCOUNT DATA
  ======================================================= */

  const notifications = useMemo(() => {
    const items = [];

    resumes.forEach((resume, index) => {
      const date =
        resume.updated_at || resume.uploaded_at;

      items.push({
        id: `resume-${
          resume.id ||
          resume._id ||
          resume.stored_filename ||
          `${date || "unknown"}-${index}`
        }`,
        icon: FileText,
        type: "violet",
        title: resume.parsed
          ? "Resume analysis completed"
          : "Resume uploaded",
        description: resume.parsed
          ? `${
              resume.original_filename || "Your resume"
            } is ready for career analysis.`
          : `${
              resume.original_filename || "Your resume"
            } has been uploaded.`,
        time: formatDate(date),
        date: new Date(date || 0).getTime() || 0,
      });
    });

    applications.forEach((application, index) => {
      const date =
        application.updated_at ||
        application.created_at ||
        application.appliedDate;

      items.push({
        id: `application-${
          application.id ||
          application._id ||
          `${date || "unknown"}-${index}`
        }`,
        icon: BriefcaseBusiness,
        type: "blue",
        title: "Job application update",
        description:
          application.title ||
          application.job_title ||
          application.company ||
          "Your job application is being tracked.",
        time: formatDate(date),
        date: new Date(date || 0).getTime() || 0,
      });
    });

    reports.forEach((report, index) => {
      const date =
        report.updated_at || report.created_at;

      const score = getReportScore(report);

      items.push({
        id: `report-${
          report.id ||
          report._id ||
          `${date || "unknown"}-${index}`
        }`,
        icon: Mic,
        type: "fuchsia",
        title: "Interview report generated",
        description:
          score === null
            ? "Your interview performance report is available."
            : `Your interview score: ${
                scoreToPercent(score)
              }%.`,
        time: formatDate(date),
        date: new Date(date || 0).getTime() || 0,
      });
    });

    return items
      .filter(
        (item) => !clearedNotifications.includes(item.id)
      )
      .sort((a, b) => b.date - a.date)
      .map((item) => ({
        ...item,
        read: readNotifications.includes(item.id),
      }));
  }, [
    resumes,
    applications,
    reports,
    readNotifications,
    clearedNotifications,
  ]);

  function markNotificationRead(id) {
    setReadNotifications((previous) => {
      const updated = [...new Set([...previous, id])];

      try {
        localStorage.setItem(
          "hirenexus_read_notifications",
          JSON.stringify(updated)
        );
      } catch {
        // Continue without persistence.
      }

      return updated;
    });
  }

  function markAllNotificationsRead() {
    setReadNotifications((previous) => {
      const updated = [
        ...new Set([
          ...previous,
          ...notifications.map((item) => item.id),
        ]),
      ];

      try {
        localStorage.setItem(
          "hirenexus_read_notifications",
          JSON.stringify(updated)
        );
      } catch {
        // Continue without persistence.
      }

      return updated;
    });
  }

  function clearNotifications() {
    setClearedNotifications((previous) => {
      const updated = [
        ...new Set([
          ...previous,
          ...notifications.map((item) => item.id),
        ]),
      ];

      try {
        localStorage.setItem(
          "hirenexus_cleared_notifications",
          JSON.stringify(updated)
        );
      } catch {
        // Continue without persistence.
      }

      return updated;
    });
  }

  /* =======================================================
     RECENT ACTIVITIES
  ======================================================= */

  const recentActivities = useMemo(() => {
    const items = [];

    resumes.forEach((resume, index) => {
      const date =
        resume.updated_at || resume.uploaded_at;

      items.push({
        id: `resume-${resume.id || resume._id || index}`,
        icon: FileText,
        title: resume.parsed
          ? "Resume analysis completed"
          : "Resume uploaded",
        description: resume.parsed
          ? `${
              resume.original_filename || "Resume"
            } is ready for analysis`
          : `${
              resume.original_filename || "Resume"
            } is awaiting parsing`,
        time: formatDate(date),
        type: "violet",
        date: new Date(date || 0).getTime() || 0,
      });
    });

    applications.forEach((application, index) => {
      const date =
        application.updated_at ||
        application.created_at ||
        application.appliedDate;

      items.push({
        id: `application-${
          application.id || application._id || index
        }`,
        icon: BriefcaseBusiness,
        title: "Job application submitted",
        description:
          application.title ||
          application.job_title ||
          application.company ||
          "Application submitted",
        time: formatDate(date),
        type: "blue",
        date: new Date(date || 0).getTime() || 0,
      });
    });

    reports.forEach((report, index) => {
      const date =
        report.updated_at || report.created_at;

      const score = getReportScore(report);

      items.push({
        id: `report-${report.id || report._id || index}`,
        icon: Mic,
        title: "Interview report generated",
        description:
          score === null
            ? "Interview performance report available"
            : `Latest evaluated score: ${scoreToPercent(
                score
              )}%`,
        time: formatDate(date),
        type: "fuchsia",
        date: new Date(date || 0).getTime() || 0,
      });
    });

    return items
      .sort((a, b) => b.date - a.date)
      .slice(0, 4);
  }, [resumes, applications, reports]);

  /* =======================================================
     AI CAREER INSIGHTS
  ======================================================= */

  const profileStrength = useMemo(() => {
    if (!latestResume?.structured_data) return null;

    const data = latestResume.structured_data;
    const personal = data.personal_information || {};

    let completed = 0;

    if (
      personal.name ||
      personal.email ||
      personal.phone
    ) {
      completed += 1;
    }

    if (data.summary) completed += 1;
    if (data.education) completed += 1;

    if (
      Array.isArray(data.skills) &&
      data.skills.length
    ) {
      completed += 1;
    }

    if (data.experience) completed += 1;
    if (data.projects) completed += 1;

    return Math.round((completed / 6) * 100);
  }, [latestResume]);

  const skillCoverage = useMemo(() => {
    const skills =
      latestResume?.structured_data?.skills;

    if (!Array.isArray(skills) || !skills.length) {
      return null;
    }

    return Math.min(
      100,
      Math.round((skills.length / 12) * 100)
    );
  }, [latestResume]);

  /* =======================================================
     PAGE DESIGN
  ======================================================= */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="relative z-10">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <div className="min-h-screen lg:pl-[250px]">
          <Topbar
            setOpen={setSidebarOpen}
            user={user}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onClearNotifications={clearNotifications}
          />

          <main className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-[100px] sm:px-6 sm:pt-[105px] lg:px-8">
            {dashboardError && (
              <div className="mb-4 rounded-xl border border-red-400/10 bg-red-500/[0.04] px-4 py-3 text-xs text-red-300">
                {dashboardError}
              </div>
            )}

            {/* ==========================================
                HERO SECTION
            ========================================== */}

            <section className="relative overflow-visible py-4 sm:py-7 lg:py-5">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[8%] top-[10%] h-[280px] w-[280px] rounded-full bg-violet-600/[0.04] blur-[120px]" />

                <div className="absolute right-[10%] top-[25%] h-[300px] w-[300px] rounded-full bg-cyan-500/[0.04] blur-[130px]" />

                <div className="absolute bottom-0 left-[45%] h-[220px] w-[220px] rounded-full bg-fuchsia-500/[0.025] blur-[120px]" />
              </div>

              <div className="relative grid items-center gap-3 lg:grid-cols-[1fr_0.95fr]">
                <div className="relative z-20 max-w-[620px]">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.05] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300 backdrop-blur-md">
                    <Zap size={11} />
                    Next-Generation Career AI
                  </div>

                  <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[54px]">
                    Welcome back,
                    <br />

                    <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                      {firstName}
                    </span>
                  </h1>

                  <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
                    Your AI career intelligence system is ready.
                    Analyze your resume, discover matching
                    opportunities and sharpen your interview
                    performance.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => goTo("/resume")}
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-[0_10px_35px_rgba(124,58,237,0.20)] transition hover:-translate-y-0.5"
                    >
                      <FileText size={15} />
                      Analyze Resume

                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => goTo("/jobs")}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.018] px-5 py-3 text-xs font-semibold text-slate-400 backdrop-blur-md transition hover:border-cyan-300/20 hover:bg-white/[0.035] hover:text-white"
                    >
                      <Target size={15} />
                      Explore Jobs
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_9px_rgba(167,139,250,0.8)]" />
                      NLP Analysis
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_9px_rgba(34,211,238,0.8)]" />
                      Semantic Matching
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_9px_rgba(232,121,249,0.8)]" />
                      LLM Intelligence
                    </span>
                  </div>
                </div>

                <div className="relative flex min-h-[390px] items-center justify-center sm:min-h-[450px] lg:min-h-[420px]">
                  <HologramCard
                    type="resume"
                    atsScore={latestScorePercent}
                  />

                  <HologramCard
                    type="jobs"
                    jobsCount={jobs.length}
                  />

                  <HologramCard
                    type="interview"
                    interviewScore={latestScorePercent}
                  />

                  <AIBot />
                </div>
              </div>
            </section>

            {/* ==========================================
                STATISTICS
            ========================================== */}

            <section className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Resumes Analyzed"
                value={parsedResumeCount}
                trend={
                  resumes.length
                    ? `${resumes.length} total`
                    : "No resume"
                }
                type="violet"
                loading={loading}
              />

              <StatCard
                icon={Target}
                label="Jobs Available"
                value={jobs.length}
                trend="Live"
                type="cyan"
                loading={loading}
              />

              <StatCard
                icon={Gauge}
                label="Interview Reports"
                value={reports.length}
                trend={
                  averageScorePercent === null
                    ? "No score"
                    : `${averageScorePercent}% avg`
                }
                type="fuchsia"
                loading={loading}
              />

              <StatCard
                icon={BriefcaseBusiness}
                label="Applications Sent"
                value={applications.length}
                trend={
                  applications.length
                    ? "Tracked"
                    : "None yet"
                }
                type="blue"
                loading={loading}
              />
            </section>

            {/* ==========================================
                QUICK ACTIONS / RECENT ACTIVITY / INSIGHTS
            ========================================== */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1fr_1fr]">
              {/* QUICK ACTIONS */}

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <Zap
                      size={19}
                      className="text-violet-300"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Quick Actions
                    </h2>

                    <p className="mt-0.5 text-[10px] text-slate-700">
                      Get started with your career journey
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <QuickAction
                    icon={FileText}
                    title="Upload Resume"
                    description="Analyze your latest resume"
                    type="violet"
                    path="/resume"
                  />

                  <QuickAction
                    icon={Brain}
                    title="Resume Intelligence"
                    description="Get AI-powered resume insights"
                    type="cyan"
                    path="/resume"
                  />

                  <QuickAction
                    icon={Target}
                    title="AI Job Matching"
                    description="Discover relevant opportunities"
                    type="fuchsia"
                    path="/jobs"
                  />

                  <QuickAction
                    icon={Mic}
                    title="AI Interview"
                    description="Practice with your AI interviewer"
                    type="blue"
                    path="/interview"
                  />

                  <QuickAction
                    icon={TrendingUp}
                    title="Interview Reports"
                    description="Review your AI interview performance"
                    type="violet"
                    path="/interview-report"
                  />
                </div>
              </div>

              {/* RECENT ACTIVITY */}

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                      <Activity
                        size={19}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-white">
                        Recent Activity
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-700">
                        Your latest AI actions
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/applications")}
                    className="text-[10px] font-semibold text-cyan-300/80 hover:text-cyan-200"
                  >
                    View All →
                  </button>
                </div>

                <div className="mt-5 space-y-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2
                        size={20}
                        className="animate-spin text-cyan-300"
                      />
                    </div>
                  ) : recentActivities.length ? (
                    recentActivities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        icon={activity.icon}
                        title={activity.title}
                        description={activity.description}
                        time={activity.time}
                        type={activity.type}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.012] px-4 py-8 text-center">
                      <Activity
                        size={22}
                        className="mx-auto text-slate-700"
                      />

                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        No recent activity
                      </p>

                      <p className="mt-1 text-[10px] text-slate-700">
                        Upload a resume or explore jobs to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI CAREER INSIGHTS */}

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10">
                      <Lightbulb
                        size={19}
                        className="text-fuchsia-300"
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-white">
                        AI Career Insights
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-700">
                        Based on your current profile
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.035] px-2 py-1 text-[8px] font-bold text-cyan-300/80">
                    LIVE DATA
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.06] via-white/[0.01] to-cyan-500/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <Sparkles
                        size={14}
                        className="text-violet-300"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {latestResume
                          ? latestResume.parsed
                            ? "Your resume is ready for AI career analysis."
                            : "Your resume needs parsing before deeper insights."
                          : "Start by uploading your resume."}
                      </p>

                      <p className="mt-2 text-[10px] leading-5 text-slate-600">
                        {latestResume?.parsed
                          ? "Your resume data is available for job matching and interview preparation."
                          : "Upload and parse a resume to unlock personalized career intelligence."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.012] p-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-700">
                      Profile Strength
                    </p>

                    <p className="mt-2 text-xl font-black text-cyan-300">
                      {profileStrength === null
                        ? "—"
                        : `${profileStrength}%`}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.012] p-3">
                    <p className="text-[9px] uppercase tracking-wider text-slate-700">
                      Skill Coverage
                    </p>

                    <p className="mt-2 text-xl font-black text-violet-300">
                      {skillCoverage === null
                        ? "—"
                        : `${skillCoverage}%`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo("/resume")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.012] py-3 text-[10px] font-bold text-slate-500 transition hover:border-violet-300/15 hover:bg-white/[0.03] hover:text-white"
                >
                  Explore Career Insights
                  <ArrowRight size={13} />
                </button>
              </div>
            </section>

            {/* ==========================================
                AI CAREER ENGINE / READINESS
            ========================================== */}

            <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl">
                <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-500/[0.035] blur-[90px]" />

                <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Orbit
                        size={16}
                        className="text-cyan-300"
                      />

                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">
                        AI Career Engine
                      </p>
                    </div>

                    <h2 className="mt-2 text-xl font-black text-white">
                      Your next opportunity is closer than you think.
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600">
                      Use semantic job matching to compare your skills
                      with opportunities and identify your strongest
                      matches.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => goTo("/jobs")}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-xs font-black text-white shadow-[0_0_30px_rgba(124,58,237,0.16)] transition hover:-translate-y-0.5"
                  >
                    Start Matching
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <Brain
                      size={19}
                      className="text-violet-300"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      AI Readiness
                    </p>

                    <p className="text-[10px] text-slate-700">
                      Based on latest interview report
                    </p>
                  </div>

                  <span className="ml-auto text-xl font-black text-violet-300">
                    {latestScorePercent === null
                      ? "—"
                      : `${latestScorePercent}%`}
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${latestScorePercent ?? 0}%`,
                    }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  />
                </div>

                <div className="mt-3 flex justify-between text-[9px] text-slate-700">
                  <span>
                    {reports.length
                      ? `${reports.length} report${
                          reports.length > 1 ? "s" : ""
                        }`
                      : "No reports yet"}
                  </span>

                  <span className="text-cyan-300/80">
                    {latestScorePercent === null
                      ? "Waiting"
                      : "Active"}
                  </span>
                </div>
              </div>
            </section>

            {/* FOOTER */}

            <footer className="py-8 text-center text-[9px] uppercase tracking-[0.25em] text-slate-800">
              HireNexus • AI Recruitment Intelligence
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
