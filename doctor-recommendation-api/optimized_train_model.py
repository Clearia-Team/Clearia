import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os
import pickle
import psutil
import time
import gc
import sys
from joblib import Parallel, delayed, effective_n_jobs

# Function to monitor and print memory usage
def print_memory_usage():
    memory_usage = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024
    print(f"Current memory usage: {memory_usage:.2f} MB")

print("Starting ultra memory-efficient model training...")
print_memory_usage()

# Set CPU and memory limits
n_jobs = max(1, int(psutil.cpu_count() * 0.3))  # Use 30% of cores
print(f"Using {n_jobs} CPU cores for training")

# Paths to data files
data_dir = "./data"
symptoms_path = os.path.join(data_dir, "Disease and symptoms dataset.csv")

# Check if file exists
if not os.path.exists(symptoms_path):
    print(f"Error: symptoms file not found at {symptoms_path}")
    exit(1)

# Load dataset in extremely memory-efficient way
print("Loading dataset header first to determine structure...")
df_sample = pd.read_csv(symptoms_path, nrows=5)
total_columns = len(df_sample.columns)
symptom_columns = df_sample.columns.drop("diseases")
print(f"Dataset has {total_columns} columns including the target column")
print_memory_usage()

# Count lines without loading full dataset
def count_lines(filepath):
    count = 0
    with open(filepath, 'r') as f:
        for _ in f:
            count += 1
    return count - 1  # Subtract header

total_rows = count_lines(symptoms_path)
print(f"Total rows in dataset: {total_rows}")

# Determine optimal chunk size based on available memory
available_memory = psutil.virtual_memory().available / (1024 * 1024)  # in MB
print(f"Available memory: {available_memory:.2f} MB")

# Target using only 50% of available memory
memory_target = available_memory * 0.5  
estimated_row_size = 0.5  # MB per 1000 rows - adjust based on observations
chunk_size = int((memory_target / estimated_row_size) * 1000)
chunk_size = min(chunk_size, 10000)  # Cap at 10,000 rows per chunk
print(f"Using chunk size of {chunk_size} rows")

# Initialize label encoder
le = LabelEncoder()
all_labels = set()

# First pass to collect all unique disease labels
print("First pass: collecting unique disease labels...")
for chunk in pd.read_csv(symptoms_path, chunksize=chunk_size):
    all_labels.update(chunk["diseases"].unique())
    print(f"\rCollected {len(all_labels)} unique labels so far...", end="")
    sys.stdout.flush()

print(f"\nFound {len(all_labels)} unique disease labels")
print_memory_usage()

# Fit the encoder with all labels
print("Fitting label encoder...")
le.fit(list(all_labels))
print_memory_usage()

# Train the model incrementally
print("Training Random Forest model incrementally...")
start_time = time.time()

# Create a minimal initial model
n_estimators_total = 200
n_estimators_per_batch = 10
trees_per_chunk = 2

# Initialize base model with minimal trees
print("Initializing base model...")
base_model = RandomForestClassifier(n_estimators=1, random_state=42, 
                                   class_weight="balanced", n_jobs=1)

# For the first chunk, just create the model structure
first_chunk = next(pd.read_csv(symptoms_path, chunksize=chunk_size))
X_first = first_chunk[symptom_columns].values
y_first = le.transform(first_chunk["diseases"].values)
base_model.fit(X_first, y_first)

# Delete the first chunk data to free memory
del first_chunk, X_first, y_first
gc.collect()
print_memory_usage()

# Clear the estimators to start fresh with our incremental approach
base_estimators = base_model.estimators_
base_model.estimators_ = []

# Function to train a single tree
def train_tree(X, y, tree_idx):
    tree = RandomForestClassifier(n_estimators=1, random_state=42+tree_idx, 
                                  bootstrap=True, class_weight="balanced")
    tree.fit(X, y)
    return tree.estimators_[0]

# Incrementally train the model
trees_trained = 0
total_chunks = (total_rows + chunk_size - 1) // chunk_size
chunks_processed = 0

new_estimators = []
while trees_trained < n_estimators_total:
    print(f"\nTraining batch {trees_trained//trees_per_chunk + 1}/{n_estimators_total//trees_per_chunk}...")
    
    # Process each chunk
    for i, chunk in enumerate(pd.read_csv(symptoms_path, chunksize=chunk_size)):
        chunks_processed += 1
        print(f"Processing chunk {chunks_processed}/{total_chunks}...")
        
        # Prepare data
        X_chunk = chunk[symptom_columns].values
        y_chunk = le.transform(chunk["diseases"].values)
        
        # Train trees for this chunk
        for j in range(trees_per_chunk):
            if trees_trained >= n_estimators_total:
                break
                
            print(f"Training tree {trees_trained + 1}/{n_estimators_total}...")
            tree = train_tree(X_chunk, y_chunk, trees_trained)
            new_estimators.append(tree)
            trees_trained += 1
            print_memory_usage()
            
        # Free memory
        del X_chunk, y_chunk
        gc.collect()
        
        # Save intermediate model every 20 trees as backup
        if trees_trained % 20 == 0 and trees_trained > 0:
            print(f"Saving intermediate model with {trees_trained} trees...")
            temp_model = RandomForestClassifier(n_estimators=1, random_state=42)
            temp_model.fit(np.zeros((1, len(symptom_columns))), np.zeros(1))
            temp_model.estimators_ = new_estimators
            temp_model.n_estimators = len(new_estimators)
            
            pickle.dump(temp_model, open(f"data/rf_model_temp_{trees_trained}trees.pkl", "wb"))
            pickle.dump(le, open("data/label_encoder.pkl", "wb"))
            pickle.dump(list(symptom_columns), open("data/symptom_columns.pkl", "wb"))
            
            print(f"Intermediate model saved with {trees_trained} trees")
            
        if trees_trained >= n_estimators_total:
            break
    
    # If we've processed all chunks but still need more trees, start over
    if trees_trained < n_estimators_total:
        print("Restarting chunk processing to train more trees...")

print(f"\nModel training completed in {time.time() - start_time:.2f} seconds")

# Create the final model
final_model = RandomForestClassifier(n_estimators=1, random_state=42)
final_model.fit(np.zeros((1, len(symptom_columns))), np.zeros(1))
final_model.estimators_ = new_estimators
final_model.n_estimators = len(new_estimators)

print(f"Final model has {len(final_model.estimators_)} trees")
print_memory_usage()

# Save model and encoder to pickle files
print("Saving final model and data to pickle files...")
pickle.dump(final_model, open("data/optimized_rf_model.pkl", "wb"))
pickle.dump(le, open("data/label_encoder.pkl", "wb"))
pickle.dump(list(symptom_columns), open("data/symptom_columns.pkl", "wb"))

print("Model training and saving complete!")
print_memory_usage()
