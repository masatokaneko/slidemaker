import { Queue, Worker } from 'bullmq'
import { Monitoring } from './monitoring'

const monitoring = Monitoring.getInstance()

// ジョブキューの設定
export const pdfAnalysisQueue = new Queue('pdf-analysis', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})

// ワーカーの設定
export const pdfAnalysisWorker = new Worker(
  'pdf-analysis',
  async (job) => {
    try {
      monitoring.trackMetric('pdf_analysis_started', {
        jobId: job.id,
      })

      // PDF解析処理
      const result = await processPdfAnalysis(job.data)

      monitoring.trackMetric('pdf_analysis_completed', {
        jobId: job.id,
      })

      return result
    } catch (error) {
      monitoring.trackError('pdf_analysis_error', error)
      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    },
  }
)

// ジョブの進捗を取得
export const getJobProgress = async (jobId: string) => {
  const job = await pdfAnalysisQueue.getJob(jobId)
  if (!job) return null

  return {
    id: job.id,
    status: await job.getState(),
    progress: job.progress,
    result: job.returnvalue,
    error: job.failedReason,
  }
} 