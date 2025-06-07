#!/bin/bash
# 🔴 最高優先度: 必須依存関係のインストール

echo "🚀 PPTスライド生成システム - 依存関係セットアップ"
echo "=================================================="

# Node.js バージョンチェック
echo "📋 Node.js バージョンチェック..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18以上が必要です。現在のバージョン: $(node -v)"
    exit 1
fi
echo "✅ Node.js バージョン: $(node -v)"

# npm バージョンチェック
echo "📋 npm バージョンチェック..."
echo "✅ npm バージョン: $(npm -v)"

# 既存のnode_modulesとpackage-lock.jsonを削除
echo "🧹 既存の依存関係をクリーンアップ..."
rm -rf node_modules package-lock.json

# 🔴 最高優先度の依存関係
echo "📦 最高優先度の依存関係をインストール中..."
npm install \
  next@^14.0.0 \
  react@^18.0.0 \
  react-dom@^18.0.0 \
  prisma@^5.0.0 \
  @prisma/client@^5.0.0 \
  next-auth@^4.24.0 \
  @auth/prisma-adapter@^1.0.0

if [ $? -ne 0 ]; then
    echo "❌ 最高優先度の依存関係のインストールに失敗しました"
    exit 1
fi

# 🟡 高優先度の依存関係
echo "📦 高優先度の依存関係をインストール中..."
npm install \
  pptxgenjs@^3.12.0 \
  ai@^3.0.0 \
  @ai-sdk/openai@^0.0.0 \
  @vercel/blob@^0.15.0 \
  js-yaml@^4.1.0 \
  zod@^3.22.0

if [ $? -ne 0 ]; then
    echo "❌ 高優先度の依存関係のインストールに失敗しました"
    exit 1
fi

# UI コンポーネント
echo "📦 UIコンポーネントをインストール中..."
npm install \
  @radix-ui/react-dialog@^1.0.0 \
  @radix-ui/react-dropdown-menu@^2.0.0 \
  @radix-ui/react-select@^2.0.0 \
  @radix-ui/react-separator@^1.0.0 \
  @radix-ui/react-tabs@^1.0.0 \
  @radix-ui/react-progress@^1.0.0 \
  @radix-ui/react-alert-dialog@^1.0.0 \
  lucide-react@^0.294.0 \
  class-variance-authority@^0.7.0 \
  clsx@^2.0.0 \
  tailwind-merge@^2.0.0 \
  tailwindcss-animate@^1.0.0

# 開発依存関係
echo "📦 開発依存関係をインストール中..."
npm install -D \
  @types/node@^20.0.0 \
  @types/react@^18.0.0 \
  @types/react-dom@^18.0.0 \
  @types/js-yaml@^4.0.0 \
  typescript@^5.0.0 \
  tailwindcss@^3.3.0 \
  autoprefixer@^10.4.0 \
  postcss@^8.4.0 \
  eslint@^8.0.0 \
  eslint-config-next@^14.0.0

if [ $? -ne 0 ]; then
    echo "❌ 開発依存関係のインストールに失敗しました"
    exit 1
fi

# Prisma の初期化
echo "🗄️ Prisma を初期化中..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma の初期化に失敗しました"
    exit 1
fi

echo ""
echo "✅ 全ての依存関係のインストールが完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. .env.local ファイルを作成して環境変数を設定"
echo "2. PostgreSQL データベースを作成"
echo "3. npx prisma migrate dev を実行"
echo "4. npm run dev でアプリケーションを起動"
echo ""
echo "🔧 セットアップスクリプトを実行: npm run setup"
