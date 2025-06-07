# 🔧 トラブルシューティングガイド

## 一般的な問題と解決方法

### 🔴 起動時の問題

#### 1. モジュールが見つからないエラー
\`\`\`
Error: Cannot find module 'xyz'
\`\`\`
**原因:** 依存関係がインストールされていない
**解決方法:**
\`\`\`bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install

# 特定のパッケージが不足している場合
npm install xyz
\`\`\`

#### 2. TypeScript型エラー
\`\`\`
Type 'xyz' is not assignable to type 'abc'
\`\`\`
**解決方法:**
\`\`\`bash
# 型定義の再生成
npx prisma generate
npm run type-check
\`\`\`

### 🟡 認証関連の問題

#### 1. NextAuth セッションエラー
\`\`\`
[next-auth][error][SESSION_ERROR]
\`\`\`
**チェックポイント:**
- NEXTAUTH_SECRET が設定されているか
- NEXTAUTH_URL が正しいか
- データベース接続が正常か

**解決方法:**
\`\`\`bash
# セッションテーブルをリセット
npx prisma db push --force-reset
\`\`\`

#### 2. Google OAuth エラー
\`\`\`
[next-auth][error][OAUTH_CALLBACK_ERROR]
\`\`\`
**チェックポイント:**
- Google Cloud Console の設定
- リダイレクトURI の設定
- クライアントIDとシークレットの設定

### 🟢 データベース関連の問題

#### 1. Prisma接続エラー
\`\`\`
PrismaClientInitializationError: Can't reach database server
\`\`\`
**解決方法:**
\`\`\`bash
# データベースの状態確認
pg_isready -h localhost -p 5432

# 接続文字列の確認
echo $DATABASE_URL

# Prismaクライアントの再生成
npx prisma generate
\`\`\`

#### 2. マイグレーションエラー
\`\`\`
Error: Migration failed
\`\`\`
**解決方法:**
\`\`\`bash
# マイグレーション状態の確認
npx prisma migrate status

# 強制リセット（開発環境のみ）
npx prisma migrate reset

# 手動マイグレーション
npx prisma db push
\`\`\`

### 🔵 AI機能関連の問題

#### 1. OpenAI API エラー
\`\`\`
Error: 429 Too Many Requests
\`\`\`
**解決方法:**
- レート制限の確認
- APIキーのクレジット残高確認
- リクエスト頻度の調整

#### 2. PDF処理エラー
\`\`\`
Error: Failed to analyze PDF
\`\`\`
**解決方法:**
\`\`\`bash
# PDF処理ライブラリの確認
npm list pdf2pic
npm list sharp

# 依存関係の再インストール
npm install pdf2pic sharp canvas
\`\`\`

### 🟣 ファイル処理関連の問題

#### 1. ファイルアップロードエラー
\`\`\`
Error: File upload failed
\`\`\`
**チェックポイント:**
- ファイルサイズ制限
- ファイル形式の制限
- Blob Storage の設定

#### 2. PowerPoint生成エラー
\`\`\`
Error: Failed to generate PowerPoint
\`\`\`
**解決方法:**
\`\`\`bash
# pptxgenjs の確認
npm list pptxgenjs

# Canvas依存関係の確認（サーバーサイド）
npm install canvas
\`\`\`

## デバッグ方法

### 1. ログレベルの設定
\`\`\`bash
# 詳細ログの有効化
DEBUG=* npm run dev

# 特定のモジュールのログ
DEBUG=next-auth* npm run dev
\`\`\`

### 2. データベースデバッグ
\`\`\`bash
# Prisma Studio でデータ確認
npx prisma studio

# SQLログの有効化
# prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
\`\`\`

### 3. API デバッグ
\`\`\`typescript
// API ルートでのデバッグ
export async function POST(request: NextRequest) {
  console.log('Request headers:', request.headers)
  console.log('Request body:', await request.text())
  
  try {
    // 処理
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
\`\`\`

## パフォーマンス問題

### 1. 遅いページ読み込み
**診断方法:**
\`\`\`bash
# Lighthouse でパフォーマンス測定
npm install -g lighthouse
lighthouse http://localhost:3000

# Next.js のビルド分析
npm run build
npm run analyze
\`\`\`

**最適化方法:**
- 画像の最適化
- コード分割の実装
- キャッシュの活用

### 2. メモリリーク
**診断方法:**
\`\`\`bash
# Node.js メモリ使用量の監視
node --inspect npm run dev
\`\`\`

**解決方法:**
- イベントリスナーの適切な削除
- 大きなオブジェクトの適切な解放
- メモリプロファイリング

## 本番環境での問題

### 1. Vercel デプロイエラー
\`\`\`
Error: Build failed
\`\`\`
**解決方法:**
\`\`\`bash
# ローカルでビルドテスト
npm run build

# Vercel ログの確認
vercel logs

# 環境変数の確認
vercel env ls
\`\`\`

### 2. 本番環境でのエラー
**監視方法:**
- Vercel Analytics の活用
- Sentry などのエラー監視ツール
- カスタムログの実装

## サポートリソース

### 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### コミュニティ
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Discord](https://pris.ly/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

### 緊急時の対応
1. エラーログの収集
2. 再現手順の記録
3. 環境情報の確認
4. 一時的な回避策の実装
5. 根本原因の調査と修正
