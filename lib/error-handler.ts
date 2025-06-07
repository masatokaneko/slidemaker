/**
 * 包括的なエラーハンドリングシステム
 */

export enum ErrorCode {
  // 認証エラー
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // バリデーションエラー
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // API エラー
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // AI サービスエラー
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  OPENAI_API_ERROR = "OPENAI_API_ERROR",
  AI_QUOTA_EXCEEDED = "AI_QUOTA_EXCEEDED",

  // ファイル処理エラー
  FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  PDF_PROCESSING_ERROR = "PDF_PROCESSING_ERROR",

  // データベースエラー
  DATABASE_ERROR = "DATABASE_ERROR",
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  DUPLICATE_RECORD = "DUPLICATE_RECORD",

  // PowerPoint生成エラー
  POWERPOINT_GENERATION_ERROR = "POWERPOINT_GENERATION_ERROR",
  TEMPLATE_ERROR = "TEMPLATE_ERROR",
  CHART_GENERATION_ERROR = "CHART_GENERATION_ERROR",

  // 一般的なエラー
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export interface AppError {
  code: ErrorCode
  message: string
  details?: any
  timestamp: Date
  userId?: string
  requestId?: string
  stack?: string
}

export class CustomError extends Error {
  public readonly code: ErrorCode
  public readonly details?: any
  public readonly timestamp: Date
  public readonly userId?: string
  public readonly requestId?: string

  constructor(code: ErrorCode, message: string, details?: any, userId?: string, requestId?: string) {
    super(message)
    this.name = "CustomError"
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.userId = userId
    this.requestId = requestId
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      userId: this.userId,
      requestId: this.requestId,
      stack: this.stack,
    }
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * エラーをログに記録
   */
  logError(error: Error | CustomError, context?: any): void {
    const appError: AppError =
      error instanceof CustomError
        ? error.toJSON()
        : {
            code: ErrorCode.UNKNOWN_ERROR,
            message: error.message,
            details: context,
            timestamp: new Date(),
            stack: error.stack,
          }

    this.errorLog.push(appError)

    // コンソールにログ出力
    console.error("Error logged:", {
      ...appError,
      context,
    })

    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalLogger(appError)
    }
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   */
  getUserFriendlyMessage(error: Error | CustomError): string {
    if (error instanceof CustomError) {
      return this.getMessageByCode(error.code)
    }

    // 一般的なエラーの場合
    if (error.message.includes("fetch")) {
      return "ネットワーク接続に問題があります。インターネット接続を確認してください。"
    }

    return "予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。"
  }

  /**
   * エラーコードに基づくメッセージ取得
   */
  private getMessageByCode(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.UNAUTHORIZED]: "ログインが必要です。再度ログインしてください。",
      [ErrorCode.FORBIDDEN]: "この操作を実行する権限がありません。",
      [ErrorCode.SESSION_EXPIRED]: "セッションが期限切れです。再度ログインしてください。",

      [ErrorCode.VALIDATION_ERROR]: "入力内容に問題があります。入力内容を確認してください。",
      [ErrorCode.INVALID_INPUT]: "無効な入力です。正しい形式で入力してください。",
      [ErrorCode.MISSING_REQUIRED_FIELD]: "必須項目が入力されていません。",

      [ErrorCode.API_ERROR]: "サーバーとの通信でエラーが発生しました。",
      [ErrorCode.NETWORK_ERROR]: "ネットワーク接続に問題があります。",
      [ErrorCode.TIMEOUT_ERROR]: "処理がタイムアウトしました。再度お試しください。",
      [ErrorCode.RATE_LIMIT_EXCEEDED]: "リクエストが多すぎます。しばらく時間をおいて再度お試しください。",

      [ErrorCode.AI_SERVICE_ERROR]: "AI処理でエラーが発生しました。",
      [ErrorCode.OPENAI_API_ERROR]: "OpenAI APIでエラーが発生しました。",
      [ErrorCode.AI_QUOTA_EXCEEDED]: "AI使用量の上限に達しました。",

