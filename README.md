# datadog-mcp-server

Datadog API にリードオンリーでアクセスする MCP (Model Context Protocol) サーバー。

Progressive Disclosure パターンにより、LLM が必要なツールを効率的に発見・利用できる設計。

## セットアップ

### 必要な環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `DD_API_KEY` | Yes | Datadog API Key : https://app.datadoghq.com/organization-settings/api-keys |
| `DD_APP_KEY` | Yes | Datadog Application Key : https://app.datadoghq.com/organization-settings/application-keys |
| `DD_SITE` | No | Datadog サイト（デフォルト: `datadoghq.com`） |

### Claude Code での設定

`~/.claude.json` の `mcpServers` に追加:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": ["-y", "https://github.com/shueisha-arts-and-digital/datadog-mcp-server"],
      "env": {
        "DD_API_KEY": "your-api-key",
        "DD_APP_KEY": "your-app-key",
        "DD_SITE": "datadoghq.com"
      }
    }
  }
}
```

ローカルビルドの場合:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "node",
      "args": ["/path/to/datadog-mcp-server/build/index.js"],
      "env": {
        "DD_API_KEY": "your-api-key",
        "DD_APP_KEY": "your-app-key",
        "DD_SITE": "datadoghq.com"
      }
    }
  }
}
```

### ローカルビルド

```bash
npm install
npm run build
```

## サポート API 一覧

### Meta Tools（2ツール）

LLM がツールを発見するための Progressive Disclosure ツール。

| ツール名 | 説明 |
|---------|------|
| `datadog_list_tool_categories` | カテゴリ一覧とツールの表示。`detailLevel`（name / description / full）で情報量を制御 |
| `datadog_search_tools` | キーワードによるツール検索 |

### Error Tracking（2ツール）

| ツール名 | API | 説明 |
|---------|-----|------|
| `datadog_get_error_tracking_issue` | `GET /api/v2/error-tracking/issues/{issue_id}` | 特定 Issue の詳細取得 |
| `datadog_search_error_tracking_issues` | `POST /api/v2/error-tracking/issues/search` | エラートラッキング Issue の検索 |

### Monitors（3ツール）

| ツール名 | API | 説明 |
|---------|-----|------|
| `datadog_list_monitors` | `GET /api/v1/monitor` | モニター一覧の取得（名前・タグフィルタ対応） |
| `datadog_get_monitor` | `GET /api/v1/monitor/{monitor_id}` | 特定モニターの詳細取得 |
| `datadog_search_monitor_groups` | `GET /api/v1/monitor/groups/search` | モニターグループの検索 |

### Metrics（5ツール）

| ツール名 | API | 説明 |
|---------|-----|------|
| `datadog_list_active_metrics` | `GET /api/v1/metrics` | アクティブなメトリクス名の一覧取得 |
| `datadog_query_metrics` | `GET /api/v1/query` | 時系列メトリクスデータのクエリ |
| `datadog_get_metric_metadata` | `GET /api/v1/metrics/{metric_name}` | 特定メトリクスのメタデータ取得 |
| `datadog_list_all_metric_tags` | `GET /api/v2/metrics/{metric_name}/all-tags` | 特定メトリクスの全タグ一覧（ingested タグ含む） |
| `datadog_search_metrics` | `GET /api/v1/search` | メトリクス名のプレフィックス検索 |

### Logs（1ツール）

| ツール名 | API | 説明 |
|---------|-----|------|
| `datadog_search_logs` | `POST /api/v2/logs/events/search` | ログイベントの検索（クエリ・時間範囲指定） |

### RUM（1ツール）

| ツール名 | API | 説明 |
|---------|-----|------|
| `datadog_search_rum_events` | `POST /api/v2/rum/events/search` | RUM イベントの検索 |

**合計: 14ツール**（Meta 2 + API 12）

## Progressive Disclosure

LLM のコンテキスト消費を最小化するため、ツール発見を段階的に行う設計:

1. `datadog_list_tool_categories` でカテゴリ概要を確認
2. 必要なカテゴリの `detailLevel: "full"` で詳細を取得
3. 目的のツールを呼び出す

`detailLevel` パラメータ:

| 値 | 出力内容 |
|----|---------|
| `name` | ツール名のみ |
| `description` | ツール名 + 説明 |
| `full` | ツール名 + 説明 + API メソッド・パス + カテゴリ |
