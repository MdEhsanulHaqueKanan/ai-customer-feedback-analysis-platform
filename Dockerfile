# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory
WORKDIR /code

# Copy application files
COPY backend/requirements.txt .
COPY backend/app ./app
COPY backend/data ./data
COPY backend/models ./models
COPY backend/run.py .
COPY backend/config.py .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# --- FINAL FIX ---
# Create the cache directory and give the default user ownership.
# This ensures the application has permission to write model files here.
RUN mkdir -p /code/sentence-transformers-cache && \
    chown -R 1000:1000 /code/sentence-transformers-cache

# Set the environment variable to use this new, permissioned directory
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache

# Expose the application port
EXPOSE 7860

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "run:app"]