import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { Monitoring } from "@/lib/monitoring"

const prisma = new PrismaClient()
const monitoring = Monitoring.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    monitoring.trackMetric("job_status_check", {
      jobId: job.id,
      status: job.status,
    })

    return NextResponse.json({
      id: job.id,
      type: job.type,
      status: job.status,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })
  } catch (error) {
    console.error("Error fetching job status:", error)
    monitoring.trackError("job_status_check_error", error)
    return NextResponse.json({ error: "Failed to fetch job status" }, { status: 500 })
  }
} 