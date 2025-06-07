"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Palette, Layout, Eye, Download, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DesignPattern } from "@/types/design-patterns"

export function PdfPatternExtractor() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedPatterns, setExtractedPatterns] = useState<DesignPattern[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // プログレスシミュレーション
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("分析に失敗しました")
      }

      const result = await response.json()
      setAnalysisResult(result)
      setExtractedPatterns(result.patterns)
    } catch (error) {
      console.error("Error analyzing PDF:", error)
      alert("PDFの分析中にエラーが発生しました")
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleSavePattern = (pattern: DesignPattern) => {
    // パターンをライブラリに保存
    console.log("Saving pattern:", pattern)
    alert(`パターン "${pattern.name}" をライブラリに保存しました`)
  }

  const handleDeletePattern = (patternId: string) => {
    setExtractedPatterns((prev) => prev.filter((p) => p.id !== patternId))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            PDFデザインパターン抽出
          </CardTitle>
          <CardDescription>
            既存のプレゼンテーションPDFをアップロードして、デザインパターンを自動抽出します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="flex-1" disabled={isAnalyzing} />
            <Button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing}>
              {isAnalyzing ? "分析中..." : "分析開始"}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">PDFを分析しています... ({progress}%)</p>
            </div>
          )}

          {analysisResult && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                {analysisResult.metadata.filename} から {extractedPatterns.length} 個のデザインパターンを抽出しました （
                {analysisResult.metadata.pageCount} ページ）
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {extractedPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>抽出されたデザインパターン</CardTitle>
            <CardDescription>分析結果から抽出されたデザインパターンを確認し、ライブラリに保存できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {extractedPatterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onSave={handleSavePattern}
                  onDelete={handleDeletePattern}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface PatternCardProps {
  pattern: DesignPattern
  onSave: (pattern: DesignPattern) => void
  onDelete: (patternId: string) => void
}

function PatternCard({ pattern, onSave, onDelete }: PatternCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{pattern.name}</h3>
            <p className="text-sm text-muted-foreground">信頼度: {Math.round(pattern.confidence * 100)}%</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave(pattern)}>
              <Download className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(pattern.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {pattern.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              レイアウト
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              カラー
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              プレビュー
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="mt-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>タイプ:</span>
                <span className="font-medium">{pattern.layout.type}</span>
              </div>
              <div className="flex justify-between">
                <span>グリッド:</span>
                <span className="font-medium">
                  {pattern.layout.gridStructure.columns}×{pattern.layout.gridStructure.rows}
                </span>
              </div>
              <div className="flex justify-between">
                <span>配置:</span>
                <span className="font-medium">{pattern.layout.gridStructure.alignment}</span>
              </div>
              <div>
                <span>領域: </span>
                <span className="font-medium">{pattern.layout.regions.length}個</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-3">
            <div className="space-y-3">
              <div className="flex gap-2">
                {pattern.colors.palette.map((colorInfo, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="w-8 h-8 rounded border border-gray-200 mb-1"
                      style={{ backgroundColor: colorInfo.color }}
                    />
                    <div className="text-xs text-muted-foreground">{colorInfo.percentage}%</div>
                  </div>
                ))}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>プライマリ:</span>
                  <span className="font-mono">{pattern.colors.primary}</span>
                </div>
                <div className="flex justify-between">
                  <span>アクセント:</span>
                  <span className="font-mono">{pattern.colors.accent}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-3">
            <div className="aspect-[16/9] bg-gray-100 rounded-md flex items-center justify-center">
              <img
                src={`/placeholder.svg?height=200&width=300&query=slide design pattern ${pattern.type}`}
                alt={`${pattern.name} preview`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