      [ErrorCode.FILE_UPLOAD_ERROR]: "ファイルのアップロードに失敗しました。",
      [ErrorCode.FILE_TOO_LARGE]: "ファイルサイズが大きすぎます。",
      [ErrorCode.INVALID_FILE_TYPE]: "サポートされていないファイル形式です。",
      [ErrorCode.PDF_PROCESSING_ERROR]: "PDFの処理に失敗しました。",

      [ErrorCode.DATABASE_ERROR]: "データベースエラーが発生しました。",
      [ErrorCode.RECORD_NOT_FOUND]: "指定されたデータが見つかりません。",
      [ErrorCode.DUPLICATE_RECORD]: "既に存在するデータです。",

      [ErrorCode.POWERPOINT_GENERATION_ERROR]: "PowerPointの生成に失敗しました。",
      [ErrorCode.TEMPLATE_ERROR]: "テンプレートの処理でエラーが発生しました。",
      [ErrorCode.CHART_GENERATION_ERROR]: "チャートの生成に失敗しました。",

      [ErrorCode.UNKNOWN_ERROR]: "予期しないエラーが発生しました。",
      [ErrorCode.INTERNAL_SERVER_ERROR]: "サーバー内部エラーが発生しました。",
    }

    return messages[code] || messages[ErrorCode.UNKNOWN_ERROR]
  }

  /**
   * エラーの重要度を判定
   */
  getErrorSeverity(error: Error | CustomError): "low" | "medium" | "high" | "critical" {
    if (error instanceof CustomError) {
      const criticalCodes = [ErrorCode.INTERNAL_SERVER_ERROR, ErrorCode.DATABASE_ERROR]

      const highCodes = [ErrorCode.AI_SERVICE_ERROR, ErrorCode.POWERPOINT_GENERATION_ERROR]

      const mediumCodes = [ErrorCode.UNAUTHORIZED, ErrorCode.VALIDATION_ERROR, ErrorCode.FILE_UPLOAD_ERROR]

      if (criticalCodes.includes(error.code)) return "critical"
      if (highCodes.includes(error.code)) return "high"
      if (mediumCodes.includes(error.code)) return "medium"
    }

    return "low"
  }

  /**
   * 復旧可能なエラーかどうかを判定
   */
  isRecoverable(error: Error | CustomError): boolean {
    if (error instanceof CustomError) {
      const recoverableCodes = [
        ErrorCode.NETWORK_ERROR,
        ErrorCode.TIMEOUT_ERROR,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        ErrorCode.SESSION_EXPIRED,
      ]

      return recoverableCodes.includes(error.code)
    }

    return false
  }

  /**
   * 外部ログサービスへの送信（本番環境用）
   */
  private async sendToExternalLogger(error: AppError): Promise<void> {
    try {
      // Sentry、LogRocket、DataDog などの外部サービスに送信
      // 実装例（Sentryの場合）
      /*
      Sentry.captureException(new Error(error.message), {
        tags: {
          errorCode: error.code,
          userId: error.userId,
        },
        extra: {
          details: error.details,
          timestamp: error.timestamp,
        },
      })
      */
    } catch (logError) {
      console.error("Failed to send error to external logger:", logError)
    }
  }

  /**
   * エラーログの取得（管理者用）
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  /**
   * エラーログのクリア
   */
  clearErrorLog(): void {
    this.errorLog = []
  }
}

/**
 * API レスポンスエラーを処理
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorCode: ErrorCode
    let errorMessage: string

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

  try {
    return await response.json()
  } catch (parseError) {
    throw new CustomError(ErrorCode.API_ERROR, "レスポンスの解析に失敗しました", { parseError: parseError.message })
  }
}

/**
 * 非同期操作のエラーハンドリング
 */
export async function withErrorHandling<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance()
    errorHandler.logError(error as Error, { context })
    throw error
  }
}

/**
 * リトライ機能付きの操作実行
 */
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      const errorHandler = ErrorHandler.getInstance()

      // 復旧可能なエラーの場合のみリトライ
      if (attempt < maxRetries && errorHandler.isRecoverable(lastError)) {
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // 指数バックオフ
        continue
      }

      throw error
    }
  }

  throw lastError!
}
