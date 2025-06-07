// 🟡 高優先度: 実際のPowerPoint生成エンジン

import PptxGenJS from "pptxgenjs"
import { CustomError, ErrorCode } from "./error-handler"
import yaml from "js-yaml"

export interface PowerPointOptions {
  template?: "bcg" | "modern" | "minimal" | "corporate"
  colorScheme?: "blue" | "red" | "green" | "purple" | "orange"
  fontSize?: "small" | "medium" | "large"
  includeNotes?: boolean
}

export class PowerPointGenerator {
  private static instance: PowerPointGenerator

  static getInstance(): PowerPointGenerator {
    if (!PowerPointGenerator.instance) {
      PowerPointGenerator.instance = new PowerPointGenerator()
    }
    return PowerPointGenerator.instance
  }

  /**
   * YAMLデータからPowerPointファイルを生成
   */
  async generatePowerPoint(yamlData: string, options: PowerPointOptions = {}): Promise<Buffer> {
    try {
      const pptx = new PptxGenJS()

      // テンプレート設定の適用
      this.applyTemplate(pptx, options)

      // YAMLデータの解析
      const data = yaml.load(yamlData) as any

      if (!data || !data.slides || !Array.isArray(data.slides)) {
        throw new CustomError(ErrorCode.VALIDATION_ERROR, "無効なYAMLデータです。slides配列が必要です。")
      }

      // 各スライドの生成
      for (let i = 0; i < data.slides.length; i++) {
        const slideData = data.slides[i]
        await this.generateSlide(pptx, slideData, i + 1, options)
      }

      // PowerPointファイルの生成
      const pptxBuffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer

      if (!pptxBuffer || pptxBuffer.length === 0) {
        throw new CustomError(ErrorCode.POWERPOINT_GENERATION_ERROR, "PowerPointファイルの生成に失敗しました")
      }

      return pptxBuffer
    } catch (error) {
      console.error("PowerPoint generation error:", error)

      if (error instanceof CustomError) {
        throw error
      }

      if (error.message?.includes("yaml")) {
        throw new CustomError(ErrorCode.VALIDATION_ERROR, "YAMLデータの解析に失敗しました。形式を確認してください。", {
          originalError: error.message,
        })
      }

      throw new CustomError(ErrorCode.POWERPOINT_GENERATION_ERROR, "PowerPointの生成中にエラーが発生しました", {
        originalError: error.message,
      })
    }
  }

