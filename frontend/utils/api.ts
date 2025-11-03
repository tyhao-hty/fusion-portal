export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest(path: string, method = 'GET', data?: unknown, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || response.statusText;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed?.error?.message ?? parsed?.message ?? message;
    } catch {
      // ignore parse error, fall back to raw text
    }
    throw new Error(message);
  }

  return response.json();
}
