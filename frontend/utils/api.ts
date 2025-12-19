// NEXT_PUBLIC_API_URL is for legacy or cross-origin calls only. Do not use for /api/*.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest(path: string, method = 'GET', data?: unknown, token?: string) {
  const isSameOriginApi = path.startsWith('/api/');
  if (isSameOriginApi && process.env.NODE_ENV !== 'production') {
    console.warn('[apiRequest] Use same-origin /api/* paths; do not route via NEXT_PUBLIC_API_URL.');
  }
  const resolvedUrl = isSameOriginApi ? path : `${API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolvedUrl, {
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
