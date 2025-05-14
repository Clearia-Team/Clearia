# Dockerized Doctor Recommendation API
This is a containerized version of the Doctor Recommendation API that provides doctor recommendations based on patient symptoms using a machine learning model.

## Prerequisites
- Docker
- Docker Compose

## Quick Start
1. **Clone the repository**

2. **Download the large dataset file**
   
   The main dataset file exceeds GitHub's file size limit (181.95 MB > 100.00 MB).
   Download it from Google Drive:
   ```
   https://drive.google.com/file/d/17akNawDf8CEPZf_ZFEZF8NOdokRwmWVq/view?usp=drive_link
   ```
   and place it in the `./data` directory as `Disease and symptoms dataset.csv`

3. **Prepare the data directory**
   
   Make sure the following files are in the `./data` directory:
   - `Disease and symptoms dataset.csv` (downloaded from Google Drive)
   - `Mapped_Diseases_Final2.xlsx`
   - `Faculty_Cleaned_ML.xlsx`

3. **Run the model training script**
   ```bash
   chmod +x train_with_limits.sh
   ./train_with_limits.sh
   ```
   This script will:
   - Use the optimized_train_model.py script to train the model with memory limits
   - Generate the required .pkl files (optimized_rf_model.pkl, label_encoder.pkl, symptom_columns.pkl)

4. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   This script will:
   - Check if Docker and Docker Compose are installed
   - Create the data directory if it doesn't exist
   - Build the Docker image
   - Start the Docker container
   - Test the API

5. **Alternatively, set up manually**
   ```bash
   # Build the Docker image
   docker-compose build
   # Start the container
   docker-compose up -d
   ```

## API Usage
Once the container is running, you can access the API:

### Health Check
```
GET http://localhost:8080/
```

### List Available Symptoms
```
GET http://localhost:8080/symptoms
```

### Get Doctor Recommendations
```
POST http://localhost:8080/recommend
Content-Type: application/json
{
  "symptoms": "fever, headache, cough"
}
```

### API Documentation
Interactive API documentation is available at:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### Example Usage with curl

```bash
curl -X POST "http://localhost:8080/recommend" \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "red eyes, discharge, irritation"}'
```

Example response:
```json
{
  "predicted_disease": "vulvodynia",
  "doctors": [
    {
      "Name": "Dr. Rakesh Shandil",
      "Designation": "Asst. Prof.",
      "Department": "Medicine"
    },
    {
      "Name": "Dr. Vimal Bharti",
      "Designation": "Asst. Prof.",
      "Department": "Medicine"
    },
    {
      "Name": "Dr. Satish Kumar",
      "Designation": "Assoc. Prof.",
      "Department": "Medicine"
    }
  ],
  "debug_info": {
    "symptoms_input": "red eyes, discharge, irritation",
    "symptoms_processed": ["red eyes", "discharge", "irritation"],
    "symptoms_matched_count": 2,
    "nonzero_features": 8,
    "vector_length": 377,
    "classes_count": 773,
    "estimators_count": 200,
    "prediction_method": "symptom_matching_fallback",
    "matched_count": 15965
  }
}

## Container Management
```bash
# View logs
docker-compose logs -f
# Stop the container
docker-compose down
# Restart the container
docker-compose restart
# Rebuild and restart (after code changes)
docker-compose down
docker-compose up -d --build
```

## Environment Variables
The following environment variables can be modified in the docker-compose.yml file:
- `DATA_DIR`: Directory containing data files (default: `/app/data`)
- `PORT`: Port to run the API on (default: `8080`)

## Project Structure
```
.
├── Dockerfile                         # Docker configuration
├── docker-compose.yml                 # Docker Compose configuration
├── requirements.txt                   # Python dependencies
├── setup.sh                           # Setup script
├── train_with_limits.sh               # Script to run optimized model training
├── optimized_train_model.py           # Optimized script to train and save the model
├── main.py                            # FastAPI application
└── data/                              # Data directory (mounted as volume)
    ├── Disease and symptoms dataset.csv  # Symptoms to diseases dataset
    ├── Mapped_Diseases_Final2.xlsx    # Diseases to departments mapping
    ├── Faculty_Cleaned_ML.xlsx        # Faculty/doctor information
    ├── optimized_rf_model.pkl         # Pre-trained Random Forest model (generated)
    ├── label_encoder.pkl              # Saved LabelEncoder instance (generated)
    └── symptom_columns.pkl            # Saved symptom column names (generated)
```

## Troubleshooting
If the API fails to start:
1. Check the logs: `docker-compose logs`
2. Verify that all required data files are in the `./data` directory
3. Ensure the model files have been created by running the training script: `./train_with_limits.sh`
4. Make sure ports are not already in use by another application
