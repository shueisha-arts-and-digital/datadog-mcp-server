import axios, { type AxiosInstance } from 'axios';

export class DatadogClient {
  private client: AxiosInstance;

  constructor(apiKey: string, appKey: string, site: string = 'datadoghq.com') {
    this.client = axios.create({
      baseURL: `https://api.${site}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'DD-API-KEY': apiKey,
        'DD-APPLICATION-KEY': appKey,
      },
    });
  }

  // ─── Error Tracking ───

  async getErrorTrackingIssue(issueId: string) {
    const response = await this.client.get(`/api/v2/error-tracking/issues/${issueId}`);
    return response.data;
  }

  async searchErrorTrackingIssues(params: {
    query: string;
    from: number;
    to: number;
    track?: string;
  }) {
    const response = await this.client.post('/api/v2/error-tracking/issues/search', {
      data: {
        type: 'search_request',
        attributes: {
          query: params.query,
          from: params.from,
          to: params.to,
          track: params.track,
        },
      },
    });
    return response.data;
  }

  // ─── Monitors ───

  async listMonitors(params: {
    group_states?: string;
    name?: string;
    tags?: string;
    monitor_tags?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await this.client.get('/api/v1/monitor', { params });
    return response.data;
  }

  async getMonitor(monitorId: number) {
    const response = await this.client.get(`/api/v1/monitor/${monitorId}`);
    return response.data;
  }

  async searchMonitorGroups(params: {
    query?: string;
    page?: number;
    per_page?: number;
    sort?: string;
  }) {
    const response = await this.client.get('/api/v1/monitor/groups/search', { params });
    return response.data;
  }

  // ─── Metrics ───

  async listActiveMetrics(params: { from: number; host?: string; tag_filter?: string }) {
    const response = await this.client.get('/api/v1/metrics', { params });
    return response.data;
  }

  async queryMetrics(params: { from: number; to: number; query: string }) {
    const response = await this.client.get('/api/v1/query', { params });
    return response.data;
  }

  async listTagConfigurations(params: {
    filter_configured?: boolean;
    filter_tags_configured?: string;
    filter_metric_type?: string;
    filter_include_percentiles?: boolean;
    filter_queried?: boolean;
    filter_tags?: string;
    window_seconds?: number;
  }) {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      'filter[configured]': params.filter_configured,
      'filter[tags_configured]': params.filter_tags_configured,
      'filter[metric_type]': params.filter_metric_type,
      'filter[include_percentiles]': params.filter_include_percentiles,
      'filter[queried]': params.filter_queried,
      'filter[tags]': params.filter_tags,
      'window[seconds]': params.window_seconds,
    };
    const response = await this.client.get('/api/v2/metrics', { params: queryParams });
    return response.data;
  }

  async getMetricMetadata(metricName: string) {
    const response = await this.client.get(`/api/v1/metrics/${metricName}`);
    return response.data;
  }

  async listMetricTags(metricName: string) {
    const response = await this.client.get(`/api/v2/metrics/${metricName}/tags`);
    return response.data;
  }

  // ─── Logs ───

  async searchLogs(params: {
    filter_query?: string;
    filter_from?: string;
    filter_to?: string;
    sort?: string;
    page_limit?: number;
    page_cursor?: string;
  }) {
    const response = await this.client.post('/api/v2/logs/events/search', {
      filter: {
        query: params.filter_query || '*',
        from: params.filter_from || 'now-15m',
        to: params.filter_to || 'now',
      },
      sort: params.sort,
      page: {
        limit: params.page_limit || 10,
        cursor: params.page_cursor,
      },
    });
    return response.data;
  }

  // ─── RUM ───

  async searchRumEvents(params: {
    filter_query?: string;
    filter_from?: string;
    filter_to?: string;
    sort?: string;
    page_limit?: number;
    page_cursor?: string;
  }) {
    const response = await this.client.post('/api/v2/rum/events/search', {
      filter: {
        query: params.filter_query || '*',
        from: params.filter_from || 'now-15m',
        to: params.filter_to || 'now',
      },
      sort: params.sort,
      page: {
        limit: params.page_limit || 10,
        cursor: params.page_cursor,
      },
    });
    return response.data;
  }
}
