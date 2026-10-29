
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Palette,
  Phone,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import GlobalNightSky from "../../components/landing/GlobalNightSky";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const defaultSettings = {
  name: "",
  email: "",
  phone: "",
  location: "",
  education: "",
  headline: "",
  bio: "",

  emailNotifications: true,
  interviewReminders: true,
  jobAlerts: true,
  applicationUpdates: true,
  securityAlerts: true,

  profileVisibility: true,
  showEmailToRecruiters: false,
  showPhoneToRecruiters: false,

  language: "English",
  theme: "Dark",
  interviewDifficulty: "Adaptive",
};

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.12)]">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  label,
  description,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition duration-300 hover:border-violet-400/20 hover:bg-white/[0.045]"
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300">
            <Icon size={17} />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100">
            {label}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          enabled
            ? "border-violet-400/40 bg-violet-500/30"
            : "border-white/10 bg-white/[0.06]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ${
            enabled
              ? "left-6 bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]"
              : "left-1 bg-slate-500"
          }`}
        />
      </span>
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border border-white/[0.08] bg-black/25 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-black/35 focus:ring-4 focus:ring-violet-500/5 ${
            Icon ? "pl-11 pr-4" : "px-4"
          } ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : ""
          }`}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full appearance-none rounded-2xl border border-white/[0.08] bg-black/25 py-3.5 text-sm text-white outline-none transition focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/5 ${
            Icon ? "pl-11 pr-10" : "px-4 pr-10"
          }`}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-slate-950 text-white"
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronRight
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-500"
        />
      </div>
    </label>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(
    defaultSettings
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);

      setSettings((previous) => ({
        ...previous,
        name: storedUser.name || "",
        email: storedUser.email || "",
      }));
    }

    const savedSettings = localStorage.getItem(
      "hirenexus_candidate_settings"
    );

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        setSettings((previous) => ({
          ...previous,
          ...parsed,
        }));
      } catch {
        // Ignore invalid local settings.
      }
    }

    loadProfile();
  }, []);

  async function loadProfile() {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    try {
      const [
        profileResponse,
        settingsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),

        fetch(`${API_URL}/auth/settings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }),
      ]);

      const profileData =
        await profileResponse.json();

      const settingsData =
        await settingsResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData?.detail ||
            "Failed to load profile."
        );
      }

      if (!settingsResponse.ok) {
        throw new Error(
          settingsData?.detail ||
            "Failed to load account settings."
        );
      }

      const profileUser =
        profileData?.user || {};

      const backendUser =
        settingsData?.user || {};

      const mergedUser = {
        ...profileUser,
        ...backendUser,
      };

      setUser(mergedUser);

      setSettings((previous) => ({
        ...previous,

        name:
          backendUser.name ||
          profileUser.name ||
          previous.name,

        email:
          backendUser.email ||
          profileUser.email ||
          previous.email,

        phone:
          backendUser.phone ??
          previous.phone,

        location:
          backendUser.location ??
          previous.location,

        education:
          backendUser.education ??
          previous.education,

        headline:
          backendUser.headline ??
          previous.headline,

        bio:
          backendUser.bio ??
          previous.bio,

        emailNotifications:
          backendUser.email_notifications ??
          previous.emailNotifications,

        interviewReminders:
          backendUser.interview_reminders ??
          previous.interviewReminders,

        jobAlerts:
          backendUser.job_alerts ??
          previous.jobAlerts,

        applicationUpdates:
          backendUser.application_updates ??
          previous.applicationUpdates,

        securityAlerts:
          backendUser.security_alerts ??
          previous.securityAlerts,

        profileVisibility:
          backendUser.profile_visibility ??
          previous.profileVisibility,

        showEmailToRecruiters:
          backendUser.show_email_to_recruiters ??
          previous.showEmailToRecruiters,

        showPhoneToRecruiters:
          backendUser.show_phone_to_recruiters ??
          previous.showPhoneToRecruiters,

        language:
          backendUser.language ||
          previous.language,

        theme:
          backendUser.theme ||
          previous.theme,

        interviewDifficulty:
          backendUser.interview_difficulty ||
          previous.interviewDifficulty,
      }));

      localStorage.setItem(
        "user",
        JSON.stringify(mergedUser)
      );
    } catch (err) {
      console.error(
        "Settings load error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your account settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveSettings() {
    const token = getToken();

    setSaving(true);
    setNotice("");
    setError("");

    if (!token) {
      setSaving(false);

      setError(
        "Authentication token not found. Please login again."
      );

      return;
    }

    try {
      const payload = {
        name: settings.name.trim(),
        phone: settings.phone.trim(),
        location: settings.location.trim(),
        education: settings.education.trim(),
        headline: settings.headline.trim(),
        bio: settings.bio.trim(),

        email_notifications:
          settings.emailNotifications,

        interview_reminders:
          settings.interviewReminders,

        job_alerts:
          settings.jobAlerts,

        application_updates:
          settings.applicationUpdates,

        security_alerts:
          settings.securityAlerts,

        profile_visibility:
          settings.profileVisibility,

        show_email_to_recruiters:
          settings.showEmailToRecruiters,

        show_phone_to_recruiters:
          settings.showPhoneToRecruiters,

        language:
          settings.language,

        theme:
          settings.theme,

        interview_difficulty:
          settings.interviewDifficulty,
      };

      const response = await fetch(
        `${API_URL}/auth/settings`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to save account settings."
        );
      }

      const backendUser =
        data?.user;

      if (!backendUser) {
        throw new Error(
          "Settings were saved, but the server returned invalid user data."
        );
      }

      const updatedSettings = {
        name:
          backendUser.name || "",

        email:
          backendUser.email || "",

        phone:
          backendUser.phone || "",

        location:
          backendUser.location || "",

        education:
          backendUser.education || "",

        headline:
          backendUser.headline || "",

        bio:
          backendUser.bio || "",

        emailNotifications:
          backendUser.email_notifications ??
          true,

        interviewReminders:
          backendUser.interview_reminders ??
          true,

        jobAlerts:
          backendUser.job_alerts ??
          true,

        applicationUpdates:
          backendUser.application_updates ??
          true,

        securityAlerts:
          backendUser.security_alerts ??
          true,

        profileVisibility:
          backendUser.profile_visibility ??
          true,

        showEmailToRecruiters:
          backendUser.show_email_to_recruiters ??
          false,

        showPhoneToRecruiters:
          backendUser.show_phone_to_recruiters ??
          false,

        language:
          backendUser.language ||
          "English",

        theme:
          backendUser.theme ||
          "Dark",

        interviewDifficulty:
          backendUser.interview_difficulty ||
          "Adaptive",
      };

      setSettings(updatedSettings);
      setUser(backendUser);

      localStorage.setItem(
        "user",
        JSON.stringify(backendUser)
      );

      localStorage.setItem(
        "hirenexus_candidate_settings",
        JSON.stringify(updatedSettings)
      );

      setNotice(
        data?.message ||
          "Settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Settings save error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    const token = getToken();

    setNotice("");
    setError("");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );

      return;
    }

    if (!passwordData.currentPassword) {
      setError(
        "Please enter your current password."
      );

      return;
    }

    if (!passwordData.newPassword) {
      setError(
        "Please enter a new password."
      );

      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    if (
      new TextEncoder().encode(
        passwordData.newPassword
      ).length > 72
    ) {
      setError(
        "New password must be 72 bytes or fewer."
      );

      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError(
        "New passwords do not match."
      );

      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            current_password:
              passwordData.currentPassword,

            new_password:
              passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to change password."
        );
      }

      setNotice(
        data?.message ||
          "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err?.message ||
          "Unable to change password."
      );
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "selected_job_id"
    );

    localStorage.removeItem(
      "latest_job_id"
    );

    localStorage.removeItem(
      "latest_interview_id"
    );

    localStorage.removeItem(
      "latest_report_id"
    );

    window.location.href = "/login";
  }

  function goProfile() {
    window.location.href = "/profile";
  }

  const initials = useMemo(() => {
    const name =
      settings.name ||
      user?.name ||
      "Candidate";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  }, [
    settings.name,
    user?.name,
  ]);

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
    },

    {
      id: "security",
      label: "Security",
      icon: Shield,
    },

    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "preferences",
      label: "Preferences",
      icon: Palette,
    },

    {
      id: "privacy",
      label: "Privacy",
      icon: Lock,
    },

    {
      id: "account",
      label: "Account",
      icon: Zap,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#01030a] text-white">
      <GlobalNightSky />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="settings-orb settings-orb-one" />
        <div className="settings-orb settings-orb-two" />
        <div className="settings-orb settings-orb-three" />

        <div className="absolute left-[12%] top-[18%] h-28 w-28 rounded-full border border-cyan-300/10 [transform:perspective(700px)_rotateX(55deg)_rotateY(20deg)]" />

        <div className="absolute right-[10%] top-[30%] h-44 w-44 rounded-[35%] border border-violet-300/10 [transform:perspective(700px)_rotateX(55deg)_rotateY(-25deg)]" />

        <div className="settings-grid absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1450px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goProfile}
            className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-sm text-slate-300 backdrop-blur-xl transition hover:border-violet-400/30 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Profile
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Candidate Control Center
              </p>

              <p className="mt-1 text-sm font-medium text-slate-200">
                {loading
                  ? "Loading profile..."
                  : settings.name ||
                    "Candidate"}
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500/50 to-cyan-400/50 blur-md" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-sm font-bold text-white">
                {initials || "C"}
              </div>
            </div>
          </div>
        </header>

        <section className="relative mb-7 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-cyan-400/[0.06] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute right-[-40px] top-[-50px] h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-70px] left-[25%] h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200">
                <Sparkles size={13} />
                AI Recruitment Intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Account{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  Settings
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Manage your candidate profile, interview
                preferences, notifications, privacy controls
                and account security from one place.
              </p>
            </div>

            <div className="relative mx-auto h-32 w-32 shrink-0 sm:h-40 sm:w-40 lg:mx-0">
              <div className="absolute inset-5 rounded-full border border-violet-300/20 bg-violet-500/5 shadow-[0_0_70px_rgba(139,92,246,0.18)] backdrop-blur-xl" />

              <div className="settings-core absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-cyan-200/20 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.18)]">
                <Sparkles
                  size={26}
                  className="text-cyan-200"
                />
              </div>

              <div className="settings-ring absolute inset-1 rounded-full border border-dashed border-cyan-300/20" />

              <div className="settings-ring-reverse absolute inset-8 rounded-full border border-violet-300/20" />

              <div className="absolute left-2 top-1/2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.9)]" />

              <div className="absolute right-3 top-5 h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.9)]" />
            </div>
          </div>
        </section>

        {(notice || error) && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
              error
                ? "border-red-400/20 bg-red-500/10 text-red-200"
                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error ? (
              <X
                size={18}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <Check
                size={18}
                className="mt-0.5 shrink-0"
              />
            )}

            <span>
              {error || notice}
            </span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.03] p-2 backdrop-blur-xl lg:sticky lg:top-5">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setNotice("");
                      setError("");
                    }}
                    className={`group flex min-w-max items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-300 lg:w-full ${
                      active
                        ? "border border-violet-400/20 bg-gradient-to-r from-violet-500/20 to-cyan-400/10 text-white shadow-[0_0_25px_rgba(139,92,246,0.08)]"
                        : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        active
                          ? "text-cyan-300"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    />

                    <span>
                      {tab.label}
                    </span>

                    {active && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)] lg:block" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 hidden border-t border-white/[0.06] pt-3 lg:block">
              <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-400/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                  <Zap size={14} />
                  AI Profile Status
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Keep your profile updated to improve AI
                  job matching and recruiter visibility.
                </p>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={UserRound}
                    title="Personal Information"
                    description="Keep your candidate identity and contact details up to date."
                  />

                  <div className="mb-7 flex flex-col gap-5 rounded-3xl border border-white/[0.06] bg-black/20 p-5 sm:flex-row sm:items-center">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-500/30 to-cyan-400/20 blur-lg" />

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-xl font-bold text-white">
                        {initials || "C"}
                      </div>

                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#080b14] bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-white">
                        {settings.name ||
                          "Your Name"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {settings.email ||
                          "your@email.com"}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-200">
                        <Check size={12} />
                        Candidate Account
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Full Name"
                      value={settings.name}
                      onChange={(value) =>
                        updateSetting(
                          "name",
                          value
                        )
                      }
                      placeholder="Enter your full name"
                      icon={User}
                    />

                    <InputField
                      label="Email Address"
                      value={settings.email}
                      onChange={(value) =>
                        updateSetting(
                          "email",
                          value
                        )
                      }
                      placeholder="Enter your email"
                      icon={Mail}
                      type="email"
                      disabled
                    />

                    <InputField
                      label="Phone Number"
                      value={settings.phone}
                      onChange={(value) =>
                        updateSetting(
                          "phone",
                          value
                        )
                      }
                      placeholder="+91 XXXXX XXXXX"
                      icon={Phone}
                    />

                    <InputField
                      label="Location"
                      value={settings.location}
                      onChange={(value) =>
                        updateSetting(
                          "location",
                          value
                        )
                      }
                      placeholder="City, State, Country"
                      icon={MapPin}
                    />
                  </div>
                </SettingCard>

                <SettingCard>
                  <SectionTitle
                    icon={Sparkles}
                    title="Career Profile"
                    description="Help HireNexus understand your professional goals and career direction."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Professional Headline"
                      value={settings.headline}
                      onChange={(value) =>
                        updateSetting(
                          "headline",
                          value
                        )
                      }
                      placeholder="e.g. Full Stack Developer | AI/ML"
                      icon={Zap}
                    />

                    <InputField
                      label="Education"
                      value={settings.education}
                      onChange={(value) =>
                        updateSetting(
                          "education",
                          value
                        )
                      }
                      placeholder="e.g. B.Tech CSE (AI-ML)"
                      icon={Laptop}
                    />
                  </div>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      Professional Bio
                    </span>

                    <textarea
                      value={settings.bio}
                      onChange={(event) =>
                        updateSetting(
                          "bio",
                          event.target.value
                        )
                      }
                      rows={5}
                      placeholder="Write a short professional introduction..."
                      className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/40 focus:ring-4 focus:ring-violet-500/5"
                    />
                  </label>
                </SettingCard>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={goProfile}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.2)] transition hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(34,211,238,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={Shield}
                    title="Security Center"
                    description="Manage your password and keep your HireNexus account protected."
                  />

                  <div className="mb-5 flex items-center gap-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Shield size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-200">
                        Account security active
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your account is protected using authenticated access.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={
                      handlePasswordChange
                    }
                    className="space-y-5"
                  >
                    <div className="relative">
                      <InputField
                        label="Current Password"
                        value={
                          passwordData.currentPassword
                        }
                        onChange={(value) =>
                          setPasswordData(
                            (previous) => ({
                              ...previous,
                              currentPassword:
                                value,
                            })
                          )
                        }
                        placeholder="Enter current password"
                        icon={KeyRound}
                        type={
                          showCurrentPassword
                            ? "text"
                            : "password"
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        className="absolute right-3 top-[35px] rounded-lg p-2 text-slate-500 hover:text-white"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <InputField
                        label="New Password"
                        value={
                          passwordData.newPassword
                        }
                        onChange={(value) =>
                          setPasswordData(
                            (previous) => ({
                              ...previous,
                              newPassword:
                                value,
                            })
                          )
                        }
                        placeholder="Create a new password"
                        icon={Lock}
                        type={
                          showNewPassword
                            ? "text"
                            : "password"
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowNewPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        className="absolute right-3 top-[35px] rounded-lg p-2 text-slate-500 hover:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <InputField
                      label="Confirm New Password"
                      value={
                        passwordData.confirmPassword
                      }
                      onChange={(value) =>
                        setPasswordData(
                          (previous) => ({
                            ...previous,
                            confirmPassword:
                              value,
                          })
                        )
                      }
                      placeholder="Confirm new password"
                      icon={Lock}
                      type="password"
                    />

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <KeyRound size={17} />

                      {saving
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </form>
                </SettingCard>

                <SettingCard>
                  <h3 className="text-base font-semibold text-white">
                    Login & Session
                  </h3>

                  <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Current device
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Browser session · Active now
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <Laptop size={17} />
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={Bell}
                    title="Notification Center"
                    description="Choose what HireNexus should notify you about."
                  />

                  <div className="space-y-3">
                    <Toggle
                      enabled={
                        settings.emailNotifications
                      }
                      onChange={(value) =>
                        updateSetting(
                          "emailNotifications",
                          value
                        )
                      }
                      label="Email Notifications"
                      description="Receive important account and platform updates by email."
                      icon={Mail}
                    />

                    <Toggle
                      enabled={
                        settings.interviewReminders
                      }
                      onChange={(value) =>
                        updateSetting(
                          "interviewReminders",
                          value
                        )
                      }
                      label="Interview Reminders"
                      description="Get reminders for upcoming AI interview sessions."
                      icon={Bell}
                    />

                    <Toggle
                      enabled={
                        settings.jobAlerts
                      }
                      onChange={(value) =>
                        updateSetting(
                          "jobAlerts",
                          value
                        )
                      }
                      label="Job Match Alerts"
                      description="Receive notifications when suitable jobs are matched with your profile."
                      icon={Sparkles}
                    />

                    <Toggle
                      enabled={
                        settings.applicationUpdates
                      }
                      onChange={(value) =>
                        updateSetting(
                          "applicationUpdates",
                          value
                        )
                      }
                      label="Application Updates"
                      description="Stay updated about your application activity."
                      icon={Check}
                    />

                    <Toggle
                      enabled={
                        settings.securityAlerts
                      }
                      onChange={(value) =>
                        updateSetting(
                          "securityAlerts",
                          value
                        )
                      }
                      label="Security Alerts"
                      description="Receive alerts about important account security events."
                      icon={Shield}
                    />
                  </div>
                </SettingCard>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Notification Settings"}
                </button>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={Palette}
                    title="Candidate Preferences"
                    description="Customize how HireNexus presents your experience and AI interview workflow."
                  />

                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label="Interface Language"
                      value={
                        settings.language
                      }
                      onChange={(value) =>
                        updateSetting(
                          "language",
                          value
                        )
                      }
                      options={[
                        "English",
                        "Bengali",
                        "Hinglish",
                      ]}
                      icon={Globe2}
                    />

                    <SelectField
                      label="Appearance"
                      value={settings.theme}
                      onChange={(value) =>
                        updateSetting(
                          "theme",
                          value
                        )
                      }
                      options={[
                        "Dark",
                        "System",
                      ]}
                      icon={Palette}
                    />

                    <SelectField
                      label="AI Interview Difficulty"
                      value={
                        settings.interviewDifficulty
                      }
                      onChange={(value) =>
                        updateSetting(
                          "interviewDifficulty",
                          value
                        )
                      }
                      options={[
                        "Adaptive",
                        "Beginner",
                        "Intermediate",
                        "Advanced",
                      ]}
                      icon={Sparkles}
                    />
                  </div>
                </SettingCard>

                <SettingCard>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <Sparkles size={20} />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">
                        AI Personalization
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Your selected interview difficulty
                        can be used to personalize future
                        interview preparation.
                      </p>
                    </div>
                  </div>
                </SettingCard>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Preferences"}
                </button>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={Lock}
                    title="Privacy & Recruiter Visibility"
                    description="Control which parts of your candidate profile can be visible to recruiters."
                  />

                  <div className="space-y-3">
                    <Toggle
                      enabled={
                        settings.profileVisibility
                      }
                      onChange={(value) =>
                        updateSetting(
                          "profileVisibility",
                          value
                        )
                      }
                      label="Recruiter Profile Visibility"
                      description="Allow recruiters to discover your candidate profile."
                      icon={Eye}
                    />

                    <Toggle
                      enabled={
                        settings.showEmailToRecruiters
                      }
                      onChange={(value) =>
                        updateSetting(
                          "showEmailToRecruiters",
                          value
                        )
                      }
                      label="Show Email"
                      description="Allow your email address to be visible to recruiters."
                      icon={Mail}
                    />

                    <Toggle
                      enabled={
                        settings.showPhoneToRecruiters
                      }
                      onChange={(value) =>
                        updateSetting(
                          "showPhoneToRecruiters",
                          value
                        )
                      }
                      label="Show Phone"
                      description="Allow your phone number to be visible to recruiters."
                      icon={Phone}
                    />
                  </div>
                </SettingCard>

                <SettingCard className="border-violet-400/10 bg-violet-500/[0.03]">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Shield size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Privacy-first recruitment
                      </h3>

                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        Keep only the information necessary
                        for your recruitment experience visible
                        to recruiters.
                      </p>
                    </div>
                  </div>
                </SettingCard>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Save Privacy Settings"}
                </button>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <SettingCard>
                  <SectionTitle
                    icon={User}
                    title="Account Information"
                    description="View your HireNexus account details."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
                        Name
                      </p>

                      <p className="mt-2 text-sm font-medium text-white">
                        {settings.name ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
                        Email
                      </p>

                      <p className="mt-2 break-all text-sm font-medium text-white">
                        {settings.email ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
                        Role
                      </p>

                      <p className="mt-2 text-sm font-medium capitalize text-white">
                        {user?.role ||
                          "candidate"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-600">
                        Account Status
                      </p>

                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                        Active
                      </div>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard>
                  <h3 className="text-base font-semibold text-white">
                    Quick Actions
                  </h3>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={goProfile}
                      className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-violet-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <UserRound
                          size={18}
                          className="text-violet-300"
                        />

                        <span className="text-sm text-slate-200">
                          View Profile
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-600"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "security"
                        )
                      }
                      className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <Shield
                          size={18}
                          className="text-cyan-300"
                        />

                        <span className="text-sm text-slate-200">
                          Security Settings
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-600"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "notifications"
                        )
                      }
                      className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-violet-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <Bell
                          size={18}
                          className="text-violet-300"
                        />

                        <span className="text-sm text-slate-200">
                          Notification Settings
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-600"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "privacy"
                        )
                      }
                      className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-cyan-400/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <Lock
                          size={18}
                          className="text-cyan-300"
                        />

                        <span className="text-sm text-slate-200">
                          Privacy Controls
                        </span>
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-slate-600"
                      />
                    </button>
                  </div>
                </SettingCard>

                <SettingCard className="border-red-400/10 bg-red-500/[0.02]">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Sign out
                      </h3>

                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        Sign out from this HireNexus account
                        on the current device.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </SettingCard>

                <SettingCard className="border-red-500/10">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trash2
                          size={17}
                          className="text-red-300"
                        />

                        <h3 className="text-base font-semibold text-white">
                          Delete Account
                        </h3>
                      </div>

                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        Account deletion should only be enabled
                        after a backend confirmation flow is
                        implemented.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-600"
                    >
                      <Trash2 size={17} />
                      Delete Account
                    </button>
                  </div>
                </SettingCard>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CircleHelp size={14} />
                HireNexus Candidate Settings
              </div>

              <button
                type="button"
                onClick={() => {
                  setNotice(
                    "Your profile and account settings are securely synchronized with your HireNexus account."
                  );

                  setError("");
                }}
                className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-slate-300"
              >
                <BellOff size={14} />
                Storage information
              </button>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .settings-grid {
          background-image:
            linear-gradient(rgba(139, 92, 246, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at center, black, transparent 78%);
        }

        .settings-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(1px);
          animation: settingsFloat 8s ease-in-out infinite;
        }

        .settings-orb-one {
          width: 190px;
          height: 190px;
          left: -80px;
          top: 15%;
          border: 1px solid rgba(167, 139, 250, 0.08);
          background: radial-gradient(
            circle at 35% 35%,
            rgba(139, 92, 246, 0.12),
            transparent 65%
          );
        }

        .settings-orb-two {
          width: 250px;
          height: 250px;
          right: -100px;
          top: 45%;
          border: 1px solid rgba(103, 232, 249, 0.08);
          background: radial-gradient(
            circle at 40% 40%,
            rgba(34, 211, 238, 0.08),
            transparent 68%
          );
          animation-delay: -3s;
        }

        .settings-orb-three {
          width: 130px;
          height: 130px;
          left: 50%;
          bottom: 5%;
          border: 1px solid rgba(217, 70, 239, 0.06);
          background: radial-gradient(
            circle at 40% 40%,
            rgba(217, 70, 239, 0.08),
            transparent 65%
          );
          animation-delay: -5s;
        }

        .settings-core {
          animation: settingsCore 4s ease-in-out infinite;
        }

        .settings-ring {
          animation: settingsSpin 12s linear infinite;
        }

        .settings-ring-reverse {
          animation: settingsSpinReverse 9s linear infinite;
        }

        @keyframes settingsFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(0, -18px, 0) scale(1.04);
          }
        }

        @keyframes settingsCore {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0) rotate(0deg);
          }

          50% {
            transform: translate(-50%, -50%) translateY(-7px) rotate(3deg);
          }
        }

        @keyframes settingsSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes settingsSpinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .settings-orb,
          .settings-core,
          .settings-ring,
          .settings-ring-reverse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;
