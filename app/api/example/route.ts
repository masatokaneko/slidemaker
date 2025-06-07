import { type NextRequest, NextResponse } from "next/server"
import { CustomError, ErrorCode } from "@/lib/error-handler"

/**
 * エラーハンドリングを強化したAPIルートの例
 */
export async function GET(request: NextRequest) {
  try {
    // リクエストパラメータの検証
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      throw new CustomError(ErrorCode.VALIDATION_ERROR, "IDパラメータが必要です", { requiredParam: "id" })
    }

    // データ取得処理（例）
    const data = await fetchData(id)

    // 成功レスポンス
    return NextResponse.json({ success: true, data })
  } catch (error) {
    // エラーハンドリング
    console.error("API Error:", error)

    if (error instanceof CustomError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: process.env.NODE_ENV === "development" ? error.details : undefined,
        },
        { status: getStatusCodeFromErrorCode(error.code) },
      )
    }

    // 未知のエラー
    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました",
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      },
      { status: 500 },
    )
  }
}

/**
 * データ取得の例（実際の実装に置き換える）
 */
async function fetchData(id: string) {
  // 実際のデータ取得ロジック
  return { id, name: "サンプルデータ" }
}

/**
 * エラーコードからHTTPステータスコードを取得
 */
function getStatusCodeFromErrorCode(errorCode: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.INVALID_INPUT]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.SESSION_EXPIRED]: 401,
    [ErrorCode.RECORD_NOT_FOUND]: 404,
    [ErrorCode.DUPLICATE_RECORD]: 409,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCode.API_ERROR]: 500,
    [ErrorCode.NETWORK_ERROR]: 500,
    [ErrorCode.TIMEOUT_ERROR]: 504,
    [ErrorCode.AI_SERVICE_ERROR]: 502,
    [ErrorCode.OPENAI_API_ERROR]: 502,
    [ErrorCode.AI_QUOTA_EXCEEDED]: 429,
    [ErrorCode.FILE_UPLOAD_ERROR]: 500,
    [ErrorCode.FILE_TOO_LARGE]: 413,
    [ErrorCode.INVALID_FILE_TYPE]: 415,
    [ErrorCode.PDF_PROCESSING_ERROR]: 500,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.POWERPOINT_GENERATION_ERROR]: 500,
    [ErrorCode.TEMPLATE_ERROR]: 500,
    [ErrorCode.CHART_GENERATION_ERROR]: 500,
    [ErrorCode.UNKNOWN_ERROR]: 500,
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  }

  return statusMap[errorCode] || 500
}
