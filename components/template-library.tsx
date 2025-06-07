"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Star, Download, Eye, Plus, Filter } from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: string
  industry: string
  thumbnail: string
  featured: boolean
  user: {
    name: string
    email: string
  }
  _count: {
    usage: number
  }
  createdAt: string
}

const CATEGORIES = [
  { value: "business", label: "ビジネス" },
  { value: "consulting", label: "コンサルティング" },
  { value: "sales", label: "営業" },
  { value: "academic", label: "学術" },
  { value: "marketing", label: "マーケティング" },
  { value: "financial", label: "財務" },
]

const INDUSTRIES = [
  { value: "technology", label: "テクノロジー" },
  { value: "finance", label: "金融" },
  { value: "healthcare", label: "ヘルスケア" },
  { value: "retail", label: "小売" },
  { value: "manufacturing", label: "製造業" },
  { value: "consulting", label: "コンサルティング" },
]

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, selectedCategory, selectedIndustry])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    if (selectedIndustry !== "all") {
      filtered = filtered.filter((template) => template.industry === selectedIndustry)
    }

    setFilteredTemplates(filtered)
  }

  const handleUseTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: "POST",
      })

      if (response.ok) {
        const templateData = await response.json()
        // テンプレートデータを親コンポーネントに渡す
        console.log("Using template:", templateData)
      }
    } catch (error) {
      console.error("Error using template:", error)
    }
  }

  const featuredTemplates = filteredTemplates.filter((t) => t.featured)
  const popularTemplates = filteredTemplates.filter((t) => !t.featured).sort((a, b) => b._count.usage - a._count.usage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">テンプレートライブラリ</h2>
          <p className="text-muted-foreground">プロフェッショナルなテンプレートを選択してください</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              テンプレート作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>カスタムテンプレート作成</DialogTitle>
              <DialogDescription>独自のテンプレートを作成して共有できます</DialogDescription>
            </DialogHeader>
            <TemplateCreator onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="テンプレートを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのカテゴリー</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="業界" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての業界</SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              詳細フィルター
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="featured" className="w-full">
        <TabsList>
          <TabsTrigger value="featured">おすすめ</TabsTrigger>
          <TabsTrigger value="popular">人気</TabsTrigger>
          <TabsTrigger value="recent">最新</TabsTrigger>
          <TabsTrigger value="my-templates">マイテンプレート</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <TemplateGrid templates={featuredTemplates} onUseTemplate={handleUseTemplate} />
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <TemplateGrid templates={popularTemplates} onUseTemplate={handleUseTemplate} />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <TemplateGrid
            templates={filteredTemplates.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )}
            onUseTemplate={handleUseTemplate}
          />
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">まだカスタムテンプレートがありません</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              最初のテンプレートを作成
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TemplateGridProps {
  templates: Template[]
  onUseTemplate: (templateId: string) => void
}

function TemplateGrid({ templates, onUseTemplate }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">該当するテンプレートが見つかりませんでした</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <div className="aspect-[16/9] relative overflow-hidden rounded-t-lg">
            {template.featured && (
              <Badge className="absolute top-2 left-2 z-10">
                <Star className="mr-1 h-3 w-3" />
                おすすめ
              </Badge>
            )}
            <img
              src={template.thumbnail || `/placeholder.svg?height=200&width=300&query=${template.title} template`}
              alt={template.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {CATEGORIES.find((c) => c.value === template.category)?.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {INDUSTRIES.find((i) => i.value === template.industry)?.label}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{template._count.usage} 回使用</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => onUseTemplate(template.id)}>
                <Download className="mr-1 h-3 w-3" />
                使用
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">作成者: {template.user.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TemplateCreator({ onClose }: { onClose: () => void }) {
  const [templateData, setTemplateData] = useState({
    title: "",
    description: "",
    category: "",
    industry: "",
    isPublic: false,
  })

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateData,
          yamlData: "# テンプレートのYAMLデータ",
          thumbnail: "",
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="template-title">テンプレート名</Label>
        <Input
          id="template-title"
          value={templateData.title}
          onChange={(e) => setTemplateData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="BCG戦略分析テンプレート"
        />
      </div>

      <div>
        <Label htmlFor="template-description">説明</Label>
        <Input
          id="template-description"
          value={templateData.description}
          onChange={(e) => setTemplateData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="戦略分析に最適なテンプレート"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="template-category">カテゴリー</Label>
          <Select
            value={templateData.category}
            onValueChange={(value) => setTemplateData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="template-industry">業界</Label>
          <Select
            value={templateData.industry}
            onValueChange={(value) => setTemplateData((prev) => ({ ...prev, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleCreate} className="w-full">
        テンプレートを作成
      </Button>
    </div>
  )
}
