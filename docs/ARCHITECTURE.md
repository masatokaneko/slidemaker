# SlideMaker アーキテクチャ

## システム概要

SlideMakerは、自然言語からPowerPointプレゼンテーションを生成するAIツールです。システムは以下の主要コンポーネントで構成されています：

1. フロントエンド（Next.js）
2. バックエンドAPI（Next.js API Routes）
3. データベース（PostgreSQL）
4. キャッシュ（Redis）
5. ファイルストレージ
6. モニタリングシステム

## コンポーネント詳細

### フロントエンド

- Next.js 14を使用
- TypeScriptで実装
- Tailwind CSSでスタイリング
- コンポーネントベースのアーキテクチャ
- クライアントサイドの状態管理
- レスポンシブデザイン

### バックエンドAPI

#### プレゼンテーション生成
- 自然言語処理
- テンプレート適用
- チャート生成
- ファイル出力

#### PDF分析
- PDFパース
- デザインパターン抽出
- カラー分析
- レイアウト分析

#### キャッシュ管理
- Redisを使用
- キー/バリューストア
- TTL設定
- キャッシュ無効化

#### セキュリティ
- CORS設定
- レート制限
- ファイル検証
- セキュリティヘッダー

### データベース

#### スキーマ
- ユーザー
- プレゼンテーション
- デザインパターン
- テンプレート

#### インデックス
- パフォーマンス最適化
- クエリ効率化
- データ整合性

### キャッシュ

#### 実装
- Redis
- キー/バリューストア
- パブリッシュ/サブスクライブ
- セッション管理

#### キャッシュ戦略
- プレゼンテーション
- チャート
- テンプレート
- ユーザーデータ

### ファイルストレージ

#### 実装
- ローカルストレージ
- クラウドストレージ（オプション）
- ファイルシステム

#### ファイル管理
- アップロード
- ダウンロード
- 削除
- バックアップ

### モニタリング

#### ロギング
- エラーログ
- アクセスログ
- パフォーマンスログ
- セキュリティログ

#### メトリクス
- パフォーマンス
- ユーザー行動
- システムリソース
- エラー率

## データフロー

1. ユーザー入力
   - 自然言語テキスト
   - テンプレート選択
   - スタイル設定

2. バックエンド処理
   - 入力検証
   - テンプレート適用
   - チャート生成
   - ファイル生成

3. キャッシュ処理
   - キャッシュチェック
   - キャッシュ更新
   - キャッシュ無効化

4. データベース操作
   - データ保存
   - データ取得
   - データ更新

5. ファイル処理
   - アップロード
   - 変換
   - ダウンロード

6. モニタリング
   - ログ記録
   - メトリクス収集
   - アラート生成

## セキュリティ

### 認証
- JWT
- セッション管理
- パスワードハッシュ

### 認可
- ロールベース
- パーミッション
- アクセス制御

### データ保護
- 暗号化
- バックアップ
- データマスキング

### セキュリティ対策
- XSS対策
- CSRF対策
- SQLインジェクション対策
- レート制限

## パフォーマンス

### 最適化
- キャッシュ
- インデックス
- クエリ最適化
- リソース管理

### スケーリング
- 水平スケーリング
- 垂直スケーリング
- ロードバランシング
- データベースシャーディング

## デプロイメント

### 環境
- 開発
- ステージング
- 本番

### CI/CD
- GitHub Actions
- 自動テスト
- 自動デプロイ
- ロールバック

### 監視
- ヘルスチェック
- パフォーマンスモニタリング
- エラー追跡
- アラート設定

## テスト戦略

1. 単体テスト
   - コンポーネントテスト
   - ユーティリティ関数テスト
   - エラーハンドリングテスト

2. 統合テスト
   - APIエンドポイントテスト
   - データベース操作テスト
   - ファイル処理テスト

3. E2Eテスト
   - ユーザーフローテスト
   - パフォーマンステスト
   - セキュリティテスト

## 新機能

### デザインライブラリ
- コンポーネントのプレビュー機能
  - 各タイプ（見出し、グラフ、カバー）に対応したプレビュー表示
  - モーダルウィンドウでの表示
  - エラーハンドリングとローディング状態の管理

- コンポーネントの編集機能
  - コンポーネント名の編集
  - タイプ別の編集フォーム
  - バリデーションとエラーハンドリング
  - 保存時のメトリクス記録

- コンポーネントのバージョン管理
  - バージョン履歴の保存
  - バージョン番号の自動管理
  - 作成者情報の記録

- コンポーネントのカテゴリ分類
  - カテゴリの作成、更新、削除
  - コンポーネントとカテゴリの関連付け
  - キャッシュによる高速なデータ取得
  - メトリクスとエラーログの記録

### 一括操作機能
- 複数コンポーネントの選択
- カテゴリの一括変更
- 一括削除
- 操作のメトリクス記録

### 高度な検索とフィルタリング
- テキスト検索
- タイプによるフィルタリング
- カテゴリによるフィルタリング
- 日付範囲によるフィルタリング
- 並び替え機能
  - 作成日
  - 名前
  - タイプ
- 検索条件の保存と復元

## 今後の展望
1. バージョン履歴の表示と復元機能
2. カテゴリ管理のUI改善
3. コンポーネントの一括操作機能の拡張
4. 検索とフィルタリングのさらなる高度化 