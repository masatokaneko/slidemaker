# 🛠️ セットアップガイド

## 前提条件

### 必要なソフトウェア
- Node.js 18.0.0 以上
- npm または yarn
- PostgreSQL 14 以上
- Git

### 必要なアカウント
- OpenAI API アカウント
- Google Cloud Console アカウント（OAuth用）
- Vercel アカウント（デプロイ用）

## ステップバイステップセットアップ

### 1. リポジトリのクローン
\`\`\`bash
git clone <repository-url>
cd ppt-slide-generator
\`\`\`

### 2. 依存関係のインストール
\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定
\`\`\`bash
# .env.local ファイルを作成
cp .env.example .env.local

# 以下の値を設定
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/ppt_generator
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
\`\`\`

### 4. データベースセットアップ
\`\`\`bash
# Prisma CLI のインストール
npm install -g prisma

# データベースの作成
createdb ppt_generator

# マイグレーションの実行
npx prisma migrate dev --name init

# Prisma クライアントの生成
npx prisma generate

# 初期データの投入
npx prisma db seed
\`\`\`

### 5. Google OAuth設定
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. APIs & Services > Credentials に移動
4. OAuth 2.0 Client IDs を作成
5. Authorized redirect URIs に `http://localhost:3000/api/auth/callback/google` を追加

### 6. OpenAI API設定
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. API Keys セクションで新しいキーを作成
3. 使用量制限を設定（推奨）

### 7. 開発サーバーの起動
\`\`\`bash
npm run dev
\`\`\`

### 8. 動作確認
1. http://localhost:3000 にアクセス
2. ユーザー登録・ログイン機能をテスト
3. スライド生成機能をテスト

## トラブルシューティング

### よくある問題

#### 1. データベース接続エラー
\`\`\`
Error: P1001: Can't reach database server
\`\`\`
**解決方法:**
- PostgreSQLが起動していることを確認
- DATABASE_URLが正しいことを確認
- ファイアウォール設定を確認

#### 2. OpenAI API エラー
\`\`\`
Error: 401 Unauthorized
\`\`\`
**解決方法:**
- APIキーが正しく設定されていることを確認
- APIキーに十分なクレジットがあることを確認
- レート制限に引っかかっていないか確認

#### 3. NextAuth エラー
\`\`\`
[next-auth][error][SIGNIN_OAUTH_ERROR]
\`\`\`
**解決方法:**
- Google OAuth設定を確認
- リダイレクトURIが正しく設定されていることを確認
- NEXTAUTH_SECRETが設定されていることを確認

### ログの確認
\`\`\`bash
# 開発サーバーのログ
npm run dev

# データベースログ
npx prisma studio

# Vercelデプロイログ
vercel logs
\`\`\`

## 本番環境デプロイ

### Vercelへのデプロイ
\`\`\`bash
# Vercel CLIのインストール
npm install -g vercel

# プロジェクトの初期化
vercel

# 環境変数の設定
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# デプロイ
vercel --prod
\`\`\`

### 本番環境での注意点
1. NEXTAUTH_URLを本番URLに変更
2. Google OAuthのリダイレクトURIを本番URL用に追加
3. データベースを本番環境用に設定
4. セキュリティヘッダーの設定
5. 監視・ログ設定

## パフォーマンス最適化

### 推奨設定
\`\`\`javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['pptxgenjs']
  },
  images: {
    domains: ['blob.vercel-storage.com']
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  }
}
\`\`\`

## セキュリティ設定

### 推奨セキュリティヘッダー
\`\`\`javascript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}
