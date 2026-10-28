
import React from "react";

// =========================================================
// LANDING PAGE COMPONENTS
// =========================================================

import LandingNavbar from "./components/landing/LandingNavbar";
import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import HowItWorks from "./components/landing/HowItWorks";
import ForRolesSection from "./components/landing/ForRolesSection";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/landing/Footer";
import GlobalNightSky from "./components/landing/GlobalNightSky";

// =========================================================
// AUTH & COMMON PAGES
// =========================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// =========================================================
// CANDIDATE PAGES
// =========================================================

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import ResumeUpload from "./pages/candidate/ResumeUpload";
import ResumeAnalysis from "./pages/candidate/ResumeAnalysis";
import JobMatching from "./pages/candidate/JobMatching";
import Interview from "./pages/candidate/Interview";
import InterviewReport from "./pages/candidate/InterviewReport";
import Profile from "./pages/candidate/Profile";
import Settings from "./pages/candidate/Settings";
import MyApplications from "./pages/candidate/MyApplications";

// =========================================================
// HR PAGES
// =========================================================

import HRDashboard from "./pages/hr/HRDashboard";
import CreateJob from "./pages/hr/CreateJob";
import Candidates from "./pages/hr/Candidates";
import CandidateDetails from "./pages/hr/CandidateDetails";
import Reports from "./pages/hr/Reports";
import HRSettings from "./pages/hr/HRSettings";

// =========================================================
// LANDING PAGE
// =========================================================

function LandingPage() {
  return (
    <div id="top" className="hn-page">
      <GlobalNightSky />

      <div className="relative z-10">
        <LandingNavbar />

        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorks />
          <ForRolesSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </div>
  );
}

// =========================================================
// MAIN APPLICATION
// =========================================================

function App() {
  // Normalize trailing slashes without changing root "/".
  const pathname = window.location.pathname;
  const path =
    pathname.replace(/\/+$/, "") || "/";

  // =======================================================
  // PUBLIC ROUTES
  // =======================================================

  if (path === "/") {
    return <LandingPage />;
  }

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  // =======================================================
  // HR DASHBOARD
  // =======================================================

  if (
    path === "/hr-dashboard" ||
    path === "/hr" ||
    path === "/hr/dashboard"
  ) {
    return <HRDashboard />;
  }

  // =======================================================
  // HR CREATE JOB
  // =======================================================

  if (
    path === "/hr/create-job" ||
    path === "/create-job" ||
    path === "/hr/jobs/create"
  ) {
    return <CreateJob />;
  }

  // =======================================================
  // HR CANDIDATES
  // =======================================================

  if (
    path === "/hr/candidates" ||
    path === "/candidates" ||
    path === "/hr/applicants"
  ) {
    return <Candidates />;
  }

  // =======================================================
  // HR CANDIDATE DETAILS
  // =======================================================

  if (
    path.startsWith("/hr/candidate/") ||
    path.startsWith("/candidate-details/")
  ) {
    return <CandidateDetails />;
  }

  // =======================================================
  // HR REPORTS
  // =======================================================

  if (
    path === "/hr/reports" ||
    path === "/reports" ||
    path === "/hr/analytics"
  ) {
    return <Reports />;
  }

  // =======================================================
  // HR SETTINGS
  // =======================================================

  if (
    path === "/hr/settings" ||
    path === "/hr/account/settings"
  ) {
    return <HRSettings />;
  }

  // =======================================================
  // CANDIDATE DASHBOARD
  // =======================================================

  if (
    path === "/dashboard" ||
    path === "/candidate-dashboard" ||
    path === "/candidate/dashboard" ||
    path === "/candidate"
  ) {
    return <CandidateDashboard />;
  }

  // =======================================================
  // CANDIDATE RESUME UPLOAD
  // =======================================================

  if (
    path === "/resume" ||
    path === "/candidate/resume" ||
    path === "/resume-upload"
  ) {
    return <ResumeUpload />;
  }

  // =======================================================
  // CANDIDATE RESUME ANALYSIS
  // =======================================================

  if (
    path === "/resume-analysis" ||
    path === "/candidate/resume-analysis"
  ) {
    return <ResumeAnalysis />;
  }

  // =======================================================
  // CANDIDATE JOB MATCHING
  // =======================================================

  if (
    path === "/jobs" ||
    path === "/job-search" ||
    path === "/candidate/jobs"
  ) {
    return <JobMatching />;
  }

  // =======================================================
  // CANDIDATE INTERVIEW
  // =======================================================

  if (
    path === "/interview" ||
    path === "/candidate/interview"
  ) {
    return <Interview />;
  }

  // =======================================================
  // CANDIDATE INTERVIEW REPORT
  // =======================================================

  if (
    path === "/interview-report" ||
    path === "/candidate/interview-report"
  ) {
    return <InterviewReport />;
  }

  // =======================================================
  // CANDIDATE PROFILE
  // =======================================================

  if (
    path === "/profile" ||
    path === "/candidate/profile"
  ) {
    return <Profile />;
  }

  // =======================================================
  // CANDIDATE SETTINGS
  // =======================================================

  if (
    path === "/settings" ||
    path === "/candidate/settings"
  ) {
    return <Settings />;
  }

  // =======================================================
  // CANDIDATE APPLICATIONS
  // =======================================================

  if (
    path === "/applications" ||
    path === "/candidate/applications"
  ) {
    return <MyApplications />;
  }

  // =======================================================
  // 404 PAGE
  // =======================================================

  return <NotFound />;
}

export default App;
