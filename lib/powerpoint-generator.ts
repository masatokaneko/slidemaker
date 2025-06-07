import PptxGenJS from "pptxgenjs"
import { generateChart } from "@/lib/chart-generator"
import { applyBCGTemplate } from "@/lib/bcg-templates"
import yaml from "js-yaml"

export async function generatePowerPointFile(yamlData: string, tags: string[]): Promise<Buffer> {
  const pptx = new PptxGenJS()

  // BCGスタイルのマスターテンプレートを適用
  applyBCGTemplate(pptx, tags)

  try {
    const data = yaml.load(yamlData) as any

    if (!data.slides || !Array.isArray(data.slides)) {
      throw new Error("Invalid slide data structure")
    }

    // 各スライドを生成
    for (const slideData of data.slides) {
      await generateSlide(pptx, slideData, tags)
    }

    // PowerPointファイルを生成
    const pptxBuffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer
    return pptxBuffer
  } catch (error) {
    console.error("Error parsing YAML or generating slides:", error)
    throw new Error("Failed to generate PowerPoint presentation")
  }
}

async function generateSlide(pptx: PptxGenJS, slideData: any, tags: string[]) {
  const slide = pptx.addSlide()

  switch (slideData.type) {
    case "title":
      await generateTitleSlide(slide, slideData.content)
      break
    case "chart":
      await generateChartSlide(slide, slideData.content, tags)
      break
    case "comparison":
      await generateComparisonSlide(slide, slideData.content)
      break
    case "strategy":
      await generateStrategySlide(slide, slideData.content)
      break
    case "content":
      await generateContentSlide(slide, slideData.content)
      break
    default:
      await generateContentSlide(slide, slideData.content)
  }
}

async function generateTitleSlide(slide: any, content: any) {
  // BCGスタイルのタイトルスライド
  slide.addText(content.title || "タイトル", {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    fontFace: "Arial",
    color: "1F2937",
    bold: true,
    align: "center",
  })

  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 1,
      y: 4.2,
      w: 8,
      h: 1,
      fontSize: 24,
      fontFace: "Arial",
      color: "6B7280",
      align: "center",
    })
  }

  // BCGロゴプレースホルダー
  slide.addText("BCG STYLE", {
    x: 8.5,
    y: 6.8,
    w: 1.5,
    h: 0.5,
    fontSize: 12,
    fontFace: "Arial",
    color: "9CA3AF",
    align: "right",
  })
}

async function generateChartSlide(slide: any, content: any, tags: string[]) {
  // タイトル
  slide.addText(content.title || "チャート", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    fontFace: "Arial",
    color: "1F2937",
    bold: true,
  })

  // チャートデータの処理
  if (content.data && content.data.datasets) {
    const chartType = content.chart_type || content.chartType || "bar"
    const chartData = processChartData(content.data)

    try {
      slide.addChart(chartType, chartData, {
        x: 1,
        y: 1.5,
        w: 8,
        h: 4.5,
        showTitle: false,
        showLegend: true,
        legendPos: "b",
        chartColors: ["3B82F6", "10B981", "F59E0B", "EF4444", "8B5CF6"],
      })
    } catch (error) {
      console.error("Error generating chart:", error)
      // エラー時のフォールバック
      slide.addText("チャートの生成に失敗しました", {
        x: 1,
        y: 3,
        w: 8,
        h: 2,
        fontSize: 18,
        fontFace: "Arial",
        color: "6B7280",
        align: "center",
        valign: "middle",
        fill: "F3F4F6",
      })
    }
  }

  // データソース注記
  slide.addText("出典: 内部データ分析", {
    x: 0.5,
    y: 6.5,
    w: 9,
    h: 0.3,
    fontSize: 10,
    fontFace: "Arial",
    color: "9CA3AF",
    italic: true,
  })
}

