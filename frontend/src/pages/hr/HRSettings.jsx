
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

// =========================================================
// API CONFIGURATION
// =========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const SETTINGS_ENDPOINT = `${API_BASE_URL}/hr/settings`;

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const getUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    return null;
  }
};

const navigate = (path) => {
  window.location.href = path;
};

const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("resumeId");

  navigate("/login");
};

// =========================================================
// API REQUEST HELPER
// =========================================================

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  let response;

  try {
    response = await fetch(
      `${SETTINGS_ENDPOINT}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the backend. Check that FastAPI is running."
    );
  }

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((error) => error.msg)
        .join(", ");
    } else if (response.status === 401) {
      message = "Session expired. Please log in again.";
    } else if (response.status === 403) {
      message = "Only HR accounts can access these settings.";
    }

    throw new Error(message);
  }

  return data;
}

// =========================================================
// DEFAULT STATES
// =========================================================

const DEFAULT_PROFILE = {
  name: "",
  email: "",
  company: "",
  designation: "",
  phone: "",
};

const DEFAULT_PREFERENCES = {
  jobApplications: true,
  candidateUpdates: true,
  interviewAlerts: true,
  emailNotifications: true,
  theme: "dark",
  language: "en",
};

const DEFAULT_PASSWORD = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

// =========================================================
// BACKEND DATA MAPPING
// =========================================================

function mapSettingsResponse(data) {
  const notifications = data?.notifications || {};
  const appearance = data?.appearance || {};

  return {
    profile: {
      name: data?.name || "",
      email: data?.email || "",
      company: data?.company || "",
      designation: data?.designation || "",
      phone: data?.phone || "",
    },

    preferences: {
      jobApplications:
        notifications.application_alerts ?? true,

      candidateUpdates:
        notifications.report_updates ?? true,

      interviewAlerts:
        notifications.interview_reminders ?? true,

      emailNotifications:
        notifications.email_notifications ?? true,

      theme: appearance.theme || "dark",
      language: appearance.language || "en",
    },
  };
}

// =========================================================
// SECTION CARD
// =========================================================

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="
        rounded-2xl
        border border-white/[0.13]
        bg-[#081329]/65
        p-5
        shadow-[0_12px_40px_rgba(0,0,0,0.15)]
        backdrop-blur-xl
        sm:p-7
      "
    >
      <div className="flex items-start gap-4 border-b border-white/[0.10] pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-300">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-6">{children}</div>
    </motion.section>
  );
}

// =========================================================
// INPUT FIELD
// =========================================================

function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  icon: Icon,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-300">
        {label}
      </span>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-xl
            border border-white/[0.13]
            bg-[#020817]/70
            py-3 pr-4
            text-sm text-white
            outline-none transition
            placeholder:text-slate-500
            focus:border-cyan-300/50
            ${Icon ? "pl-11" : "pl-4"}
            ${
              disabled
                ? "cursor-not-allowed opacity-65"
                : ""
            }
          `}
        />
      </div>
    </label>
  );
}

// =========================================================
// TOGGLE SETTING
// =========================================================

