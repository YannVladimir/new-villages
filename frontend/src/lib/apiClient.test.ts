import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, getAccessToken, setAccessToken } from './apiClient';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'status text',
    json: async () => body,
  } as unknown as Response;
}

describe('apiClient', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on a successful GET', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { hello: 'world' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.get<{ hello: string }>('/api/ping');

    expect(result).toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/ping'),
      expect.objectContaining({ method: 'GET', credentials: 'include' })
    );
  });

  it('attaches the Authorization header once a token is set', async () => {
    setAccessToken('my-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/api/me');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer my-token');
  });

  it('throws an ApiError with the server-provided code/message on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(400, { code: 'VALIDATION_ERROR', message: 'Name is required' })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/api/communities', {})).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Name is required',
    });
  });

  it('transparently refreshes and retries once after a 401, then updates the access token', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, { code: 'UNAUTHORIZED' })) // original request
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'new-token' })) // refresh call
      .mockResolvedValueOnce(jsonResponse(200, { data: 'secret' })); // retried request
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.get<{ data: string }>('/api/communities/mine');

    expect(result).toEqual({ data: 'secret' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/api/auth/refresh');
    expect(getAccessToken()).toBe('new-token');
  });

  it('dispatches auth:session-expired and throws when the refresh itself fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(401, {})); // refresh also fails
    vi.stubGlobal('fetch', fetchMock);

    const listener = vi.fn();
    window.addEventListener('auth:session-expired', listener);

    await expect(api.get('/api/communities/mine')).rejects.toBeInstanceOf(ApiError);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth:session-expired', listener);
  });

  it('does not attempt a refresh for the login/refresh endpoints themselves', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.post('/api/auth/login', { email: 'a@b.com', password: 'x' })).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
