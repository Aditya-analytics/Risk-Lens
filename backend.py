from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends, Header, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import os
import json
from app.model import StudentRiskPredictor
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Student Risk Assessment API",
    description="Backend API for predicting student risk based on study habits and performance data.",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
MODEL_PATH = "student_risk_model"
predictor = StudentRiskPredictor(model_path=MODEL_PATH)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Auth Dependency ───────────────────────────────────────────────────────────
from supabase import ClientOptions

class AuthenticatedUser:
    def __init__(self, user, token: str):
        self.user = user
        self.token = token
        self.id = user.id

async def get_current_user(authorization: str = Header(...)):
    """Validates Supabase JWT and returns user data with token."""
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return AuthenticatedUser(user_response.user, token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_user_supabase(token: str) -> Client:
    options = ClientOptions(headers={"Authorization": f"Bearer {token}"})
    return create_client(SUPABASE_URL, SUPABASE_KEY, options=options)




# ── Pydantic Models ──────────────────────────────────────────────────────────
class StudentData(BaseModel):
    hours_studied: float
    avg_mid_sem_marks: float
    avg_prev_sem_marks: float
    attendance_percentage: float
    mobile_screen_time_hours: float

class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    dashboard_metrics: Optional[Dict[str, Any]] = None
    ai_insights: Optional[str] = None

class InsightsRequest(BaseModel):
    top_performing: List[Dict[str, Any]]
    top_risk: List[Dict[str, Any]]
    risk_distribution: Dict[str, Any]

class StudentInsightsRequest(BaseModel):
    student_data: Dict[str, Any]
    risk_probability: float
    prediction: int




# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "online", "message": "Student Risk Assessment API is running."}


# ── Auth Info ─────────────────────────────────────────────────────────────────
@app.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Returns the current user's profile from Supabase."""
    try:
        profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        return profile.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Single Prediction (Student Dashboard) ─────────────────────────────────────
@app.post("/predict_single")
async def predict_single(
    student: StudentData, 
    user=Depends(get_current_user)
):
    """Single student prediction — used by the Student Dashboard."""
    try:
        df = pd.DataFrame([student.dict()])
        processed = predictor.pipeline(df)
        row = processed.to_dict(orient="records")[0]

        return {
            "prediction": row.get("prediction"),
            "risk_probability": row.get("risk_probability"),
            "metrics": row
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Batch JSON Prediction ────────────────────────────────────────────────────
@app.post("/predict_json")
async def predict_json(
    students: List[Dict[str, Any]],
    generate_insights: bool = Query(False),
    user=Depends(get_current_user)
):
    """Batch JSON prediction. AI insights only when generate_insights=true."""
    if not students:
        raise HTTPException(status_code=400, detail="No data provided.")

    try:
        df = pd.DataFrame(students)
        processed_df = predictor.pipeline(df)
        top_p, top_r, risk_dist, _ = predictor.dashboard(processed_df)

        ai_insights = None
        if generate_insights:
            ai_insights = predictor.generate_ai_insights(top_p, top_r, risk_dist)

        dashboard_metrics = {
            "top_performing": top_p.to_dict(orient="records"),
            "top_risk": top_r.to_dict(orient="records"),
            "risk_distribution": risk_dist.to_dict()
        }

        # Extremely fast C-backed serialization avoiding Python object traversal
        # We process all rows to ensure the user sees all uploaded data (e.g. 10,000 students)
        predictions_str = processed_df.to_json(orient="records")
        final_json = f'{{"predictions": {predictions_str}, "dashboard_metrics": {json.dumps(dashboard_metrics)}, "ai_insights": {json.dumps(ai_insights)}}}'
        return Response(content=final_json, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── CSV Upload Prediction ────────────────────────────────────────────────────
@app.post("/predict_csv")
async def predict_csv(
    file: UploadFile = File(...),
    generate_insights: bool = Query(False),
    department_id: Optional[str] = Query(None),
    user=Depends(get_current_user)
):
    """CSV upload prediction. AI insights only when generate_insights=true."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        processed_df = predictor.pipeline(df)
        top_p, top_r, risk_dist, _ = predictor.dashboard(processed_df)

        ai_insights = None
        if generate_insights:
            ai_insights = predictor.generate_ai_insights(top_p, top_r, risk_dist)

        dashboard_metrics = {
            "top_performing": top_p.to_dict(orient="records"),
            "top_risk": top_r.to_dict(orient="records"),
            "risk_distribution": risk_dist.to_dict()
        }

        # Extremely fast serialization skipping all Python parsing
        # We output all rows so the dashboard correctly reflects large datasets (e.g. 10,000 records)
        predictions_str = processed_df.to_json(orient="records")
        final_json = f'{{"predictions": {predictions_str}, "dashboard_metrics": {json.dumps(dashboard_metrics)}, "ai_insights": {json.dumps(ai_insights)}}}'
        return Response(content=final_json, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── On-Demand AI Insights ────────────────────────────────────────────────────
@app.post("/insights")
async def generate_insights(data: InsightsRequest, user=Depends(get_current_user)):
    """Generate AI insights on demand — teacher clicks 'Generate Report'."""
    try:
        top_p = pd.DataFrame(data.top_performing)
        top_r = pd.DataFrame(data.top_risk)
        risk_dist = pd.Series(data.risk_distribution)

        insights = predictor.generate_ai_insights(top_p, top_r, risk_dist)
        return {"ai_insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/student_insights")
async def generate_student_insights(data: StudentInsightsRequest, user=Depends(get_current_user)):
    """Generate personalized AI recommendations for a specific student."""
    try:
        insights = predictor.generate_student_insights(data.student_data, data.risk_probability, data.prediction)
        return {"ai_insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
