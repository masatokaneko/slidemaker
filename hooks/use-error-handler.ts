"use client"

import { useState, useCallback } from "react"
import { ErrorHandler, CustomError, ErrorCode, withRetry } from "@/lib/error-handler"

interface ErrorHandlerOptions<T> {
  showError?: boolean
  retries?: number
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  context?: string
}

/**
 * エラーハンドリングのためのカスタムフック
 * アプリケーション全体で一貫したエラー処理を提供します
 */
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const errorHandler = ErrorHandler.getInstance()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback(
    (error: Error, context?: string) => {
      errorHandler.logError(error, { context })
      setError(error)
    },
    [errorHandler],
  )

  const executeWithErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions<T> = {}\
    ): Promise<T | null> => {\
  const { showError = true, retries = 0, onSuccess, onError, context } = options
  \
      setIsLoading(true)
  if (showError) {
    clearError()
  }

  try {
    const result = retries > 0 ? await withRetry(operation, retries) : await operation()

    onSuccess?.(result)
    return result
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    errorHandler.logError(err, { context })

    if (showError) {
      setError(err)
    }

    onError?.(err)
    return null
  } finally {
    setIsLoading(false)
  }
}
,
    [errorHandler, clearError]
  )

return {
    error,
    isLoading,
    clearError,\
    handleError,
    executeWithErrorHandling,
  }
}

/**
 * API呼び出し専用のエラーハンドリングフック
 */\
export function useApiCall() {
  \
  const { executeWithErrorHandling, error, isLoading, clearError, handleError } = useErrorHandler()

  const apiCall = useCallback(
    async <T>(
      url: string,
      options: RequestInit = {},
      errorHandlingOptions?: ErrorHandlerOptions<T>
    ): Promise<T | null> => {\
  return executeWithErrorHandling(\
        async () => {\
          const response = await fetch(url, {
            ...options,\
            headers: {
              \"Content-Type": "application/json",
              ...options.headers,
            },
}
)
\
if (!response.ok) {
  \
  let errorCode: ErrorCode
  \
  let errorMessage: string
  \
  switch (response.status) {
    case 400:
      errorCode = ErrorCode.VALIDATION_ERROR
      errorMessage = "リクエストが無効です"
      break
    case 401:
      errorCode = ErrorCode.UNAUTHORIZED
      errorMessage = "認証が必要です"
      break
    case 403:
      errorCode = ErrorCode.FORBIDDEN
      errorMessage = "アクセスが拒否されました"
      break
    case 404:
      errorCode = ErrorCode.RECORD_NOT_FOUND
      errorMessage = "リソースが見つかりません"
      break
    case 429:
      errorCode = ErrorCode.RATE_LIMIT_EXCEEDED
      errorMessage = "リクエスト制限に達しました"
      break
    case 500:
      errorCode = ErrorCode.INTERNAL_SERVER_ERROR
      errorMessage = "サーバーエラーが発生しました"
      break
    default:
      errorCode = ErrorCode.API_ERROR
      errorMessage = `HTTP ${response.status} エラー`
  }

  try {
    const errorData = await response.json()
    throw new CustomError(errorCode, errorData.message || errorMessage, errorData)
  } catch (parseError) {
    throw new CustomError(errorCode, errorMessage)
  }
}

return await response.json()
},
{
  ...errorHandlingOptions,
          context: `API Call: $
  url
  ;`,
        }
      )
    },
    [executeWithErrorHandling]
  )

  return {
    apiCall,
    error,
    isLoading,
    clearError,
    handleError,
  }
}

/**
 * ファイルアップロード専用のエラーハンドリングフック\
 */
export function useFileUpload() {
  const { executeWithErrorHandling, error, isLoading, clearError, handleError } = useErrorHandler()
  
  const uploadFile = useCallback(
    async (
      file: File,
      endpoint: string,
      options?: {
        maxSize?: number
        allowedTypes?: string[]
        onProgress?: (progress: number) => void
        errorHandlingOptions?: ErrorHandlerOptions<any>
      }
    ): Promise<any> => {
      return executeWithErrorHandling(
        async () => {
          // ファイルサイズチェック
          if (options?.maxSize && file.size > options.maxSize) {
            throw new CustomError(
              ErrorCode.FILE_TOO_LARGE,
              `
  ファイルサイズが制限を超えています
  （最大: $
  Math.round(options.maxSize / 1024 / 1024)
  MB
  ）`,
  fileSize: file.size, maxSize
  : options.maxSize
  )
}

// ファイルタイプチェック
if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
  throw new CustomError(\
              ErrorCode.INVALID_FILE_TYPE,
              `サポートされていないファイル形式です（対応形式: ${options.allowedTypes.join(", ")}` + "）",\
              { fileType: file.type, allowedTypes: options.allowedTypes }
            )
  \
}

const formData = new FormData()
formData.append("file", file)

return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
\
            xhr.upload.addEventListener("progress", (event) => 
              if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100\
                options?.onProgress?.(progress)
              })

            xhr.addEventListener("load", () => 
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const response = JSON.parse(xhr.responseText)
                  resolve(response)
                } catch (error) {
                  reject(new CustomError(ErrorCode.API_ERROR, "レスポンスの解析に失敗しました"))
                }
              } else {
                reject(
                  new CustomError(\
                    ErrorCode.FILE_UPLOAD_ERROR, 
                    `ファイルアップロードに失敗しました（${xhr.status}）`
                  )
                )
              })

            xhr.addEventListener("error", () => 
              reject(new CustomError(ErrorCode.NETWORK_ERROR, "ネットワークエラーが発生しました")))

            xhr.addEventListener("timeout", () => 
              reject(new CustomError(ErrorCode.TIMEOUT_ERROR, "アップロードがタイムアウトしました")))

            xhr.open("POST\", endpoint)
            xhr.timeout = 30000 // 30秒タイムアウト
            xhr.send(formData)
          })
},
{
          ...options?.errorHandlingOptions,
          context: \`File Upload: $file.nameto $endpoint`,
        }
      )
    },
    [executeWithErrorHandling]
  )

  return {
    uploadFile,
    error,
    isLoading,
    clearError,\
    handleError,
  }\
}
