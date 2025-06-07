"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { ErrorHandler, CustomError } from "@/lib/error-handler"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    }
    this.errorHandler = ErrorHandler.getInstance()
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーをログに記録
    this.errorHandler.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
    })

    // 親コンポーネントにエラーを通知
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error
      const isCustomError = error instanceof CustomError
      const errorMessage = isCustomError
        ? this.errorHandler.getUserFriendlyMessage(error)
        : "アプリケーションでエラーが発生しました"

      const severity = this.errorHandler.getErrorSeverity(error!)
      const isRecoverable = this.errorHandler.isRecoverable(error!)

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">エラーが発生しました</CardTitle>
              <CardDescription>申し訳ございません。予期しないエラーが発生しました。</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>

              {/* エラー詳細（開発環境のみ） */}
              {process.env.NODE_ENV === "development" && error && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    技術的な詳細を表示
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                    <div>
                      <strong>エラー:</strong> {error.message}
                    </div>
                    {isCustomError && (
                      <>
                        <div>
                          <strong>コード:</strong> {error.code}
                        </div>
                        <div>
                          <strong>詳細:</strong> {JSON.stringify(error.details, null, 2)}
                        </div>
                      </>
                    )}
                    <div>
                      <strong>ID:</strong> {this.state.errorId}
                    </div>
                  </div>
                </details>
              )}

              {/* 復旧アクション */}
              <div className="space-y-2">
                {isRecoverable && this.state.retryCount < 3 && (
                  <Button onClick={this.handleRetry} className="w-full" variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    再試行 ({3 - this.state.retryCount}回まで)
                  </Button>
                )}

                <Button onClick={this.handleReload} className="w-full" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  ページを再読み込み
                </Button>

                <Button onClick={this.handleGoHome} className="w-full" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  ホームに戻る
                </Button>
              </div>

              {/* サポート情報 */}
              <div className="text-center text-sm text-gray-600">
                <p>問題が続く場合は、以下の情報と共にサポートにお問い合わせください：</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">エラーID: {this.state.errorId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// 関数型コンポーネント用のエラーバウンダリーフック
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// 軽量なエラー表示コンポーネント
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
}: {
  error: Error | CustomError
  onRetry?: () => void
  onDismiss?: () => void
}) {
  const errorHandler = ErrorHandler.getInstance()
  const message = errorHandler.getUserFriendlyMessage(error)
  const isRecoverable = errorHandler.isRecoverable(error)

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex gap-2 ml-4">
          {isRecoverable && onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              再試行
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              ×
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
