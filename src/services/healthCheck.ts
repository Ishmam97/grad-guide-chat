const BACKEND_URL = 'https://ualr-chatbot-backend.onrender.com';

export const wakeUpServer = async (): Promise<void> => {
  try {
    console.log('Sending health check to wake up server...');
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('Server is awake and responding');
    } else {
      console.warn('Server responded but with non-200 status:', response.status, response.statusText);
      const errorText = await response.text();
      console.warn('Response body:', errorText);
    }
  } catch (error: unknown) {
    console.error('Health check failed, server may be sleeping or unreachable.');
    if (error instanceof TypeError) {
      console.error('TypeError details:', error.message);
    } else if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    if (typeof window !== 'undefined') {
      console.error('Current location:', window.location.href);
    }
  }
};
