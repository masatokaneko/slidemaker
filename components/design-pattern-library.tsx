"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const SAMPLE_PATTERNS = [
  {
    id: 1,
    name: "2x2マトリックス",
    tags: ["ビジネス", "戦略", "比較"],
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "タイムライン",
    tags: ["プロセス", "タイムライン"],
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "データチャート",
    tags: ["データ分析", "比較"],
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "プロセスフロー",
    tags: ["プロセス", "戦略"],
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

export function DesignPatternLibrary() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredPatterns =
    activeTab === "all" ? SAMPLE_PATTERNS : SAMPLE_PATTERNS.filter((pattern) => pattern.tags.includes(activeTab))

  return (
    <Card>
      <CardHeader>
        <CardTitle>デザインパターンライブラリ</CardTitle>
        <CardDescription>学習済みのデザインパターン</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">全て</TabsTrigger>
            <TabsTrigger value="ビジネス">ビジネス</TabsTrigger>
            <TabsTrigger value="データ分析">データ分析</TabsTrigger>
            <TabsTrigger value="プロセス">プロセス</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredPatterns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">該当するパターンが見つかりませんでした</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="rounded-md overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="aspect-[3/2] relative bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-1 flex items-center justify-center">
                          📊
                        </div>
                        <p className="text-xs text-gray-600">{pattern.name}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{pattern.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pattern.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {pattern.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{pattern.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
