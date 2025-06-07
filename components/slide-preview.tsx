"use client"

import { useSlideStore } from "@/store/slide-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function SlidePreview() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = useSlideStore()

  if (slides.length === 0) {
    return null
  }

  const currentSlide = slides[currentSlideIndex]

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative aspect-[16/9] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* スライドのプレビュー表示 */}
          <div className="absolute inset-0 p-8">
            <h2 className="text-2xl font-bold mb-4">{currentSlide.content.title}</h2>
            {currentSlide.content.subtitle && (
              <p className="text-lg text-gray-600 mb-6">{currentSlide.content.subtitle}</p>
            )}
            {currentSlide.content.points && (
              <ul className="list-disc list-inside space-y-2">
                {currentSlide.content.points.map((point: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ナビゲーションボタン */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-gray-500">
              {currentSlideIndex + 1} / {slides.length}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