function processChartData(data: any): any[] {
  const result = []

  if (data.labels && data.datasets) {
    // ヘッダー行の追加
    const header = ["Category"]
    data.datasets.forEach((dataset: any) => {
      header.push(dataset.label || `Series ${header.length}`)
    })
    result.push(header)

    // データ行の追加
    data.labels.forEach((label: string, index: number) => {
      const row = [label]
      data.datasets.forEach((dataset: any) => {
        row.push(dataset.data[index] || 0)
      })
      result.push(row)
    })
  }

  return result
}

async function generateComparisonSlide(slide: any, content: any) {
  slide.addText(content.title || "比較分析", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    fontFace: "Arial",
    color: "1F2937",
    bold: true,
  })

  if (content.items && Array.isArray(content.items)) {
    const itemsPerRow = content.layout === "2x2" ? 2 : Math.ceil(Math.sqrt(content.items.length))
    const itemWidth = 8 / itemsPerRow - 0.2
    const itemHeight = 1.8

    content.items.forEach((item: any, index: number) => {
      const row = Math.floor(index / itemsPerRow)
      const col = index % itemsPerRow
      const x = 1 + col * (itemWidth + 0.2)
      const y = 2 + row * (itemHeight + 0.3)

      // アイテムボックス
      slide.addShape("rect", {
        x,
        y,
        w: itemWidth,
        h: itemHeight,
        fill: "F8FAFC",
        line: { color: "E2E8F0", width: 1 },
      })

      // タイトル
      slide.addText(item.title, {
        x,
        y: y + 0.1,
        w: itemWidth,
        h: 0.4,
        fontSize: 16,
        fontFace: "Arial",
        color: "1F2937",
        bold: true,
        align: "center",
      })

      // 値
      slide.addText(item.value, {
        x,
        y: y + 0.6,
        w: itemWidth,
        h: 0.6,
        fontSize: 32,
        fontFace: "Arial",
        color: "3B82F6",
        bold: true,
        align: "center",
      })

      // トレンド
      if (item.trend) {
        const trendColor = item.trend.startsWith("+") ? "10B981" : "EF4444"
        slide.addText(item.trend, {
          x,
          y: y + 1.3,
          w: itemWidth,
          h: 0.3,
          fontSize: 14,
          fontFace: "Arial",
          color: trendColor,
          bold: true,
          align: "center",
        })
      }
    })
  }
}

async function generateStrategySlide(slide: any, content: any) {
  slide.addText(content.title || "戦略提案", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    fontFace: "Arial",
    color: "1F2937",
    bold: true,
  })

  if (content.points && Array.isArray(content.points)) {
    content.points.forEach((point: string, index: number) => {
      const y = 1.8 + index * 0.8

      // 番号付きリスト
      slide.addShape("ellipse", {
        x: 0.8,
        y: y + 0.1,
        w: 0.4,
        h: 0.4,
        fill: "3B82F6",
      })

      slide.addText((index + 1).toString(), {
        x: 0.8,
        y: y + 0.1,
        w: 0.4,
        h: 0.4,
        fontSize: 16,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "center",
        valign: "middle",
      })

      slide.addText(point, {
        x: 1.4,
        y: y,
        w: 7.6,
        h: 0.6,
        fontSize: 18,
        fontFace: "Arial",
        color: "1F2937",
        valign: "middle",
      })
    })
  }
}

async function generateContentSlide(slide: any, content: any) {
  slide.addText(content.title || "コンテンツ", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    fontFace: "Arial",
    color: "1F2937",
    bold: true,
  })

  if (content.points && Array.isArray(content.points)) {
    content.points.forEach((point: string, index: number) => {
      slide.addText(`• ${point}`, {
        x: 1,
        y: 1.8 + index * 0.6,
        w: 8,
        h: 0.5,
        fontSize: 18,
        fontFace: "Arial",
        color: "1F2937",
      })
    })
  } else if (content.text) {
    slide.addText(content.text, {
      x: 1,
      y: 1.8,
      w: 8,
      h: 4,
      fontSize: 18,
      fontFace: "Arial",
      color: "1F2937",
      valign: "top",
    })
  }
}
