"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { ErrorDisplay } from "@/components/error-boundary"
import { CustomError, ErrorCode } from "@/lib/error-handler"

// 動的インポート
import dynamic from "next/dynamic"

const SlidePreview = dynamic(
  () => import("@/components/slide-preview").then((mod) => ({ default: mod.SlidePreview })),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded flex items-center justify-center">プレビューを読み込み中...</div>
    ),
    ssr: false,
  },
)

const DesignPatternLibrary = dynamic(
  () => import("@/components/design-pattern-library").then((mod) => ({ default: mod.DesignPatternLibrary })),
  {
    loading: () => <div className="h-32 bg-gray-100 rounded"></div>,
    ssr: false,
  },
)

function SlidePatternTag({
  tag,
  selected,
  onSelect,
}: { tag: string; selected: boolean; onSelect: (tag: string) => void }) {
  return (
    <Badge
      variant={selected ? "default" : "outline"}
      className="cursor-pointer hover:bg-primary/80"
      onClick={() => onSelect(tag)}
    >
      {tag}
    </Badge>
  )
}

export function SlideGenerator() {
  const [naturalText, setNaturalText] = useState("")
  const [structuredData, setStructuredData] = useState("")
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("input")

  const { error, isLoading, clearError, executeWithErrorHandling } = useErrorHandler()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNaturalText(e.target.value)
    clearError()
  }

  const handleStructureText = async () => {
    await executeWithErrorHandling(
      async () => {
        // バリデーション
        if (!naturalText.trim()) {
          throw new CustomError(ErrorCode.VALIDATION_ERROR, "テキストを入力してください")
        }

        if (naturalText.length < 10) {
          throw new CustomError(ErrorCode.VALIDATION_ERROR, "より詳細な内容を入力してください（10文字以上）")
        }

        // 簡単なYAML生成（実際のAI処理の代わり）
        const yaml = generateSimpleYaml(naturalText)
        setStructuredData(yaml)
        setActiveTab("structured")
      },
      {
        onSuccess: () => {
          console.log("テキストの構造化が完了しました")
        },
        onError: (error) => {
          console.error("構造化エラー:", error)
        },
      },
    )
  }

  const handleStructuredDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStructuredData(e.target.value)
    clearError()
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleGenerateSlides = async () => {
    await executeWithErrorHandling(
      async () => {
        // バリデーション
        if (!structuredData.trim()) {
          throw new CustomError(ErrorCode.VALIDATION_ERROR, "構造化データが必要です")
        }

        // YAML形式の簡単なバリデーション
        if (!structuredData.includes("title:") || !structuredData.includes("slides:")) {
          throw new CustomError(ErrorCode.VALIDATION_ERROR, "有効なYAML形式で入力してください")
        }

        // 人工的な遅延（実際のAPI呼び出しをシミュレート）
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // ランダムにエラーを発生させる（デモ用）
        if (Math.random() < 0.1) {
          throw new CustomError(ErrorCode.AI_SERVICE_ERROR, "AI処理でエラーが発生しました")
        }

        const slides = generateDummySlides()
        setGeneratedSlides(slides)
        setActiveTab("preview")
      },
      {
        retries: 2, // 2回まで自動リトライ
        onSuccess: () => {
          console.log("スライド生成が完了しました")
        },
        onError: (error) => {
          console.error("スライド生成エラー:", error)
        },
      },
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="input">自然文入力</TabsTrigger>
            <TabsTrigger value="structured">構造化データ</TabsTrigger>
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
          </TabsList>

          {error && (
            <ErrorDisplay
              error={error}
              onRetry={() => {
                clearError()
                if (activeTab === "input") {
                  handleStructureText()
                } else if (activeTab === "structured") {
                  handleGenerateSlides()
                }
              }}
              onDismiss={clearError}
            />
          )}

          <TabsContent value="input" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>自然文を入力</CardTitle>
                <CardDescription>スライドの内容を自然な文章で入力してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="例: 「第1四半期の売上分析について。主要3製品の売上推移と地域別シェア、そして今後の戦略提案を含めてください。」"
                  className="min-h-[300px]"
                  value={naturalText}
                  onChange={handleTextChange}
                  disabled={isLoading}
                />
                <div className="mt-2 text-sm text-muted-foreground">{naturalText.length}/1000文字</div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleStructureText} disabled={isLoading || !naturalText.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      構造化中...
                    </>
                  ) : (
                    "構造化する"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="structured" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>構造化データ</CardTitle>
                <CardDescription>YAMLフォーマットで編集できます</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="構造化されたデータがここに表示されます"
                  className="min-h-[300px] font-mono text-sm"
                  value={structuredData}
                  onChange={handleStructuredDataChange}
                  disabled={isLoading}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerateSlides} disabled={isLoading || !structuredData.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    "スライド生成"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Suspense
              fallback={
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  プレビューを読み込み中...
                </div>
              }
            >
              <SlidePreview slides={generatedSlides} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>デザインパターン</CardTitle>
            <CardDescription>使用したいデザインパターンを選択</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-patterns">パターン検索</Label>
                <Input id="search-patterns" placeholder="検索..." disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label>タグ</Label>
                <div className="flex flex-wrap gap-2">
                  {["ビジネス", "データ分析", "比較", "タイムライン", "プロセス", "戦略"].map((tag) => (
                    <SlidePatternTag
                      key={tag}
                      tag={tag}
                      selected={selectedTags.includes(tag)}
                      onSelect={handleTagSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Suspense fallback={<div className="h-32 bg-gray-100 rounded"></div>}>
          <DesignPatternLibrary />
        </Suspense>
      </div>
    </div>
  )
}

// ヘルパー関数
function generateSimpleYaml(text: string): string {
  return `---
title: プレゼンテーション
slides:
  - type: title
    content:
      title: "${text.slice(0, 50)}..."
      subtitle: "自動生成されたプレゼンテーション"
  
  - type: content
    content:
      title: "概要"
      points:
        - "ポイント1: ${text.slice(0, 30)}..."
        - "ポイント2: 詳細な分析"
        - "ポイント3: 今後の展望"
  
  - type: chart
    content:
      title: "データ分析"
      chart_type: "bar"
      data:
        labels: ["Q1", "Q2", "Q3", "Q4"]
        datasets:
          - label: "売上"
            data: [100, 120, 150, 180]
`
}

function generateDummySlides(): any[] {
  return [
    {
      id: 1,
      type: "title",
      content: {
        title: "プレゼンテーションタイトル",
        subtitle: "自動生成されたスライド",
      },
    },
    {
      id: 2,
      type: "content",
      content: {
        title: "概要",
        points: ["主要なポイント1", "主要なポイント2", "主要なポイント3"],
      },
    },
    {
      id: 3,
      type: "chart",
      content: {
        title: "データ分析",
        chartType: "bar",
        data: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [{ label: "売上", data: [100, 120, 150, 180] }],
        },
      },
    },
  ]
}