function ToggleSetting({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-white/[0.05] p-2 text-violet-300">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative h-7 w-12 shrink-0
          rounded-full transition-colors
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${
            checked
              ? "bg-cyan-500"
              : "bg-slate-600"
          }
        `}
      >
        <span
          className={`
            absolute left-1 top-1
            h-5 w-5 rounded-full
            bg-white shadow
            transition-transform
            ${
              checked
                ? "translate-x-5"
                : ""
            }
          `}
        />
      </button>
    </div>
  );
}

// =========================================================
// PASSWORD FIELD
// =========================================================

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-300">
        {label}
      </span>

      <div className="relative">
        <LockKeyhole
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={
            label === "Current Password"
              ? "current-password"
              : "new-password"
          }
          className="
            w-full rounded-xl
            border border-white/[0.13]
            bg-[#020817]/70
            py-3 pl-11 pr-12
            text-sm text-white
            outline-none transition
            placeholder:text-slate-500
            focus:border-cyan-300/50
            disabled:opacity-50
          "
        />

        <button
          type="button"
          aria-label={
            visible ? "Hide password" : "Show password"
          }
          onClick={() => setVisible(!visible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </label>
  );
}

// =========================================================
// MAIN HR SETTINGS COMPONENT
// =========================================================

export default function HRSettings() {
  const [user, setUser] = useState(getUser);

  const [profile, setProfile] = useState({
    ...DEFAULT_PROFILE,
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
    designation: user?.designation || "",
  });

  const [preferences, setPreferences] = useState(
    DEFAULT_PREFERENCES
  );

  const [password, setPassword] = useState(
    DEFAULT_PASSWORD
  );

  const [activeSection, setActiveSection] =
    useState("profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [savedMessage, setSavedMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =======================================================
  // INITIAL SETTINGS FETCH
  // =======================================================

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await apiRequest("", {
          method: "GET",
        });

        if (!mounted) return;

        const mapped = mapSettingsResponse(data);

        setProfile(mapped.profile);
        setPreferences(mapped.preferences);
      } catch (error) {
        if (mounted) {
          setErrorMessage(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  // =======================================================
  // UPDATE FORM VALUES
  // =======================================================

  const updateProfile = (key, value) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("");
    setErrorMessage("");
  };

  const updatePreference = (key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("");
    setErrorMessage("");
  };

  const updatePasswordField = (key, value) => {
    setPassword((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("");
    setErrorMessage("");
  };

  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const saveProfile = async () => {
    const name = profile.name.trim();

    if (name.length < 2) {
      throw new Error(
        "Full name must contain at least 2 characters."
      );
    }

    const data = await apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify({
        name,
        company: profile.company.trim(),
        designation: profile.designation.trim(),
        phone: profile.phone.trim(),
      }),
    });

    const mapped = mapSettingsResponse(data);

    setProfile(mapped.profile);

    // Keep existing frontend user display in sync.
    const existingUser = getUser() || {};

    const updatedUser = {
      ...existingUser,
      name: mapped.profile.name,
      company: mapped.profile.company,
      designation: mapped.profile.designation,
      phone: mapped.profile.phone,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  };

  // =======================================================
  // SAVE NOTIFICATION PREFERENCES
  // =======================================================

  const saveNotifications = async () => {
    await apiRequest("/notifications", {
      method: "PUT",
      body: JSON.stringify({
        application_alerts:
          preferences.jobApplications,

        report_updates:
          preferences.candidateUpdates,

        interview_reminders:
          preferences.interviewAlerts,

        email_notifications:
          preferences.emailNotifications,
      }),
    });
  };

  // =======================================================
  // SAVE APPEARANCE
  // =======================================================

  const saveAppearance = async () => {
    await apiRequest("/appearance", {
      method: "PUT",
      body: JSON.stringify({
        theme: preferences.theme,
        language: preferences.language,
      }),
    });
  };

  // =======================================================
  // SAVE CURRENT SECTION
  // =======================================================

  const saveSettings = async () => {
    if (saving || loading) return;

    setSaving(true);
    setSavedMessage("");
    setErrorMessage("");

    try {
      if (activeSection === "profile") {
        await saveProfile();
      } else if (activeSection === "notifications") {
        await saveNotifications();
      } else if (activeSection === "appearance") {
        await saveAppearance();
      }

      setSavedMessage(
        "Settings saved successfully to your account."
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // CHANGE PASSWORD
  // =======================================================

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (changingPassword) return;

    setSavedMessage("");
    setErrorMessage("");

    if (
      !password.current_password ||
      !password.new_password ||
      !password.confirm_password
    ) {
      setErrorMessage(
        "Please fill in all password fields."
      );
      return;
    }

    if (password.new_password.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      password.new_password !==
      password.confirm_password
    ) {
      setErrorMessage(
        "New password and confirmation do not match."
      );
      return;
    }

    if (
      new TextEncoder().encode(
        password.new_password
      ).length > 72
    ) {
      setErrorMessage(
        "New password must not exceed 72 UTF-8 bytes."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const data = await apiRequest("/password", {
        method: "PUT",
        body: JSON.stringify(password),
      });

      setPassword(DEFAULT_PASSWORD);

      setSavedMessage(
        data?.message ||
          "Password updated successfully."
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  // =======================================================
  // SECTIONS
  // =======================================================

  const sections = [
    {
      id: "profile",
      label: "HR Profile",
      icon: UserRound,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Moon,
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <GlobalNightSky />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-7 sm:px-7 lg:px-10">
        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/hr-dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.04] px-4 py-3 text-xs font-medium text-slate-200 backdrop-blur-md transition hover:border-cyan-300/30 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-lg font-bold">
                Hire
                <span className="text-cyan-300">
                  Nexus
                </span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                HR Workspace
              </p>
            </div>
          </div>
        </header>

        {/* ===============================================
            PAGE TITLE
        =============================================== */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-9 mt-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200">
            <Settings size={13} />
            Workspace Configuration
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
            HR{" "}
            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Personalize your recruitment workspace,
            manage notification preferences and
            update account security.
          </p>
        </motion.div>

        {/* ===============================================
            ERROR / SUCCESS MESSAGES
        =============================================== */}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-400/[0.07] px-4 py-3 text-xs text-red-200"
          >
            <AlertCircle
              size={17}
              className="shrink-0"
            />

            <span>{errorMessage}</span>
          </div>
        )}

        {savedMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-xs text-emerald-200"
          >
            <Check
              size={17}
              className="shrink-0"
            />

            <span>{savedMessage}</span>
          </div>
        )}

        {/* ===============================================
            LOADING STATE
        =============================================== */}

        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.10] bg-[#081329]/50 backdrop-blur-xl">
            <Loader2
              size={35}
              className="animate-spin text-cyan-300"
            />

            <p className="text-sm text-slate-300">
              Loading your HR settings...
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* ===========================================
                SETTINGS SIDEBAR
            =========================================== */}

            <aside className="rounded-2xl border border-white/[0.13] bg-[#081329]/65 p-3 backdrop-blur-xl lg:sticky lg:top-6">
              <p className="px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Settings Menu
              </p>

              <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
                {sections.map((section) => {
                  const Icon = section.icon;

                  const selected =
                    activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(section.id);
                        setSavedMessage("");
                        setErrorMessage("");
                      }}
                      className={`
                        flex min-w-0 items-center
                        gap-3 rounded-xl px-3 py-3
                        text-left text-xs font-medium
                        transition sm:text-sm
                        ${
                          selected
                            ? "border border-violet-300/20 bg-violet-500/[0.15] text-white"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        size={17}
                        className={
                          selected
                            ? "text-violet-300"
                            : ""
                        }
                      />

                      <span className="truncate">
                        {section.label}
                      </span>

                      {selected && (
                        <ChevronRight
                          size={14}
                          className="ml-auto hidden text-violet-300 lg:block"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-5 border-t border-white/[0.10] px-3 pt-4">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 py-2 text-xs font-medium text-slate-400 transition hover:text-red-300"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </aside>

            {/* ===========================================
                SETTINGS CONTENT
            =========================================== */}

            <div className="min-w-0 space-y-6">
              {/* =========================================
                  HR PROFILE
              ========================================= */}

              {activeSection === "profile" && (
                <SectionCard
                  icon={UserRound}
                  title="HR Profile"
                  description="Manage the information displayed in your HR workspace."
                >
                  <div className="mb-7 flex items-center gap-4 rounded-xl border border-white/[0.10] bg-white/[0.03] p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/[0.10]">
                      <UserRound
                        size={29}
                        className="text-cyan-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {profile.name || "HR Manager"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {profile.email ||
                          "No email available"}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-violet-400/10 px-2 py-1 text-[10px] text-violet-200">
                        HR / Recruiter
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField
                      label="Full Name"
                      icon={UserRound}
                      value={profile.name}
                      placeholder="Enter your name"
                      onChange={(value) =>
                        updateProfile("name", value)
                      }
                    />

                    <InputField
                      label="Email Address"
                      icon={Mail}
                      value={profile.email}
                      disabled
                    />

                    <InputField
                      label="Company Name"
                      icon={BriefcaseBusiness}
                      value={profile.company}
                      placeholder="Enter company name"
                      onChange={(value) =>
                        updateProfile("company", value)
                      }
                    />

                    <InputField
                      label="Designation"
                      icon={Users}
                      value={profile.designation}
                      placeholder="HR Manager / Recruiter"
                      onChange={(value) =>
                        updateProfile("designation", value)
                      }
                    />

                    <InputField
                      label="Phone Number"
                      icon={Phone}
                      value={profile.phone}
                      placeholder="Enter phone number"
                      onChange={(value) =>
                        updateProfile("phone", value)
                      }
                    />
                  </div>

                  <p className="mt-5 text-xs leading-5 text-slate-400">
                    Profile updates are saved securely
                    to your HR account in MongoDB.
                    Your email address cannot be
                    changed from this page.
                  </p>
                </SectionCard>
              )}

              {/* =========================================
                  NOTIFICATIONS
              ========================================= */}

              {activeSection === "notifications" && (
                <SectionCard
                  icon={Bell}
                  title="Notification Preferences"
                  description="Choose which recruitment updates you want to receive."
                >
                  <ToggleSetting
                    icon={BriefcaseBusiness}
                    title="Job Application Updates"
                    description="Preference for new candidate application alerts."
                    checked={
                      preferences.jobApplications
                    }
                    onChange={(value) =>
                      updatePreference(
                        "jobApplications",
                        value
                      )
                    }
                  />

                  <ToggleSetting
                    icon={Users}
                    title="Candidate Updates"
                    description="Preference for candidate screening and report alerts."
                    checked={
                      preferences.candidateUpdates
                    }
                    onChange={(value) =>
                      updatePreference(
                        "candidateUpdates",
                        value
                      )
                    }
                  />

                  <ToggleSetting
                    icon={Bell}
                    title="Interview Alerts"
                    description="Preference for upcoming interview notifications."
                    checked={
                      preferences.interviewAlerts
                    }
                    onChange={(value) =>
                      updatePreference(
                        "interviewAlerts",
                        value
                      )
                    }
                  />

                  <ToggleSetting
                    icon={Mail}
                    title="Email Notifications"
                    description="Preference for recruitment alerts by email."
                    checked={
                      preferences.emailNotifications
                    }
                    onChange={(value) =>
                      updatePreference(
                        "emailNotifications",
                        value
                      )
                    }
                  />

                  <p className="mt-5 text-xs leading-5 text-slate-400">
                    Your notification preferences
                    will be stored in MongoDB.
                    Sending actual email or in-app
                    alerts requires the notification
                    delivery service to use these preferences.
                  </p>
                </SectionCard>
              )}

              {/* =========================================
                  APPEARANCE
              ========================================= */}

              {activeSection === "appearance" && (
                <SectionCard
                  icon={Moon}
                  title="Appearance"
                  description="Customize your HR workspace appearance preferences."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        updatePreference(
                          "theme",
                          "dark"
                        )
                      }
                      className={`
                        rounded-2xl border
                        p-5 text-left transition
                        ${
                          preferences.theme === "dark"
                            ? "border-cyan-300/50 bg-cyan-400/[0.08]"
                            : "border-white/[0.13] bg-white/[0.03] hover:border-white/25"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <Moon
                          size={22}
                          className="text-violet-300"
                        />

                        {preferences.theme ===
                          "dark" && (
                          <Check
                            size={18}
                            className="text-cyan-300"
                          />
                        )}
                      </div>

                      <p className="mt-5 text-sm font-semibold text-white">
                        Dark Mode
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        HireNexus signature dark interface
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updatePreference(
                          "theme",
                          "light"
                        )
                      }
                      className={`
                        rounded-2xl border
                        p-5 text-left transition
                        ${
                          preferences.theme === "light"
                            ? "border-cyan-300/50 bg-cyan-400/[0.08]"
                            : "border-white/[0.13] bg-white/[0.03] hover:border-white/25"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <Sun
                          size={22}
                          className="text-amber-300"
                        />

                        {preferences.theme ===
                          "light" && (
                          <Check
                            size={18}
                            className="text-cyan-300"
                          />
                        )}
                      </div>

                      <p className="mt-5 text-sm font-semibold text-white">
                        Light Mode
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Save your preferred light theme
                      </p>
                    </button>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-xs font-medium text-slate-300">
                      Preferred Language
                    </label>

                    <select
                      value={preferences.language}
                      onChange={(event) =>
                        updatePreference(
                          "language",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/[0.13] bg-[#020817] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
                    >
                      <option value="en">
                        English
                      </option>

                      <option value="hi">
                        Hindi
                      </option>

                      <option value="bn">
                        Bengali
                      </option>
                    </select>
                  </div>

                  <p className="mt-5 text-xs leading-5 text-slate-400">
                    Appearance preferences are saved
                    to your account. Applying them
                    throughout HireNexus requires a
                    shared theme and localization system.
                  </p>
                </SectionCard>
              )}

              {/* =========================================
                  SECURITY
              ========================================= */}

              {activeSection === "security" && (
                <SectionCard
                  icon={ShieldCheck}
                  title="Security & Account"
                  description="Manage your HR account security."
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 rounded-xl border border-white/[0.10] bg-white/[0.03] p-4">
                      <div className="rounded-xl bg-emerald-400/[0.08] p-3 text-emerald-300">
                        <ShieldCheck size={21} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          HR Account
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Signed in as{" "}
                          {profile.email ||
                            user?.email ||
                            "HR user"}
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handlePasswordChange}
                      className="rounded-xl border border-white/[0.10] bg-white/[0.03] p-5"
                    >
                      <div className="mb-6 flex items-center gap-3">
                        <LockKeyhole
                          size={20}
                          className="text-violet-300"
                        />

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Change Password
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Update your account password securely.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <PasswordField
                          label="Current Password"
                          value={
                            password.current_password
                          }
                          onChange={(value) =>
                            updatePasswordField(
                              "current_password",
                              value
                            )
                          }
                          placeholder="Enter current password"
                          disabled={changingPassword}
                        />

                        <PasswordField
                          label="New Password"
                          value={
                            password.new_password
                          }
                          onChange={(value) =>
                            updatePasswordField(
                              "new_password",
                              value
                            )
                          }
                          placeholder="Minimum 8 characters"
                          disabled={changingPassword}
                        />

                        <PasswordField
                          label="Confirm New Password"
                          value={
                            password.confirm_password
                          }
                          onChange={(value) =>
                            updatePasswordField(
                              "confirm_password",
                              value
                            )
                          }
                          placeholder="Re-enter new password"
                          disabled={changingPassword}
                        />
                      </div>

                      <p className="mt-4 text-xs leading-5 text-slate-400">
                        Your current password is
                        verified before the new
                        password is saved. Passwords
                        are never stored in browser
                        localStorage.
                      </p>

                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {changingPassword ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <LockKeyhole size={17} />
                        )}

                        {changingPassword
                          ? "Updating Password..."
                          : "Change Password"}
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.07] px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/[0.12]"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* =========================================
                  SAVE SETTINGS BUTTON
              ========================================= */}

              {activeSection !== "security" && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.10] bg-[#081329]/50 p-4 backdrop-blur-lg sm:px-6">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Save your preferences
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Changes are saved to your
                      HR account in MongoDB.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===============================================
            FOOTER
        =============================================== */}

        <footer className="pt-12 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
          HIRENEXUS • HR WORKSPACE SETTINGS
        </footer>
      </div>
    </div>
  );
}
