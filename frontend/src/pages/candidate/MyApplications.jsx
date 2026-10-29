
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const goTo = (path) => {
  window.location.href = path;
};

const STATUS_OPTIONS = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
  "Withdrawn",
];

/* =========================================================
   ORIGINAL SKY BACKGROUND
========================================================= */

function GlobalNightSky() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let animationFrame;

    const particles = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();

    const particleCount = Math.min(
      125,
      Math.max(50, Math.floor(window.innerWidth / 13))
    );

    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.9 + 0.35,
        speedX: (Math.random() - 0.5) * 0.16,
        speedY: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.65 + 0.12,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.22,
        0,
        width * 0.5,
        height * 0.22,
        Math.max(width, height) * 0.9
      );

      gradient.addColorStop(
        0,
        "rgba(79, 70, 229, 0.13)"
      );

      gradient.addColorStop(
        0.38,
        "rgba(37, 99, 235, 0.055)"
      );

      gradient.addColorStop(
        0.72,
        "rgba(15, 23, 42, 0.02)"
      );

      gradient.addColorStop(
        1,
        "rgba(2, 6, 23, 0)"
      );

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += 0.012;

        if (particle.x < -10) {
          particle.x = width + 10;
        }

        if (particle.x > width + 10) {
          particle.x = -10;
        }

        if (particle.y < -10) {
          particle.y = height + 10;
        }

        if (particle.y > height + 10) {
          particle.y = -10;
        }

        const alpha =
          particle.opacity *
          (0.72 + Math.sin(particle.pulse) * 0.28);

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

/* =========================================================
   AMBIENT BACKGROUND
========================================================= */

function AmbientBackground() {
  return (
    <>
      {/* Top blue glow */}
      <div
        className="
          pointer-events-none fixed
          -left-32 -top-32
          z-0
          h-[420px] w-[420px]
          rounded-full
          bg-blue-500/[0.12]
          blur-[130px]
          animate-pulse
        "
      />

      {/* Purple glow */}
      <div
        className="
          pointer-events-none fixed
          right-[-120px] top-[20%]
          z-0
          h-[500px] w-[500px]
          rounded-full
          bg-purple-500/[0.11]
          blur-[150px]
        "
      />

      {/* Cyan glow */}
      <div
        className="
          pointer-events-none fixed
          bottom-[-160px] left-[30%]
          z-0
          h-[520px] w-[520px]
          rounded-full
          bg-cyan-400/[0.08]
          blur-[150px]
        "
      />

      {/* Pink glow */}
      <div
        className="
          pointer-events-none fixed
          right-[25%] top-[55%]
          z-0
          h-[280px] w-[280px]
          rounded-full
          bg-fuchsia-500/[0.06]
          blur-[120px]
        "
      />
    </>
  );
}

/* =========================================================
   STATUS STYLE
========================================================= */

function getStatusStyle(status) {
  switch (status) {
    case "Applied":
      return {
        text: "text-cyan-200",
        bg: "bg-cyan-400/[0.08]",
        border: "border-cyan-300/30",
        dot: "bg-cyan-300",
        glow: "shadow-[0_0_18px_rgba(34,211,238,0.18)]",
      };

    case "Under Review":
      return {
        text: "text-yellow-200",
        bg: "bg-yellow-400/[0.08]",
        border: "border-yellow-300/30",
        dot: "bg-yellow-300",
        glow: "shadow-[0_0_18px_rgba(250,204,21,0.14)]",
      };

    case "Shortlisted":
      return {
        text: "text-blue-200",
        bg: "bg-blue-400/[0.08]",
        border: "border-blue-300/30",
        dot: "bg-blue-300",
        glow: "shadow-[0_0_18px_rgba(96,165,250,0.16)]",
      };

    case "Interview":
      return {
        text: "text-purple-200",
        bg: "bg-purple-400/[0.08]",
        border: "border-purple-300/30",
        dot: "bg-purple-300",
        glow: "shadow-[0_0_18px_rgba(192,132,252,0.18)]",
      };

    case "Hired":
      return {
        text: "text-emerald-200",
        bg: "bg-emerald-400/[0.08]",
        border: "border-emerald-300/30",
        dot: "bg-emerald-300",
        glow: "shadow-[0_0_18px_rgba(52,211,153,0.18)]",
      };

    case "Rejected":
      return {
        text: "text-red-200",
        bg: "bg-red-400/[0.08]",
        border: "border-red-300/30",
        dot: "bg-red-300",
        glow: "shadow-[0_0_18px_rgba(248,113,113,0.16)]",
      };

    case "Withdrawn":
      return {
        text: "text-orange-200",
        bg: "bg-orange-400/[0.08]",
        border: "border-orange-300/30",
        dot: "bg-orange-300",
        glow: "shadow-[0_0_18px_rgba(251,146,60,0.16)]",
      };

    default:
      return {
        text: "text-slate-200",
        bg: "bg-white/[0.05]",
        border: "border-white/15",
        dot: "bg-slate-300",
        glow: "",
      };
  }
}

