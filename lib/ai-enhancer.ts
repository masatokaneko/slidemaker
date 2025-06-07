import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

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

const EnhancedPresentationSchema = z.object({
  title: z.string(),
  slides: z.array(SlideSchema),
  recommendations: z.object({
    structure: z.string(),
    design: z.string(),
    content: z.string(),
  }),
})

export async function enhanceWithAI(yamlData: string, tags: string[]): Promise<string> {
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `あなたは元BCGのコンサルタントで、最高品質のプレゼンテーションスライドを作成する専門家です。
          
          以下の原則に従ってスライドを改善してください：
          1. MECE（Mutually Exclusive, Collectively Exhaustive）の原則
          2. ピラミッド構造での論理展開
          3. データドリブンな洞察
          4. アクション指向の提案
          5. 視覚的に分かりやすいデザイン
          
          選択されたタグ: ${tags.join(", ")}
          
          入力されたYAMLデータを分析し、以下を改善してください：
          - スライドの論理的な流れ
          - 各スライドの内容の質
          - データ可視化の提案
          - 戦略的な洞察の追加`,
        },
        {
          role: "user",
          content: `以下のYAMLデータを改善してください：\n\n${yamlData}`,
        },
      ],
      schema: EnhancedPresentationSchema,
    })

    // 改善されたデータをYAML形式に変換
    const enhancedYaml = `---
title: ${result.object.title}
slides:
${result.object.slides
  .map(
    (slide) => `  - type: ${slide.type}
    content:
      title: "${slide.content.title}"${
        slide.content.subtitle
          ? `
      subtitle: "${slide.content.subtitle}"`
          : ""
      }${
        slide.content.text
          ? `
      text: "${slide.content.text}"`
          : ""
      }${
        slide.content.points
          ? `
      points:
${slide.content.points.map((point) => `        - "${point}"`).join("\n")}`
          : ""
      }${
        slide.content.chart_type
          ? `
      chart_type: "${slide.content.chart_type}"`
          : ""
      }${
        slide.content.data
          ? `
      data: ${JSON.stringify(slide.content.data, null, 8).replace(/^/gm, "        ")}`
          : ""
      }${
        slide.content.items
          ? `
      items: ${JSON.stringify(slide.content.items, null, 8).replace(/^/gm, "        ")}`
          : ""
      }${
        slide.content.layout
          ? `
      layout: "${slide.content.layout}"`
          : ""
      }`,
  )
  .join("\n")}

recommendations:
  structure: "${result.object.recommendations.structure}"
  design: "${result.object.recommendations.design}"
  content: "${result.object.recommendations.content}"
`

    return enhancedYaml
  } catch (error) {
    console.error("AI enhancement failed:", error)
    // AIが失敗した場合は元のデータを返す
    return yamlData
  }
}

export async function generateSlideRecommendations(content: string, slideType: string): Promise<string[]> {
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `BCGスタイルのプレゼンテーション専門家として、${slideType}スライドの改善提案を行ってください。`,
        },
        {
          role: "user",
          content: `以下のスライド内容を改善するための具体的な提案を3-5個提供してください：\n\n${content}`,
        },
      ],
      schema: z.object({
        recommendations: z.array(z.string()),
      }),
    })

    return result.object.recommendations
  } catch (error) {
    console.error("Failed to generate recommendations:", error)
    return ["スライドの構造を見直してください", "データの可視化を改善してください"]
  }
}
