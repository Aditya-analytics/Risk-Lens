from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import os
from app.model import StudentRiskPredictor
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="Student Risk Assessment API",
    description="Backend API for predicting student risk based on study habits and performance data.",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
# Note: The model path is relative to the root where this script will be executed
MODEL_PATH = "student_risk_model"
predictor = StudentRiskPredictor(model_path=MODEL_PATH)

# Pydantic models for request/response
class StudentData(BaseModel):
    # Mapping to standard columns from model.py
    hours_studied: float
    avg_mid_sem_marks: float
    avg_prev_sem_marks: float
    attendance_percentage: float
    mobile_screen_time_hours: float

class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    dashboard_metrics: Optional[Dict[str, Any]] = None
    ai_insights: Optional[str] = None

@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "online", "message": "Student Risk Assessment API is running."}

@app.post("/predict_json", response_model=PredictionResponse)
async def predict_json(students: List[Dict[str, Any]]):
    """
    Accepts a list of student JSON objects and returns predictions.
    Fields will be matched using fuzzy matching defined in StudentRiskPredictor.
    """
    if not students:
        raise HTTPException(status_code=400, detail="No data provided.")
    
    try:
        # Convert list of dicts to DataFrame
        df = pd.DataFrame(students)
        
        # Run pipeline
        processed_df = predictor.pipeline(df)
        
        # Get dashboard metrics
        top_p, top_r, risk_dist, _ = predictor.dashboard(processed_df)
        
        # Get AI insights
        ai_insights = predictor.generate_ai_insights(top_p, top_r, risk_dist)
        
        # Prepare response
        return {
            "predictions": processed_df.to_dict(orient="records"),
            "dashboard_metrics": {
                "top_performing": top_p.to_dict(orient="records"),
                "top_risk": top_r.to_dict(orient="records"),
                "risk_distribution": risk_dist.to_dict()
            },
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_csv", response_model=PredictionResponse)
async def predict_csv(file: UploadFile = File(...)):
    """
    Accepts a CSV file, processes it, and returns predictions.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    try:
        # Read the uploaded CSV
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        # Run pipeline
        processed_df = predictor.pipeline(df)
        
        # Get dashboard metrics
        top_p, top_r, risk_dist, _ = predictor.dashboard(processed_df)
        
        # Get AI insights
        ai_insights = predictor.generate_ai_insights(top_p, top_r, risk_dist)
        
        # Prepare response
        return {
            "predictions": processed_df.to_dict(orient="records"),
            "dashboard_metrics": {
                "top_performing": top_p.to_dict(orient="records"),
                "top_risk": top_r.to_dict(orient="records"),
                "risk_distribution": risk_dist.to_dict()
            },
            "ai_insights": ai_insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
