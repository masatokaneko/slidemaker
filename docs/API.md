# API ドキュメント

## エンドポイント

### プレゼンテーション生成

#### POST /api/generate
プレゼンテーションを生成します。

**リクエスト**
```json
{
  "content": "プレゼンテーションの内容",
  "template": "bcg",
  "style": {
    "theme": "light",
    "font": "Arial"
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "fileUrl": "/api/download/123456",
    "slides": [
      {
        "type": "title",
        "content": "タイトル"
      }
    ]
  }
}
```

### PDF分析

#### POST /api/analyze-pdf
PDFファイルからデザインパターンを抽出します。

**リクエスト**
- Content-Type: multipart/form-data
- ファイルサイズ制限: 10MB
- 許可されるMIMEタイプ: application/pdf

**レスポンス**
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "type": "layout",
        "description": "パターンの説明",
        "confidence": 0.95
      }
    ]
  }
}
```

### キャッシュ管理

#### GET /api/cache/:key
キャッシュされたデータを取得します。

**レスポンス**
```json
{
  "success": true,
  "data": {
    "value": "キャッシュされた値",
    "expiresAt": "2024-03-20T12:00:00Z"
  }
}
```

#### DELETE /api/cache/:key
キャッシュされたデータを削除します。

**レスポンス**
```json
{
  "success": true
}
```

### モニタリング

#### GET /api/monitoring/errors
エラーログを取得します。

**クエリパラメータ**
- startDate: 開始日時（ISO 8601形式）
- endDate: 終了日時（ISO 8601形式）
- level: エラーレベル（error, warning, info）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "errors": [
      {
        "timestamp": "2024-03-20T12:00:00Z",
        "level": "error",
        "message": "エラーメッセージ",
        "stack": "エラースタック"
      }
    ]
  }
}
```

#### GET /api/monitoring/metrics
パフォーマンスメトリクスを取得します。

**クエリパラメータ**
- startDate: 開始日時（ISO 8601形式）
- endDate: 終了日時（ISO 8601形式）
- type: メトリクスタイプ（performance, user, system）

**レスポンス**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "timestamp": "2024-03-20T12:00:00Z",
        "type": "performance",
        "name": "responseTime",
        "value": 150
      }
    ]
  }
}
```

## エラーコード

| コード | 説明 |
|--------|------|
| FILE_PROCESSING_ERROR | ファイル処理エラー |
| DATABASE_ERROR | データベースエラー |
| CACHE_ERROR | キャッシュエラー |
| VALIDATION_ERROR | バリデーションエラー |
| RATE_LIMIT_ERROR | レート制限エラー |
| SECURITY_ERROR | セキュリティエラー |

## レート制限

- リクエスト制限: 60回/分
- ファイルアップロード: 10MB/ファイル
- キャッシュTTL: 1時間（デフォルト）

## セキュリティ

- CORS設定
- レート制限
- ファイルアップロードの検証
- セキュリティヘッダー
- XSS対策
- CSRF対策 