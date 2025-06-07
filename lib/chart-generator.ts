import type { ChartConfiguration } from "chart.js"
import { createCanvas } from "canvas"
import Chart from "chart.js/auto"
import { CustomError, ErrorCode } from "./error-handler"

export type ChartType = "bar" | "line" | "pie" | "doughnut" | "scatter" | "area"

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

export interface ChartOptions {
  width?: number
  height?: number
  bcgStyle?: boolean
  showLegend?: boolean
  showTitle?: boolean
  legendPosition?: "top" | "bottom" | "left" | "right"
  colors?: string[]
}

export async function generateChart(config: {
  type: ChartType
  data: ChartData
  options?: ChartOptions
}): Promise<string> {
  const { type, data, options = {} } = config

  // データのバリデーション
  validateChartData(data)

  // BCGスタイルのチャート設定
  const bcgChartConfig: ChartConfiguration = {
    type: type,
    data: {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: getBCGColors(index, type === "line" ? 0.1 : 0.8, options.colors),
        borderColor: getBCGColors(index, 1, options.colors),
        borderWidth: type === "line" ? 3 : 1,
        pointBackgroundColor: type === "line" ? getBCGColors(index, 1, options.colors) : undefined,
        pointBorderColor: type === "line" ? "#FFFFFF" : undefined,
        pointBorderWidth: type === "line" ? 2 : undefined,
        pointRadius: type === "line" ? 6 : undefined,
      })),
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          display: options.showLegend !== false,
          position: options.legendPosition || "bottom",
          labels: {
            font: {
              family: "Arial",
              size: 12,
            },
            color: "#1F2937",
            usePointStyle: true,
            padding: 20,
          },
        },
        title: {
          display: options.showTitle !== false,
          font: {
            family: "Arial",
            size: 16,
            weight: "bold",
          },
          color: "#1F2937",
          padding: 20,
        },
      },
      scales:
        type !== "pie" && type !== "doughnut"
          ? {
              x: {
                grid: {
                  color: "#E5E7EB",
                  lineWidth: 1,
                },
                ticks: {
                  font: {
                    family: "Arial",
                    size: 11,
                  },
                  color: "#6B7280",
                },
              },
              y: {
                grid: {
                  color: "#E5E7EB",
                  lineWidth: 1,
                },
                ticks: {
                  font: {
                    family: "Arial",
                    size: 11,
                  },
                  color: "#6B7280",
                },
              },
            }
          : undefined,
    },
  }

  try {
    // Canvasでチャートを生成
    const canvas = createCanvas(options.width || 800, options.height || 400)
    const ctx = canvas.getContext("2d")

    new Chart(ctx as any, bcgChartConfig)

    // Base64画像として返す
    return canvas.toDataURL("image/png")
  } catch (error) {
    throw new CustomError(ErrorCode.CHART_GENERATION_ERROR, "チャートの生成に失敗しました", {
      chartType: type,
      originalError: error,
    })
  }
}

function validateChartData(data: ChartData): void {
  if (!data.labels || !Array.isArray(data.labels) || data.labels.length === 0) {
    throw new CustomError(ErrorCode.INVALID_CHART_DATA, "チャートのラベルが無効です")
  }

  if (!data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    throw new CustomError(ErrorCode.INVALID_CHART_DATA, "チャートのデータセットが無効です")
  }

  data.datasets.forEach((dataset, index) => {
    if (!dataset.label) {
      throw new CustomError(ErrorCode.INVALID_CHART_DATA, `データセット ${index + 1} のラベルが無効です`)
    }

    if (!Array.isArray(dataset.data) || dataset.data.length === 0) {
      throw new CustomError(ErrorCode.INVALID_CHART_DATA, `データセット ${index + 1} のデータが無効です`)
    }

    if (dataset.data.length !== data.labels.length) {
      throw new CustomError(
        ErrorCode.INVALID_CHART_DATA,
        `データセット ${index + 1} のデータ数がラベル数と一致しません`,
      )
    }
  })
}

function getBCGColors(index: number, alpha = 1, customColors?: string[]): string {
  const defaultColors = [
    `rgba(59, 130, 246, ${alpha})`, // 青
    `rgba(239, 68, 68, ${alpha})`, // 赤
    `rgba(16, 185, 129, ${alpha})`, // 緑
    `rgba(245, 158, 11, ${alpha})`, // オレンジ
    `rgba(139, 92, 246, ${alpha})`, // 紫
    `rgba(236, 72, 153, ${alpha})`, // ピンク
    `rgba(14, 165, 233, ${alpha})`, // 水色
    `rgba(34, 197, 94, ${alpha})`, // ライムグリーン
  ]

  if (customColors && customColors.length > 0) {
    const color = customColors[index % customColors.length]
    return color.startsWith("rgba") ? color : `rgba(${hexToRgb(color)}, ${alpha})`
  }

  return defaultColors[index % defaultColors.length]
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new CustomError(ErrorCode.INVALID_CHART_DATA, "無効なカラーコードです")
  }
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}
