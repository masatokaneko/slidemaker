/**
 * 🔴 最高優先度: 本番環境セットアップスクリプト
 */

import { testDatabaseConnection, initializeDatabase } from "../lib/database"
import { aiService } from "../lib/ai-service"
import { fileStorage } from "../lib/file-storage"
import { powerPointGenerator } from "../lib/powerpoint-generator-enhanced"

interface SetupStep {
  name: string
  description: string
  required: boolean
  status: "pending" | "completed" | "failed" | "skipped"
  action: () => Promise<boolean>
}

class ProductionSetup {
  private steps: SetupStep[] = [
    {
      name: "Environment Variables",
      description: "環境変数の設定確認",
      required: true,
      status: "pending",
      action: this.checkEnvironmentVariables.bind(this),
    },
    {
      name: "Database Connection",
      description: "データベース接続の確認",
      required: true,
      status: "pending",
      action: this.checkDatabaseConnection.bind(this),
    },
    {
      name: "Database Initialization",
      description: "データベースの初期化",
      required: true,
      status: "pending",
      action: this.initializeDatabase.bind(this),
    },
    {
      name: "OpenAI API",
      description: "OpenAI APIの接続確認",
      required: true,
      status: "pending",
      action: this.checkOpenAIConnection.bind(this),
    },
    {
      name: "File Storage",
      description: "ファイルストレージの設定確認",
      required: false,
      status: "pending",
      action: this.checkFileStorage.bind(this),
    },
    {
      name: "PowerPoint Generation",
      description: "PowerPoint生成機能のテスト",
      required: true,
      status: "pending",
      action: this.testPowerPointGeneration.bind(this),
    },
  ]

  async runSetup(): Promise<void> {
    console.log("🚀 PPTスライド生成システム - 本番環境セットアップ")
    console.log("=" * 60)

    for (const step of this.steps) {
      console.log(`\n📋 ${step.name}: ${step.description}`)

      try {
        const success = await step.action()
        step.status = success ? "completed" : "failed"

        if (success) {
          console.log(`✅ ${step.name} - 完了`)
        } else {
          console.log(`❌ ${step.name} - 失敗`)
          if (step.required) {
            console.log(`⚠️  必須項目のため、セットアップを中断します`)
            break
          } else {
            step.status = "skipped"
            console.log(`⏭️  オプション項目のためスキップします`)
          }
        }
      } catch (error) {
        step.status = "failed"
        console.log(`❌ ${step.name} - エラー: ${error.message}`)
        if (step.required) {
          break
        }
      }
    }

    this.printSummary()
  }

  private async checkEnvironmentVariables(): Promise<boolean> {
    const requiredVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL", "OPENAI_API_KEY"]

    const optionalVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "VERCEL_BLOB_READ_WRITE_TOKEN"]

    const missing = requiredVars.filter((varName) => !process.env[varName])
    const missingOptional = optionalVars.filter((varName) => !process.env[varName])

    if (missing.length > 0) {
      console.log(`   ❌ 不足している必須環境変数: ${missing.join(", ")}`)
      console.log(`   💡 .env.local ファイルに以下を追加してください:`)
      missing.forEach((varName) => {
        console.log(`      ${varName}=your-${varName.toLowerCase().replace(/_/g, "-")}-here`)
      })
      return false
    }

    console.log(`   ✅ 全ての必須環境変数が設定されています`)

    if (missingOptional.length > 0) {
      console.log(`   ⚠️  オプション環境変数: ${missingOptional.join(", ")} が未設定`)
    }

