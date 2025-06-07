"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSlideStore } from "@/store/slide-store"
import { SlidePreview } from "./slide-preview"
import { AiEnhancementPanel } from "./ai-enhancement-panel"
import { DesignLibrary } from "./design-library"
import { Monitoring } from "@/lib/monitoring"

const monitoring = Monitoring.getInstance()

export function SlideGenerator() {
  const {
    slides,
    isLoading,
    error,
    selectedDesignPattern,
    currentSlideIndex,
    setSlides,
    setLoading,
    setError,
    setSelectedDesignPattern,
    setCurrentSlideIndex,
    clearError,
  } = useSlideStore()

  useEffect(() => {
    // 初期化処理
    monitoring.trackMetric('slide_generator_mount', {})
  }, [])

  const handleGenerate = async () => {
    try {
      setLoading(true)
      clearError()

      const response = await fetch("/api/generate-powerpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: slides.map(slide => slide.content),
          designPattern: selectedDesignPattern,
        }),
      })

      if (!response.ok) {
        throw new Error("スライドの生成に失敗しました")
      }

      const result = await response.json()
      setSlides(result.slides)
      monitoring.trackMetric('slide_generation_success', {
        slideCount: result.slides.length,
        hasDesignPattern: !!selectedDesignPattern,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "予期せぬエラーが発生しました")
      monitoring.trackError('slide_generation_error', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDesignPatternSelect = (pattern: any) => {
    setSelectedDesignPattern(pattern)
    monitoring.trackMetric('design_pattern_select', {
      patternType: pattern.type,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>スライド生成</CardTitle>
          <CardDescription>
            デザインパターンを選択して、AIがスライドを生成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DesignLibrary onComponentSelect={handleDesignPatternSelect} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="space-y-2">
              <Progress value={100} className="h-2" />
              <p className="text-sm text-muted-foreground">スライドを生成しています...</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={isLoading || !selectedDesignPattern}>
              {isLoading ? "生成中..." : "スライドを生成"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {slides.length > 0 && (
        <div className="space-y-4">
          <SlidePreview
            slides={slides}
            currentIndex={currentSlideIndex}
            onIndexChange={setCurrentSlideIndex}
          />
          <AiEnhancementPanel
            slide={slides[currentSlideIndex]}
            onUpdate={(content) => {
              const updatedSlides = [...slides]
              updatedSlides[currentSlideIndex] = {
                ...updatedSlides[currentSlideIndex],
                content,
              }
              setSlides(updatedSlides)
            }}
          />
        </div>
      )}
    </div>
  )
}
