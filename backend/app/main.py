
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth_routes import router as auth_router
from app.api.resume_routes import router as resume_router
from app.api.job_routes import router as job_router
from app.api.screening_routes import router as screening_router
from app.api.interview_routes import router as interview_router
from app.api.evaluation_routes import router as evaluation_router
from app.api.report_routes import router as report_router
from app.api.application_routes import router as application_router
from app.api.hr_settings_routes import router as hr_settings_router

from app.database.mongodb import (
    connect_to_mongodb,
    close_mongodb_connection,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongodb()

    yield

    close_mongodb_connection()


app = FastAPI(
    title="AI-Powered Smart Resume Screening & Interview Assistant",
    description=(
        "Backend API for AI-powered resume screening "
        "and interview assistance."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-powered-smart-resume-screening-i-omega.vercel.app",
        "https://ai-powered-smart-resume-screening-interview-assistan-aq2il8r6c.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(job_router)
app.include_router(screening_router)
app.include_router(interview_router)
app.include_router(evaluation_router)
app.include_router(report_router)
app.include_router(application_router)
app.include_router(hr_settings_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": (
            "AI Resume Screening & Interview Assistant "
            "API is running"
        )
    }
