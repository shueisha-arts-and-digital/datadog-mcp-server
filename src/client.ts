import axios, { type AxiosInstance } from 'axios';
import type {
  GetErrorTrackingIssueParams,
  SearchErrorTrackingIssuesParams,
  ListMonitorsParams,
  GetMonitorParams,
  SearchMonitorGroupsParams,
  ListActiveMetricsParams,
  QueryMetricsParams,
  ListTagConfigurationsParams,
  GetMetricMetadataParams,
  ListMetricTagsParams,
  SearchLogsParams,
  SearchRumEventsParams,
} from './types.js';

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

  async getErrorTrackingIssue(params: GetErrorTrackingIssueParams) {
    const response = await this.client.get(`/api/v2/error-tracking/issues/${params.issueId}`);
    return response.data;
  }

  async searchErrorTrackingIssues(params: SearchErrorTrackingIssuesParams) {
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

  async listMonitors(params: ListMonitorsParams) {
    const response = await this.client.get('/api/v1/monitor', { params });
    return response.data;
  }

  async getMonitor(params: GetMonitorParams) {
    const response = await this.client.get(`/api/v1/monitor/${params.monitorId}`);
    return response.data;
  }

  async searchMonitorGroups(params: SearchMonitorGroupsParams) {
    const response = await this.client.get('/api/v1/monitor/groups/search', { params });
    return response.data;
  }

  // ─── Metrics ───

  async listActiveMetrics(params: ListActiveMetricsParams) {
    const response = await this.client.get('/api/v1/metrics', { params });
    return response.data;
  }

  async queryMetrics(params: QueryMetricsParams) {
    const response = await this.client.get('/api/v1/query', { params });
    return response.data;
  }

  async listTagConfigurations(params: ListTagConfigurationsParams) {
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

  async getMetricMetadata(params: GetMetricMetadataParams) {
    const response = await this.client.get(`/api/v1/metrics/${params.metricName}`);
    return response.data;
  }

  async listMetricTags(params: ListMetricTagsParams) {
    const response = await this.client.get(`/api/v2/metrics/${params.metricName}/tags`);
    return response.data;
  }

  // ─── Logs ───

  async searchLogs(params: SearchLogsParams) {
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

  async searchRumEvents(params: SearchRumEventsParams) {
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
