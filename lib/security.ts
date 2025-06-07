import { NextRequest, NextResponse } from 'next/server'
import { CustomError, ErrorCode } from './error-handler'

export class SecurityMiddleware {
  static async handle(request: NextRequest): Promise<NextResponse> {
    try {
      // CORSヘッダーの設定
      const response = NextResponse.next()
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      response.headers.set('Content-Security-Policy', "default-src 'self'")

      // レート制限の実装
      const ip = request.ip || 'unknown'
      const key = `rate-limit:${ip}`
      const limit = 60 // 1分あたりのリクエスト数
      const window = 60 // 時間枠（秒）

      const cache = (await import('./cache')).Cache.getInstance()
      const current = await cache.get<number>(key) || 0

      if (current >= limit) {
        throw new CustomError(ErrorCode.RATE_LIMIT_EXCEEDED, 'レート制限を超えました')
      }

      await cache.set(key, current + 1, window)

      // ファイルアップロードの検証
      if (request.method === 'POST' && request.headers.get('content-type')?.includes('multipart/form-data')) {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (file) {
          // ファイルサイズの制限（10MB）
          if (file.size > 10 * 1024 * 1024) {
            throw new CustomError(ErrorCode.FILE_TOO_LARGE, 'ファイルサイズが大きすぎます')
          }

          // 許可されたMIMEタイプ
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
          if (!allowedTypes.includes(file.type)) {
            throw new CustomError(ErrorCode.INVALID_FILE_TYPE, '許可されていないファイルタイプです')
          }
        }
      }

      return response
    } catch (error) {
      if (error instanceof CustomError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: '内部サーバーエラーが発生しました',
          },
        },
        { status: 500 }
      )
    }
  }
} 