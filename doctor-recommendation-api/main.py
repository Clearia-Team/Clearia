from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pickle
import os
import uvicorn
from contextlib import asynccontextmanager
import gc
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define lifespan to replace @app.on_event decorator (which is deprecated)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load data and model on startup
    await load_model()
    yield
    # Clean up when application shuts down
    global model, le, symptom_columns, diseases_df, faculty_df
    del model, le, symptom_columns, diseases_df, faculty_df
    gc.collect()

app = FastAPI(
    title="Doctor Recommendation API",
    description="API for recommending doctors based on symptoms",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class SymptomRequest(BaseModel):
    symptoms: str  # Comma-separated symptoms

# Response model
class DoctorRecommendation(BaseModel):
    predicted_disease: str
    doctors: list
    debug_info: dict

# Global variables for models and data
model = None
le = None
symptom_columns = None
diseases_df = None
faculty_df = None

async def load_model():
    global model, le, symptom_columns, diseases_df, faculty_df
    
    logger.info("Loading datasets and model...")
    
    # Paths to data files
    data_dir = os.environ.get("DATA_DIR", "./data")
    model_path = os.path.join(data_dir, "optimized_rf_model.pkl")
    encoder_path = os.path.join(data_dir, "label_encoder.pkl")
    columns_path = os.path.join(data_dir, "symptom_columns.pkl")
    diseases_path = os.path.join(data_dir, "Mapped_Diseases_Final2.xlsx")
    faculty_path = os.path.join(data_dir, "Faculty_Cleaned_ML.xlsx")
    
    # Check if pickle files exist, if not train the model
    if not all(os.path.exists(p) for p in [model_path, encoder_path, columns_path]):
        logger.error("Pre-trained model files not found. Please run train_model.py first.")
        raise FileNotFoundError(f"Required pickle files not found. Run train_model.py first.")
    
    # Check if other required files exist
    for path, name in [(diseases_path, "diseases"), (faculty_path, "faculty")]:
        if not os.path.exists(path):
            logger.error(f"Error: {name} file not found at {path}")
            raise FileNotFoundError(f"Required data file not found: {path}")
    
    try:
        # Load pre-trained model and required data
        logger.info("Loading pre-trained model from pickle files...")
        
        # Load model with diagnostic info
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        logger.info(f"Model type: {type(model).__name__}")
        
        # Check model structure
        if not hasattr(model, 'estimators_') or len(model.estimators_) == 0:
            logger.error("Model has no estimators or is improperly structured")
            raise ValueError("Invalid model structure")
            
        # Load label encoder
        with open(encoder_path, "rb") as f:
            le = pickle.load(f)
        logger.info(f"Label encoder loaded with {len(le.classes_)} classes")
        
        # Load symptom columns
        with open(columns_path, "rb") as f:
            symptom_columns = pickle.load(f)
        logger.info(f"Loaded {len(symptom_columns)} symptom columns")
        
        # Test a tree to verify functionality - try to predict with first estimator
        try:
            first_tree = model.estimators_[0]
            test_vector = np.zeros(len(symptom_columns))
            test_pred = first_tree.predict([test_vector])
            logger.info(f"Test prediction from first tree: {test_pred}")
        except Exception as e:
            logger.error(f"Test prediction failed: {str(e)}")
            # This helps diagnose if the trees are properly structured
        
        # Load mapping datasets
        diseases_df = pd.read_excel(diseases_path)
        faculty_df = pd.read_excel(faculty_path)
        
        # Clean faculty data
        faculty_df['Department'] = faculty_df['Department'].str.strip().str.strip(')')
        
        # Print diagnostic information
        logger.info("Model and data loaded successfully!")
        logger.info(f"Number of symptom columns: {len(symptom_columns)}")
        logger.info(f"Number of disease classes: {len(le.classes_)}")
        logger.info(f"Number of estimators in model: {len(model.estimators_)}")
        logger.info(f"Sample of classes: {list(le.classes_)[:5]}")
        
        # Check model and columns compatibility
        if hasattr(model, 'n_features_in_'):
            expected_features = model.n_features_in_
            actual_features = len(symptom_columns)
            if expected_features != actual_features:
                logger.warning(f"Model expects {expected_features} features but we have {actual_features} symptom columns")
            else:
                logger.info(f"Feature count match confirmed: {expected_features} features")
        
    except Exception as e:
        logger.error(f"Error loading model or data: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise

def predict_disease_from_symptoms(symptom_input):
    global model, le, symptom_columns
    
    # Safety check
    if model is None or le is None or symptom_columns is None:
        raise ValueError("Model or required data not loaded")
    
    # Debug the input
    logger.info(f"Input symptoms: {symptom_input}")
    
    # Create input vector
    input_symptoms = [sym.strip().lower() for sym in symptom_input.split(",")]
    logger.info(f"Processed symptoms: {input_symptoms}")
    
    # Debug: count how many symptoms are actually in our columns
    matched_symptoms = [s for s in input_symptoms if any(s in col.lower() for col in symptom_columns)]
    logger.info(f"Found {len(matched_symptoms)}/{len(input_symptoms)} symptoms in model columns")
    
    # Create a binary vector where 1 means the symptom is present
    input_vector = [1 if any(sym in symptom.lower() for sym in input_symptoms) else 0 for symptom in symptom_columns]
    
    # Count non-zero features for debug
    nonzero_count = sum(input_vector)
    logger.info(f"Input vector has {nonzero_count} non-zero features out of {len(input_vector)}")
    
    debug_info = {
        "symptoms_input": symptom_input,
        "symptoms_processed": input_symptoms,
        "symptoms_matched_count": len(matched_symptoms),
        "nonzero_features": nonzero_count,
        "vector_length": len(input_vector),
        "classes_count": len(le.classes_),
        "estimators_count": len(model.estimators_),
        "prediction_method": "unknown"
    }
    
    # First try: Use model's predict_proba if available
    try:
        logger.info("Attempting method 1: model.predict_proba")
        debug_info["prediction_method"] = "predict_proba"
        
        proba = model.predict_proba([input_vector])
        pred_encoded = np.argmax(proba[0])
        predicted_disease = le.inverse_transform([pred_encoded])[0]
        
        logger.info(f"Method 1 successful - predicted disease: {predicted_disease}")
        debug_info["prediction_confidence"] = float(proba[0][pred_encoded])
        return predicted_disease, debug_info
    except Exception as e:
        logger.warning(f"Method 1 failed: {str(e)}")

    # Second try: Use direct predict
    try:
        logger.info("Attempting method 2: model.predict")
        debug_info["prediction_method"] = "predict"
        
        pred_encoded = model.predict([input_vector])[0]
        predicted_disease = le.inverse_transform([pred_encoded])[0]
        
        logger.info(f"Method 2 successful - predicted disease: {predicted_disease}")
        return predicted_disease, debug_info
    except Exception as e:
        logger.warning(f"Method 2 failed: {str(e)}")

    # Third try: Manual voting system
    try:
        logger.info("Attempting method 3: manual voting")
        debug_info["prediction_method"] = "manual_voting"
        
        class_votes = {}
        # Loop through each tree and collect its vote
        for tree in model.estimators_:
            tree_pred = tree.predict([input_vector])[0]
            if tree_pred in class_votes:
                class_votes[tree_pred] += 1
            else:
                class_votes[tree_pred] = 1
        
        if not class_votes:
            raise ValueError("No predictions made by any tree")
        
        # Get the class with most votes and its count
        pred_encoded, vote_count = max(class_votes.items(), key=lambda x: x[1])
        predicted_disease = le.inverse_transform([pred_encoded])[0]
        
        logger.info(f"Method 3 successful - predicted disease: {predicted_disease} with {vote_count} votes")
        debug_info["votes"] = vote_count
        debug_info["total_trees"] = len(model.estimators_)
        return predicted_disease, debug_info
    except Exception as e:
        logger.warning(f"Method 3 failed: {str(e)}")
    
    # Last Resort: Try a different manual approach
    try:
        logger.info("Attempting method 4: tree-by-tree")
        debug_info["prediction_method"] = "tree_by_tree"
        
        predictions = []
        for idx, estimator in enumerate(model.estimators_):
            try:
                # Try to get prediction from this specific tree
                pred = estimator.predict([input_vector])[0]
                predictions.append(pred)
            except Exception as tree_error:
                logger.warning(f"Tree {idx} failed: {str(tree_error)}")
        
        if not predictions:
            raise ValueError("No successful tree predictions")
            
        from collections import Counter
        most_common = Counter(predictions).most_common(1)
        pred_encoded = most_common[0][0]
        predicted_disease = le.inverse_transform([pred_encoded])[0]
        
        logger.info(f"Method 4 successful - predicted disease: {predicted_disease}")
        debug_info["successful_trees"] = len(predictions)
        return predicted_disease, debug_info
    except Exception as e:
        logger.error(f"Method 4 failed: {str(e)}")
    
    # Ultimate fallback - check if any symptoms exist in the dataset
    logger.warning("All prediction methods failed, falling back to symptom matching")
    debug_info["prediction_method"] = "symptom_matching_fallback"
    
    try:
        # Let's try loading the original training data
        data_dir = os.environ.get("DATA_DIR", "./data")
        symptoms_path = os.path.join(data_dir, "Disease and symptoms dataset.csv")
        
        if os.path.exists(symptoms_path):
            df = pd.read_csv(symptoms_path)
            logger.info(f"Loaded original dataset with {len(df)} rows")
            
            # Find rows with matching symptoms
            matches = []
            for symptom in input_symptoms:
                # Check if any column contains this symptom
                for col in df.columns:
                    if col != 'diseases' and symptom in str(col).lower():
                        # Found a column that matches this symptom
                        matched_rows = df[df[col] == 1]
                        if not matched_rows.empty:
                            matches.extend(matched_rows['diseases'].tolist())
            
            if matches:
                # Return the most common disease among matches
                most_common = Counter(matches).most_common(1)[0][0]
                logger.info(f"Found matching disease by symptom lookup: {most_common}")
                debug_info["matched_count"] = len(matches)
                return most_common, debug_info
    except Exception as e:
        logger.error(f"Symptom matching fallback failed: {str(e)}")
    
    # Final fallback - totally generic response
    logger.error("All methods failed - returning generic response")
    return "General Health Issue", debug_info

def get_doctors_by_disease(disease_name):
    global diseases_df, faculty_df
    
    # Safety check
    if diseases_df is None or faculty_df is None:
        raise ValueError("Required data not loaded")
        
    logger.info(f"Finding doctors for disease: {disease_name}")
    # Make sure we match case-insensitive
    disease_row = diseases_df[diseases_df['Diseases'].str.strip().str.lower() == disease_name.lower()]
    
    if disease_row.empty:
        logger.warning(f"No department found for disease '{disease_name}', defaulting to 'Medicine'")
        department = "Medicine"
    else:
        department = disease_row.iloc[0]['Department'].strip()
        logger.info(f"Found department: {department}")
    
    # Match department in faculty, case-insensitive
    doctors = faculty_df[faculty_df['Department'].str.lower() == department.lower()]
    
    if doctors.empty:
        logger.warning(f"No doctors found in department: {department}")
        return []
    
    # Return up to 3 doctors (randomly selected)
    selected_doctors = doctors.sample(min(3, len(doctors)))
    return selected_doctors[['Name', 'Designation', 'Department']].to_dict(orient='records')  # type: ignore


@app.get("/")
async def root():
    return {
        "message": "Doctor Recommendation API is running",
        "model_loaded": model is not None,
        "symptom_count": len(symptom_columns) if symptom_columns is not None else 0,
        "classes_count": len(le.classes_) if le is not None else 0,
        "model_estimators": len(model.estimators_) if model is not None and hasattr(model, 'estimators_') else 0,
        "sample_symptoms": list(symptom_columns)[:5] if symptom_columns is not None else []
    }

@app.get("/symptoms")
async def list_symptoms():
    if symptom_columns is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "symptoms": list(symptom_columns)
    }

@app.post("/recommend")
async def recommend_doctors(request: SymptomRequest):
    if model is None or le is None or symptom_columns is None or diseases_df is None or faculty_df is None:
        raise HTTPException(status_code=500, detail="Model or data not loaded")
    
    if not request.symptoms or request.symptoms.strip() == "":
        raise HTTPException(status_code=400, detail="Symptoms cannot be empty")
    
    try:
        # Predict disease with debug info
        predicted_disease, debug_info = predict_disease_from_symptoms(request.symptoms)
        
        # Get doctor recommendations
        doctors = get_doctors_by_disease(predicted_disease)
        
        # If no doctors found, provide some default options
        if not doctors:
            logger.warning(f"No doctors found for disease '{predicted_disease}', using defaults")
            doctors = [
                {"Name": "Dr. General Medicine", "Designation": "General Physician", "Department": "Medicine"}
            ]
        
        return {
            "predicted_disease": predicted_disease,
            "doctors": doctors,
            "debug_info": debug_info
        }
    except Exception as e:
        import traceback
        error_details = f"Error processing request: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_details)
        raise HTTPException(status_code=500, detail=error_details)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
