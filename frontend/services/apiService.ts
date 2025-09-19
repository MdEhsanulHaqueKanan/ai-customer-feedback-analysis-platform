import axios from 'axios';
import type { SentimentTrendPoint, Topic, FeedbackItem, FeedbackSource } from '../types';

// The base URL of our running Flask backend
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Acts as a transformer/adapter between the raw backend API data and the
 * structured data the frontend components expect.
 */
const transformApiData = (apiData: any) => {
  // 1. Transform Sentiment Data for the line chart
  const sentimentTrend: SentimentTrendPoint[] = (apiData.sentiment_over_time || []).map((point: any) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    positive: point.positive || 0,
    negative: point.negative || 0,
    neutral: point.neutral || 0,
  }));

  // 2. Transform Topic Data for the pie chart, assigning colors
  const topicDistribution: Topic[] = (apiData.topic_distribution || []).map((topic: any) => ({
    name: topic.name,
    value: topic.value,
    percentage: topic.percentage,
    fill: topic.name === 'Verified' ? '#82ca9d' 
        : topic.name === 'Not Verified' ? '#ffc658'
        : '#8884d8', // Purple for 'Document'
  }));

  // 3. Transform Recent Feedback for the data table (with summary logic)
  const recentFeedback: FeedbackItem[] = (apiData.recent_feedback || []).map((item: any, index: number) => ({
    id: `feedback-${index}`,
    source: (item.topic === 'Document' ? 'document' : 'dataset') as FeedbackSource,
    sentiment: item.sentiment,
    text: item.review_body || 'No content', // The full text for the modal
    summary: item.review_summary || item.review_body, // The truncated summary for the table
    timestamp: item.review_date,
  }));

  return { sentimentTrend, topicDistribution, recentFeedback };
};

export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard`);
    return transformApiData(response.data);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
};


export const queryAssistant = async (question: string, source_filter?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/assistant/query`, {
      question: question,
      source_filter: source_filter,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to query assistant:", error);
    throw error;
  }
};

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/document/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload document:", error);
    throw error;
  }
};