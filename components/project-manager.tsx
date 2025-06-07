"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, FolderOpen, MoreVertical, Edit, Trash2, Share, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface Project {
  id: string
  title: string
  description: string
  yamlData: string
  tags: string[]
  createdAt: string
  updatedAt: string
  _count: {
    slides: number
  }
}

export function ProjectManager() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tags: "",
  })

  useEffect(() => {
    if (session?.user) {
      fetchProjects()
    }
  }, [session])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          yamlData: "",
          tags: newProject.tags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (response.ok) {
        const project = await response.json()
        setProjects((prev) => [project, ...prev])
        setIsCreateDialogOpen(false)
        setNewProject({ title: "", description: "", tags: "" })
      }
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("このプロジェクトを削除しますか？")) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId))
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">ログインしてプロジェクトを管理してください</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">プロジェクト管理</h2>
          <p className="text-muted-foreground">あなたのプレゼンテーションプロジェクト</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規プロジェクト
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規プロジェクト作成</DialogTitle>
              <DialogDescription>新しいプレゼンテーションプロジェクトを作成します</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">プロジェクト名</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="第1四半期売上分析"
                />
              </div>
              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="プロジェクトの概要を入力してください"
                />
              </div>
              <div>
                <Label htmlFor="tags">タグ（カンマ区切り）</Label>
                <Input
                  id="tags"
                  value={newProject.tags}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="ビジネス, データ分析, 戦略"
                />
              </div>
              <Button onClick={handleCreateProject} className="w-full">
                作成
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="mr-2 h-4 w-4" />
                        共有
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <FolderOpen className="h-4 w-4" />
                    {project._count.slides} スライド
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  開く
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">プロジェクトがありません</h3>
            <p className="text-muted-foreground text-center mb-4">
              新規プロジェクトを作成して、プレゼンテーション作成を始めましょう
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              最初のプロジェクトを作成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
