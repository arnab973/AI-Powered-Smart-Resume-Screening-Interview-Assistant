import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Zap,
  Brain,
  ScanSearch,
  CircleAlert,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function goTo(path) {
  window.location.href = path;
}

function NeonLine({ position = "top", color = "cyan" }) {
  const colors = {
    cyan: "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)]",
    violet:
      "bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.95)]",
    fuchsia:
      "bg-fuchsia-300 shadow-[0_0_12px_rgba(240,171,252,0.95)]",
  };

  const positionClass = {
    top: "left-0 top-0 h-px w-full",
    bottom: "bottom-0 left-0 h-px w-full",
    left: "bottom-0 left-0 h-full w-px",
    right: "right-0 top-0 h-full w-px",
  };

  return (
    <motion.span
      className={`pointer-events-none absolute ${positionClass[position]} ${colors[color]}`}
      initial={
        position === "top" || position === "bottom"
          ? { scaleX: 0, opacity: 0 }
          : { scaleY: 0, opacity: 0 }
      }
      animate={
        position === "top" || position === "bottom"
          ? { scaleX: [0, 1, 0], opacity: [0, 1, 0] }
          : { scaleY: [0, 1, 0], opacity: [0, 1, 0] }
      }
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay:
          position === "top"
            ? 0
            : position === "right"
              ? 1
              : position === "bottom"
                ? 2
                : 3,
      }}
      style={{
        transformOrigin:
          position === "top" || position === "bottom"
            ? "left center"
            : "center top",
      }}
    />
  );
}

