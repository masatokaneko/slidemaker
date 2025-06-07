import { CustomError, ErrorCode } from "@/lib/error-handler"

/**
 * エラーメッセージをユーザーフレンドリーなものに変換
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof CustomError) {
    return error.message
  }

  if (error instanceof Error) {
    // 一般的なエラーメッセージのパターンを検出
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "ネットワーク接続に問題があります。インターネット接続を確認してください。"
    }

    if (error.message.includes("timeout")) {
      return "リクエストがタイムアウトしました。しばらく時間をおいて再度お試しください。"
    }

    if (error.message.includes("permission") || error.message.includes("access")) {
      return "アクセス権限がありません。ログインしているか確認してください。"
    }

    return error.message
  }

  return "予期しないエラーが発生しました。"
}

/**
 * エラーの種類を判定
 */
export function categorizeError(error: unknown): {
  code: ErrorCode
  isRecoverable: boolean
  severity: "low" | "medium" | "high" | "critical"
} {
  if (error instanceof CustomError) {
    return {
      code: error.code,
      isRecoverable: isRecoverableError(error),
      severity: getErrorSeverity(error),
    }
  }

  return {
    code: ErrorCode.UNKNOWN_ERROR,
    isRecoverable: false,
    severity: "medium",
  }
}

/**
 * エラーが回復可能かどうかを判定
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof CustomError) {
    const recoverableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.SESSION_EXPIRED,
    ]

    return recoverableCodes.includes(error.code)
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("retry")
    )
  }

  return false
}

/**
 * エラーの重要度を判定
 */
export function getErrorSeverity(error: unknown): "low" | "medium" | "high" | "critical" {
  if (error instanceof CustomError) {
    const criticalCodes = [ErrorCode.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR]

    const highCodes = [
      ErrorCode.AI_SERVICE_ERROR,
      ErrorCode.POWERPOINT_GENERATION_ERROR,
      ErrorCode.UNAUTHORIZED,
      ErrorCode.FORBIDDEN,
    ]

    const mediumCodes = [ErrorCode.VALIDATION_ERROR, ErrorCode.FILE_UPLOAD_ERROR, ErrorCode.NETWORK_ERROR]

    if (criticalCodes.includes(error.code)) return "critical"
    if (highCodes.includes(error.code)) return "high"
    if (mediumCodes.includes(error.code)) return "medium"
  }

  return "low"
}

/**
 * エラーオブジェクトを標準化
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === "string") {
    return new Error(error)
  }

  return new Error(JSON.stringify(error))
}
