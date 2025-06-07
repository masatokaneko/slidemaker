# SlideMaker

SlideMakerは、自然言語からPowerPointプレゼンテーションを生成するAIツールです。

## 機能

- 自然言語からのプレゼンテーション生成
- BCGスタイルのテンプレート
- チャートの自動生成
- PDFからのデザインパターン抽出
- カスタマイズ可能なレイアウト
- パフォーマンス最適化（キャッシュ）
- セキュリティ機能
- モニタリングとロギング

## 技術スタック

- Next.js 14
- TypeScript
- Prisma
- Chart.js
- PptxGenJS
- Tailwind CSS
- Redis（キャッシュ）
- ioredis（Redisクライアント）

## セットアップ

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/slidemaker.git
cd slidemaker
```

2. 依存関係のインストール
```bash
pnpm install
```

3. 環境変数の設定
`.env`ファイルを作成し、必要な環境変数を設定します：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/slidemaker"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
```

4. データベースのセットアップ
```bash
pnpm prisma generate
pnpm prisma migrate dev
```

5. Redisの起動
```bash
docker run -d -p 6379:6379 redis
```

6. 開発サーバーの起動
```bash
pnpm dev
```

## 使用方法

1. プレゼンテーションの作成
   - 自然言語でプレゼンテーションの内容を入力
   - テンプレートとスタイルを選択
   - 生成ボタンをクリック

2. チャートの追加
   - チャートタイプを選択
   - データを入力
   - スタイルをカスタマイズ

3. PDFからのデザインパターン抽出
   - PDFファイルをアップロード
   - 自動的にデザインパターンを抽出
   - 抽出されたパターンをプレゼンテーションに適用

## セキュリティ機能

- CORS設定
- レート制限
- ファイルアップロードの検証
- セキュリティヘッダー
- XSS対策
- CSRF対策

## パフォーマンス最適化

- Redisキャッシュ
- 画像の最適化
- チャートのキャッシュ
- データベースのインデックス

## モニタリング

- エラーログ
- パフォーマンスメトリクス
- ユーザー行動分析
- システムリソース監視

## テスト

```bash
# テストの実行
pnpm test

# テストの監視
pnpm test:watch

# カバレッジレポートの生成
pnpm test:coverage
```

## CI/CD

- GitHub Actionsによる自動テスト
- 自動デプロイメント
- コード品質チェック
- セキュリティスキャン

## ライセンス

MIT License

## 貢献

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成