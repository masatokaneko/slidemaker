"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, LineChart, PieChart, TrendingUp } from "lucide-react"

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

export function AdvancedChartGenerator() {
  const [chartType, setChartType] = useState<string>("bar")
  const [chartData, setChartData] = useState<ChartData>({
    labels: ["1月", "2月", "3月", "4月"],
    datasets: [
      {
        label: "売上",
        data: [120, 150, 180, 200],
      },
    ],
  })
  const [csvData, setCsvData] = useState("")

  const handleGenerateFromCSV = () => {
    if (!csvData.trim()) return

    try {
      const lines = csvData.trim().split("\n")
      const headers = lines[0].split(",")
      const labels = headers.slice(1) // 最初の列はラベル

      const datasets = lines.slice(1).map((line, index) => {
        const values = line.split(",")
        const label = values[0]
        const data = values.slice(1).map((v) => Number.parseFloat(v) || 0)

        return {
          label,
          data,
        }
      })

      setChartData({
        labels,
        datasets,
      })
    } catch (error) {
      console.error("CSV parsing error:", error)
    }
  }

  const chartTypeIcons = {
    bar: BarChart3,
    line: LineChart,
    pie: PieChart,
    doughnut: PieChart,
  }

  const ChartIcon = chartTypeIcons[chartType as keyof typeof chartTypeIcons] || BarChart3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon className="h-5 w-5" />
          高度なチャート生成
        </CardTitle>
        <CardDescription>BCGスタイルの高品質なチャートを生成します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chart-type">チャートタイプ</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">棒グラフ</SelectItem>
                <SelectItem value="line">線グラフ</SelectItem>
                <SelectItem value="pie">円グラフ</SelectItem>
                <SelectItem value="doughnut">ドーナツグラフ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chart-title">チャートタイトル</Label>
            <Input id="chart-title" placeholder="売上推移" />
          </div>
        </div>

        <div>
          <Label htmlFor="csv-data">CSVデータ</Label>
          <Textarea
            id="csv-data"
            placeholder="月,製品A,製品B,製品C&#10;1月,120,90,60&#10;2月,150,110,80&#10;3月,180,130,95"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            className="font-mono text-sm"
            rows={6}
          />
          <Button onClick={handleGenerateFromCSV} className="mt-2" size="sm">
            CSVからチャート生成
          </Button>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-2">プレビュー</h4>
          <div className="aspect-[2/1] bg-white rounded border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ChartIcon className="h-12 w-12 mx-auto mb-2" />
              <p>チャートプレビュー</p>
              <p className="text-sm">
                {chartType} - {chartData.datasets.length}系列
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            トレンド分析
          </Button>
          <Button variant="outline" size="sm">
            色彩最適化
          </Button>
          <Button variant="outline" size="sm">
            レイアウト調整
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
