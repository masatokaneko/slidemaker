import { type NextRequest, NextResponse } from "next/server"
import { generatePowerPointFile } from "@/lib/powerpoint-generator"
import { enhanceWithAI } from "@/lib/ai-enhancer"

export async function POST(request: NextRequest) {
  try {
    const { structuredData, selectedTags, aiEnhancement } = await request.json()

    let processedData = structuredData

    // AI強化処理
    if (aiEnhancement) {
      processedData = await enhanceWithAI(structuredData, selectedTags)
    }

    // PowerPointファイル生成
    const pptxBuffer = await generatePowerPointFile(processedData, selectedTags)

    // ファイルとして返す
    return new NextResponse(pptxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="presentation.pptx"',
        "Content-Length": pptxBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error generating PowerPoint:", error)
    return NextResponse.json({ error: "Failed to generate PowerPoint" }, { status: 500 })
  }
}
