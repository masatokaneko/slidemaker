import { type NextRequest, NextResponse } from "next/server"
import { analyzePdfToDesignPatternDTO } from "@/lib/pdf-analyzer"
import { saveDesignPattern, getDesignPatternByPdfHash } from "@/lib/pattern-storage"
import { PrismaClient } from "@prisma/client"
import { Monitoring } from "@/lib/monitoring"

const prisma = new PrismaClient()
const monitoring = Monitoring.getInstance()

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

    // ジョブを作成
    const job = await prisma.job.create({
      data: {
        type: "pdf_analysis",
        status: "PENDING",
      },
    })

    // バックグラウンドで処理を実行
    processPdfAnalysis(job.id, file).catch((error) => {
      console.error("PDF analysis error:", error)
      monitoring.trackError("pdf_analysis_error", error)
    })

    return NextResponse.json({
      jobId: job.id,
      status: "PENDING",
    })
  } catch (error) {
    console.error("Error creating PDF analysis job:", error)
    return NextResponse.json({ error: "Failed to create PDF analysis job" }, { status: 500 })
  }
}

async function processPdfAnalysis(jobId: string, file: File) {
  try {
    // ジョブのステータスを更新
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    })

    const buffer = await file.arrayBuffer()
    const patterns = await analyzePdfToDesignPatternDTO(Buffer.from(buffer), file.name)

    // 各パターンをDBに保存
    for (const pattern of patterns) {
      const existing = await getDesignPatternByPdfHash(pattern.pdfHash)
      if (!existing) {
        await saveDesignPattern(pattern)
      }
    }

    // ジョブを完了として更新
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "SUCCESS",
        result: {
          patterns,
          metadata: {
            filename: file.name,
            pageCount: patterns.length,
            extractedAt: new Date().toISOString(),
          },
        },
      },
    })

    monitoring.trackMetric("pdf_analysis_success", {
      jobId,
      patternCount: patterns.length,
    })
  } catch (error) {
    // エラーを記録
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })

    monitoring.trackError("pdf_analysis_error", error)
    throw error
  }
}
