import { type NextRequest, NextResponse } from "next/server"
import { enhanceWithAI, generateSlideRecommendations } from "@/lib/ai-enhancer"

export async function POST(request: NextRequest) {
  try {
    const { yamlData, tags, action } = await request.json()

    if (action === "enhance") {
      const enhancedData = await enhanceWithAI(yamlData, tags)
      return NextResponse.json({ enhancedData })
    } else if (action === "recommend") {
      const { content, slideType } = await request.json()
      const recommendations = await generateSlideRecommendations(content, slideType)
      return NextResponse.json({ recommendations })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("AI enhancement error:", error)
    return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 })
  }
}
