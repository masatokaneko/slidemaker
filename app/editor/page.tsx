import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { RealtimeEditor } from "@/components/realtime-editor"

export default async function EditorPage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return <RealtimeEditor />
}
