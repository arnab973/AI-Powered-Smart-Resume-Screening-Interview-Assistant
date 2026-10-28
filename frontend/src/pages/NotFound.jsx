import React from "react";

function NotFound() {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#01030a] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
          HireNexus
        </p>

        <h1 className="mt-4 text-7xl font-bold">
          404
        </h1>

        <p className="mt-4 text-lg text-slate-400">
          The page you're looking for doesn't exist.
        </p>

        <button
          type="button"
          onClick={goHome}
          className="mt-8 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;