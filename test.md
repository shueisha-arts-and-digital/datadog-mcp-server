# Test

- すべてこのディレクトリ（`datadog-mcp-server/`）内で実行する。
- `.env` を本ディレクトリに配置済みの前提（`.gitignore` 対象）。

## 1. Build

```bash
npm run build
```

## 2. 環境変数なしでexitすること

```bash
DD_API_KEY="" DD_APP_KEY="" node build/index.js 2>&1; echo "exit: $?"
# 期待値: "DD_API_KEY and DD_APP_KEY environment variables are required." + exit: 1
```

## 3. MCP初期化ハンドシェイク

```bash
source .env && export DD_API_KEY DD_APP_KEY DD_SITE && \
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}' \
| timeout 5 node build/index.js 2>&1 || true
# 期待値: serverInfo.name = "datadog-mcp-server" を含むJSON
```

## 4. ツール一覧の取得（14ツール）

```bash
source .env && export DD_API_KEY DD_APP_KEY DD_SITE && \
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' \
| timeout 5 node build/index.js 2>&1 | tail -1 | jq .
# 期待値: result.tools に14個のツール定義
```

## 5. メタツール（Progressive Disclosure）

```bash
source .env && export DD_API_KEY DD_APP_KEY DD_SITE && \
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"datadog_list_tool_categories","arguments":{"detailLevel":"name"}}}\n' \
| timeout 5 node build/index.js 2>&1 | tail -1 | jq .
# 期待値: 5カテゴリとツール名一覧
```

## 6. 実API呼び出し（Monitors）

```bash
source .env && export DD_API_KEY DD_APP_KEY DD_SITE && \
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1.0"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"datadog_list_monitors","arguments":{"page_size":2}}}\n' \
| timeout 15 node build/index.js 2>&1 | tail -1 | jq .
# 期待値: Datadogから取得した実モニター情報
```

## 7. ユニットテスト

```bash
npm test
```
