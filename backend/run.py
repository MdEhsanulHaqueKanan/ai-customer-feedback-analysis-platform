from app import create_app
from app.services import ingest_reviews_for_rag # Import the ingestion function

app = create_app()

# Use the application context to run the one-time data ingestion process.
with app.app_context():
    ingest_reviews_for_rag()

if __name__ == '__main__':
    app.run()