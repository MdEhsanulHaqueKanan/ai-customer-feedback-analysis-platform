# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory
WORKDIR /code

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
# Add huggingface-hub[cli] to install the command-line tool
RUN pip install --no-cache-dir -r requirements.txt gunicorn "huggingface-hub[cli]"

# --- DEFINITIVE FIX: Reliably pre-cache the Sentence Transformer model ---
# Set the environment variable to define the cache location
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache
# Use the official huggingface-cli to download the model into the cache.
# This is the most robust method.
RUN huggingface-cli download sentence-transformers/all-MiniLM-L6-v2 --cache-dir $SENTENCE_TRANSFORMERS_HOME

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