/* =========================================================
   DATE
========================================================= */

function formatDate(dateString) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   GLASS STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "cyan",
}) {
  const accentStyles = {
    cyan: {
      icon:
        "border-cyan-300/30 bg-cyan-400/[0.08] text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.12)]",
      glow: "bg-cyan-400/10",
    },

    purple: {
      icon:
        "border-purple-300/30 bg-purple-400/[0.08] text-purple-200 shadow-[0_0_25px_rgba(192,132,252,0.12)]",
      glow: "bg-purple-400/10",
    },

    blue: {
      icon:
        "border-blue-300/30 bg-blue-400/[0.08] text-blue-200 shadow-[0_0_25px_rgba(96,165,250,0.12)]",
      glow: "bg-blue-400/10",
    },

    pink: {
      icon:
        "border-fuchsia-300/30 bg-fuchsia-400/[0.08] text-fuchsia-200 shadow-[0_0_25px_rgba(232,121,249,0.12)]",
      glow: "bg-fuchsia-400/10",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-3xl
        border border-white/15
        bg-white/[0.045]
        backdrop-blur-2xl
        p-5 sm:p-6
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.16)]
        transition-all duration-500
        hover:-translate-y-2
        hover:border-cyan-200/30
        hover:bg-white/[0.065]
      "
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={`
          pointer-events-none absolute
          -right-16 -top-16
          h-40 w-40
          rounded-full
          ${style.glow}
          blur-[70px]
          transition-all duration-700
          group-hover:scale-125
        `}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400/80">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-2xl border
            ${style.icon}
            transition-all duration-500
            group-hover:scale-110
            group-hover:rotate-6
          `}
        >
          {icon}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
  application,
  onView,
  onWithdraw,
}) {
  const cardRef = useRef(null);

  const statusStyle = getStatusStyle(
    application.status
  );

  const handleMouseMove = (event) => {
    const card = cardRef.current;

    if (!card || window.innerWidth < 768) {
      return;
    }

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX =
      ((y / rect.height) - 0.5) * -3;

    const rotateY =
      ((x / rect.width) - 0.5) * 4;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-6px)
    `;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;

    if (!card) return;

    card.style.transform = "";
  };

  const match = Math.min(
    100,
    Math.max(0, Number(application.match) || 0)
  );

  const canWithdraw =
    application.status !== "Rejected" &&
    application.status !== "Hired" &&
    application.status !== "Withdrawn";

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="
        group relative overflow-hidden
        rounded-[28px]
        border border-white/15
        bg-white/[0.045]
        backdrop-blur-2xl
        p-5 sm:p-6 lg:p-7
        shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_25px_80px_rgba(0,0,0,0.22)]
        transition-all duration-500 ease-out
        hover:border-cyan-200/35
        hover:bg-white/[0.065]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_90px_rgba(0,0,0,0.28),0_0_45px_rgba(34,211,238,0.08)]
      "
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glass glow */}

      <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-cyan-400/[0.08] blur-[90px] transition-all duration-700 group-hover:bg-cyan-400/[0.15]" />

      <div className="pointer-events-none absolute -bottom-32 -left-24 h-64 w-64 rounded-full bg-purple-500/[0.07] blur-[100px] transition-all duration-700 group-hover:bg-purple-500/[0.14]" />

      {/* Top glass line */}

      <div className="pointer-events-none absolute left-[8%] right-[8%] top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />

      {/* Main content */}

      <div className="relative z-10">

        {/* TOP */}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div className="flex min-w-0 gap-4">

            <div
              className="
                relative flex h-14 w-14 shrink-0
                items-center justify-center
                overflow-hidden
                rounded-2xl
                border border-cyan-200/25
                bg-gradient-to-br
                from-cyan-400/[0.15]
                via-indigo-500/[0.12]
                to-purple-500/[0.15]
                text-xl font-black text-white
                shadow-[0_0_30px_rgba(99,102,241,0.16)]
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] to-transparent" />

              <span className="relative">
                {application.company
                  ?.charAt(0)
                  ?.toUpperCase() || "C"}
              </span>
            </div>

            <div className="min-w-0">

              <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {application.title ||
                  "Untitled Position"}
              </h3>

              <p className="mt-1 text-sm font-medium text-cyan-100/70">
                {application.company ||
                  "Unknown Company"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">

                <span className="inline-flex items-center gap-1.5">
                  <span className="text-cyan-300/80">
                    ⌖
                  </span>
                  {application.location ||
                    "Not specified"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <span className="text-purple-300/80">
                    ◷
                  </span>
                  {application.type ||
                    "Not specified"}
                </span>

              </div>
            </div>
          </div>

          <div
            className={`
              inline-flex w-fit
              items-center gap-2
              rounded-full
              border
              px-4 py-2
              text-xs font-semibold
              backdrop-blur-xl
              ${statusStyle.bg}
              ${statusStyle.border}
              ${statusStyle.text}
              ${statusStyle.glow}
            `}
          >
            <span
              className={`
                h-2 w-2
                rounded-full
                ${statusStyle.dot}
                shadow-[0_0_10px_currentColor]
              `}
            />

            {application.status || "Applied"}
          </div>
        </div>

        {/* Divider */}

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* DETAILS */}

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Applied
            </p>

            <p className="mt-1.5 text-sm font-medium text-white/80">
              {formatDate(
                application.appliedDate
              )}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Match
            </p>

            <div className="mt-2 flex items-center gap-2">

              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.45)] transition-all duration-700"
                  style={{
                    width: `${match}%`,
                  }}
                />

              </div>

              <span className="text-sm font-bold text-cyan-200">
                {match}%
              </span>

            </div>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Salary
            </p>

            <p className="mt-1.5 text-sm font-medium text-white/80">
              {application.salary ||
                "Not disclosed"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Application ID
            </p>

            <p className="mt-1.5 truncate text-xs font-mono text-slate-400">
              {application.id}
            </p>
          </div>

        </div>

        {/* SKILLS */}

        {application.skills?.length > 0 && (
          <div className="mt-6">

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Relevant Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {application.skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="
                      rounded-xl
                      border border-white/10
                      bg-white/[0.045]
                      px-3 py-1.5
                      text-[11px]
                      font-medium
                      text-slate-300
                      backdrop-blur-xl
                      transition-all duration-300
                      hover:border-cyan-300/30
                      hover:bg-cyan-300/[0.07]
                      hover:text-cyan-100
                    "
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => onView(application)}
            className="
              group/button
              rounded-xl
              border border-cyan-300/25
              bg-cyan-400/[0.08]
              px-5 py-2.5
              text-xs font-semibold
              text-cyan-100
              shadow-[0_0_20px_rgba(34,211,238,0.06)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-cyan-200/50
              hover:bg-cyan-300/[0.14]
              hover:shadow-[0_0_28px_rgba(34,211,238,0.15)]
            "
          >
            View Details
            <span className="ml-2 inline-block transition-transform duration-300 group-hover/button:translate-x-1">
              →
            </span>
          </button>

          {canWithdraw && (
            <button
              type="button"
              onClick={() =>
                onWithdraw(application)
              }
              className="
                rounded-xl
                border border-white/10
                bg-white/[0.035]
                px-5 py-2.5
                text-xs font-medium
                text-slate-400
                backdrop-blur-xl
                transition-all duration-300
                hover:border-red-300/30
                hover:bg-red-400/[0.08]
                hover:text-red-200
              "
            >
              Withdraw
            </button>
          )}

        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  searchActive,
  onClear,
}) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-[28px]
        border border-white/15
        bg-white/[0.035]
        p-10 text-center
        backdrop-blur-2xl
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_25px_70px_rgba(0,0,0,0.2)]
        sm:p-14
      "
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[80px]" />

      <div className="relative z-10">

        <div
          className="
            mx-auto flex h-16 w-16
            items-center justify-center
            rounded-2xl
            border border-cyan-300/25
            bg-cyan-400/[0.07]
            text-2xl text-cyan-200
            shadow-[0_0_30px_rgba(34,211,238,0.1)]
          "
        >
          ◇
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">
          {searchActive
            ? "No applications found"
            : "No applications yet"}
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
          {searchActive
            ? "Try another search term or change the status filter."
            : "Once you apply to a job, your application will appear here."}
        </p>

        {searchActive && (
          <button
            type="button"
            onClick={onClear}
            className="
              mt-5 rounded-xl
              border border-cyan-300/20
              bg-cyan-400/[0.06]
              px-5 py-2.5
              text-xs font-semibold
              text-cyan-100
              transition
              hover:border-cyan-200/40
              hover:bg-cyan-300/[0.12]
            "
          >
            Clear Filters
          </button>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function ErrorState({
  error,
  onRetry,
}) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        border border-red-300/20
        bg-red-400/[0.045]
        p-5
        backdrop-blur-2xl
        shadow-[0_0_40px_rgba(248,113,113,0.06)]
      "
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-red-400/10 blur-[70px]" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-red-200">
            Unable to load applications
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="
            w-fit rounded-xl
            border border-red-300/25
            bg-red-400/[0.08]
            px-5 py-2.5
            text-xs font-semibold
            text-red-100
            transition
            hover:border-red-200/40
            hover:bg-red-400/[0.14]
          "
        >
          Retry
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MyApplications() {
  const [applications, setApplications] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  /* =======================================================
     LOAD REAL APPLICATIONS
  ======================================================= */

  const loadApplications = async () => {
    const token = getToken();

    if (!token) {
      setApplications([]);
      setLoading(false);
      setError(
        "Please login to view your applications."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/applications/my-applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to load applications."
        );
      }

      const backendApplications =
        data?.applications ||
        data?.items ||
        data?.data ||
        [];

      if (!Array.isArray(backendApplications)) {
        throw new Error(
          "Invalid applications response from server."
        );
      }

      setApplications(
        backendApplications
      );
    } catch (err) {
      console.error(
        "Applications API error:",
        err
      );

      setApplications([]);

      setError(
        err?.message ||
          "Unable to load applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredApplications = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return applications.filter(
      (application) => {
        const matchesStatus =
          statusFilter === "All" ||
          application.status ===
            statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          application.title,
          application.company,
          application.location,
          application.status,
          application.type,
          application.salary,
          ...(application.skills || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch
        );
      }
    );
  }, [
    applications,
    search,
    statusFilter,
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: applications.length,

      review: applications.filter(
        (item) =>
          item.status ===
          "Under Review"
      ).length,

      interview: applications.filter(
        (item) =>
          item.status ===
          "Interview"
      ).length,

      shortlisted: applications.filter(
        (item) =>
          item.status ===
          "Shortlisted"
      ).length,
    };
  }, [applications]);

  /* =======================================================
     VIEW
  ======================================================= */

  const handleView = (
    application
  ) => {
    setSelectedApplication(
      application
    );
  };

  /* =======================================================
     WITHDRAW
  ======================================================= */

  const handleWithdraw = async (
    application
  ) => {
    const confirmed =
      window.confirm(
        `Withdraw your application for ${application.title} at ${application.company}?`
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      window.alert(
        "Please login again."
      );
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/applications/${application.id}/withdraw`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to withdraw application."
        );
      }

      setApplications(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              application.id
                ? {
                    ...item,
                    status:
                      "Withdrawn",
                    updated_at:
                      data
                        ?.application
                        ?.updated_at ||
                      item.updated_at,
                  }
                : item
          )
      );

      setSelectedApplication(
        null
      );
    } catch (err) {
      console.error(
        "Withdraw application error:",
        err
      );

      window.alert(
        err?.message ||
          "Unable to withdraw application. Please try again."
      );
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        relative min-h-screen
        overflow-x-hidden
        text-white
        selection:bg-cyan-300/20
        selection:text-cyan-100
      "
    >
      {/* =================================================
          ORIGINAL SKY
      ================================================= */}

      <GlobalNightSky />

      {/* =================================================
          AMBIENT LIGHTS
      ================================================= */}

      <AmbientBackground />

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          relative z-10
          mx-auto w-full
          max-w-[1480px]
          px-4 py-5
          sm:px-6 sm:py-7
          lg:px-8 lg:py-9
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8 sm:mb-10">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              {/* Back */}

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/candidate-dashboard"
                  )
                }
                className="
                  group mb-5
                  inline-flex items-center gap-2
                  rounded-full
                  border border-white/10
                  bg-white/[0.035]
                  px-4 py-2
                  text-xs font-medium
                  text-slate-400
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:border-cyan-300/25
                  hover:bg-cyan-300/[0.05]
                  hover:text-cyan-100
                "
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>

                Back to Dashboard
              </button>

              {/* Title */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    relative flex
                    h-14 w-14 shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-2xl
                    border border-cyan-300/30
                    bg-gradient-to-br
                    from-cyan-400/[0.12]
                    via-indigo-500/[0.10]
                    to-purple-500/[0.14]
                    text-xl text-cyan-100
                    shadow-[0_0_35px_rgba(34,211,238,0.12)]
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] to-transparent" />

                  <span className="relative">
                    ◈
                  </span>
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-cyan-300/80">
                    HIRENEXUS
                  </p>

                  <h1
                    className="
                      mt-1
                      text-3xl font-black
                      tracking-tight
                      text-white
                      sm:text-4xl
                      lg:text-5xl
                    "
                  >
                    My Applications
                  </h1>

                </div>

              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300/65 sm:text-base">
                Track every opportunity you've
                applied for and monitor your
                recruitment journey in one place.
              </p>

            </div>

            {/* Find Jobs */}

            <button
              type="button"
              onClick={() =>
                goTo("/jobs")
              }
              className="
                group
                inline-flex w-fit
                items-center gap-2
                rounded-2xl
                border border-cyan-300/30
                bg-gradient-to-r
                from-cyan-400/[0.10]
                to-indigo-500/[0.10]
                px-5 py-3
                text-sm font-semibold
                text-cyan-100
                backdrop-blur-xl
                shadow-[0_0_25px_rgba(34,211,238,0.07)]
                transition-all duration-300
                hover:-translate-y-1
                hover:border-cyan-200/50
                hover:bg-cyan-300/[0.14]
                hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]
              "
            >
              <span className="text-lg transition-transform duration-300 group-hover:rotate-90">
                +
              </span>

              Find More Jobs
            </button>

          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section
          className="
            mb-7
            grid grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <StatCard
            title="Total Applications"
            value={stats.total}
            subtitle="All submitted applications"
            icon="◈"
            accent="cyan"
          />

          <StatCard
            title="Under Review"
            value={stats.review}
            subtitle="Currently being reviewed"
            icon="◌"
            accent="purple"
          />

          <StatCard
            title="Interviews"
            value={stats.interview}
            subtitle="Interview stage"
            icon="◇"
            accent="blue"
          />

          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            subtitle="Moved forward"
            icon="✦"
            accent="pink"
          />

        </section>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <section
          className="
            mb-7
            rounded-3xl
            border border-white/15
            bg-white/[0.035]
            p-4
            backdrop-blur-2xl
            shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_60px_rgba(0,0,0,0.16)]
            sm:p-5
          "
        >

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* Search */}

            <div className="relative w-full xl:max-w-md">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/60">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search company, role, skill..."
                className="
                  w-full
                  rounded-2xl
                  border border-white/10
                  bg-black/[0.12]
                  py-3.5 pl-11 pr-4
                  text-sm text-white
                  outline-none
                  placeholder:text-slate-500
                  backdrop-blur-xl
                  transition-all duration-300
                  focus:border-cyan-300/35
                  focus:bg-cyan-300/[0.025]
                  focus:shadow-[0_0_25px_rgba(34,211,238,0.07)]
                "
              />

            </div>

            {/* Status */}

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">

              {STATUS_OPTIONS.map(
                (status) => {
                  const active =
                    statusFilter ===
                    status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          status
                        )
                      }
                      className={`
                        whitespace-nowrap
                        rounded-xl
                        border
                        px-3.5 py-2.5
                        text-xs font-semibold
                        backdrop-blur-xl
                        transition-all duration-300
                        ${
                          active
                            ? "border-cyan-300/40 bg-gradient-to-r from-cyan-300/[0.14] to-indigo-400/[0.14] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
                            : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                        }
                      `}
                    >
                      {status}
                    </button>
                  );
                }
              )}

            </div>

          </div>
        </section>

        {/* =================================================
            LIST HEADER
        ================================================= */}

        <div className="mb-4 flex items-end justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-white">
              Applications
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-cyan-200">
                {filteredApplications.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white/70">
                {applications.length}
              </span>{" "}
              applications
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-200/70">

              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />

              Syncing
            </div>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <ErrorState
            error={error}
            onRetry={loadApplications}
          />
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <section className="grid gap-5">

            {[1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="
                    animate-pulse
                    rounded-[28px]
                    border border-white/10
                    bg-white/[0.035]
                    p-6
                    backdrop-blur-2xl
                  "
                >

                  <div className="flex gap-4">

                    <div className="h-14 w-14 rounded-2xl bg-white/10" />

                    <div className="flex-1">

                      <div className="h-5 w-52 rounded-lg bg-white/10" />

                      <div className="mt-3 h-3 w-36 rounded bg-white/5" />

                      <div className="mt-3 h-3 w-72 max-w-full rounded bg-white/5" />

                    </div>

                  </div>

                  <div className="my-6 h-px bg-white/5" />

                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />

                  </div>

                </div>
              )
            )}

          </section>
        ) : !error &&
          filteredApplications.length ===
            0 ? (
          <EmptyState
            searchActive={
              Boolean(
                search.trim()
              ) ||
              statusFilter !==
                "All"
            }
            onClear={
              clearFilters
            }
          />
        ) : (
          <section className="grid gap-5">

            {filteredApplications.map(
              (application) => (
                <ApplicationCard
                  key={
                    application.id
                  }
                  application={
                    application
                  }
                  onView={
                    handleView
                  }
                  onWithdraw={
                    handleWithdraw
                  }
                />
              )
            )}

          </section>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-12 border-t border-white/10 py-7 text-center">

          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            HIRENEXUS
          </p>

          <p className="mt-2 text-[11px] text-slate-600">
            AI Recruitment Intelligence
          </p>

        </footer>

      </main>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedApplication && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/45
            p-3
            backdrop-blur-xl
            sm:p-5
          "
          onClick={() =>
            setSelectedApplication(
              null
            )
          }
        >

          <div
            className="
              relative
              max-h-[92vh]
              w-full max-w-2xl
              overflow-y-auto
              rounded-[30px]
              border border-cyan-200/25
              bg-slate-950/[0.72]
              p-5
              backdrop-blur-3xl
              shadow-[0_0_80px_rgba(34,211,238,0.10),0_30px_100px_rgba(0,0,0,0.55)]
              sm:p-7
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-[90px]" />

            {/* top line */}

            <div className="pointer-events-none absolute left-[8%] right-[8%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />

            <div className="relative z-10">

              {/* Header */}

              <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 gap-4">

                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-2xl
                      border border-cyan-300/25
                      bg-cyan-400/[0.08]
                      text-lg font-black
                      text-cyan-100
                      shadow-[0_0_25px_rgba(34,211,238,0.10)]
                    "
                  >
                    {selectedApplication.company
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "C"}
                  </div>

                  <div className="min-w-0">

                    <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-300/80">
                      Application Details
                    </p>

                    <h2 className="mt-1.5 text-xl font-black text-white sm:text-2xl">
                      {selectedApplication.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {selectedApplication.company}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(
                      null
                    )
                  }
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-white/[0.04]
                    text-slate-400
                    transition
                    hover:border-cyan-300/30
                    hover:bg-cyan-300/[0.07]
                    hover:text-white
                  "
                >
                  ×
                </button>

              </div>

              {/* Status */}

              <div className="mt-6 flex flex-wrap items-center gap-3">

                <div
                  className={`
                    inline-flex items-center gap-2
                    rounded-full border
                    px-3 py-1.5
                    text-xs font-semibold
                    ${getStatusStyle(
                      selectedApplication.status
                    ).bg}
                    ${getStatusStyle(
                      selectedApplication.status
                    ).border}
                    ${getStatusStyle(
                      selectedApplication.status
                    ).text}
                  `}
                >

                  <span
                    className={`
                      h-1.5 w-1.5
                      rounded-full
                      ${getStatusStyle(
                        selectedApplication.status
                      ).dot}
                    `}
                  />

                  {
                    selectedApplication.status
                  }

                </div>

                <span className="text-xs text-slate-500">
                  ID:{" "}
                  <span className="font-mono text-slate-400">
                    {
                      selectedApplication.id
                    }
                  </span>
                </span>

              </div>

              {/* Information grid */}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Match
                  </p>

                  <p className="mt-1 text-lg font-bold text-cyan-200">
                    {Number(
                      selectedApplication.match
                    ) || 0}
                    %
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Applied
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/80">
                    {formatDate(
                      selectedApplication.appliedDate
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Job Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/80">
                    {
                      selectedApplication.type
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/80">
                    {
                      selectedApplication.location ||
                      "Not specified"
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Salary
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/80">
                    {
                      selectedApplication.salary ||
                      "Not disclosed"
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                    Resume
                  </p>

                  <p className="mt-1 truncate text-xs font-mono text-slate-400">
                    {
                      selectedApplication.resume_id ||
                      "Not attached"
                    }
                  </p>
                </div>

              </div>

              {/* Skills */}

              {selectedApplication.skills?.length >
                0 && (
                <div className="mt-6">

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Relevant Skills
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {selectedApplication.skills.map(
                      (
                        skill,
                        index
                      ) => (
                        <span
                          key={`${skill}-${index}`}
                          className="
                            rounded-xl
                            border border-cyan-300/15
                            bg-cyan-300/[0.045]
                            px-3 py-1.5
                            text-xs font-medium
                            text-cyan-100/75
                          "
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>
                </div>
              )}

              {/* Cover Letter */}

              {selectedApplication.cover_letter && (
                <div className="mt-6">

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Cover Letter
                  </p>

                  <div
                    className="
                      mt-3
                      rounded-2xl
                      border border-white/10
                      bg-white/[0.03]
                      p-4
                      backdrop-blur-xl
                    "
                  >
                    <p className="text-sm leading-6 text-slate-300/80">
                      {
                        selectedApplication.cover_letter
                      }
                    </p>
                  </div>

                </div>
              )}

              {/* Recruiter note */}

              {selectedApplication.recruiter_note && (
                <div className="mt-6">

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Recruiter Note
                  </p>

                  <div
                    className="
                      mt-3
                      rounded-2xl
                      border border-purple-300/15
                      bg-purple-400/[0.035]
                      p-4
                    "
                  >
                    <p className="text-sm leading-6 text-slate-300/80">
                      {
                        selectedApplication.recruiter_note
                      }
                    </p>
                  </div>

                </div>
              )}

              {/* Actions */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() => {
                    const jobId =
                      selectedApplication.job_id;

                    setSelectedApplication(
                      null
                    );

                    if (jobId) {
                      goTo(
                        `/jobs?job_id=${encodeURIComponent(
                          jobId
                        )}`
                      );
                    } else {
                      goTo("/jobs");
                    }
                  }}
                  className="
                    group flex-1
                    rounded-2xl
                    border border-cyan-300/30
                    bg-gradient-to-r
                    from-cyan-400/[0.10]
                    to-indigo-500/[0.12]
                    px-5 py-3
                    text-sm font-semibold
                    text-cyan-100
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-cyan-200/50
                    hover:bg-cyan-300/[0.15]
                    hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]
                  "
                >
                  View Job

                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedApplication(
                      null
                    )
                  }
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-white/[0.035]
                    px-6 py-3
                    text-sm font-medium
                    text-slate-400
                    transition-all duration-300
                    hover:border-white/20
                    hover:bg-white/[0.07]
                    hover:text-white
                  "
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
