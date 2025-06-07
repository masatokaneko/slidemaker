# API ドキュメント

## エンドポイント

### プレゼンテーション生成

#### POST /api/generate-presentation

自然言語からPowerPointプレゼンテーションを生成します。

**リクエスト**
```json
{
  "content": "プレゼンテーションの内容を自然言語で記述",
  "template": "BCG",
  "options": {
    "includeCharts": true,
    "includeImages": true,
    "style": "modern"
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://example.com/presentations/123.pptx",
    "previewUrl": "https://example.com/previews/123.png"
  }
}
```

### PDF分析

#### POST /api/analyze-pdf

PDFファイルからデザインパターンを抽出します。

**リクエスト**
```json
{
  "file": "PDFファイル（multipart/form-data）",
  "options": {
    "extractColors": true,
    "extractLayouts": true,
    "extractCharts": true
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "type": "color",
        "value": "#1F2937",
        "frequency": 0.3
      },
      {
        "type": "layout",
        "value": "title-and-content",
        "frequency": 0.5
      }
    ]
  }
}
```

### チャート生成

#### POST /api/generate-chart

チャートを生成します。

**リクエスト**
```json
{
  "type": "bar",
  "data": {
    "labels": ["A", "B", "C"],
    "datasets": [
      {
        "label": "データ1",
        "data": [1, 2, 3]
      }
    ]
  },
  "options": {
    "width": 800,
    "height": 400,
    "colors": ["#FF0000", "#00FF00", "#0000FF"]
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "chartUrl": "https://example.com/charts/123.png"
  }
}
```

## エラーコード

| コード | 説明 |
|--------|------|
| INVALID_YAML_DATA | YAMLデータが無効です |
| EMPTY_SLIDES | スライドデータが空です |
| INVALID_SLIDE_TYPE | 無効なスライドタイプです |
| INVALID_CHART_DATA | チャートデータが無効です |
| TEMPLATE_APPLICATION_ERROR | テンプレートの適用に失敗しました |
| FILE_PROCESSING_ERROR | ファイルの処理に失敗しました |

## 認証

APIリクエストには認証が必要です。認証トークンを`Authorization`ヘッダーに含めてください：

```
Authorization: Bearer <your-token>
```

## レート制限

- 1分あたり60リクエスト
- 1時間あたり1000リクエスト
- 1日あたり10000リクエスト

## レスポンス形式

すべてのAPIレスポンスは以下の形式で返されます：

```json
{
  "success": true|false,
  "data": {
    // レスポンスデータ
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {
      // 追加のエラー情報
    }
  }
}
``` 