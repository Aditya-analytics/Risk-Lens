import os
import joblib
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from rapidfuzz import process, fuzz
except ImportError:
    # Fallback to a simple substring match if rapidfuzz is missing or suggest installation
    print("Warning: rapidfuzz not found. Install it for better column matching: pip install rapidfuzz")
    process, fuzz = None, None


class StudentRiskPredictor:
    """
    A class to predict student risk levels based on study habits and performance data.
    """

    def __init__(self, model_path: str = "student_pred_pipe copy"):
        """
        Initializes the predictor with a set of standard columns and loads the model.

        Args:
            model_path (str): The path to the serialized model file.
        """
        self.cols = [
            "hours_studied", "avg_mid_sem_marks",
            "avg_prev_sem_marks", "attendance_percentage",
            "mobile_screen_time_hours"
        ]
        self.model = self.load_model(model_path)

    def load_model(self, path: str) -> Any:
        """
        Loads the joblib model from the specified path.

        Args:
            path (str): Path to the model file.

        Returns:
            Any: The loaded model or None if loading fails.
        """
        try:
            return joblib.load(path)
        except Exception as e:
            print(f"Error loading model from {path}: {e}")
            return None

    def clean(self, text: str) -> str:
        """
        Cleans a given string by stripping, lowering, and removing spaces and underscores.
        """
        try:
            return text.strip().lower().replace("_", "").replace(" ", "")
        except (AttributeError, TypeError):
            return ""

    def match_columns(self, user_cols: List[str], threshold: int = 60) -> Dict[str, str]:
        """
        Maps user-provided column names to standard column names using fuzzy matching.

        Args:
            user_cols (List[str]): List of columns from the user's data.
            threshold (int): Fuzzy matching score threshold.

        Returns:
            Dict[str, str]: A mapping from user columns to standard columns.
        """
        if process is None or fuzz is None:
            # Simple direct match fallback
            mapping = {}
            for col in user_cols:
                if col in self.cols:
                    mapping[col] = col
            return mapping

        mapping = {}
        cleaned_standard = [self.clean(c) for c in self.cols]

        for col in user_cols:
            res = process.extractOne(
                self.clean(col),
                cleaned_standard,
                scorer=fuzz.token_sort_ratio
            )
            
            if res:
                match, score, _ = res
                if score > threshold:
                    original_match = self.cols[cleaned_standard.index(match)]
                    mapping[col] = original_match

        return mapping

    def rename_columns(self, df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
        """
        Renames columns of the dataframe based on the provided mapping.
        """
        return df.rename(columns=mapping)

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Runs the model prediction on the processed dataframe.

        Args:
            df (pd.DataFrame): Dataframe containing the required columns.

        Returns:
            pd.DataFrame: Dataframe with added 'prediction' and 'risk_probability' columns.
        """
        if self.model is None:
            raise ValueError("Model not loaded. Ensure the model file exists and is valid.")

        missing_cols = [col for col in self.cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns after mapping: {missing_cols}")

        new_df = df[self.cols]
        df["prediction"] = self.model.predict(new_df)

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(new_df)
            # Safely find index of "high risk" class (assumed to be 1 or 'high')
            try:
                classes = list(self.model.classes_)
                high_risk_index = classes.index(1) if 1 in classes else classes.index('high')
                df["risk_probability"] = probs[:, high_risk_index]
            except (ValueError, IndexError):
                # Fallback to the second column if class name mismatch
                df["risk_probability"] = probs[:, 1] if probs.shape[1] > 1 else probs[:, 0]
        else:
            df["risk_probability"] = 0.5  # Default if probabilities unavailable

        return df

    def pipeline(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        The full processing pipeline: matches columns, renames them, and runs prediction.

        Args:
            df (pd.DataFrame): The input dataframe.

        Returns:
            pd.DataFrame: The processed dataframe with results.
        """
        # Step 1: Match columns
        mapping = self.match_columns(df.columns.tolist())
        
        # Step 4: Rename columns
        df = self.rename_columns(df, mapping)
        
        # Ensure column names are unique after renaming
        # This prevents ValueError: DataFrame columns must be unique for orient='records'
        df = df.loc[:, ~df.columns.duplicated()].copy()
        
        # Step 3: Predict
        try:
            df = self.predict(df)
        except Exception as e:
            print(f"Prediction failed: {e}")
            df["error"] = str(e)
            
        return df

    def dashboard(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.DataFrame]:
        """
        Generates dashboard metrics from the predicted data.

        Returns:
            Tuple: Top performing students, Top risk students, Risk distribution, and a sample.
        """
        if "prediction" not in df.columns or "risk_probability" not in df.columns:
            return pd.DataFrame(), pd.DataFrame(), pd.Series(), pd.DataFrame()

        # Top risk students (prediction == 1 means High Risk)
        risk_students = df[df['prediction'] == 1].copy()
        risk_students.sort_values(by="risk_probability", ascending=False, inplace=True)
        top_risk = risk_students.head(5)

        # Top performing students (prediction == 0 means Low Risk)
        performing_students = df[df['prediction'] == 0].copy()
        performing_students.sort_values(by="risk_probability", ascending=True, inplace=True)
        top_performing = performing_students.head(5)

        # Risk distribution
        risk_distribution = df['prediction'].value_counts()
        risk_percentage = (risk_distribution / len(df) * 100) if len(df) > 0 else pd.Series()

        # Sample for display
        sample_size = min(5, len(df))
        sample = df.sample(sample_size) if len(df) > 0 else pd.DataFrame()

        return top_performing, top_risk, risk_percentage, sample

    def generate_ai_insights(self, top_performing: pd.DataFrame, top_risk: pd.DataFrame, risk_percentage: pd.Series) -> str:
        """
        Generates actionable insights and recommendations using Gemini AI based on dashboard metrics.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return "AI Insights unavailable: GEMINI_API_KEY not found in environment."

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash-lite')

            # Prepare data summary for the prompt
            risk_summary = risk_percentage.to_dict()
            
            # Format top risk students for prompt (limit to key features)
            if top_risk.empty:
                risk_rows = []
            else:
                valid_cols = [c for c in (self.cols + ["risk_probability"]) if c in top_risk.columns]
                risk_rows = top_risk[valid_cols].head(3).to_dict(orient="records")
            
            prompt = f"""
            You are an educational data analyst. Based on the following student risk assessment data, provide a concise summary of insights and actionable recommendations.
            
            Note : Use bullet points answer style

            Data Summary:
            - Risk Distribution (%): {risk_summary}
            - Top 3 At-Risk Students Samples: {risk_rows}

            Standard Metrics being tracked: {self.cols}

            Please provide:
            1. A brief analysis of the current risk landscape.
            2. 3-4 specific interventions for high-risk students and mention their names as well.
            3. Long-term strategies to improve overall student performance.
            Keep the tone professional and the advice practical.
            """

            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating AI insights: {str(e)}"

    def generate_student_insights(self, student_data: Dict[str, Any], risk_probability: float, prediction: int) -> str:
        """
        Generates personalized recommendations for a single student based on their own metrics.
        """
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return "AI Recommendations unavailable: GEMINI_API_KEY not found in environment."

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash-lite')

            risk_level = "High Risk" if prediction == 1 else "Low Risk"
            risk_percent = round(risk_probability * 100)

            prompt = f"""
            You are an empathetic academic advisor. Analyze this student's self-reported metrics and provide personalized feedback.
            
            Note: Use bullet points answer style.

            Student Data:
            {student_data}
            
            Risk Assessment: {risk_level} ({risk_percent}% risk of poor academic performance)
            
            Please provide:
            1. A brief encouraging opening acknowledging their current standing.
            2. 2-3 specific, actionable recommendations based ONLY on their metrics (e.g., if screen time is high, address it. If study hours are low, address it).
            3. A supportive closing statement.
            Keep the tone supportive, direct, and constructive.
            """

            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating typical student insights: {str(e)}"


if __name__ == "__main__":
    # Example usage:
    # predictor = StudentRiskPredictor()
    # data = pd.read_csv("students.csv")
    # results = predictor.pipeline(data)
    # top_p, top_r, dist, samp = predictor.dashboard(results)
    pass


        



