# <p align="center">RiskLens</p>
<p align="center"><strong>Early Detection, Better Outcomes</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
</p>

---

## 🌟 Introduction

**RiskLens** is an AI-powered student risk assessment platform designed to help educators identify at-risk students early and provide students with a clear understanding of their academic standing. By combining advanced machine learning with Google Gemini's generative AI, RiskLens transforms raw academic data into actionable intervention strategies.

## ✨ Core Features

### 👩‍🏫 For Educators (Teacher Dashboard)
- **Batch CSV Analysis**: Upload class-wide data to instantly classify students into "Low Risk" or "High Risk" categories.
- **Fuzzy Data Mapping**: Smart column matching handles various CSV formats automatically using fuzzy logic.
- **Interactive Analytics**: Visualize risk distribution across departments or classes with dynamic charts.
- **AI Intervention Reports**: Generate on-demand, personalized AI reports (powered by Gemini) that suggest specific strategies for at-risk students.

### 🎓 For Students (Student Dashboard)
- **Self-Assessment**: Input study habits and performance metrics to see a real-time risk probability gauge.
- **Personalized Insights**: Receive tailored AI recommendations on how to improve academic performance based on individual metrics.
- **Progress Tracking**: Monitor academic standing and risk levels through a sleek, intuitive interface.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Vanilla CSS (Premium Custom Design)
- **Authentication**: Supabase Auth

### Backend
- **Framework**: FastAPI (Python)
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-learn (Serialized with Joblib)
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Fuzzy Matching**: Rapidfuzz

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Supabase Project (for Authentication)
- Google Gemini API Key

### Backend Setup
1. Clone the repository and navigate to the root directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Run the backend server:
   ```bash
   python backend.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Data Model
RiskLens tracks 5 key metrics to predict academic risk:
1. **Hours Studied**: Average hours spent studying per day.
2. **Mid-Sem Marks**: Average marks in mid-semester examinations.
3. **Prev-Sem Marks**: Performance in previous semesters.
4. **Attendance %**: Student's attendance record.
5. **Screen Time**: Daily mobile screen time hours (as a potential risk factor).

## 🛡️ Security
- **Role-Based Access Control (RBAC)**: Distinct paths and dashboards for teachers and students.
- **JWT Authorization**: All risk assessment endpoints are protected via Supabase JWT validation.

---

<p align="center">Built with ❤️ by the RiskLens Team</p>
