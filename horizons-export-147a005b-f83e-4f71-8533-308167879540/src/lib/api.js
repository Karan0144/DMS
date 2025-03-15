const API_BASE_URL = 'YOUR_API_BASE_URL';
const API_KEY = 'YOUR_API_KEY';

export async function fetchFromApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Example API endpoints
export const api = {
  getData: async (params) => {
    return fetchFromApi('/endpoint', {
      method: 'GET',
      params,
    });
  },
  
  postData: async (data) => {
    return fetchFromApi('/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};