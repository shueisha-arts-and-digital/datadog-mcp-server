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

describe('Metrics - Client', () => {
  let client: DatadogClient;
  let mock: ReturnType<typeof createMockClient>['mock'];

  beforeEach(() => {
    vi.clearAllMocks();
    ({ client, mock } = createMockClient());
  });

  describe('listAllMetricTags', () => {
    it('メトリクス名がパスに正しく埋め込まれる', async () => {
      mock.get.mockResolvedValue({ data: { data: { id: 'system.cpu.user', type: 'metrics' } } });

      await client.listAllMetricTags({ metricName: 'system.cpu.user' });

      expect(mock.get).toHaveBeenCalledWith(
        '/api/v2/metrics/system.cpu.user/all-tags',
        expect.objectContaining({ params: expect.any(Object) }),
      );
    });

    it('windowSeconds が window[seconds] クエリパラメータとして送信される', async () => {
      mock.get.mockResolvedValue({ data: { data: {} } });

      await client.listAllMetricTags({ metricName: 'system.cpu.user', windowSeconds: 3600 });

      expect(mock.get).toHaveBeenCalledWith(
        '/api/v2/metrics/system.cpu.user/all-tags',
        { params: { 'window[seconds]': 3600 } },
      );
    });

    it('windowSeconds が未指定時は params に含まれない', async () => {
      mock.get.mockResolvedValue({ data: { data: {} } });

      await client.listAllMetricTags({ metricName: 'system.disk.free' });

      const callArgs = mock.get.mock.calls[0];
      const params = callArgs[1]?.params ?? {};
      expect(params).not.toHaveProperty('window[seconds]');
    });
  });

  describe('searchMetrics', () => {
    it('metrics: プレフィックスなしのクエリに自動付与される', async () => {
      mock.get.mockResolvedValue({ data: { results: { metrics: ['system.cpu.user'] } } });

      await client.searchMetrics({ query: 'system.cpu' });

      expect(mock.get).toHaveBeenCalledWith('/api/v1/search', {
        params: { q: 'metrics:system.cpu' },
      });
    });

    it('metrics: プレフィックスありのクエリはそのまま送信される', async () => {
      mock.get.mockResolvedValue({ data: { results: { metrics: ['aws.ecs.running'] } } });

      await client.searchMetrics({ query: 'metrics:aws.ecs' });

      expect(mock.get).toHaveBeenCalledWith('/api/v1/search', {
        params: { q: 'metrics:aws.ecs' },
      });
    });

    it('パスが /api/v1/search であること', async () => {
      mock.get.mockResolvedValue({ data: { results: { metrics: [] } } });

      await client.searchMetrics({ query: 'test' });

      expect(mock.get.mock.calls[0][0]).toBe('/api/v1/search');
    });
  });

  describe('エラーハンドリング', () => {
    it('API エラー（status 403）が正しくフォーマットされる', async () => {
      const apiError = new Error('Request failed') as any;
      apiError.response = { status: 403, statusText: 'Forbidden', data: { errors: ['Forbidden'] } };
      mock.get.mockRejectedValue(apiError);

      await expect(client.listAllMetricTags({ metricName: 'system.cpu.user' })).rejects.toThrow('Request failed');
    });

    it('ネットワークエラーが正しく伝播する', async () => {
      mock.get.mockRejectedValue(new Error('Network Error'));

      await expect(client.searchMetrics({ query: 'test' })).rejects.toThrow('Network Error');
    });
  });
});
