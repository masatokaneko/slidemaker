"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface SlidePreviewProps {
  slides: any[]
}

export function SlidePreview({ slides }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  if (!slides || slides.length === 0) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">スライドが生成されていません</p>
          <p className="text-sm text-muted-foreground">左側でテキストを入力してスライドを生成してください</p>
        </div>
      </Card>
    )
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleDownload = () => {
    alert("PowerPointファイルのダウンロード機能は開発中です")
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="space-y-4">
      <div className="relative bg-white rounded-lg shadow-lg aspect-[16/9] overflow-hidden border">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0">
              <div className="aspect-[16/9] bg-white p-8">
                <SlideContent slide={currentSlideData} />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* スライドコンテンツ */}
        <div className="w-full h-full p-8">
          <SlideContent slide={currentSlideData} />
        </div>

        {/* ナビゲーションボタン */}
        {slides.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          スライド {currentSlide + 1} / {slides.length}
        </p>

        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          PowerPointとしてダウンロード
        </Button>
      </div>

      {/* スライドサムネイル */}
      {slides.length > 1 && (
        <div className="grid grid-cols-4 gap-2 overflow-x-auto pb-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              className={`aspect-[16/9] rounded-md overflow-hidden border-2 p-2 text-xs ${
                currentSlide === index ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">{index + 1}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// スライドコンテンツを表示するコンポーネント
function SlideContent({ slide }: { slide: any }) {
  if (!slide) {
    return <div className="flex items-center justify-center h-full text-gray-400">スライドデータがありません</div>
  }

  switch (slide.type) {
    case "title":
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">{slide.content?.title || "タイトル"}</h1>
          {slide.content?.subtitle && <p className="text-xl text-gray-600">{slide.content.subtitle}</p>}
        </div>
      )

    case "content":
      return (
        <div className="h-full p-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{slide.content?.title || "コンテンツ"}</h2>
          {slide.content?.points && (
            <ul className="space-y-3">
              {slide.content.points.map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-lg text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )

    case "chart":
      return (
        <div className="h-full p-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{slide.content?.title || "チャート"}</h2>
          <div className="flex items-center justify-center h-3/4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">📊</div>
              <p className="text-gray-600">チャートプレビュー</p>
              <p className="text-sm text-gray-400">{slide.content?.chartType || "bar"} チャート</p>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600 mb-2">スライドタイプ: {slide.type}</p>
            <p className="text-sm text-gray-400">プレビューは準備中です</p>
          </div>
        </div>
      )
  }
}