    // 環境変数の値の基本的な検証
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      console.log(`   ⚠️  NEXTAUTH_SECRET は32文字以上にすることを推奨します`)
    }

    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-")) {
      console.log(`   ⚠️  OPENAI_API_KEY の形式が正しくない可能性があります`)
    }

    return true
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      console.log(`   🔍 データベース接続を確認中...`)

      const isConnected = await testDatabaseConnection()

      if (!isConnected) {
        console.log(`   ❌ データベースに接続できません`)
        console.log(`   💡 以下を確認してください:`)
        console.log(`      - PostgreSQLが起動していること`)
        console.log(`      - DATABASE_URLが正しいこと`)
        console.log(`      - ネットワーク接続が正常なこと`)
        return false
      }

      console.log(`   ✅ データベース接続が正常です`)
      return true
    } catch (error) {
      console.log(`   ❌ データベース接続エラー: ${error.message}`)
      return false
    }
  }

  private async initializeDatabase(): Promise<boolean> {
    try {
      console.log(`   🔍 データベースを初期化中...`)

      await initializeDatabase()

      console.log(`   ✅ データベースの初期化が完了しました`)
      console.log(`   💡 マイグレーションを実行してください: npx prisma migrate dev`)

      return true
    } catch (error) {
      console.log(`   ❌ データベース初期化エラー: ${error.message}`)
      console.log(`   💡 以下のコマンドを実行してください:`)
      console.log(`      npx prisma migrate dev`)
      console.log(`      npx prisma generate`)
      return false
    }
  }

  private async checkOpenAIConnection(): Promise<boolean> {
    try {
      console.log(`   🔍 OpenAI API接続を確認中...`)

      // 簡単なテストリクエスト
      const testText = "テスト"
      const result = await aiService.generateTitle(testText)

      if (result && result.length > 0) {
        console.log(`   ✅ OpenAI API接続が正常です`)
        return true
      } else {
        console.log(`   ❌ OpenAI APIからの応答が無効です`)
        return false
      }
    } catch (error) {
      console.log(`   ❌ OpenAI API接続エラー: ${error.message}`)
      console.log(`   💡 以下を確認してください:`)
      console.log(`      - OPENAI_API_KEYが正しいこと`)
      console.log(`      - APIキーにクレジットがあること`)
      console.log(`      - ネットワーク接続が正常なこと`)
      return false
    }
  }

  private async checkFileStorage(): Promise<boolean> {
    const blobToken = process.env.VERCEL_BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      console.log(`   ⚠️  VERCEL_BLOB_READ_WRITE_TOKEN が設定されていません`)
      console.log(`   💡 ファイルアップロード機能を使用する場合は設定してください`)
      return false
    }

    try {
      console.log(`   🔍 ファイルストレージ接続を確認中...`)

      // ファイル一覧の取得テスト
      await fileStorage.listFiles()

      console.log(`   ✅ Vercel Blob Storage接続が正常です`)
      return true
    } catch (error) {
      console.log(`   ❌ ファイルストレージエラー: ${error.message}`)
      return false
    }
  }

  private async testPowerPointGeneration(): Promise<boolean> {
    try {
      console.log(`   🔍 PowerPoint生成機能をテスト中...`)

      const testYaml = `---
title: テストプレゼンテーション
slides:
  - type: title
    content:
      title: テストタイトル
      subtitle: セットアップテスト`

      const buffer = await powerPointGenerator.generatePowerPoint(testYaml)

      if (buffer && buffer.length > 0) {
        console.log(`   ✅ PowerPoint生成機能が正常です (${buffer.length} bytes)`)
        return true
      } else {
        console.log(`   ❌ PowerPoint生成に失敗しました`)
        return false
      }
    } catch (error) {
      console.log(`   ❌ PowerPoint生成エラー: ${error.message}`)
      console.log(`   💡 pptxgenjs の依存関係を確認してください`)
      return false
    }
  }

  private printSummary(): void {
    console.log("\n" + "=" * 60)
    console.log("📊 セットアップ結果サマリー")
    console.log("=" * 60)

    const completed = this.steps.filter((s) => s.status === "completed").length
    const failed = this.steps.filter((s) => s.status === "failed").length
    const skipped = this.steps.filter((s) => s.status === "skipped").length
    const required = this.steps.filter((s) => s.required).length
    const requiredCompleted = this.steps.filter((s) => s.required && s.status === "completed").length

    console.log(`✅ 完了: ${completed}/${this.steps.length}`)
    console.log(`❌ 失敗: ${failed}/${this.steps.length}`)
    console.log(`⏭️  スキップ: ${skipped}/${this.steps.length}`)
    console.log(`🔴 必須項目: ${requiredCompleted}/${required}`)

    console.log("\n📋 詳細結果:")
    this.steps.forEach((step) => {
      const icon = {
        completed: "✅",
        failed: "❌",
        skipped: "⏭️",
        pending: "⏳",
      }[step.status]

      const required = step.required ? "[必須]" : "[オプション]"
      console.log(`${icon} ${step.name} ${required}`)
    })

    if (requiredCompleted === required) {
      console.log("\n🎉 基本セットアップが完了しました！")
      console.log("\n💡 次のステップ:")
      console.log("   1. npm run dev でローカル開発サーバーを起動")
      console.log("   2. http://localhost:3000 でアプリケーションにアクセス")
      console.log("   3. 認証機能をテスト")
      console.log("   4. スライド生成機能をテスト")

      if (skipped > 0) {
        console.log("\n⚠️  オプション機能:")
        this.steps.filter((s) => s.status === "skipped").forEach((s) => console.log(`   - ${s.name}: ${s.description}`))
      }
    } else {
      console.log("\n⚠️  必須項目が未完了です")
      console.log("上記のエラーを解決してから再度実行してください")

      console.log("\n🔧 トラブルシューティング:")
      console.log("   - docs/deployment/troubleshooting.md を参照")
      console.log("   - 環境変数の設定を確認")
      console.log("   - データベース接続を確認")
    }

    console.log("\n📚 詳細なドキュメント:")
    console.log("   - セットアップガイド: docs/deployment/setup-guide.md")
    console.log("   - トラブルシューティング: docs/deployment/troubleshooting.md")
    console.log("   - API ドキュメント: docs/api/README.md")
  }
}

// セットアップ実行
if (require.main === module) {
  const setup = new ProductionSetup()
  setup.runSetup().catch(console.error)
}

export { ProductionSetup }
