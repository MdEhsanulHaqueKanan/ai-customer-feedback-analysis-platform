import pandas as pd
from flask import current_app
import os
import io
import json
import time
import fitz  # PyMuPDF
import docx  # python-docx
import pytesseract
from sentence_transformers import SentenceTransformer
import chromadb
from dotenv import load_dotenv
from groq import Groq
from PIL import Image

# Manually specify the path to the Tesseract executable if needed
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- SERVICE INITIALIZATION (SINGLETON PATTERN) ---
load_dotenv()

class DataService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            print("Initializing DataService Singleton...")
            cls._instance = super(DataService, cls).__new__(cls)
            cls._instance.df = cls._instance._load_initial_data()
        return cls._instance

    def _load_initial_data(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(base_dir, '..', 'data', 'reviews_apparel_sample_10k.csv')
            df = pd.read_csv(data_path)
            
            df['review_date'] = pd.to_datetime(df['review_date'], errors='coerce')
            df.dropna(subset=['review_date'], inplace=True)
            df['sentiment'] = df['star_rating'].apply(self._map_sentiment)
            df['topic'] = df['verified_purchase'].map({'Y': 'Verified', 'N': 'Not Verified'}).fillna('Unknown')
            df['review_summary'] = df['review_body']
            print(f"Initial data loaded. DataFrame has {len(df)} rows.")
            return df
        except Exception as e:
            print(f"CRITICAL ERROR: Could not load initial dataset. {e}")
            return pd.DataFrame()

    def _map_sentiment(self, rating):
        if rating <= 2: return 'negative'
        elif rating == 3: return 'neutral'
        else: return 'positive'
    
    def get_dashboard_data(self):
        if self.df.empty:
            return {"error": "No data available to generate dashboard."}, 500
            
        sentiment_over_time = self.df.groupby([self.df['review_date'].dt.date, 'sentiment']).size().unstack(fill_value=0)
        sentiment_over_time.reset_index(inplace=True)
        sentiment_over_time = sentiment_over_time.rename(columns={'review_date': 'date'})
        sentiment_over_time['date'] = pd.to_datetime(sentiment_over_time['date']).dt.strftime('%Y-%m-%d')
        sentiment_trend_data = sentiment_over_time.sort_values(by='date').to_dict(orient='records')
        
        topic_counts = self.df['topic'].value_counts()
        total_topics = len(self.df)
        topic_distribution_data = []
        for name, value in topic_counts.items():
            percentage = round((value / total_topics) * 100, 2)
            topic_distribution_data.append({ "name": name, "value": int(value), "percentage": percentage })

        df_sorted = self.df.sort_values(by='review_date', ascending=True)
        df_recent = df_sorted[['review_headline', 'review_body', 'review_summary', 'sentiment', 'review_date', 'topic']].dropna(subset=['review_body']).tail(20)
        df_recent['review_date'] = df_recent['review_date'].dt.strftime('%Y-%m-%d')
        recent_feedback = df_recent.to_dict(orient='records')
        
        dashboard_data = {
            "sentiment_over_time": sentiment_trend_data,
            "topic_distribution": topic_distribution_data,
            "recent_feedback": recent_feedback
        }
        return dashboard_data, 200
        
    def add_document_chunk(self, chunk: dict, filename: str, timestamp: pd.Timestamp):
        """Appends a single structured feedback chunk with a specific timestamp."""
        text = chunk.get('feedback_text', '')
        sentiment = chunk.get('sentiment', 'neutral').lower()
        star_rating_map = {'positive': 5, 'neutral': 3, 'negative': 1}
        star_rating = star_rating_map.get(sentiment, 3)

        new_row = {
            'review_date': timestamp,
            'review_body': text,
            'review_summary': (text[:200] + '...') if len(text) > 200 else text,
            'review_headline': f"From report: {filename}",
            'star_rating': star_rating,
            'sentiment': sentiment,
            'topic': 'Document'
        }
        self.df = pd.concat([self.df, pd.DataFrame([new_row])], ignore_index=True)
        print(f"Added chunk from '{filename}'. DataFrame now has {len(self.df)} rows.")

# --- INITIALIZE ALL SINGLETON SERVICES ON STARTUP ---
print("Initializing AI services...")
data_service = DataService()
groq_client = Groq()
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
APP_DIR = os.path.dirname(__file__)
PERSISTENT_DB_PATH = os.path.join(APP_DIR, '..', 'chroma_db')
chroma_client = chromadb.PersistentClient(path=PERSISTENT_DB_PATH) 
review_collection = chroma_client.get_or_create_collection(name="product_reviews", metadata={"embedding_model": "all-MiniLM-L6-v2"})
print("All AI services initialized successfully.")

# --- REGULAR SERVICE FUNCTIONS ---

def extract_feedback_chunks_with_llm(full_text: str):
    # ... (This function remains the same) ...
    print("Sending document to LLM for intelligent chunking...")
    prompt = f"""
    You are an expert data extraction AI. Your task is to read the following document and identify every individual, distinct piece of customer feedback.
    For each piece of feedback, classify its sentiment as 'positive', 'negative', or 'neutral'.
    Present the output as a valid JSON array where each object has two keys: "sentiment" and "feedback_text".

    Example Output Format:
    [
      {{"sentiment": "positive", "feedback_text": "The new Flex-Fit denim jeans are a massive success."}},
      {{"sentiment": "negative", "feedback_text": "The stitching on the cuff of my new jacket came undone the first day I wore it."}}
    ]

    Now, please process the following document:

    --- DOCUMENT START ---
    {full_text}
    --- DOCUMENT END ---

    Return ONLY the valid JSON array. Do not include any other text or explanations.
    """
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            response_format={"type": "json_object"},
        )
        response_text = chat_completion.choices[0].message.content
        parsed_json = json.loads(response_text)
        
        if isinstance(parsed_json, dict):
            for key, value in parsed_json.items():
                if isinstance(value, list):
                    return value
        
        if isinstance(parsed_json, list):
            return parsed_json
            
        print("Warning: LLM did not return a list in the expected format.")
        return []
    except Exception as e:
        print(f"Error during LLM chunking: {e}")
        return []

