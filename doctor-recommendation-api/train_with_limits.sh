#!/bin/bash

# Script to train the model with extreme resource limitations
# Usage: ./train_with_limits.sh [max_memory_mb] [max_cpu_percent]

# Default values
MAX_MEMORY=${1:-4096}  # Default to 4GB max memory
MAX_CPU=${2:-30}       # Default to 30% max CPU

echo "Starting model training with strict limits:"
echo "- Maximum memory: ${MAX_MEMORY}MB"
echo "- Maximum CPU: ${MAX_CPU}%"

# Create a systemd-run command to limit resources
if command -v systemd-run &> /dev/null; then
    echo "Using systemd-run to limit resources..."
    systemd-run --user --scope -p MemoryMax=${MAX_MEMORY}M -p CPUQuota=${MAX_CPU}% \
        python optimized_train_model.py
elif command -v docker &> /dev/null; then
    echo "Using Docker to limit resources..."
    docker run --rm \
        --cpus="$(echo "scale=2; ${MAX_CPU}/100*$(nproc)" | bc)" \
        --memory="${MAX_MEMORY}m" \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/optimized_train_model.py:/app/optimized_train_model.py" \
        python:3.9-slim \
        bash -c "pip install scikit-learn pandas numpy joblib psutil && python /app/optimized_train_model.py"
else
    echo "Training with cgroups memory limits..."
    # Create temporary cgroup
    CGROUP_NAME="rf_train_$(date +%s)"
    
    # Check if cgcreate is available
    if command -v cgcreate &> /dev/null; then
        sudo cgcreate -g memory,cpu:$CGROUP_NAME
        sudo cgset -r memory.limit_in_bytes=${MAX_MEMORY}M $CGROUP_NAME
        sudo cgset -r cpu.cfs_quota_us=$(($(cat /sys/fs/cgroup/cpu/cpu.cfs_period_us) * $MAX_CPU / 100)) $CGROUP_NAME
        
        # Run in cgroup
        sudo cgexec -g memory,cpu:$CGROUP_NAME python optimized_train_model.py
        
        # Clean up
        sudo cgdelete memory,cpu:$CGROUP_NAME
    else
        echo "No resource limiting tools available, using built-in Python limits only..."
        python optimized_train_model.py
    fi
fi

echo "Training process completed"
