#!/bin/bash

# Verify Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

# Verify Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# Check if data directory exists and contains required files
if [ ! -d "./data" ]; then
    echo "Creating data directory..."
    mkdir -p ./data
    echo "Please place the following files in the data directory:"
    echo "- Disease and symptoms dataset.csv"
    echo "- Mapped_Diseases_Final2.xlsx"
    echo "- Faculty_Cleaned_ML.xlsx"
    echo "Then run this script again."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker-compose build

# Check if the model files exist
if [ ! -f "./data/optimized_rf_model.pkl" ] || [ ! -f "./data/label_encoder.pkl" ] || [ ! -f "./data/symptom_columns.pkl" ]; then
    echo "Model files not found. Do you want to train the model now? (y/n)"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo "Training model..."
        docker-compose run --rm doctor-api python train_model.py
    else
        echo "Please train the model before running the API."
        echo "You can do this by running: docker-compose run --rm doctor-api python train_model.py"
        exit 1
    fi
fi

# Start the container
echo "Starting Docker container..."
docker-compose up -d

# Wait for the container to start
echo "Waiting for the API to start..."
sleep 10

# Test the API
echo "Testing the API..."
curl -s http://localhost:8080/ || { echo "API is not responding. Check docker logs with: docker-compose logs"; exit 1; }

echo "Docker setup complete! The API is now running at http://localhost:8080/"
echo "You can access the API documentation at http://localhost:8080/docs"
