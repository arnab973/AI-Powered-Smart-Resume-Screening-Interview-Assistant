
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function navigate(path) {
  window.location.assign(path);
}

// =========================================================
// SHARED STYLES
// =========================================================

const inputClass = `
  w-full
  rounded-xl
  border border-white/20
  bg-[#0B1930]/90
  text-white
  placeholder:text-slate-300
  outline-none
  transition-all duration-300
  focus:border-cyan-300/70
  focus:bg-[#10213D]/95
  focus:ring-2
  focus:ring-cyan-400/10
  shadow-[0_4px_18px_rgba(0,0,0,0.12)]
`;

const labelClass = `
  mb-2.5 block
  text-[11px]
  font-bold
  uppercase
  tracking-[0.16em]
  text-slate-200
`;

const glassCardClass = `
  rounded-2xl
  border border-white/15
  bg-[#0B1930]/90
  p-5 sm:p-6
  shadow-[0_12px_40px_rgba(0,0,0,0.18)]
  backdrop-blur-xl
`;

// =========================================================
// SKILL TAG
// =========================================================

function SkillTag({ skill, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="
        inline-flex max-w-full items-center gap-2
        rounded-full
        border border-cyan-300/30
        bg-cyan-400/10
        px-3 py-2
      "
    >
      <span
        className="
          h-1.5 w-1.5 shrink-0
          rounded-full bg-cyan-300
          shadow-[0_0_8px_rgba(34,211,238,0.8)]
        "
      />

      <span className="break-all text-xs font-medium text-slate-100">
        {skill}
      </span>

      <button
        type="button"
        onClick={() => onRemove(skill)}
        aria-label={`Remove ${skill}`}
        className="
          shrink-0 text-slate-300
          transition hover:text-red-300
        "
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// =========================================================
// INPUT FIELD
// =========================================================

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && (
          <span className="ml-1 text-cyan-300">*</span>
        )}
      </label>

      <div className="relative">
        <Icon
          size={18}
          className="
            pointer-events-none
            absolute left-4 top-1/2
            -translate-y-1/2
            text-cyan-300
          "
        />

        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={`
            ${inputClass}
            min-h-[54px]
            py-3.5 pl-11 pr-4
            text-sm
          `}
        />
      </div>
    </div>
  );
}

// =========================================================
// SKILL INPUT
// =========================================================

function SkillInput({
  label,
  skills,
  setSkills,
  placeholder,
  accent = "cyan",
}) {
  const [value, setValue] = useState("");

  const isViolet = accent === "violet";

  const addSkill = () => {
    const skill = value.trim();

    if (!skill) return;

    const exists = skills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (!exists) {
      setSkills((previous) => [...previous, skill]);
    }

    setValue("");
  };

  const removeSkill = (skill) => {
    setSkills((previous) =>
      previous.filter((item) => item !== skill)
    );
  };

  return (
    <div className="min-w-0">
      <label
        className={`
          ${labelClass}
          ${isViolet ? "text-violet-200" : "text-cyan-200"}
        `}
      >
        {label}
      </label>

      <div className="flex items-stretch gap-2.5">
        <input
          type="text"
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill();
            }
          }}
          placeholder={placeholder}
          className={`
            ${inputClass}
            min-w-0 flex-1
            px-4 py-3.5
            text-sm
          `}
        />

        <button
          type="button"
          onClick={addSkill}
          aria-label={`Add ${label}`}
          className={`
            flex h-[54px] w-[54px]
            shrink-0 items-center justify-center
            rounded-xl border
            transition-all duration-300
            ${
              isViolet
                ? "border-violet-300/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20"
                : "border-cyan-300/35 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20"
            }
          `}
        >
          <Plus size={21} />
        </button>
      </div>

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillTag
              key={skill}
              skill={skill}
              onRemove={removeSkill}
            />
          ))}
        </div>
      )}

      <p className="mt-2 text-xs leading-5 text-slate-300">
        Type a skill and press Enter or the + button.
      </p>
    </div>
  );
}

// =========================================================
// AI JOB CORE
// =========================================================

