import { type NextRequest, NextResponse } from "next/server"
import { analyzePdfToDesignPatternDTO } from "@/lib/pdf-analyzer"
import { saveDesignPattern, getDesignPatternByPdfHash } from "@/lib/pattern-storage"

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
    const patterns = await analyzePdfToDesignPatternDTO(Buffer.from(buffer), file.name)

    // 各パターンをDBに保存
    for (const pattern of patterns) {
      // 重複チェック
      const existing = await getDesignPatternByPdfHash(pattern.pdfHash)
      if (!existing) {
        await saveDesignPattern(pattern)
      }
    }

    return NextResponse.json({
      patterns,
      metadata: {
        filename: file.name,
        pageCount: patterns.length,
        extractedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error analyzing PDF:", error)
    return NextResponse.json({ error: "Failed to analyze PDF" }, { status: 500 })
  }
}