def process_uploaded_document(file_storage):
    """V2 with nanosecond precision: Extracts text, chunks it, and ingests each chunk with a guaranteed unique timestamp."""
    try:
        filename = file_storage.filename
        file_bytes = file_storage.read()
        extracted_text = ""
        
        if filename.endswith('.pdf'):
            print("Processing PDF file...")
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            for page in pdf_document:
                extracted_text += page.get_text()
            if len(extracted_text.strip()) < 50:
                print("Minimal text found. Attempting OCR fallback...")
                extracted_text = ""
                for page_num in range(len(pdf_document)):
                    page = pdf_document.load_page(page_num)
                    pix = page.get_pixmap()
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    extracted_text += pytesseract.image_to_string(img) + "\n"
        elif filename.endswith('.docx'):
            print("Processing DOCX file...")
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        else:
            return {"error": "Unsupported file type."}, 400

        if not extracted_text.strip():
            return {"error": "No text could be extracted from the document."}, 400

        feedback_chunks = extract_feedback_chunks_with_llm(extracted_text)
        
        if not feedback_chunks:
            return {"error": "AI could not identify distinct feedback items in the document."}, 500

        base_timestamp = pd.Timestamp.now()
        for i, chunk in enumerate(feedback_chunks):
            # Create a unique, ascending timestamp for each chunk
            unique_timestamp = base_timestamp + pd.Timedelta(nanoseconds=i + 1)
            data_service.add_document_chunk(chunk, filename, unique_timestamp)
            
            chunk_text = chunk.get("feedback_text", "")
            if chunk_text:
                doc_id = f"chunk_{filename}_{unique_timestamp.isoformat()}_{hash(chunk_text)}"
                embedding = embedding_model.encode([chunk_text])
                review_collection.add(
                    embeddings=embedding.tolist(),
                    documents=[chunk_text],
                    metadatas=[{"source": "report"}],
                    ids=[doc_id]
                )

        print(f"Successfully ingested {len(feedback_chunks)} chunks from document '{filename}'.")
        return {"status": "success", "message": f"Successfully ingested {len(feedback_chunks)} feedback items from '{filename}'."}, 200
    except Exception as e:
        print(f"Error processing document: {e}")
        return {"error": "An error occurred while processing the document."}, 500

def ingest_reviews_for_rag():
    # ... (This function remains the same) ...
    global review_collection
    if review_collection.count() > 0:
        print("Review collection is already populated. Skipping ingestion.")
        return
    try:
        print("Starting RAG ingestion...")
        df = data_service.df.dropna(subset=['review_body'])
        documents = df['review_body'].tolist()
        ids = [f"review_{i}" for i in range(len(documents))]
        batch_metadatas = [{"source": "apparel_review"}] * len(documents)
        batch_size = 500
        for i in range(0, len(documents), batch_size):
            batch_documents = documents[i:i + batch_size]
            batch_ids = ids[i:i + batch_size]
            batch_meta = batch_metadatas[i:i + batch_size]
            batch_embeddings = embedding_model.encode(batch_documents, show_progress_bar=False)
            review_collection.add(embeddings=batch_embeddings.tolist(), documents=batch_documents, metadatas=batch_meta, ids=batch_ids)
            print(f"Ingested RAG batch {i // batch_size + 1}...")
        print(f"Successfully ingested {review_collection.count()} reviews into ChromaDB.")
    except Exception as e:
        print(f"Error during RAG ingestion: {e}")

def query_reviews(question: str, num_results: int = 5, source_filter: str = "all"):
    # ... (This function remains the same) ...
    try:
        query_params = {"query_texts": [question], "n_results": num_results}
        if source_filter and source_filter != "all":
            query_params["where"] = {"source": source_filter}
        retrieved_results = review_collection.query(**query_params)
        retrieved_docs = retrieved_results.get('documents', [[]])[0]
        if not retrieved_docs:
            return {"answer": "I couldn't find any relevant information for that topic in the specified source.", "retrieved_documents": []}, 200
        context = "\n- ".join(retrieved_docs)
        prompt = f"""
        You are a helpful AI product analyst. Your job is to answer the user's question based *only* on the provided customer reviews.
        Analyze the following reviews and synthesize a concise summary.
        If the provided reviews do not contain information to answer the question, you MUST state that and do not attempt to answer.

        Question: "{question}"

        Customer Reviews:
        - {context}

        Based *only* on the reviews provided, what is the answer to the question?
        """
        chat_completion = groq_client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model="llama-3.1-8b-instant")
        generated_answer = chat_completion.choices[0].message.content
        final_response = {"answer": generated_answer, "retrieved_documents": retrieved_docs}
        return final_response, 200
    except Exception as e:
        print(f"Error during LLM query: {e}")
        return {"error": "An error occurred while communicating with the AI model."}, 500