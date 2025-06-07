import type { ChartConfiguration } from "chart.js"
import { createCanvas } from "canvas"
import Chart from "chart.js/auto"

export async function generateChart(config: {
  type: string
  data: any
  options?: any
}): Promise<string> {
  const { type, data, options = {} } = config

  // BCGスタイルのチャート設定
  const bcgChartConfig: ChartConfiguration = {
    type: type as any,
    data: {
      labels: data.labels || [],
      datasets:
        data.datasets?.map((dataset: any, index: number) => ({
          ...dataset,
          backgroundColor: getBCGColors(index, type === "line" ? 0.1 : 0.8),
          borderColor: getBCGColors(index, 1),
          borderWidth: type === "line" ? 3 : 1,
          pointBackgroundColor: type === "line" ? getBCGColors(index, 1) : undefined,
          pointBorderColor: type === "line" ? "#FFFFFF" : undefined,
          pointBorderWidth: type === "line" ? 2 : undefined,
          pointRadius: type === "line" ? 6 : undefined,
        })) || [],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
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
          display: false,
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
      ...options,
    },
  }

  // Canvasでチャートを生成
  const canvas = createCanvas(options.width || 800, options.height || 400)
  const ctx = canvas.getContext("2d")

  new Chart(ctx as any, bcgChartConfig)

  // Base64画像として返す
  return canvas.toDataURL("image/png")
}

function getBCGColors(index: number, alpha = 1): string {
  const colors = [
    `rgba(59, 130, 246, ${alpha})`, // 青
    `rgba(239, 68, 68, ${alpha})`, // 赤
    `rgba(16, 185, 129, ${alpha})`, // 緑
    `rgba(245, 158, 11, ${alpha})`, // オレンジ
    `rgba(139, 92, 246, ${alpha})`, // 紫
    `rgba(236, 72, 153, ${alpha})`, // ピンク
    `rgba(14, 165, 233, ${alpha})`, // 水色
    `rgba(34, 197, 94, ${alpha})`, // ライムグリーン
  ]
  return colors[index % colors.length]
}
