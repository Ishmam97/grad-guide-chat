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
  try {
    const response = await fetch(`${BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queryRequest.query,
        api_key: queryRequest.api_key,
        k: queryRequest.k || 3,
        model: queryRequest.model || 'gemini-2.0-flash-lite'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API request failed:', response.status, response.statusText, errorText);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error: unknown) {
    console.error('Error during queryBackend fetch:', {
      error: error instanceof Error ? error.message : error,
      request: queryRequest,
      url: `${BASE_URL}/query`,
    });
    if (typeof window !== 'undefined') {
      console.error('Current location:', window.location.href);
    }
    throw error;
  }
};

export const submitFeedback = async (feedbackRequest: FeedbackRequest): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Feedback submission failed:', response.status, response.statusText, errorText);
      throw new Error(`Feedback submission failed: ${response.statusText}`);
    }
  } catch (error: unknown) {
    console.error('Error during submitFeedback fetch:', {
      error: error instanceof Error ? error.message : error,
      request: feedbackRequest,
      url: `${BASE_URL}/feedback`,
    });
    if (typeof window !== 'undefined') {
      console.error('Current location:', window.location.href);
    }
    throw error;
  }
};
