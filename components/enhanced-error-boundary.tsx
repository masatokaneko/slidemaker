"use client"

import type React from "react"
import { Component, type ReactNode, type ErrorInfo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { ErrorHandler } from "@/lib/error-handler"
import { getUserFriendlyErrorMessage, isRecoverableError, getErrorSeverity } from "@/lib/error-utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  errorComponent?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  retryCount: number
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler
  private mounted = false

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーをログに記録
    this.errorHandler.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
    })

    // 親コンポーネントにエラーを通知
    this.props.onError?.(error, errorInfo)
  }

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidUpdate(prevProps: Props) {
    // propsが変更されたときにエラー状態をリセット（オプション）
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      Object.keys(this.props).some((key) => {
        return key !== "children" && key !== "fallback" && key !== "onError" && this.props[key] !== prevProps[key]
      })
    ) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    if (this.mounted) {
      this.setState({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: 0,
      })
    }
  }

  handleRetry = () => {
    if (this.mounted) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  handleGoBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      // カスタムエラーコンポーネントが提供されている場合
      if (this.props.errorComponent) {
        const ErrorComponent = this.props.errorComponent
        return <ErrorComponent error={this.state.error!} reset={this.resetErrorBoundary} />
      }

      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error!
      const errorMessage = getUserFriendlyErrorMessage(error)
      const isRecoverable = isRecoverableError(error)
      const severity = getErrorSeverity(error)
      const severityColor = {
        low: "blue",
        medium: "yellow",
        high: "orange",
        critical: "red",
      }[severity]

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div
                className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-${severityColor}-100`}
              >
                <AlertTriangle className={`h-6 w-6 text-${severityColor}-600`} />
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
              {process.env.NODE_ENV === "development" && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    技術的な詳細を表示
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-32">
                    <div>
                      <strong>エラー:</strong> {error.message}
                    </div>
                    <div>
                      <strong>スタック:</strong> {error.stack?.split("\n").slice(0, 3).join("\n")}
                    </div>
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

                <div className="flex gap-2">
                  <Button onClick={this.handleGoBack} className="flex-1" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>

                  <Button onClick={this.handleGoHome} className="flex-1" variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    ホームに戻る
                  </Button>
                </div>
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

/**
 * エラーバウンダリーをラップするHOC
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
