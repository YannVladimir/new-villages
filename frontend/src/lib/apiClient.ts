const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(status: number, code: string, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

// In-memory only — never persisted. Session survival across reloads comes from
// the httpOnly refresh cookie via bootstrap(), not from storing this token.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

const NO_REFRESH_RETRY_PATHS = ['/api/auth/refresh', '/api/auth/login', '/api/auth/register'];

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (!isFormData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: isFormData
      ? (options.body as FormData)
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (res.status === 401 && !isRetry && !NO_REFRESH_RETRY_PATHS.includes(path)) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      return request<T>(path, options, true);
    }
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session has expired. Please log in again.');
  }

  if (!res.ok) {
    let body: { code?: string; message?: string; fieldErrors?: Record<string, string> } = {};
    try {
      body = await res.json();
    } catch {
      // no JSON body — fall through with defaults below
    }
    if (res.status === 409 && body.code === 'TERMS_UPDATE_REQUIRED') {
      window.dispatchEvent(new CustomEvent('auth:terms-required'));
    }
    throw new ApiError(res.status, body.code || 'ERROR', body.message || res.statusText, body.fieldErrors);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
};
