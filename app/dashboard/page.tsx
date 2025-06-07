import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { ProjectManager } from "@/components/project-manager"
import { TemplateLibrary } from "@/components/template-library"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">ようこそ、{session.user?.name}さん</p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">プロジェクト</TabsTrigger>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectManager />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateLibrary />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <p className="text-muted-foreground">使用統計と分析機能は準備中です</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
