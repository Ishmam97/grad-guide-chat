
interface QueryRequest {
  query: string;
  api_key: string;
  k?: number;
  model?: string;
}

interface QueryResponse {
  response: string;
  retrieved_docs?: any[];
  model_used?: string;
}

interface FeedbackRequest {
  timestamp: string;
  query: string;
  response: string;
  feedback_type: string;
  thumbs_down_reason?: string;
  thumbs_up_reason?: string;
  corrected_question?: string;
  correct_answer?: string;
  model_used?: string;
  retrieved_docs?: any[];
  source_message_id?: string;
}

const BASE_URL = 'https://ualr-chatbot-backend.onrender.com';

export const queryBackend = async (queryRequest: QueryRequest): Promise<QueryResponse> => {
  const response = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryRequest.query,
      api_key: queryRequest.api_key,
      k: queryRequest.k || 3,
      model: queryRequest.model || 'gemini-1.5-flash-latest'
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const submitFeedback = async (feedbackRequest: FeedbackRequest): Promise<void> => {
  const response = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedbackRequest),
  });

  if (!response.ok) {
    throw new Error(`Feedback submission failed: ${response.statusText}`);
  }
};
