import { SlideGenerator } from "@/components/slide-generator"
import { Suspense } from "react"

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="container mx-auto py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">PPTスライド生成システム</h1>
          <p className="text-lg text-muted-foreground">自然言語からプロフェッショナルなスライドを生成</p>
        </header>
        <SlideGenerator />
      </div>
    </Suspense>
  )
}
