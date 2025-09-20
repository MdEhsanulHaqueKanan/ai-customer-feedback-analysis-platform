# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory
WORKDIR /code

# Copy requirements and install Python dependencies first to leverage Docker caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# --- FINAL FIX: Pre-download and cache the Sentence Transformer model during the build ---
# Set the environment variable to define the cache location
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache
# Run a Python command to download the model into that specific cache directory
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Now, copy the rest of the application code
COPY backend/app ./app
COPY backend/data ./data
COPY backend/models ./models
COPY backend/run.py .
COPY backend/config.py .

# Expose the application port
EXPOSE 7860

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "run:app"]