"use client"

import { useState } from "react"
import { useSlideStore } from "@/store/slide-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Monitoring } from "@/lib/monitoring"

const monitoring = Monitoring.getInstance()

export function AiEnhancementPanel() {
  const { slides, currentSlideIndex, updateSlide } = useSlideStore()
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementPrompt, setEnhancementPrompt] = useState("")

  const currentSlide = slides[currentSlideIndex]

  const handleEnhance = async () => {
    if (!enhancementPrompt.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideId: currentSlide.id,
          prompt: enhancementPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("スライドの強化に失敗しました")
      }

      const result = await response.json()
      updateSlide(currentSlide.id, result.enhancedContent)

      monitoring.trackMetric('slide_enhancement_success', {
        slideId: currentSlide.id,
        promptLength: enhancementPrompt.length,
      })
    } catch (error) {
      monitoring.trackError('slide_enhancement_error', error)
      console.error("Error enhancing slide:", error)
    } finally {
      setIsEnhancing(false)
      setEnhancementPrompt("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI強化</CardTitle>
        <CardDescription>
          現在のスライドをAIを使って強化します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="例: 「このスライドをより簡潔に」「グラフを追加して」「デザインをモダンに」"
          value={enhancementPrompt}
          onChange={(e) => setEnhancementPrompt(e.target.value)}
          disabled={isEnhancing}
          className="min-h-[100px]"
        />

        {isEnhancing && (
          <div className="space-y-2">
            <Progress value={100} className="h-2" />
            <p className="text-sm text-muted-foreground">AIがスライドを強化しています...</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleEnhance}
            disabled={isEnhancing || !enhancementPrompt.trim()}
          >
            {isEnhancing ? "強化中..." : "スライドを強化"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