function AIJobCore() {
  return (
    <div
      className="
        relative mx-auto
        flex h-[210px] w-full
        max-w-[460px]
        items-center justify-center
        overflow-hidden
        sm:h-[250px]
        lg:h-[280px]
      "
    >
      {/* OUTER ROTATING RING */}

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          h-40 w-40
          rounded-full
          border border-dashed border-cyan-300/20
          sm:h-52 sm:w-52
        "
      />

      {/* INNER ROTATING RING */}

      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          h-32 w-32
          rounded-full
          border border-dashed border-violet-300/20
          sm:h-40 sm:w-40
        "
      />

      {/* BACKGROUND GLOW */}

      <div
        className="
          absolute h-40 w-40
          rounded-full
          bg-cyan-400/10
          blur-3xl
        "
      />

      {/* FLOATING AI CORE */}

      <motion.div
        animate={{
          y: [0, -8, 0],
          rotateY: [-8, 8, -8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <div
          className="
            relative flex
            h-28 w-28
            items-center justify-center
            rounded-[28px]
            border border-cyan-200/30
            bg-gradient-to-br
            from-cyan-100/15
            via-[#071426]
            to-violet-500/15
            shadow-[0_0_65px_rgba(34,211,238,0.16)]
            sm:h-32 sm:w-32
          "
          style={{
            transform:
              "perspective(600px) rotateX(8deg) rotateY(-12deg)",
          }}
        >
          <div
            className="
              absolute inset-3
              rounded-[23px]
              border border-white/10
              bg-[#020617]/90
            "
          />

          <div className="relative z-10">
            <BrainCircuit
              size={46}
              strokeWidth={1.3}
              className="text-cyan-300"
            />

            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                absolute -right-2 -top-2
                h-3 w-3 rounded-full
                bg-violet-300
                shadow-[0_0_15px_rgba(167,139,250,0.9)]
              "
            />
          </div>
        </div>
      </motion.div>

      {/* AI JOB BUILDER BADGE */}

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute right-1 top-3
          border border-cyan-300/25
          bg-[#071426]/90
          px-3 py-2
          backdrop-blur-md
          sm:right-3
        "
      >
        <div className="flex items-center gap-2">
          <Sparkles
            size={13}
            className="text-cyan-300"
          />

          <span
            className="
              text-[9px] font-semibold
              uppercase tracking-wider
              text-cyan-200
            "
          >
            AI Job Builder
          </span>
        </div>
      </motion.div>

      {/* SEMANTIC READY BADGE */}

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute bottom-3 left-1
          border border-violet-300/25
          bg-[#071426]/90
          px-3 py-2
          backdrop-blur-md
          sm:left-3
        "
      >
        <div className="flex items-center gap-2">
          <Target
            size={13}
            className="text-violet-300"
          />

          <span
            className="
              text-[9px] font-semibold
              uppercase tracking-wider
              text-violet-200
            "
          >
            Semantic Ready
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// =========================================================
// AI STATUS ROW
// =========================================================

function AIStatusRow({ label, status, color = "green" }) {
  return (
    <div
      className="
        flex items-center justify-between
        gap-3 border-b border-white/10
        py-3.5 last:border-b-0
      "
    >
      <span className="text-xs font-medium text-slate-200 sm:text-sm">
        {label}
      </span>

      <span
        className={`
          shrink-0 text-[10px]
          font-bold tracking-wide
          ${
            color === "cyan"
              ? "text-cyan-300"
              : "text-emerald-300"
          }
        `}
      >
        {status}
      </span>
    </div>
  );
}

// =========================================================
// CREATE JOB MAIN COMPONENT
// =========================================================

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const [requiredSkills, setRequiredSkills] =
    useState([]);

  const [preferredSkills, setPreferredSkills] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // =======================================================
  // CREATE JOB API
  // =======================================================

  const createJob = async (event) => {
    event.preventDefault();

    if (loading || success) return;

    setError("");
    setSuccess(false);

    const cleanTitle = title.trim();
    const cleanCompany = company.trim();
    const cleanDescription = description.trim();

    if (cleanTitle.length < 3) {
      setError(
        "Job title must contain at least 3 characters."
      );
      return;
    }

    if (!cleanCompany) {
      setError("Please enter the company name.");
      return;
    }

    if (cleanDescription.length < 20) {
      setError(
        "Job description must contain at least 20 characters."
      );
      return;
    }

    if (requiredSkills.length === 0) {
      setError(
        "Please add at least one required skill."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Authentication token not found. Please log in again."
      );
      return;
    }

    const payload = {
      title: cleanTitle,
      company: cleanCompany,
      description: cleanDescription,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
    };

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/jobs`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        let message = "Failed to create job.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(", ");
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          message =
            typeof data?.detail === "string"
              ? data.detail
              : "Your HR session has expired. Please log in again.";
        }

        throw new Error(message);
      }

      setSuccess(true);

      setTitle("");
      setCompany("");
      setDescription("");
      setRequiredSkills([]);
      setPreferredSkills([]);

      window.setTimeout(() => {
        navigate("/hr-dashboard");
      }, 1300);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the job."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // PAGE UI
  // =======================================================

  return (
    <div
      className="
        relative min-h-screen
        overflow-x-hidden
        bg-[#020617]
        text-white
      "
    >
      {/* ORIGINAL ANIMATED NIGHT SKY */}

      <GlobalNightSky />

      {/* CONTENT LAYER */}

      <div className="relative z-10 min-h-screen">
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            fixed left-3 right-3 top-3 z-50
            rounded-2xl
            border border-white/15
            bg-[#071225]/90
            shadow-[0_10px_35px_rgba(0,0,0,0.25)]
            backdrop-blur-xl
            sm:left-5 sm:right-5 sm:top-4
          "
        >
          <div
            className="
              flex items-center justify-between
              gap-3 px-4 py-3
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate("/hr-dashboard")
              }
              className="
                flex min-w-0 items-center gap-3
                text-white transition
                hover:opacity-85
              "
            >
              <div
                className="
                  flex h-10 w-10
                  shrink-0 items-center justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-violet-500 to-cyan-400
                "
              >
                <Sparkles
                  size={19}
                  className="text-white"
                />
              </div>

              <div className="min-w-0 text-left">
                <p className="text-sm font-bold text-white">
                  Hire
                  <span className="text-cyan-300">
                    Nexus
                  </span>
                </p>

                <p
                  className="
                    hidden text-[9px]
                    font-semibold uppercase
                    tracking-[0.16em]
                    text-slate-300
                    sm:block
                  "
                >
                  HR Command Center
                </p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className="
                  h-2 w-2 animate-pulse
                  rounded-full bg-emerald-300
                  shadow-[0_0_10px_rgba(52,211,153,0.8)]
                "
              />

              <span
                className="
                  text-[9px] font-semibold
                  uppercase tracking-[0.12em]
                  text-emerald-300
                  sm:text-[10px]
                "
              >
                AI Online
              </span>
            </div>
          </div>
        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main
          className="
            mx-auto w-full max-w-7xl
            px-4 pb-16 pt-28
            sm:px-7 sm:pt-32
            lg:px-10
          "
        >
          {/* =================================================
              HERO SECTION
          ================================================= */}

          <section
            className="
              grid items-center
              gap-4
              lg:grid-cols-[1.1fr_0.9fr]
              lg:gap-8
            "
          >
            {/* LEFT HERO */}

            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-violet-300/30
                  bg-violet-400/10
                  px-3 py-2
                "
              >
                <Zap
                  size={14}
                  className="text-violet-300"
                />

                <span
                  className="
                    text-[10px] font-bold
                    uppercase tracking-[0.15em]
                    text-violet-200
                  "
                >
                  AI Job Intelligence
                </span>
              </motion.div>

              {/* FIXED HEADING: NO DESCENDER CLIPPING */}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="
                  mt-6
                  pb-3
                  text-[clamp(2.1rem,5.5vw,3.4rem)]
                  font-bold
                  leading-[1.24]
                  tracking-tight
                  sm:leading-[1.22]
                "
              >
                <span className="block text-white">
                  Create your next
                </span>

                <span
                  className="
                    block
                    pb-[0.18em]
                    leading-[1.28]
                    bg-gradient-to-r
                    from-violet-300
                    via-white
                    to-cyan-300
                    bg-clip-text
                    text-transparent
                  "
                >
                  intelligent role.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="
                  mt-2 max-w-2xl
                  text-sm leading-7
                  text-slate-200
                  sm:text-base sm:leading-8
                "
              >
                Define the role, required capabilities
                and hiring expectations. HireNexus
                will use this information for semantic
                candidate matching.
              </motion.p>
            </div>

            {/* RIGHT AI ROBOT */}

            <AIJobCore />
          </section>

          {/* =================================================
              CREATE JOB FORM
          ================================================= */}

          <motion.form
            onSubmit={createJob}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 sm:mt-8"
          >
            <div
              className="
                grid items-start
                gap-7
                lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]
                lg:gap-9
              "
            >
              {/* ===========================================
                  LEFT SIDE
              =========================================== */}

              <div className="min-w-0">
                {/* SECTION HEADING */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0 items-center justify-center
                      rounded-xl
                      border border-cyan-300/30
                      bg-cyan-400/10
                      text-cyan-300
                    "
                  >
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <p
                      className="
                        text-[10px] font-bold
                        uppercase tracking-[0.17em]
                        text-slate-300
                      "
                    >
                      Role Definition
                    </p>

                    <h2
                      className="
                        mt-1 text-lg
                        font-semibold text-white
                        sm:text-xl
                      "
                    >
                      Position Information
                    </h2>
                  </div>
                </div>

                {/* JOB TITLE + COMPANY */}

                <div
                  className="
                    mt-7 grid
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  <InputField
                    icon={BriefcaseBusiness}
                    label="Job Title"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Full Stack Developer"
                    required
                  />

                  <InputField
                    icon={Building2}
                    label="Company"
                    value={company}
                    onChange={(event) =>
                      setCompany(event.target.value)
                    }
                    placeholder="e.g. HireNexus Technologies"
                    required
                  />
                </div>

                {/* JOB DESCRIPTION */}

                <div className="mt-6">
                  <label className={labelClass}>
                    Job Description
                    <span className="ml-1 text-cyan-300">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={18}
                      className="
                        pointer-events-none
                        absolute left-4 top-4
                        text-cyan-300
                      "
                    />

                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Describe the role, responsibilities, expectations and what the candidate will work on..."
                      rows={8}
                      required
                      className={`
                        ${inputClass}
                        min-h-[190px]
                        resize-y
                        px-11 py-4
                        text-sm leading-7
                        sm:min-h-[220px]
                      `}
                    />
                  </div>

                  <p
                    className="
                      mt-2.5
                      text-xs leading-5
                      text-slate-300
                    "
                  >
                    Include responsibilities and
                    expectations for better AI matching.
                  </p>
                </div>

                {/* REQUIRED SKILLS */}

                <div className="mt-7">
                  <SkillInput
                    label="Required Skills"
                    skills={requiredSkills}
                    setSkills={setRequiredSkills}
                    placeholder="e.g. React, Python, SQL"
                  />
                </div>

                {/* PREFERRED SKILLS */}

                <div className="mt-7">
                  <SkillInput
                    label="Preferred Skills"
                    skills={preferredSkills}
                    setSkills={setPreferredSkills}
                    placeholder="e.g. Docker, AWS, FastAPI"
                    accent="violet"
                  />
                </div>
              </div>

              {/* ===========================================
                  RIGHT SIDE AI PANELS
              =========================================== */}

              <div className="min-w-0 space-y-6">
                {/* AI MATCHING ENGINE */}

                <div className={glassCardClass}>
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        flex h-11 w-11
                        shrink-0 items-center justify-center
                        rounded-xl
                        border border-violet-300/30
                        bg-violet-400/10
                      "
                    >
                      <BrainCircuit
                        size={20}
                        className="text-violet-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-[10px] font-bold
                          uppercase tracking-[0.15em]
                          text-violet-200
                        "
                      >
                        AI Matching Engine
                      </p>

                      <h3
                        className="
                          mt-2 text-sm
                          font-semibold text-white
                          sm:text-base
                        "
                      >
                        Semantic screening ready
                      </h3>

                      <p
                        className="
                          mt-2 text-xs
                          leading-6 text-slate-200
                          sm:text-sm
                        "
                      >
                        Your job description and skills
                        will become the matching criteria
                        for candidate screening.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <AIStatusRow
                      label="NLP Analysis"
                      status="READY"
                    />

                    <AIStatusRow
                      label="Semantic Matching"
                      status="READY"
                    />

                    <AIStatusRow
                      label="AI Screening"
                      status="ENABLED"
                      color="cyan"
                    />
                  </div>
                </div>

                {/* MATCHING SIGNALS */}

                <div className={glassCardClass}>
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-10 w-10
                        shrink-0 items-center justify-center
                        rounded-xl
                        bg-cyan-400/10
                      "
                    >
                      <Target
                        size={19}
                        className="text-cyan-300"
                      />
                    </div>

                    <div>
                      <h3
                        className="
                          text-sm font-semibold
                          text-white
                          sm:text-base
                        "
                      >
                        Matching Signals
                      </h3>

                      <p
                        className="
                          mt-1 text-xs
                          text-slate-300
                        "
                      >
                        Used by the screening engine
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      "Required technical skills",
                      "Preferred technical skills",
                      "Job description semantics",
                      "Resume skill similarity",
                    ].map((item) => (
                      <div
                        key={item}
                        className="
                          flex items-start gap-3
                        "
                      >
                        <CheckCircle2
                          size={17}
                          className="
                            mt-0.5 shrink-0
                            text-cyan-300
                          "
                        />

                        <span
                          className="
                            text-xs leading-6
                            text-slate-200
                            sm:text-sm
                          "
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ERROR MESSAGE */}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="
                      rounded-xl
                      border border-red-400/40
                      bg-red-950/85
                      px-4 py-4
                      text-sm leading-6
                      text-red-100
                    "
                  >
                    {error}
                  </motion.div>
                )}

                {/* SUCCESS MESSAGE */}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    className="
                      flex items-center gap-3
                      rounded-xl
                      border border-emerald-400/40
                      bg-emerald-950/85
                      px-4 py-4
                      text-sm text-emerald-100
                    "
                  >
                    <CheckCircle2
                      size={19}
                      className="shrink-0"
                    />

                    Job created successfully.
                    Redirecting...
                  </motion.div>
                )}

                {/* CREATE JOB BUTTON */}

                <button
                  type="submit"
                  disabled={loading || success}
                  className="
                    group flex w-full
                    min-h-[56px]
                    items-center justify-center
                    gap-3 rounded-xl
                    bg-gradient-to-r
                    from-violet-500 to-cyan-400
                    px-5 py-4
                    text-sm font-bold text-white
                    shadow-[0_0_35px_rgba(34,211,238,0.15)]
                    transition-all duration-300
                    hover:brightness-110
                    hover:shadow-[0_0_50px_rgba(139,92,246,0.25)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="
                          h-5 w-5
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Creating AI Job...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={19} />

                      Job Created
                    </>
                  ) : (
                    <>
                      <Sparkles size={19} />

                      Create AI Job

                      <ArrowRight
                        size={18}
                        className="
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}
                </button>

                <p
                  className="
                    text-center text-xs
                    leading-5 text-slate-300
                  "
                >
                  Your job will be saved to your
                  HireNexus HR workspace.
                </p>
              </div>
            </div>
          </motion.form>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer
            className="
              mt-14 border-t border-white/10
              pt-7 text-center
              text-[10px] font-medium
              uppercase tracking-[0.15em]
              text-slate-300
            "
          >
            HireNexus • AI-Powered Recruitment
          </footer>
        </main>
      </div>
    </div>
  );
}