  /**
   * テンプレート設定の適用
   */
  private applyTemplate(pptx: PptxGenJS, options: PowerPointOptions): void {
    const { template = "modern", colorScheme = "blue" } = options

    // スライドサイズの設定
    pptx.defineLayout({
      name: "CUSTOM",
      width: 10,
      height: 7.5,
    })

    // カラーパレットの設定
    const colors = this.getColorScheme(colorScheme)

    // マスタースライドの設定
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: colors.background },
      objects: [
        // ヘッダー
        {
          rect: {
            x: 0,
            y: 0,
            w: 10,
            h: 0.5,
            fill: colors.primary,
          },
        },
        // フッター
        {
          rect: {
            x: 0,
            y: 7,
            w: 10,
            h: 0.5,
            fill: colors.secondary,
          },
        },
        // ページ番号
        {
          text: {
            text: "{{slide_number}}",
            options: {
              x: 9,
              y: 7.1,
              w: 0.8,
              h: 0.3,
              fontSize: 10,
              color: colors.text,
              align: "right",
            },
          },
        },
      ],
    })

    pptx.setLayout("CUSTOM")
  }

  /**
   * カラースキームの取得
   */
  private getColorScheme(scheme: string) {
    const schemes = {
      blue: {
        primary: "1E40AF",
        secondary: "3B82F6",
        accent: "EF4444",
        background: "FFFFFF",
        text: "1F2937",
        lightGray: "F8FAFC",
      },
      red: {
        primary: "DC2626",
        secondary: "EF4444",
        accent: "3B82F6",
        background: "FFFFFF",
        text: "1F2937",
        lightGray: "FEF2F2",
      },
      green: {
        primary: "059669",
        secondary: "10B981",
        accent: "F59E0B",
        background: "FFFFFF",
        text: "1F2937",
        lightGray: "F0FDF4",
      },
      purple: {
        primary: "7C3AED",
        secondary: "8B5CF6",
        accent: "EF4444",
        background: "FFFFFF",
        text: "1F2937",
        lightGray: "FAF5FF",
      },
      orange: {
        primary: "EA580C",
        secondary: "F97316",
        accent: "3B82F6",
        background: "FFFFFF",
        text: "1F2937",
        lightGray: "FFF7ED",
      },
    }

    return schemes[scheme] || schemes.blue
  }

  /**
   * 個別スライドの生成
   */
  private async generateSlide(
    pptx: PptxGenJS,
    slideData: any,
    slideNumber: number,
    options: PowerPointOptions,
  ): Promise<void> {
    const slide = pptx.addSlide({ masterName: "MASTER_SLIDE" })
    const colors = this.getColorScheme(options.colorScheme || "blue")

    switch (slideData.type) {
      case "title":
        await this.generateTitleSlide(slide, slideData.content, colors, options)
        break
      case "content":
        await this.generateContentSlide(slide, slideData.content, colors, options)
        break
      case "chart":
        await this.generateChartSlide(slide, slideData.content, colors, options)
        break
      case "comparison":
        await this.generateComparisonSlide(slide, slideData.content, colors, options)
        break
      case "strategy":
        await this.generateStrategySlide(slide, slideData.content, colors, options)
        break
      case "timeline":
        await this.generateTimelineSlide(slide, slideData.content, colors, options)
        break
      default:
        await this.generateContentSlide(slide, slideData.content, colors, options)
    }

    // スライドノートの追加
    if (options.includeNotes && slideData.notes) {
      slide.addNotes(slideData.notes)
    }
  }

  /**
   * タイトルスライドの生成
   */
  private async generateTitleSlide(slide: any, content: any, colors: any, options: PowerPointOptions): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // メインタイトル
    slide.addText(content.title || "タイトル", {
      x: 1,
      y: 2.5,
      w: 8,
      h: 1.5,
      fontSize: fontSize.title,
      fontFace: "Arial",
      color: colors.primary,
      bold: true,
      align: "center",
    })

    // サブタイトル
    if (content.subtitle) {
      slide.addText(content.subtitle, {
        x: 1,
        y: 4.2,
        w: 8,
        h: 1,
        fontSize: fontSize.subtitle,
        fontFace: "Arial",
        color: colors.text,
        align: "center",
      })
    }

    // 日付
    const today = new Date().toLocaleDateString("ja-JP")
    slide.addText(today, {
      x: 1,
      y: 6,
      w: 8,
      h: 0.5,
      fontSize: fontSize.small,
      fontFace: "Arial",
      color: colors.text,
      align: "center",
    })
  }

  /**
   * コンテンツスライドの生成
   */
  private async generateContentSlide(slide: any, content: any, colors: any, options: PowerPointOptions): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // タイトル
    slide.addText(content.title || "コンテンツ", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: fontSize.heading,
      fontFace: "Arial",
      color: colors.primary,
      bold: true,
    })

    // 本文またはポイント
    if (content.points && Array.isArray(content.points)) {
      content.points.forEach((point: string, index: number) => {
        slide.addText(`• ${point}`, {
          x: 1,
          y: 2 + index * 0.8,
          w: 8,
          h: 0.6,
          fontSize: fontSize.body,
          fontFace: "Arial",
          color: colors.text,
          valign: "top",
        })
      })
    } else if (content.text) {
      slide.addText(content.text, {
        x: 1,
        y: 2,
        w: 8,
        h: 4,
        fontSize: fontSize.body,
        fontFace: "Arial",
        color: colors.text,
        valign: "top",
      })
    }
  }

  /**
   * チャートスライドの生成
   */
  private async generateChartSlide(slide: any, content: any, colors: any, options: PowerPointOptions): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // タイトル
    slide.addText(content.title || "チャート", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: fontSize.heading,
      fontFace: "Arial",
      color: colors.primary,
      bold: true,
    })

    // チャートデータの処理
    if (content.data && content.data.labels && content.data.datasets) {
      const chartData = this.processChartData(content.data)

      try {
        slide.addChart(this.getChartType(content.chart_type), chartData, {
          x: 1,
          y: 2,
          w: 8,
          h: 4,
          showTitle: false,
          showLegend: true,
          legendPos: "b",
          chartColors: [colors.primary, colors.secondary, colors.accent],
        })
      } catch (chartError) {
        // チャート生成に失敗した場合はプレースホルダーを表示
        slide.addText("チャートデータ", {
          x: 1,
          y: 3,
          w: 8,
          h: 2,
          fontSize: fontSize.body,
          fontFace: "Arial",
          color: colors.text,
          align: "center",
          valign: "middle",
          fill: colors.lightGray,
        })
      }
    }
  }

  /**
   * 比較スライドの生成
   */
  private async generateComparisonSlide(
    slide: any,
    content: any,
    colors: any,
    options: PowerPointOptions,
  ): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // タイトル
    slide.addText(content.title || "比較分析", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: fontSize.heading,
      fontFace: "Arial",
      color: colors.primary,
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
        const y = 2.5 + row * (itemHeight + 0.3)

        // アイテムボックス
        slide.addShape("rect", {
          x,
          y,
          w: itemWidth,
          h: itemHeight,
          fill: colors.lightGray,
          line: { color: colors.secondary, width: 1 },
        })

        // タイトル
        slide.addText(item.title, {
          x,
          y: y + 0.1,
          w: itemWidth,
          h: 0.4,
          fontSize: fontSize.small,
          fontFace: "Arial",
          color: colors.text,
          bold: true,
          align: "center",
        })

        // 値
        slide.addText(item.value, {
          x,
          y: y + 0.6,
          w: itemWidth,
          h: 0.6,
          fontSize: fontSize.large,
          fontFace: "Arial",
          color: colors.primary,
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
            fontSize: fontSize.small,
            fontFace: "Arial",
            color: trendColor,
            bold: true,
            align: "center",
          })
        }
      })
    }
  }

  /**
   * 戦略スライドの生成
   */
  private async generateStrategySlide(
    slide: any,
    content: any,
    colors: any,
    options: PowerPointOptions,
  ): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // タイトル
    slide.addText(content.title || "戦略提案", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: fontSize.heading,
      fontFace: "Arial",
      color: colors.primary,
      bold: true,
    })

    if (content.points && Array.isArray(content.points)) {
      content.points.forEach((point: string, index: number) => {
        const y = 2.2 + index * 0.9

        // 番号付きアイコン
        slide.addShape("ellipse", {
          x: 0.8,
          y: y + 0.1,
          w: 0.4,
          h: 0.4,
          fill: colors.primary,
        })

        slide.addText((index + 1).toString(), {
          x: 0.8,
          y: y + 0.1,
          w: 0.4,
          h: 0.4,
          fontSize: fontSize.small,
          fontFace: "Arial",
          color: "FFFFFF",
          bold: true,
          align: "center",
          valign: "middle",
        })

        // ポイントテキスト
        slide.addText(point, {
          x: 1.4,
          y: y,
          w: 7.6,
          h: 0.6,
          fontSize: fontSize.body,
          fontFace: "Arial",
          color: colors.text,
          valign: "middle",
        })
      })
    }
  }

  /**
   * タイムラインスライドの生成
   */
  private async generateTimelineSlide(
    slide: any,
    content: any,
    colors: any,
    options: PowerPointOptions,
  ): Promise<void> {
    const fontSize = this.getFontSize(options.fontSize || "medium")

    // タイトル
    slide.addText(content.title || "タイムライン", {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.8,
      fontSize: fontSize.heading,
      fontFace: "Arial",
      color: colors.primary,
      bold: true,
    })

    if (content.items && Array.isArray(content.items)) {
      const timelineY = 3.5
      const stepWidth = 8 / content.items.length

      // タイムライン線
      slide.addShape("line", {
        x: 1,
        y: timelineY,
        w: 8,
        h: 0,
        line: { color: colors.secondary, width: 3 },
      })

      content.items.forEach((item: any, index: number) => {
        const x = 1 + index * stepWidth + stepWidth / 2

        // タイムラインポイント
        slide.addShape("ellipse", {
          x: x - 0.15,
          y: timelineY - 0.15,
          w: 0.3,
          h: 0.3,
          fill: colors.primary,
        })

        // 日付/期間
        slide.addText(item.date || item.period || `Step ${index + 1}`, {
          x: x - stepWidth / 2,
          y: timelineY - 0.8,
          w: stepWidth,
          h: 0.4,
          fontSize: fontSize.small,
          fontFace: "Arial",
          color: colors.text,
          bold: true,
          align: "center",
        })

        // 説明
        slide.addText(item.description || item.title, {
          x: x - stepWidth / 2,
          y: timelineY + 0.5,
          w: stepWidth,
          h: 1,
          fontSize: fontSize.small,
          fontFace: "Arial",
          color: colors.text,
          align: "center",
          valign: "top",
        })
      })
    }
  }

  /**
   * フォントサイズの取得
   */
  private getFontSize(size: string) {
    const sizes = {
      small: { title: 36, heading: 24, subtitle: 20, body: 14, small: 12, large: 28 },
      medium: { title: 44, heading: 28, subtitle: 24, body: 18, small: 14, large: 32 },
      large: { title: 52, heading: 32, subtitle: 28, body: 22, small: 16, large: 36 },
    }

    return sizes[size] || sizes.medium
  }

  /**
   * チャートタイプの変換
   */
  private getChartType(chartType: string): any {
    const types = {
      bar: "bar",
      line: "line",
      pie: "pie",
      doughnut: "doughnut",
      scatter: "scatter",
      area: "area",
    }

    return types[chartType] || "bar"
  }

  /**
   * チャートデータの処理
   */
  private processChartData(data: any): any[] {
    const result = []

    if (data.labels && data.datasets) {
      data.labels.forEach((label: string, index: number) => {
        const row = [label]
        data.datasets.forEach((dataset: any) => {
          row.push(dataset.data[index] || 0)
        })
        result.push(row)
      })

      // ヘッダー行の追加
      const header = ["Category"]
      data.datasets.forEach((dataset: any) => {
        header.push(dataset.label || `Series ${header.length}`)
      })
      result.unshift(header)
    }

    return result
  }
}

// シングルトンインスタンスのエクスポート
export const powerPointGenerator = PowerPointGenerator.getInstance()
