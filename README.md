# AI-Powered Smart Resume Screening & Interview Assistant

An AI-powered recruitment platform designed to simplify resume screening, evaluate candidate profiles, conduct structured interviews, and generate performance reports.

## Overview

The **AI-Powered Smart Resume Screening & Interview Assistant** is a final-year engineering project that aims to make the recruitment process more efficient by combining resume parsing, candidate screening, AI-assisted interviews, and performance analytics.

The platform helps candidates manage their resumes and interview preparation while providing screening and evaluation capabilities for recruitment workflows.

## Key Features

- **Resume Upload:** Upload resumes for processing.
- **Resume Parsing:** Extract relevant information and text from uploaded resumes.
- **Candidate Screening:** Support candidate evaluation against job requirements.
- **AI-Assisted Interviews:** Support structured interview workflows.
- **Performance Reports:** Generate reports containing interview evaluation results.
- **Authentication:** User registration, login, and protected endpoints.
- **Recruitment Analytics:** Support reporting and analytics workflows.
- **Web Interface:** Access project functionality through the frontend.

*Feature availability depends on the implemented modules and configured AI services.*

## Technology Stack

### Backend
- Python
- FastAPI
- MongoDB
- JWT-based authentication
- REST API

### Frontend
- React
- JavaScript
- Vite

### AI and Processing
- Resume text extraction and parsing
- AI-assisted screening and interview evaluation
- Python-based processing

### Development Tools
- Git and GitHub
- Visual Studio Code
- Swagger UI for API testing

## Project Structure

```text
AI-Powered-Smart-Resume-Screening-Interview-Assistant/
├── ai-engine/
│   ├── README.md
│   └── requirements.txt
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── README.md
├── docs/
│   ├── api/
│   ├── architecture/
│   └── project/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Python
- Node.js and npm
- MongoDB database or MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/arnab973/AI-Powered-Smart-Resume-Screening-Interview-Assistant.git
cd AI-Powered-Smart-Resume-Screening-Interview-Assistant
```

### 2. Configure the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory and configure the environment variables required by the backend.

Example variable names:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET_KEY=your_strong_secret_key
OPENAI_API_KEY=your_openai_api_key
```

Use the exact variable names expected by the application configuration. Add any other required variables for authentication or external services.

**Never commit real API keys, passwords, database credentials, or secret keys to GitHub.**

### 3. Start the Backend

From the `backend` directory, run:

```bash
python -m uvicorn app.main:app --reload
```

The backend should be available at:

- API: http://127.0.0.1:8000
- Swagger documentation: http://127.0.0.1:8000/docs

### 4. Configure and Start the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file if required by the application, and configure the backend API URL using the variable name expected by the frontend.

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal.

## API Documentation

When the backend is running, interactive API documentation is available at:

**http://127.0.0.1:8000/docs**

Use Swagger UI to explore available endpoints and test supported API operations.

## Environment Configuration

The application may require configuration for:

- MongoDB connectivity
- Authentication and JWT signing
- AI service access
- Frontend-to-backend API communication
- Third-party authentication, if enabled

Configure these values locally or through your deployment provider's environment-variable settings. Do not publish actual secrets.

## Testing

Test the implemented workflows before deployment, including:

- User registration and login
- Authenticated API requests
- Resume upload and parsing
- Interview workflow
- Performance report generation
- Frontend-to-backend communication

## Future Enhancements

- More advanced resume-to-job matching
- Improved candidate ranking and explainability
- Expanded interview question generation
- Enhanced recruitment analytics
- Additional language support
- Further deployment and performance improvements

## Project Information

**Project:** AI-Powered Smart Resume Screening & Interview Assistant  
**Category:** Final-Year Engineering Project  
**Domain:** Artificial Intelligence, Recruitment Automation, and Web Development

## License

See the [LICENSE](LICENSE) file for the licensing terms of this project.

---

Developed as an academic project to explore AI-assisted recruitment and interview evaluation.
