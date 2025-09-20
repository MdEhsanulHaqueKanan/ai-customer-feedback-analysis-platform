# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory
WORKDIR /code

# Copy requirements first to leverage Docker layer caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn "huggingface-hub[cli]"

# Pre-cache the Sentence Transformer model
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache
RUN huggingface-cli download sentence-transformers/all-MiniLM-L6-v2 --cache-dir $SENTENCE_TRANSFORMERS_HOME

# Now, copy the entire backend application code
COPY backend/ ./

# --- FINAL FIX for permissions ---
# Create and set correct ownership for the persistent DB directory
# The model cache is already handled by the downloader.
RUN mkdir -p /code/chroma_db && \
    chown -R 1000:1000 /code/chroma_db

# Expose the application port
EXPOSE 7860

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "run:app"]