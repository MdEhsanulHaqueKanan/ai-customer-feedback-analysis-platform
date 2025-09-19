from flask import current_app as app
from flask import jsonify, request
from .services import (
    data_service,
    query_reviews,
    process_uploaded_document
)

@app.route('/api/health', methods=['GET'])
def health_check():
    """A simple health check endpoint to confirm the server is running."""
    return jsonify({"status": "ok", "message": "API is healthy"})

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Provides the aggregated data needed to populate the main dashboard."""
    data, status_code = data_service.get_dashboard_data()
    return jsonify(data), status_code

@app.route('/api/assistant/query', methods=['POST'])
def handle_assistant_query():
    """
    Handles a user's question for the AI assistant and accepts an optional
    metadata filter for targeted searches.
    """
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"error": "Missing 'question' in request body."}), 400
    
    question = data['question']
    # Get the optional source filter from the request, defaulting to "all" if not provided.
    source_filter = data.get('source_filter', 'all')
    
    # Pass the question and the filter to the RAG service.
    response_data, status_code = query_reviews(question, source_filter=source_filter)
    
    return jsonify(response_data), status_code

@app.route('/api/document/upload', methods=['POST'])
def handle_document_upload():
    """Handles document uploads for text extraction and RAG ingestion."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    if file:
        response_data, status_code = process_uploaded_document(file)
        return jsonify(response_data), status_code
        
    return jsonify({"error": "Invalid file provided."}), 400