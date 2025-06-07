import { type NextRequest, NextResponse } from "next/server"
import { analyzePdfDesignPatterns } from "@/lib/pdf-analyzer"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const analysisResult = await analyzePdfDesignPatterns(Buffer.from(buffer), file.name)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error analyzing PDF:", error)
    return NextResponse.json({ error: "Failed to analyze PDF" }, { status: 500 })
  }
}
