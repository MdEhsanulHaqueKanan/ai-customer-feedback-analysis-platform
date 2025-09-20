# Use an official Python runtime as a parent image
FROM python:3.10-slim

# --- Tesseract OCR Installation ---
# Install the Tesseract OCR engine and its English language pack inside the container
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng

# Set the working directory inside the container
WORKDIR /code

# Copy only the necessary files from the 'backend' subfolder
COPY backend/requirements.txt .
COPY backend/app ./app
COPY backend/data ./data
COPY backend/models ./models
COPY backend/run.py .
COPY backend/config.py .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Expose the port that Hugging Face Spaces uses
EXPOSE 7860

# Set the environment variable to use a local cache directory
ENV SENTENCE_TRANSFORMERS_HOME=/code/sentence-transformers-cache

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "run:app"]