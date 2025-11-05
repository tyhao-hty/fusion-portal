import { apiRequest } from '@/utils/api';

const originalFetch = global.fetch;

describe('apiRequest', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('sends JSON payload and returns parsed response', async () => {
    const mockJson = jest.fn().mockResolvedValue({ ok: true });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: mockJson,
    });

    const result = await apiRequest('/test', 'POST', { foo: 'bar' }, 'token-123');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ foo: 'bar' }),
    });
    expect(result).toEqual({ ok: true });
  });

  it('throws error message parsed from JSON body', async () => {
    const errorPayload = { message: 'Timeline unavailable' };
    const errorText = JSON.stringify(errorPayload);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      text: jest.fn().mockResolvedValue(errorText),
    });

    await expect(apiRequest('/fail')).rejects.toThrow('Timeline unavailable');
  });

  it('falls back to status text when response body is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
      text: jest.fn().mockResolvedValue(''),
    });

    await expect(apiRequest('/fail')).rejects.toThrow('Service Unavailable');
  });
});
