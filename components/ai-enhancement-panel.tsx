"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Lightbulb, TrendingUp, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AIEnhancementPanelProps {
  yamlData: string
  tags: string[]
  onEnhancedData: (data: string) => void
}

export function AIEnhancementPanel({ yamlData, tags, onEnhancedData }: AIEnhancementPanelProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [enhancementResult, setEnhancementResult] = useState<string>("")

  const handleEnhance = async () => {
    if (!yamlData.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yamlData,
          tags,
          action: "enhance",
        }),
      })

      const result = await response.json()
      if (result.enhancedData) {
        setEnhancementResult(result.enhancedData)
        onEnhancedData(result.enhancedData)
      }
    } catch (error) {
      console.error("Enhancement failed:", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGetRecommendations = async () => {
    try {
      const response = await fetch("/api/enhance-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: yamlData,
          slideType: "general",
          action: "recommend",
        }),
      })

      const result = await response.json()
      if (result.recommendations) {
        setRecommendations(result.recommendations)
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI強化機能
        </CardTitle>
        <CardDescription>GPT-4を使用してBCGレベルの品質にスライドを改善します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleEnhance} disabled={isEnhancing || !yamlData.trim()} className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            {isEnhancing ? "強化中..." : "AI強化"}
          </Button>
          <Button variant="outline" onClick={handleGetRecommendations} className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            改善提案
          </Button>
        </div>

        {enhancementResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>AIによる強化が完了しました。構造化データが更新されました。</AlertDescription>
          </Alert>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">改善提案:</h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
