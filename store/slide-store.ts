import { create } from 'zustand'
import type { DesignPattern } from '@/types/design-patterns'

interface Slide {
  id: string
  content: any
  designPattern?: DesignPattern
}

interface SlideState {
  slides: Slide[]
  isLoading: boolean
  error: string | null
  selectedDesignPattern: DesignPattern | null
  currentSlideIndex: number
}

interface SlideActions {
  setSlides: (slides: Slide[]) => void
  addSlide: (slide: Slide) => void
  updateSlide: (id: string, content: any) => void
  removeSlide: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSelectedDesignPattern: (pattern: DesignPattern | null) => void
  setCurrentSlideIndex: (index: number) => void
  clearError: () => void
}

export const useSlideStore = create<SlideState & SlideActions>((set) => ({
  // 状態
  slides: [],
  isLoading: false,
  error: null,
  selectedDesignPattern: null,
  currentSlideIndex: 0,

  // アクション
  setSlides: (slides) => set({ slides }),
  addSlide: (slide) => set((state) => ({ slides: [...state.slides, slide] })),
  updateSlide: (id, content) =>
    set((state) => ({
      slides: state.slides.map((slide) =>
        slide.id === id ? { ...slide, content } : slide
      ),
    })),
  removeSlide: (id) =>
    set((state) => ({
      slides: state.slides.filter((slide) => slide.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedDesignPattern: (pattern) => set({ selectedDesignPattern: pattern }),
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  clearError: () => set({ error: null }),
})) 