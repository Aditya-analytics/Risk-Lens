from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import os
from app.model import StudentRiskPredictor
from fastapi.middleware.cors import CORSMiddleware
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
async def get_current_user(authorization: str = Header(...)):
    """Validates Supabase JWT and returns user data."""
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


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

class SaveHistoryRequest(BaseModel):
    prediction_type: str  # 'single' or 'batch'
    input_data: Dict[str, Any]
    result_data: Dict[str, Any]
    ai_insights: Optional[str] = None


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
async def predict_single(student: StudentData, user=Depends(get_current_user)):
    """Single student prediction — used by the Student Dashboard."""
    try:
        df = pd.DataFrame([student.dict()])
        processed = predictor.pipeline(df)
        row = processed.to_dict(orient="records")[0]

        # Auto-save to history
        try:
            supabase.table("prediction_history").insert({
                "user_id": user.id,
                "prediction_type": "single",
                "input_data": student.dict(),
                "result_data": row,
            }).execute()
        except Exception as save_error:
            print(f"Warning: Failed to save prediction history: {save_error}")

        return {
            "prediction": row.get("prediction"),
            "risk_probability": row.get("risk_probability"),
            "metrics": row
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Batch JSON Prediction ────────────────────────────────────────────────────
@app.post("/predict_json", response_model=PredictionResponse)
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

        result = {
            "predictions": processed_df.to_dict(orient="records"),
            "dashboard_metrics": {
                "top_performing": top_p.to_dict(orient="records"),
                "top_risk": top_r.to_dict(orient="records"),
                "risk_distribution": risk_dist.to_dict()
            },
            "ai_insights": ai_insights
        }

        # Auto-save to history
        try:
            supabase.table("prediction_history").insert({
                "user_id": user.id,
                "prediction_type": "batch",
                "input_data": {"student_count": len(students)},
                "result_data": result["dashboard_metrics"],
                "ai_insights": ai_insights,
            }).execute()
        except Exception as save_error:
            print(f"Warning: Failed to save prediction history: {save_error}")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── CSV Upload Prediction ────────────────────────────────────────────────────
@app.post("/predict_csv", response_model=PredictionResponse)
async def predict_csv(
    file: UploadFile = File(...),
    generate_insights: bool = Query(False),
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

        result = {
            "predictions": processed_df.to_dict(orient="records"),
            "dashboard_metrics": {
                "top_performing": top_p.to_dict(orient="records"),
                "top_risk": top_r.to_dict(orient="records"),
                "risk_distribution": risk_dist.to_dict()
            },
            "ai_insights": ai_insights
        }

        # Auto-save to history
        try:
            supabase.table("prediction_history").insert({
                "user_id": user.id,
                "prediction_type": "batch",
                "input_data": {"filename": file.filename, "student_count": len(df)},
                "result_data": result["dashboard_metrics"],
                "ai_insights": ai_insights,
            }).execute()
        except Exception as save_error:
            print(f"Warning: Failed to save prediction history: {save_error}")

        return result
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


# ── Prediction History ───────────────────────────────────────────────────────
@app.get("/history")
async def get_history(
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user)
):
    """Fetch the current user's prediction history."""
    try:
        result = (
            supabase.table("prediction_history")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"history": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/history/{record_id}")
async def delete_history(record_id: str, user=Depends(get_current_user)):
    """Delete a specific prediction history record (only own records via RLS)."""
    try:
        supabase.table("prediction_history").delete().eq("id", record_id).eq("user_id", user.id).execute()
        return {"message": "Record deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
