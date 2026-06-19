// Native wrapper mimicking Axios endpoints for secure fetch queries
const getAuthToken = (): string | null => {
  return localStorage.getItem('fintech_wallet_token');
};

export async function fetchAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected system error occurred';
    try {
      const errJSON = await response.json();
      errorMsg = errJSON.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