function UploadCard({
  file,
  isDragging,
  onDrop,
  onBrowse,
  inputRef,
}) {
  return (
    <div className="relative">
      <motion.div
        animate={{
          scale: isDragging ? 1.015 : 1,
        }}
        className={`relative overflow-hidden rounded-[28px] border transition-all duration-300 ${
          isDragging
            ? "border-cyan-300/60 bg-cyan-400/[0.055] shadow-[0_0_70px_rgba(34,211,238,0.14)]"
            : "border-violet-300/[0.14] bg-white/[0.012] shadow-[0_0_50px_rgba(124,58,237,0.06)]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={onDrop}
      >
        <NeonLine position="top" color="cyan" />
        <NeonLine position="right" color="violet" />
        <NeonLine position="bottom" color="fuchsia" />
        <NeonLine position="left" color="cyan" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-400/[0.055] blur-[90px]" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-violet-500/[0.055] blur-[100px]" />

        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];

              if (selectedFile) {
                onBrowse(selectedFile);
              }
            }}
          />

          {!file ? (
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{
                  y: [-5, 5, -5],
                  boxShadow: [
                    "0 0 25px rgba(34,211,238,0.12)",
                    "0 0 45px rgba(139,92,246,0.22)",
                    "0 0 25px rgba(34,211,238,0.12)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-300/20 bg-gradient-to-br from-violet-500/10 via-cyan-400/[0.08] to-fuchsia-500/[0.08]"
              >
                <UploadCloud
                  size={34}
                  className="text-cyan-300"
                />
              </motion.div>

              <h2 className="mt-7 text-xl font-black tracking-tight text-white sm:text-2xl">
                Drop your resume here
              </h2>

              <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
                Upload your latest resume and let HireNexus extract your
                skills, education, projects and experience.
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-6 py-3 text-xs font-black text-white shadow-[0_10px_35px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_45px_rgba(34,211,238,0.2)]"
              >
                <FileText size={15} />
                Browse Resume
                <ArrowRight size={14} />
              </button>

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                <span>PDF</span>
                <span>DOC</span>
                <span>DOCX</span>
                <span>MAX 10 MB</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-cyan-300/20 bg-cyan-400/[0.07] shadow-[0_0_35px_rgba(34,211,238,0.12)]">
                <FileText
                  size={34}
                  className="text-cyan-300"
                />
              </div>

              <h2 className="mt-6 max-w-full truncate px-4 text-lg font-black text-white">
                {file.name}
              </h2>

              <p className="mt-2 text-xs text-slate-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-300/15 bg-violet-500/[0.06] px-4 py-2.5 text-[10px] font-bold text-violet-300 transition hover:border-violet-300/30 hover:bg-violet-500/10"
                >
                  <UploadCloud size={14} />
                  Change File
                </button>

                <button
                  type="button"
                  onClick={() => onBrowse(null)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-[10px] font-bold text-slate-500 transition hover:border-fuchsia-300/20 hover:text-fuchsia-300"
                >
                  <X size={14} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ProcessingPanel({ progress, status }) {
  const steps = [
    {
      label: "Uploading resume",
      icon: UploadCloud,
      active: progress >= 15,
    },
    {
      label: "Extracting document",
      icon: ScanSearch,
      active: progress >= 40,
    },
    {
      label: "AI profile parsing",
      icon: Brain,
      active: progress >= 65,
    },
    {
      label: "Preparing intelligence",
      icon: Sparkles,
      active: progress >= 90,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-white/[0.012] p-6 shadow-[0_0_55px_rgba(34,211,238,0.06)] sm:p-8"
    >
      <NeonLine position="top" color="cyan" />
      <NeonLine position="bottom" color="violet" />

      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-400/[0.04] blur-[80px]" />

      <div className="relative">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.06]"
          >
            <Loader2
              size={21}
              className="text-cyan-300"
            />
          </motion.div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              AI Processing
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              Uploading your resume
            </h3>
          </div>

          <span className="ml-auto text-2xl font-black text-cyan-300">
            {progress}%
          </span>
        </div>

        <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
            className="relative h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
          >
            <div className="absolute inset-y-0 right-0 w-12 bg-white/40 blur-md" />
          </motion.div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                  step.active
                    ? "border-cyan-300/10 bg-cyan-400/[0.035]"
                    : "border-white/[0.04] bg-white/[0.008]"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    step.active
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "bg-white/[0.025] text-slate-700"
                  }`}
                >
                  {step.active ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Icon size={15} />
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold ${
                    step.active
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-slate-700">
          {status}
        </p>
      </div>
    </motion.div>
  );
}

function SuccessPanel({ result, onAnalyze }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/[0.012] p-7 text-center shadow-[0_0_70px_rgba(34,211,238,0.08)] sm:p-10"
    >
      <NeonLine position="top" color="cyan" />
      <NeonLine position="right" color="violet" />
      <NeonLine position="bottom" color="cyan" />
      <NeonLine position="left" color="fuchsia" />

      <div className="absolute left-1/2 top-0 h-44 w-72 -translate-x-1/2 rounded-full bg-cyan-400/[0.055] blur-[90px]" />

      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 12,
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/[0.07] shadow-[0_0_45px_rgba(34,211,238,0.18)]"
        >
          <CheckCircle2
            size={38}
            className="text-cyan-300"
          />
        </motion.div>

        <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.25em] text-cyan-300">
          Resume Uploaded Successfully
        </p>

        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Your resume is ready for analysis
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-slate-500">
          Your resume has been uploaded successfully. Now start the AI
          analysis to calculate your ATS score, identify skills and generate
          improvement insights.
        </p>

        <div className="mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-violet-300/10 bg-violet-500/[0.035] p-4">
            <FileText
              size={17}
              className="mx-auto text-violet-300"
            />

            <p className="mt-2 text-[9px] uppercase tracking-wider text-slate-700">
              Document
            </p>

            <p className="mt-1 text-xs font-bold text-white">
              Uploaded
            </p>
          </div>

          <div className="rounded-xl border border-cyan-300/10 bg-cyan-500/[0.035] p-4">
            <ShieldCheck
              size={17}
              className="mx-auto text-cyan-300"
            />

            <p className="mt-2 text-[9px] uppercase tracking-wider text-slate-700">
              Security
            </p>

            <p className="mt-1 text-xs font-bold text-white">
              Verified
            </p>
          </div>

          <div className="rounded-xl border border-fuchsia-300/10 bg-fuchsia-500/[0.035] p-4">
            <Brain
              size={17}
              className="mx-auto text-fuchsia-300"
            />

            <p className="mt-2 text-[9px] uppercase tracking-wider text-slate-700">
              Next Step
            </p>

            <p className="mt-1 text-xs font-bold text-white">
              Analysis
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onAnalyze}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-6 py-3 text-xs font-black text-white shadow-[0_10px_35px_rgba(124,58,237,0.2)] transition hover:-translate-y-0.5"
          >
            <Brain size={15} />
            Analyze Resume
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => goTo("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.018] px-6 py-3 text-xs font-bold text-slate-400 transition hover:border-cyan-300/20 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>

        {result?.message && (
          <p className="mt-5 text-[9px] text-slate-700">
            {result.message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ResumeUpload() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  const acceptedExtensions = useMemo(
    () => [".pdf", ".doc", ".docx"],
    []
  );

  function validateFile(selectedFile) {
    if (!selectedFile) {
      return "Please select a resume.";
    }

    const name = selectedFile.name.toLowerCase();

    const validExtension = acceptedExtensions.some(
      (extension) => name.endsWith(extension)
    );

    if (!validExtension) {
      return "Only PDF, DOC and DOCX files are supported.";
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      return "Resume size must be less than 10 MB.";
    }

    return "";
  }

  function handleFile(selectedFile) {
    setError("");
    setSuccess(false);
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  }

  function getResumeId(data) {
    return (
      data?.resume_id ||
      data?.resumeId ||
      data?.id ||
      data?._id ||
      data?.resume?.id ||
      data?.resume?._id ||
      null
    );
  }

  async function uploadResume() {
    if (!file || uploading) return;

    setError("");
    setSuccess(false);
    setUploading(true);
    setProgress(10);
    setStatus("Preparing secure upload...");

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      setProgress(25);
      setStatus("Uploading resume to HireNexus...");

      const response = await fetch(
        `${API_BASE_URL}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Resume upload failed."
        );
      }

      setProgress(100);
      setStatus("Resume uploaded successfully.");

      const resumeId = getResumeId(data);

      if (resumeId) {
        localStorage.setItem(
          "resume_id",
          String(resumeId)
        );

        localStorage.setItem(
          "latest_resume_id",
          String(resumeId)
        );
      }

      setResult({
        ...data,
        resume_id: resumeId || data?.resume_id,
      });

      setSuccess(true);
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Something went wrong while uploading your resume."
      );

      setProgress(0);
      setStatus("");
    } finally {
      setUploading(false);
    }
  }

  function startAnalysis() {
    const resumeId =
      result?.resume_id ||
      result?.resumeId ||
      result?.id ||
      result?._id ||
      result?.resume?.id ||
      result?.resume?._id ||
      localStorage.getItem("resume_id") ||
      localStorage.getItem("latest_resume_id");

    if (!resumeId) {
      setError(
        "Resume ID was not returned by the server. Please upload the resume again."
      );
      return;
    }

    localStorage.setItem(
      "resume_id",
      String(resumeId)
    );

    localStorage.setItem(
      "latest_resume_id",
      String(resumeId)
    );

    goTo("/resume-analysis");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="relative z-10 min-h-screen">
        <header className="fixed left-0 right-0 top-0 z-[60]">
          <div className="mx-3 mt-3 overflow-hidden rounded-2xl border border-violet-300/[0.12] bg-[#020611]/40 shadow-[0_8px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:mx-5 lg:mx-6">
            <div className="flex h-[68px] items-center justify-between px-4 sm:px-6">
              <button
                type="button"
                onClick={() => goTo("/dashboard")}
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 shadow-[0_0_28px_rgba(124,58,237,0.25)]">
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

                  <p className="text-[8px] uppercase tracking-[0.18em] text-slate-600">
                    AI Career Intelligence
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-cyan-400/[0.12] bg-cyan-400/[0.025] px-3 py-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    AI System Online
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => goTo("/dashboard")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-violet-300/20 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-[105px] sm:px-6 lg:px-8">
          <section className="relative py-7 sm:py-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[10%] top-[5%] h-64 w-64 rounded-full bg-violet-600/[0.04] blur-[120px]" />

              <div className="absolute right-[10%] top-[20%] h-72 w-72 rounded-full bg-cyan-500/[0.04] blur-[130px]" />

              <div className="absolute bottom-0 left-[42%] h-60 w-60 rounded-full bg-fuchsia-500/[0.025] blur-[120px]" />
            </div>

            <div className="relative">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.05] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300 backdrop-blur-md">
                  <Zap size={11} />
                  Resume Intelligence
                </div>

                <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
                  Upload your{" "}
                  <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                    resume
                  </span>
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                  Give HireNexus your resume and let AI transform your
                  document into a structured career profile for screening,
                  matching and interview preparation.
                </p>
              </div>

              <div className="mx-auto mt-10 max-w-3xl">
                <AnimatePresence mode="wait">
                  {success ? (
                    <SuccessPanel
                      key="success"
                      result={result}
                      onAnalyze={startAnalysis}
                    />
                  ) : uploading ? (
                    <ProcessingPanel
                      key="processing"
                      progress={progress}
                      status={status}
                    />
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <UploadCard
                        file={file}
                        isDragging={dragging}
                        inputRef={inputRef}
                        onBrowse={handleFile}
                        onDrop={handleDrop}
                      />

                      <div className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.15em] text-slate-700">
                        <ShieldCheck
                          size={13}
                          className="text-cyan-300/50"
                        />
                        Secure AI resume processing
                      </div>

                      {file && (
                        <motion.button
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          type="button"
                          onClick={uploadResume}
                          className="mx-auto mt-7 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-8 py-3.5 text-xs font-black text-white shadow-[0_12px_40px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
                        >
                          <UploadCloud size={16} />
                          Upload Resume
                          <ArrowRight size={15} />
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/[0.035] p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10">
                      <CircleAlert
                        size={16}
                        className="text-fuchsia-300"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-fuchsia-200">
                        Upload failed
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="ml-auto text-slate-600 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-violet-300/[0.09] bg-white/[0.01] p-4 text-center backdrop-blur-xl">
                  <ScanSearch
                    size={18}
                    className="mx-auto text-violet-300"
                  />

                  <p className="mt-3 text-xs font-bold text-slate-300">
                    Smart Parsing
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-slate-700">
                    Extract skills, education and experience.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-300/[0.09] bg-white/[0.01] p-4 text-center backdrop-blur-xl">
                  <Brain
                    size={18}
                    className="mx-auto text-cyan-300"
                  />

                  <p className="mt-3 text-xs font-bold text-slate-300">
                    AI Intelligence
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-slate-700">
                    Build your structured career profile.
                  </p>
                </div>

                <div className="rounded-2xl border border-fuchsia-300/[0.09] bg-white/[0.01] p-4 text-center backdrop-blur-xl">
                  <Sparkles
                    size={18}
                    className="mx-auto text-fuchsia-300"
                  />

                  <p className="mt-3 text-xs font-bold text-slate-300">
                    Career Ready
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-slate-700">
                    Prepare for matching and interview AI.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="py-8 text-center text-[9px] uppercase tracking-[0.25em] text-slate-800">
            HireNexus • AI Recruitment Intelligence
          </footer>
        </main>
      </div>
    </div>
  );
}

export default ResumeUpload;