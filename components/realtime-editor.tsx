"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
import { useChat } from 'ai/react'
import { useDispatch } from 'react-redux'
import { NLPEditResponse } from '@/types/nlp-edit'

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

interface RealtimeEditorProps {
  slideId: string
  initialYaml: string
}

export function RealtimeEditor({ slideId, initialYaml }: RealtimeEditorProps) {
  const dispatch = useDispatch()
  const [yaml, setYaml] = useState(initialYaml)
  const [isEditing, setIsEditing] = useState(false)

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/nlp-edit',
    body: {
      slideId,
    },
    onResponse: async (response) => {
      const data = await response.json() as NLPEditResponse
      if (data.success && data.data) {
        setYaml(data.data.updatedSlideYaml)
        dispatch({
          type: 'APPLY_YAML',
          payload: {
            slideId,
            yaml: data.data.updatedSlideYaml,
          },
        })
      }
    },
  })

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
    <div className="flex h-full">
      {/* プレビュー */}
      <div className="flex-1 p-4">
        <iframe
          src={`/api/preview/${slideId}`}
          className="w-full h-full border-0"
          title="Slide Preview"
        />
      </div>

      {/* チャットパネル */}
      <div className="w-80 border-l border-gray-200 p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="スライドの編集指示を入力..."
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
