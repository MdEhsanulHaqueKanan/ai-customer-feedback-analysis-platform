export interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export type Topic = {
  name: string;
  value: number;
  percentage?: number; 
  fill: string;
};

export type FeedbackSource = 'twitter' | 'app_store' | 'support_ticket' | 'document' | 'dataset';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  sentiment: Sentiment;
  text: string; // This will hold the FULL text for the modal view
  summary?: string; // --- NEW: Add the optional summary field for the table view ---
  timestamp: string;
}

export interface Source {
  id: string;
  text: string;
}

export interface ChatMessage {
  id: number; // Changed to number to match our implementation
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  retrievedDocs?: string[];
}
