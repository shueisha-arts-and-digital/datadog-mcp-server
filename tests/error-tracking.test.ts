import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { DatadogClient } from '../src/client.js';

vi.mock('axios');

function createMockClient() {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
  };
  vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
  const client = new DatadogClient('test-api-key', 'test-app-key', 'datadoghq.com');
  return { client, mock: mockAxiosInstance };
}

describe('Error Tracking - Client', () => {
  let client: DatadogClient;
  let mock: ReturnType<typeof createMockClient>['mock'];

  beforeEach(() => {
    vi.clearAllMocks();
    ({ client, mock } = createMockClient());
  });

  describe('getErrorTrackingIssue', () => {
    it('issue_id がパスに埋め込まれる', async () => {
      mock.get.mockResolvedValue({ data: { data: { id: 'abc-123', attributes: {} } } });

      const result = await client.getErrorTrackingIssue('abc-123');

      expect(mock.get).toHaveBeenCalledWith('/api/v2/error-tracking/issues/abc-123');
      expect(result.data.id).toBe('abc-123');
    });
  });

  describe('searchErrorTrackingIssues', () => {
    it('必須パラメータで data.attributes 形式の POST body が作られる', async () => {
      mock.post.mockResolvedValue({ data: { data: [] } });

      await client.searchErrorTrackingIssues({
        query: 'service:my-app',
        from: 1700000000,
        to: 1700003600,
      });

      expect(mock.post).toHaveBeenCalledWith('/api/v2/error-tracking/issues/search', {
        data: {
          type: 'search_request',
          attributes: {
            query: 'service:my-app',
            from: 1700000000,
            to: 1700003600,
            track: undefined,
          },
        },
      });
    });

    it('track パラメータが含まれる', async () => {
      mock.post.mockResolvedValue({ data: { data: [{ id: 'issue-1' }] } });

      await client.searchErrorTrackingIssues({
        query: 'error.type:TypeError',
        from: 1700000000,
        to: 1700003600,
        track: 'backend',
      });

      expect(mock.post).toHaveBeenCalledWith('/api/v2/error-tracking/issues/search', {
        data: {
          type: 'search_request',
          attributes: {
            query: 'error.type:TypeError',
            from: 1700000000,
            to: 1700003600,
            track: 'backend',
          },
        },
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API エラー時に例外が伝播する', async () => {
      const apiError = new Error('Request failed') as any;
      apiError.response = { status: 403, statusText: 'Forbidden', data: { errors: ['Forbidden'] } };
      mock.get.mockRejectedValue(apiError);

      await expect(client.getErrorTrackingIssue('abc')).rejects.toThrow('Request failed');
    });

    it('ネットワークエラー時に例外が伝播する', async () => {
      mock.post.mockRejectedValue(new Error('Network Error'));

      await expect(client.searchErrorTrackingIssues({
        query: '*',
        from: 1700000000,
        to: 1700003600,
      })).rejects.toThrow('Network Error');
    });
  });
});
