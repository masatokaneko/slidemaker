"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Type,
  ImageIcon,
  BarChart3,
  Undo,
  Redo,
  Save,
  Eye,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
} from "lucide-react"

interface SlideElement {
  id: string
  type: "text" | "image" | "chart" | "shape"
  x: number
  y: number
  width: number
  height: number
  content: any
  style: any
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background: string
  layout: string
}

export function RealtimeEditor() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-1",
      title: "タイトルスライド",
      elements: [
        {
          id: "title-1",
          type: "text",
          x: 100,
          y: 150,
          width: 600,
          height: 100,
          content: { text: "プレゼンテーションタイトル" },
          style: { fontSize: 36, fontWeight: "bold", color: "#1F2937" },
        },
        {
          id: "subtitle-1",
          type: "text",
          x: 100,
          y: 280,
          width: 600,
          height: 60,
          content: { text: "サブタイトル" },
          style: { fontSize: 24, color: "#6B7280" },
        },
      ],
      background: "#FFFFFF",
      layout: "title",
    },
  ])

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [history, setHistory] = useState<Slide[][]>([slides])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    elementId: string | null
    startX: number
    startY: number
    startElementX: number
    startElementY: number
  }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0,
  })

  const currentSlide = slides[currentSlideIndex]

  // 履歴管理
  const saveToHistory = (newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newSlides)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides(history[historyIndex + 1])
    }
  }

  // 要素の更新
  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map((element) => (element.id === elementId ? { ...element, ...updates } : element)),
        }
      }
      return slide
    })
    setSlides(newSlides)
    saveToHistory(newSlides)
  }

  // 新しい要素の追加
  const addElement = (type: SlideElement["type"]) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === "text" ? 300 : 200,
      height: type === "text" ? 50 : 150,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    }

    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newElement],
        }
      }
      return slide
    })

    setSlides(newSlides)
    saveToHistory(newSlides)
    setSelectedElement(newElement.id)
  }

  const getDefaultContent = (type: SlideElement["type"]) => {
    switch (type) {
      case "text":
        return { text: "新しいテキスト" }
      case "chart":
        return {
          type: "bar",
          data: {
            labels: ["A", "B", "C"],
            datasets: [{ data: [10, 20, 30] }],
          },
        }
      case "image":
        return { src: "/placeholder.svg?height=150&width=200" }
      case "shape":
        return { shape: "rectangle", fill: "#3B82F6" }
      default:
        return {}
    }
  }

  const getDefaultStyle = (type: SlideElement["type"]) => {
    switch (type) {
      case "text":
        return { fontSize: 16, color: "#1F2937", fontWeight: "normal" }
      default:
        return {}
    }
  }

  // ドラッグ&ドロップ
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    const element = currentSlide.elements.find((el) => el.id === elementId)
    if (!element) return

    setDragState({
      isDragging: true,
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startElementX: element.x,
      startElementY: element.y,
    })
    setSelectedElement(elementId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId) return

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY

    updateElement(dragState.elementId, {
      x: dragState.startElementX + deltaX,
      y: dragState.startElementY + deltaY,
    })
  }

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      elementId: null,
      startX: 0,
      startY: 0,
      startElementX: 0,
      startElementY: 0,
    })
  }

  const selectedElementData = selectedElement ? currentSlide.elements.find((el) => el.id === selectedElement) : null

  return (
    <div className="h-screen flex">
      {/* ツールバー */}
      <div className="w-64 border-r bg-background p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex === 0}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex === history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={isPreviewMode ? "default" : "outline"}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <div>
          <Label className="text-sm font-medium">要素を追加</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => addElement("text")}>
              <Type className="h-4 w-4 mr-1" />
              テキスト
            </Button>
            <Button size="sm" variant="outline" onClick={() => addElement("image")}>
              <ImageIcon className="h-4 w-4 mr-1" />
              画像
            </Button>
            <Button size="sm" variant="outline" onClick={() => addElement("chart")}>
              <BarChart3 className="h-4 w-4 mr-1" />
              チャート
            </Button>
            <Button size="sm" variant="outline" onClick={() => addElement("shape")}>
              <Grid className="h-4 w-4 mr-1" />
              図形
            </Button>
          </div>
        </div>

        <Separator />

        {/* プロパティパネル */}
        {selectedElementData && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">プロパティ</Label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={selectedElementData.x}
                  onChange={(e) => updateElement(selectedElement!, { x: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={selectedElementData.y}
                  onChange={(e) => updateElement(selectedElement!, { y: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">幅</Label>
                <Input
                  type="number"
                  value={selectedElementData.width}
                  onChange={(e) => updateElement(selectedElement!, { width: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">高さ</Label>
                <Input
                  type="number"
                  value={selectedElementData.height}
                  onChange={(e) => updateElement(selectedElement!, { height: Number(e.target.value) })}
                  className="h-8"
                />
              </div>
            </div>

            {selectedElementData.type === "text" && (
              <div className="space-y-2">
                <Label className="text-xs">テキスト</Label>
                <Textarea
                  value={selectedElementData.content.text}
                  onChange={(e) =>
                    updateElement(selectedElement!, {
                      content: { ...selectedElementData.content, text: e.target.value },
                    })
                  }
                  className="h-20"
                />

                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Underline className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <AlignRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* メインエディター */}
      <div className="flex-1 flex flex-col">
        {/* スライド一覧 */}
        <div className="h-20 border-b bg-muted/30 p-2 flex gap-2 overflow-x-auto">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex-shrink-0 w-24 h-16 border rounded cursor-pointer ${
                index === currentSlideIndex ? "border-primary bg-primary/10" : "border-border bg-background"
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="w-full h-full flex items-center justify-center text-xs">{index + 1}</div>
            </div>
          ))}
          <Button size="sm" variant="outline" className="flex-shrink-0 w-24 h-16" onClick={() => {}}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* キャンバス */}
        <div className="flex-1 bg-muted/20 p-8 overflow-auto">
          <div className="mx-auto" style={{ width: "800px", height: "600px" }}>
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg"
              style={{ width: "800px", height: "600px" }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentSlide.elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 cursor-move ${
                    selectedElement === element.id ? "border-primary" : "border-transparent"
                  } hover:border-primary/50`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === "text" && (
                    <div
                      className="w-full h-full flex items-center justify-center p-2"
                      style={{
                        fontSize: element.style.fontSize,
                        color: element.style.color,
                        fontWeight: element.style.fontWeight,
                      }}
                    >
                      {element.content.text}
                    </div>
                  )}

                  {element.type === "image" && (
                    <img
                      src={element.content.src || "/placeholder.svg"}
                      alt="Element"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {element.type === "chart" && (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {element.type === "shape" && (
                    <div className="w-full h-full" style={{ backgroundColor: element.content.fill }} />
                  )}

                  {selectedElement === element.id && (
                    <>
                      {/* リサイズハンドル */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white cursor-se-resize" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white cursor-ne-resize" />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white cursor-nw-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white cursor-sw-resize" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
