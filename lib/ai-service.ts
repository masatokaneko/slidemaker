// 🟡 高優先度: 実際のAI処理機能

import { generateObject, generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { CustomError, ErrorCode } from "./error-handler"

// スライド構造のスキーマ定義
const SlideSchema = z.object({
  type: z.enum(["title", "content", "chart", "comparison", "strategy", "timeline"]),
  content: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    text: z.string().optional(),
    points: z.array(z.string()).optional(),
    data: z.any().optional(),
    chart_type: z.string().optional(),
    items: z.array(z.any()).optional(),
    layout: z.string().optional(),
  }),
})

const PresentationSchema = z.object({
  title: z.string(),
  slides: z.array(SlideSchema),
  metadata: z.object({
    totalSlides: z.number(),
    estimatedDuration: z.string(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    tags: z.array(z.string()),
  }),
})

export class AIService {
  private static instance: AIService
  private requestCount = 0
  private lastRequestTime = 0

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * レート制限チェック
   */
  private checkRateLimit(): void {
    const now = Date.now()
    const timeDiff = now - this.lastRequestTime

    // 1分間に10リクエストまで
    if (timeDiff < 60000 && this.requestCount >= 10) {
      throw new CustomError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "AI処理のリクエスト制限に達しました。しばらく時間をおいて再度お試しください。",
      )
    }

    if (timeDiff >= 60000) {
      this.requestCount = 0
    }

    this.requestCount++
    this.lastRequestTime = now
  }

  /**
   * 自然言語テキストを構造化されたYAMLに変換
   */
  async parseTextToStructuredData(
    text: string,
    options: {
      language?: string
      style?: string
      targetAudience?: string
    } = {},
  ): Promise<string> {
    this.checkRateLimit()

    try {
      const { language = "ja", style = "business", targetAudience = "general" } = options

      const result = await generateObject({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `あなたは世界最高レベルのプレゼンテーション専門家です。
            
以下の要件に従って、入力されたテキストを構造化されたプレゼンテーションに変換してください：

1. **構造化の原則**:
   - MECE（Mutually Exclusive, Collectively Exhaustive）の原則に従う
   - ピラミッド構造での論理展開
   - 聴衆の理解しやすい流れを作る

2. **スライドタイプの選択**:
   - title: タイトルスライド
   - content: 箇条書きや説明文
   - chart: データ可視化が必要な内容
   - comparison: 比較分析
   - strategy: 戦略や提案
   - timeline: 時系列や手順

3. **品質基準**:
   - 各スライドは1つの主要メッセージに集中
   - データがある場合は適切なチャートタイプを提案
   - 視覚的に分かりやすい構成

言語: ${language}
スタイル: ${style}
対象聴衆: ${targetAudience}`,
          },
          {
            role: "user",
            content: `以下のテキストを構造化されたプレゼンテーションに変換してください：

${text}

要求事項:
- 論理的で分かりやすい流れ
- 適切なスライドタイプの選択
- データがある場合は可視化の提案
- 聴衆の関心を引く構成`,
          },
        ],
        schema: PresentationSchema,
        temperature: 0.7,
      })

      // 結果をYAML形式に変換
      const yamlData = this.convertToYAML(result.object)
      return yamlData
    } catch (error) {
      console.error("AI parsing error:", error)

      if (error.message?.includes("rate limit")) {
        throw new CustomError(ErrorCode.AI_QUOTA_EXCEEDED, "AI使用量の上限に達しました")
      }

      if (error.message?.includes("API key")) {
        throw new CustomError(ErrorCode.OPENAI_API_ERROR, "OpenAI APIの認証に失敗しました")
      }

      throw new CustomError(
        ErrorCode.AI_SERVICE_ERROR,
        "AI処理中にエラーが発生しました。入力内容を確認して再度お試しください。",
        { originalError: error.message },
      )
    }
  }

  /**
   * スライド内容の改善提案
   */
  async generateImprovementSuggestions(
    yamlData: string,
    focusArea: "structure" | "content" | "design" | "all" = "all",
  ): Promise<string[]> {
    this.checkRateLimit()

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `あなたはプレゼンテーション改善の専門家です。
            
与えられたプレゼンテーションデータを分析し、以下の観点から改善提案を行ってください：

${focusArea === "structure" || focusArea === "all" ? "- 構造: 論理的な流れ、スライドの順序、情報の整理" : ""}
${focusArea === "content" || focusArea === "all" ? "- 内容: メッセージの明確性、データの活用、説得力" : ""}
${focusArea === "design" || focusArea === "all" ? "- デザイン: 視覚的な分かりやすさ、チャートの効果的な使用" : ""}

具体的で実行可能な提案を3-5個提供してください。`,
          },
          {
            role: "user",
            content: `以下のプレゼンテーションデータを分析して改善提案をしてください：

${yamlData}

フォーカス領域: ${focusArea}`,
          },
        ],
        temperature: 0.8,
      })

      // 改善提案を配列に分割
      return result.text
        .split("\n")
        .filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+\./))
        .map((line) => line.replace(/^[-\d.]\s*/, "").trim())
        .filter((suggestion) => suggestion.length > 10)
    } catch (error) {
      console.error("AI suggestion error:", error)
      throw new CustomError(ErrorCode.AI_SERVICE_ERROR, "改善提案の生成に失敗しました", {
        originalError: error.message,
      })
    }
  }

  /**
   * チャートデータの生成
   */
  async generateChartData(description: string, chartType: "bar" | "line" | "pie" | "scatter" = "bar"): Promise<any> {
    this.checkRateLimit()

    try {
      const ChartDataSchema = z.object({
        labels: z.array(z.string()),
        datasets: z.array(
          z.object({
            label: z.string(),
            data: z.array(z.number()),
            backgroundColor: z.string().optional(),
            borderColor: z.string().optional(),
          }),
        ),
      })

      const result = await generateObject({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content: `チャートデータ生成の専門家として、説明に基づいて適切なチャートデータを生成してください。

要件:
- チャートタイプ: ${chartType}
- 現実的で意味のあるデータ
- 適切なラベルとデータセット名
- ビジネスプレゼンテーションに適した内容`,
          },
          {
            role: "user",
            content: `以下の説明に基づいて${chartType}チャート用のデータを生成してください：

${description}`,
          },
        ],
        schema: ChartDataSchema,
        temperature: 0.6,
      })

      return result.object
    } catch (error) {
      console.error("Chart data generation error:", error)
      throw new CustomError(ErrorCode.CHART_GENERATION_ERROR, "チャートデータの生成に失敗しました", {
        originalError: error.message,
      })
    }
  }

  /**
   * プレゼンテーションのタイトル生成
   */
  async generateTitle(content: string): Promise<string> {
    this.checkRateLimit()

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        messages: [
          {
            role: "system",
            content:
              "プレゼンテーションの内容に基づいて、魅力的で適切なタイトルを生成してください。タイトルは簡潔で分かりやすく、聴衆の関心を引くものにしてください。",
          },
          {
            role: "user",
            content: `以下の内容に基づいてプレゼンテーションのタイトルを生成してください：

${content}`,
          },
        ],
        temperature: 0.8,
        maxTokens: 100,
      })

      return result.text.trim().replace(/["""]/g, "")
    } catch (error) {
      console.error("Title generation error:", error)
      return "プレゼンテーション" // フォールバック
    }
  }

  /**
   * オブジェクトをYAML形式に変換
   */
  private convertToYAML(obj: any): string {
    const yamlLines: string[] = ["---"]
    yamlLines.push(`title: "${obj.title}"`)
    yamlLines.push("slides:")

    obj.slides.forEach((slide: any, index: number) => {
      yamlLines.push(`  - type: ${slide.type}`)
      yamlLines.push("    content:")
      yamlLines.push(`      title: "${slide.content.title}"`)

      if (slide.content.subtitle) {
        yamlLines.push(`      subtitle: "${slide.content.subtitle}"`)
      }

      if (slide.content.text) {
        yamlLines.push(`      text: "${slide.content.text}"`)
      }

      if (slide.content.points) {
        yamlLines.push("      points:")
        slide.content.points.forEach((point: string) => {
          yamlLines.push(`        - "${point}"`)
        })
      }

      if (slide.content.chart_type) {
        yamlLines.push(`      chart_type: "${slide.content.chart_type}"`)
      }

      if (slide.content.data) {
        yamlLines.push("      data:")
        yamlLines.push(`        labels: ${JSON.stringify(slide.content.data.labels)}`)
        yamlLines.push("        datasets:")
        slide.content.data.datasets?.forEach((dataset: any) => {
          yamlLines.push(`          - label: "${dataset.label}"`)
          yamlLines.push(`            data: ${JSON.stringify(dataset.data)}`)
        })
      }

      if (slide.content.items) {
        yamlLines.push("      items:")
        slide.content.items.forEach((item: any) => {
          yamlLines.push(`        - title: "${item.title}"`)
          yamlLines.push(`          value: "${item.value}"`)
          if (item.trend) {
            yamlLines.push(`          trend: "${item.trend}"`)
          }
        })
      }

      if (slide.content.layout) {
        yamlLines.push(`      layout: "${slide.content.layout}"`)
      }
    })

    yamlLines.push("")
    yamlLines.push("metadata:")
    yamlLines.push(`  totalSlides: ${obj.metadata.totalSlides}`)
    yamlLines.push(`  estimatedDuration: "${obj.metadata.estimatedDuration}"`)
    yamlLines.push(`  difficulty: "${obj.metadata.difficulty}"`)
    yamlLines.push(`  tags: ${JSON.stringify(obj.metadata.tags)}`)

    return yamlLines.join("\n")
  }

  /**
   * 使用統計の取得
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    }
  }
}

// シングルトンインスタンスのエクスポート
export const aiService = AIService.getInstance()
