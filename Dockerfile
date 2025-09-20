# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory
WORKDIR /code

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn "huggingface-hub[cli]"

# --- DEFINITIVE FIX FOR ALL PERMISSION ERRORS ---
# Set the environment variable for the model cache
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache
# Pre-download the model into the cache directory during the build
RUN huggingface-cli download sentence-transformers/all-MiniLM-L6-v2 --cache-dir $SENTENCE_TRANSFORMERS_HOME
# Create AND set correct ownership for both the model cache and the persistent DB directory
RUN mkdir -p /code/sentence-transformers-cache /code/backend/chroma_db && \
    chown -R 1000:1000 /code/sentence-transformers-cache /code/backend/chroma_db

# Now, copy the rest of the application code
COPY backend/ ./backend
COPY run.py .
COPY config.py .

# Expose the application port
EXPOSE 7860

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "run:app"]