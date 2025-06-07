import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Monitoring } from "@/lib/monitoring"

const monitoring = Monitoring.getInstance()

interface JobStatus {
  id: string
  type: string
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED"
  result?: any
  error?: string
}

export function PdfUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (jobId) {
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/jobs/${jobId}`)
          const data = await response.json()

          if (response.ok) {
            setJobStatus(data)
            if (data.status === "SUCCESS" || data.status === "FAILED") {
              monitoring.trackMetric("pdf_analysis_complete", {
                jobId: data.id,
                status: data.status,
              })
            }
          } else {
            setError(data.error)
          }
        } catch (error) {
          console.error("Error checking job status:", error)
          setError("Failed to check job status")
        }
      }

      const interval = setInterval(checkStatus, 1000)
      return () => clearInterval(interval)
    }
  }, [jobId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setJobId(null)
      setJobStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setJobId(data.jobId)
        monitoring.trackMetric("pdf_upload_success", {
          filename: file.name,
          jobId: data.jobId,
        })
      } else {
        setError(data.error)
        monitoring.trackError("pdf_upload_error", new Error(data.error))
      }
    } catch (error) {
      console.error("Error uploading PDF:", error)
      setError("Failed to upload PDF")
      monitoring.trackError("pdf_upload_error", error)
    }
  }

  const getProgressValue = () => {
    if (!jobStatus) return 0
    switch (jobStatus.status) {
      case "PENDING":
        return 25
      case "PROCESSING":
        return 50
      case "SUCCESS":
        return 100
      case "FAILED":
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          PDFを選択
        </label>
        {file && (
          <Button onClick={handleUpload} disabled={!!jobId}>
            アップロード
          </Button>
        )}
      </div>

      {file && <p className="text-sm text-gray-500">{file.name}</p>}

      {jobStatus && (
        <div className="space-y-2">
          <Progress value={getProgressValue()} />
          <p className="text-sm">
            {jobStatus.status === "PENDING" && "処理を待機中..."}
            {jobStatus.status === "PROCESSING" && "PDFを解析中..."}
            {jobStatus.status === "SUCCESS" && "解析が完了しました"}
            {jobStatus.status === "FAILED" && "解析に失敗しました"}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 