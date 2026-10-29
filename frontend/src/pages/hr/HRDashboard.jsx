
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Radar,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

// =========================================================
// CONFIGURATION
// =========================================================

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const navigate = (path) => {
  if (path) {
    window.location.assign(path);
  }
};

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("resumeId");

  navigate("/login");
};

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

const getJobId = (job, index) =>
  String(
    job?._id ||
      job?.id ||
      job?.job_id ||
      `${job?.title || "job"}-${job?.created_at || index}`
  );

const getJobDate = (job) =>
  job?.created_at ||
  job?.createdAt ||
  job?.posted_at ||
  job?.published_at ||
  null;

const formatTime = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const minutes = Math.floor(
    Math.max(0, Date.now() - date.getTime()) / 60000
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const readStorageArray = (key) => {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveStorageArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore unavailable storage.
  }
};

// =========================================================
// GLASS CARD
// =========================================================

function GlassCard({
  children,
  className = "",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative overflow-hidden rounded-2xl
        border border-white/[0.13]
        bg-[#081329]/45
        shadow-[0_12px_40px_rgba(0,0,0,0.12)]
        backdrop-blur-md
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "cyan",
  delay = 0,
}) {
  const colors = {
    cyan: "text-cyan-300",
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    pink: "text-pink-300",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="
        group relative rounded-2xl
        border border-white/[0.13]
        bg-[#081329]/45 p-5
        shadow-[0_10px_35px_rgba(0,0,0,0.10)]
        backdrop-blur-md transition-all
        hover:border-cyan-300/30
        hover:bg-[#101d37]/55
      "
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/[0.05] blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`
            rounded-xl border border-white/[0.08]
            bg-white/[0.04] p-2
            ${colors[accent] || colors.cyan}
          `}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

// =========================================================
// ANIMATED AI RECRUITER
// =========================================================

function NeuralRecruiterCore() {
  return (
    <div className="relative mx-auto flex h-[390px] w-full max-w-[560px] items-center justify-center">
      <div className="absolute h-[320px] w-[320px] rounded-full border border-cyan-400/[0.10]" />

      <div className="absolute h-[270px] w-[270px] rounded-full border border-violet-400/[0.12]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[300px] w-[300px] rounded-full border border-dashed border-cyan-300/25"
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[235px] w-[235px] rounded-full border border-dashed border-violet-300/25"
      >
        <span className="absolute bottom-1 right-5 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.9)]" />
      </motion.div>

      <motion.div
        animate={{
          rotate: [0, 4, -4, 0],
          y: [0, -7, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <div className="absolute -inset-10 rounded-[40px] bg-cyan-400/10 blur-3xl" />

        <div
          className="
            relative h-[155px] w-[155px]
            rounded-[34px] border border-cyan-200/30
            bg-gradient-to-br
            from-cyan-100/[0.18]
            via-[#0c172d]
            to-violet-500/[0.16]
            shadow-[0_0_80px_rgba(34,211,238,0.20)]
          "
          style={{
            transform:
              "perspective(700px) rotateX(8deg) rotateY(-12deg)",
          }}
        >
          <div className="absolute inset-[13px] rounded-[26px] border border-white/[0.10] bg-[#020617]/80" />

          <div className="absolute left-1/2 top-[36px] flex -translate-x-1/2 gap-6">
            <motion.span
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              className="h-3.5 w-3.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
            />

            <motion.span
              animate={{
                opacity: [1, 0.4, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              className="h-3.5 w-3.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(167,139,250,0.9)]"
            />
          </div>

          <div className="absolute bottom-[42px] left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-white/70 to-violet-300" />

          <div className="absolute -left-8 top-12 h-14 w-3 rounded-full border border-cyan-300/20 bg-cyan-300/10" />

          <div className="absolute -right-8 top-12 h-14 w-3 rounded-full border border-violet-300/20 bg-violet-300/10" />
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.65, 1, 0.65],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute right-[5%] top-[22%] border border-cyan-300/25 bg-[#081329]/40 px-4 py-3 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <Radar size={15} className="text-cyan-300" />

          <span className="text-[10px] uppercase tracking-wider text-cyan-200">
            AI Screening
          </span>
        </div>

        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
          <motion.div
            animate={{ x: ["-100%", "0%"] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            className="h-full w-full bg-gradient-to-r from-cyan-400 to-violet-400"
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute bottom-[18%] left-[4%] border border-violet-300/25 bg-[#081329]/40 px-4 py-3 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit
            size={15}
            className="text-violet-300"
          />

          <span className="text-[10px] uppercase tracking-wider text-violet-200">
            Neural Match
          </span>
        </div>

        <p className="mt-1 text-lg font-bold text-white">
          94.8%
        </p>
      </motion.div>
    </div>
  );
}

// =========================================================
// PIPELINE ITEM
// =========================================================

function PipelineItem({
  label,
  value,
  percentage,
  color,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300">
          {label}
        </span>

        <span className="text-xs font-semibold text-white">
          {value}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            delay: 0.4,
          }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex w-full items-center gap-4 border-b border-white/[0.10] py-4 text-left transition"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/[0.07] text-cyan-300">
        <Icon size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300"
      />
    </motion.button>
  );
}

// =========================================================
// JOB CARD
// =========================================================

function JobCard({ job, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
      }}
      className="group flex items-center gap-4 border-b border-white/[0.10] py-4 transition hover:border-cyan-300/25"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/[0.07] text-violet-300">
        <BriefcaseBusiness size={19} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {job.title || "Untitled Position"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-400">
          {job.company || "Hiring Organization"}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-[9px] uppercase tracking-wider text-slate-400">
          Status
        </p>

        <p className="mt-1 text-xs text-emerald-300">
          {job.status || "Active"}
        </p>
      </div>
    </motion.div>
  );
}

// =========================================================
// RESPONSIVE NOTIFICATION DROPDOWN
// =========================================================

function NotificationDropdown({
  notifications,
  anchorRef,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}) {
  const panelRef = useRef(null);

  const [position, setPosition] = useState({
    top: 80,
    right: 16,
  });

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  useEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) return;

      const rect =
        anchorRef.current.getBoundingClientRect();

      const viewportWidth =
        document.documentElement.clientWidth;

      if (viewportWidth < 640) {
        setPosition({
          top: Math.min(
            rect.bottom + 12,
            window.innerHeight - 100
          ),
          right: 12,
        });
      } else {
        setPosition({
          top: rect.bottom + 12,
          right: Math.max(
            16,
            viewportWidth - rect.right
          ),
        });
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener(
      "scroll",
      updatePosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition
      );
      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
    };
  }, [anchorRef]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedPanel =
        panelRef.current?.contains(event.target);

      const clickedBell =
        anchorRef.current?.contains(event.target);

      if (!clickedPanel && !clickedBell) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <motion.div
      ref={panelRef}
      initial={{
        opacity: 0,
        y: -10,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.98,
      }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label="HR notifications"
      style={{
        top: position.top,
        right: position.right,
        maxHeight: `calc(100dvh - ${position.top + 12}px)`,
      }}
      className="
        fixed z-[9999] flex
        w-[calc(100vw-24px)] max-w-[390px]
        flex-col overflow-hidden rounded-2xl
        border border-cyan-300/25
        bg-[#0a1428]/95
        shadow-[0_25px_80px_rgba(0,0,0,0.70)]
        backdrop-blur-2xl sm:w-[390px]
      "
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.10] px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                {unreadCount}
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            Latest recruitment updates
          </p>
        </div>

        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
        {notifications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06]">
              <Bell
                size={23}
                className="text-cyan-300"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-white">
              All caught up!
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Job updates will appear here when available.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onMarkRead(item.id)}
              className={`
                flex w-full items-start gap-3
                border-b border-white/[0.07]
                px-4 py-4 text-left transition
                hover:bg-white/[0.06] sm:px-5
                ${
                  item.read
                    ? "bg-transparent"
                    : "bg-violet-500/[0.08]"
                }
              `}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-400/[0.08]">
                <BriefcaseBusiness
                  size={17}
                  className="text-cyan-300"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-xs font-semibold text-white">
                  {item.title}
                </p>

                <p className="mt-1 break-words text-[11px] leading-5 text-slate-300">
                  {item.description}
                </p>

                <p className="mt-2 text-[10px] text-cyan-300/80">
                  {item.time}
                </p>
              </div>

              {!item.read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink-400" />
              )}
            </button>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.10] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 transition hover:text-cyan-200 disabled:opacity-40"
          >
            <Check size={14} />
            Mark all read
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 transition hover:text-red-300"
          >
            <Trash2 size={13} />
            Clear all
          </button>
        </div>
      )}
    </motion.div>,
    document.body
  );
}

// =========================================================
// MAIN HR DASHBOARD
// =========================================================

export default function HRDashboard() {
  const [user] = useState(getUser);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState("");

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const bellRef = useRef(null);

  const userId = String(
    user?._id ||
      user?.id ||
      user?.email ||
      "hr"
  );

  const readKey =
    `hirenexus_hr_read_notifications_${userId}`;

  const clearedKey =
    `hirenexus_hr_cleared_notifications_${userId}`;

  const [readNotifications, setReadNotifications] =
    useState(() => readStorageArray(readKey));

  const [
    clearedNotifications,
    setClearedNotifications,
  ] = useState(() => readStorageArray(clearedKey));

  // =======================================================
  // LOAD NOTIFICATION STATE
  // =======================================================

  useEffect(() => {
    setReadNotifications(
      readStorageArray(readKey)
    );

    setClearedNotifications(
      readStorageArray(clearedKey)
    );
  }, [readKey, clearedKey]);

  // =======================================================
  // FETCH JOBS
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      const token = getToken();

      if (!token) {
        if (mounted) {
          setLoading(false);
          setJobError(
            "Please log in to view HR jobs."
          );
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/jobs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!mounted) return;

        if (response.ok) {
          setJobs(
            safeArray(
              Array.isArray(data)
                ? data
                : data.jobs || data.data || []
            )
          );
        } else {
          setJobError(
            "Unable to load jobs from the HR backend."
          );
        }
      } catch (error) {
        if (mounted) {
          console.error(
            "HR dashboard error:",
            error
          );

          setJobError(
            "Could not connect to the recruitment backend."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  // =======================================================
  // BUILD NOTIFICATIONS
  // =======================================================

  const notifications = useMemo(() => {
    return jobs
      .map((job, index) => {
        const date = getJobDate(job);
        const id = `job-${getJobId(job, index)}`;

        return {
          id,
          title: "Job role available",
          description: `${
            job.title || "Untitled Position"
          } — ${
            job.company || "Hiring Organization"
          }`,
          time: formatTime(date),
          timestamp: date
            ? new Date(date).getTime() || 0
            : 0,
          read: readNotifications.includes(id),
        };
      })
      .filter(
        (item) =>
          !clearedNotifications.includes(item.id)
      )
      .sort(
        (a, b) =>
          b.timestamp - a.timestamp
      );
  }, [
    jobs,
    readNotifications,
    clearedNotifications,
  ]);

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  // =======================================================
  // NOTIFICATION ACTIONS
  // =======================================================

  const markNotificationRead = (id) => {
    setReadNotifications((previous) => {
      const updated = [
        ...new Set([...previous, id]),
      ];

      saveStorageArray(readKey, updated);
      return updated;
    });
  };

  const markAllRead = () => {
    setReadNotifications((previous) => {
      const updated = [
        ...new Set([
          ...previous,
          ...notifications.map((item) => item.id),
        ]),
      ];

      saveStorageArray(readKey, updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setClearedNotifications((previous) => {
      const updated = [
        ...new Set([
          ...previous,
          ...notifications.map((item) => item.id),
        ]),
      ];

      saveStorageArray(clearedKey, updated);
      return updated;
    });
  };

  // =======================================================
  // MOBILE SIDEBAR
  // =======================================================

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [sidebarOpen]);

  // =======================================================
  // HR NAVIGATION - SETTINGS FIXED
  // =======================================================

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/hr-dashboard",
      active: true,
    },
    {
      label: "Create Job",
      icon: Plus,
      path: "/hr/create-job",
    },
    {
      label: "Candidates",
      icon: Users,
      path: "/hr/candidates",
    },
    {
      label: "Reports",
      icon: BarChart3,
      path: "/hr/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/hr/settings",
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        {/* ===============================================
            TOP NAVBAR
        =============================================== */}

        <header className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-white/[0.15] bg-[#071329]/65 shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:left-[300px] lg:right-6">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-white/10 p-2 text-slate-200 lg:hidden"
                aria-label="Open HR navigation"
              >
                <Menu size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    AI System Online
                  </span>
                </div>

                <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                  Recruitment command center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                ref={bellRef}
                type="button"
                aria-label="HR notifications"
                aria-expanded={notificationOpen}
                onClick={() =>
                  setNotificationOpen(
                    (previous) => !previous
                  )
                }
                className={`
                  relative flex h-10 w-10
                  shrink-0 items-center justify-center
                  rounded-xl border transition
                  ${
                    notificationOpen
                      ? "border-cyan-300/50 bg-cyan-400/[0.12] text-cyan-300"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-cyan-300/30 hover:text-white"
                  }
                `}
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-0.5 text-[9px] font-bold text-white">
                    {unreadCount > 9
                      ? "9+"
                      : unreadCount}
                  </span>
                )}
              </button>

              <div className="hidden h-7 w-px bg-white/15 sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/[0.08]">
                  <UserRound
                    size={16}
                    className="text-cyan-300"
                  />
                </div>

                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-white">
                    {user?.name || "HR Manager"}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Recruiter
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="hidden text-slate-400 sm:block"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ===============================================
            NOTIFICATION PORTAL
        =============================================== */}

        <AnimatePresence>
          {notificationOpen && (
            <NotificationDropdown
              notifications={notifications}
              anchorRef={bellRef}
              onClose={() =>
                setNotificationOpen(false)
              }
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllRead}
              onClearAll={clearAllNotifications}
            />
          )}
        </AnimatePresence>

        {/* ===============================================
            MOBILE SIDEBAR BACKDROP
        =============================================== */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close HR navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[65] bg-black/65 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ===============================================
            SIDEBAR
        =============================================== */}

        <aside
          className={`
            fixed bottom-5 left-5 top-5
            z-[70] flex w-[250px]
            max-w-[calc(100vw-40px)]
            flex-col rounded-3xl
            border border-white/[0.13]
            bg-[#071329]/70 px-5 py-6
            shadow-[0_15px_50px_rgba(0,0,0,0.15)]
            backdrop-blur-xl
            transition-transform duration-300
            lg:z-40 lg:translate-x-0
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-[125%]"
            }
          `}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
                <Sparkles
                  size={22}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-lg font-bold">
                  Hire
                  <span className="text-cyan-300">
                    Nexus
                  </span>
                </p>

                <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400">
                  AI Recruitment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="text-slate-300 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-12 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
            <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              HR Workspace
            </p>

            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(item.path);
                    }}
                    className={`
                      flex w-full items-center gap-4
                      rounded-xl px-4 py-3.5
                      text-left text-sm transition
                      ${
                        item.active
                          ? "border border-violet-300/[0.08] bg-violet-400/[0.12] font-semibold text-white"
                          : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={
                        item.active
                          ? "text-violet-300"
                          : "text-slate-400"
                      }
                    />

                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 shrink-0">
            <div className="border-t border-white/[0.12] pt-5">
              <div className="flex items-center gap-3">
                <BrainCircuit
                  size={20}
                  className="text-cyan-300"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    AI Core
                  </p>

                  <p className="text-[9px] text-emerald-300">
                    ONLINE
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-5 flex w-full items-center gap-3 px-2 py-3 text-xs text-slate-400 transition hover:text-red-300"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* ===============================================
            MAIN CONTENT
        =============================================== */}

        <main className="min-w-0 lg:ml-[275px]">
          <div className="px-5 pb-10 pt-28 sm:px-7 lg:px-9 lg:pt-32">
            {jobError && (
              <div className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs text-amber-200">
                {jobError}
              </div>
            )}

            {/* ===========================================
                HERO SECTION
            =========================================== */}

            <section className="relative min-h-[510px]">
              <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-500/[0.07] blur-3xl" />

              <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/[0.06] blur-3xl" />

              <div className="relative grid min-h-[510px] items-center gap-4 lg:grid-cols-[1fr_0.95fr]">
                <div>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-500/[0.04] px-3 py-1.5"
                  >
                    <Zap
                      size={13}
                      className="text-violet-300"
                    />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                      Recruitment Intelligence
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
                  >
                    Build better

                    <span className="block bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                      teams with AI.
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ delay: 0.18 }}
                    className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base"
                  >
                    Analyze talent, discover high-potential
                    candidates and accelerate your hiring
                    decisions with HireNexus recruitment
                    intelligence.
                  </motion.p>

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{ delay: 0.26 }}
                    className="mt-7 flex flex-wrap gap-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/hr/create-job")
                      }
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.15)] transition hover:shadow-[0_0_45px_rgba(34,211,238,0.20)]"
                    >
                      <Plus size={17} />
                      Create Job

                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/hr/candidates")
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/[0.18] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/30 hover:text-white"
                    >
                      <Users size={17} />
                      Explore Candidates
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-7 flex flex-wrap gap-5"
                  >
                    {[
                      "NLP Screening",
                      "Semantic Matching",
                      "LLM Intelligence",
                    ].map((label, index) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-400"
                      >
                        <span
                          className={`
                            h-1.5 w-1.5 rounded-full
                            ${
                              index === 0
                                ? "bg-violet-300"
                                : index === 1
                                ? "bg-cyan-300"
                                : "bg-pink-300"
                            }
                          `}
                        />

                        {label}
                      </div>
                    ))}
                  </motion.div>
                </div>

                <NeuralRecruiterCore />
              </div>
            </section>

            {/* ===========================================
                STATISTICS
            =========================================== */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={BriefcaseBusiness}
                label="Active Jobs"
                value={loading ? "—" : jobs.length}
                description="Your published job roles"
                accent="cyan"
                delay={0.1}
              />

              <StatCard
                icon={Users}
                label="Candidates"
                value="—"
                description="Screening analytics"
                accent="violet"
                delay={0.16}
              />

              <StatCard
                icon={Target}
                label="Avg. Match"
                value="—"
                description="Semantic compatibility"
                accent="emerald"
                delay={0.22}
              />

              <StatCard
                icon={BrainCircuit}
                label="AI Engine"
                value="ON"
                description="Recruitment intelligence"
                accent="pink"
                delay={0.28}
              />
            </section>

            {/* ===========================================
                INTELLIGENCE SECTION
            =========================================== */}

            <section className="mt-10 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
              <GlassCard
                className="p-5 sm:p-6"
                delay={0.32}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Talent Pipeline
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Recruitment Intelligence
                    </h2>
                  </div>

                  <Activity
                    size={20}
                    className="text-cyan-300"
                  />
                </div>

                <div className="mt-7 space-y-6">
                  <PipelineItem
                    label="Resume Analysis"
                    value="Active"
                    percentage={86}
                    color="bg-gradient-to-r from-cyan-400 to-cyan-300"
                  />

                  <PipelineItem
                    label="Semantic Screening"
                    value="Ready"
                    percentage={72}
                    color="bg-gradient-to-r from-violet-400 to-fuchsia-400"
                  />

                  <PipelineItem
                    label="Interview Intelligence"
                    value="Ready"
                    percentage={64}
                    color="bg-gradient-to-r from-pink-400 to-violet-400"
                  />

                  <PipelineItem
                    label="Candidate Reports"
                    value="Building"
                    percentage={48}
                    color="bg-gradient-to-r from-cyan-400 to-violet-400"
                  />
                </div>
              </GlassCard>

              <GlassCard
                className="p-5 sm:p-6"
                delay={0.38}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Command Actions
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Recruitment Tools
                    </h2>
                  </div>

                  <Sparkles
                    size={20}
                    className="text-violet-300"
                  />
                </div>

                <div className="mt-5">
                  <QuickAction
                    icon={Plus}
                    title="Create New Job"
                    description="Build an AI-ready job role"
                    onClick={() =>
                      navigate("/hr/create-job")
                    }
                  />

                  <QuickAction
                    icon={Users}
                    title="Review Candidates"
                    description="Explore screened talent"
                    onClick={() =>
                      navigate("/hr/candidates")
                    }
                  />

                  <QuickAction
                    icon={BarChart3}
                    title="Open Reports"
                    description="View recruitment intelligence"
                    onClick={() =>
                      navigate("/hr/reports")
                    }
                  />
                </div>
              </GlassCard>
            </section>

            {/* ===========================================
                JOBS AND AI STATUS
            =========================================== */}

            <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.75fr]">
              <GlassCard
                className="p-5 sm:p-6"
                delay={0.44}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Hiring Workspace
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Active Job Roles
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/hr/create-job")
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-300"
                  >
                    Add Job
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="mt-5">
                  {loading ? (
                    <div className="py-10 text-center text-xs text-slate-300">
                      Loading recruitment intelligence...
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="border-t border-white/[0.10] py-10 text-center">
                      <BriefcaseBusiness
                        size={28}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-4 text-sm font-medium text-slate-200">
                        No job roles yet
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Create your first job to activate
                        the talent pipeline.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigate("/hr/create-job")
                        }
                        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300"
                      >
                        <Plus size={15} />
                        Create First Job
                      </button>
                    </div>
                  ) : (
                    jobs
                      .slice(0, 5)
                      .map((job, index) => (
                        <JobCard
                          key={getJobId(job, index)}
                          job={job}
                          index={index}
                        />
                      ))
                  )}
                </div>
              </GlassCard>

              <GlassCard
                className="p-5 sm:p-6"
                delay={0.5}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      AI System
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Intelligence Status
                    </h2>
                  </div>

                  <BrainCircuit
                    size={20}
                    className="text-cyan-300"
                  />
                </div>

                <div className="mt-7 space-y-5">
                  {[
                    ["Resume Parser", "ONLINE"],
                    ["Semantic Matcher", "ONLINE"],
                    ["AI Interview", "ONLINE"],
                    ["Report Engine", "READY"],
                  ].map(([name, status]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between border-b border-white/[0.10] pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                        <span className="text-xs text-slate-300">
                          {name}
                        </span>
                      </div>

                      <span className="text-[9px] font-semibold tracking-wider text-emerald-300">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-white/[0.10] pt-5">
                  <Search
                    size={17}
                    className="text-violet-300"
                  />

                  <p className="text-[10px] leading-5 text-slate-400">
                    AI recruitment intelligence is ready
                    for your next hiring cycle.
                  </p>
                </div>
              </GlassCard>
            </section>

            {/* ===========================================
                FOOTER
            =========================================== */}

            <footer className="pb-3 pt-10 text-center">
              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500">
                HIRENEXUS • AI RECRUITMENT INTELLIGENCE
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
