"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { useErrorContext } from "@/contexts/error-context"
import { CustomError, ErrorCode } from "@/lib/error-handler"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"
import { ErrorDisplay } from "@/components/error-boundary"

export function ErrorHandlingExample() {
  const [inputValue, setInputValue] = useState("")
  const { error, isLoading, clearError, executeWithErrorHandling } = useErrorHandler()
  const { handleGlobalError } = useErrorContext()

  // ローカルエラーハンドリングの例
  const handleLocalError = async () => {
    await executeWithErrorHandling(
      async () => {
        if (!inputValue.trim()) {
          throw new CustomError(ErrorCode.VALIDATION_ERROR, "入力値を入力してください", { field: "inputValue" })
        }

        if (inputValue === "error") {
          throw new CustomError(ErrorCode.API_ERROR, "APIエラーが発生しました", { input: inputValue })
        }

        // 成功時の処理
        alert(`成功: ${inputValue}`)
      },
      {
        retries: 1,
        context: "ErrorHandlingExample.handleLocalError",
        onSuccess: () => console.log("処理が成功しました"),
        onError: (err) => console.error("処理中にエラーが発生しました:", err),
      },
    )
  }

  // グローバルエラーハンドリングの例
  const handleGlobalErrorExample = () => {
    try {
      if (inputValue === "global") {
        throw new CustomError(ErrorCode.INTERNAL_SERVER_ERROR, "グローバルエラーが発生しました", { severity: "high" })
      }

      // 成功時の処理
      alert("グローバルエラーは発生しませんでした")
    } catch (error) {
      handleGlobalError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  // 非同期エラーハンドリングの例
  const handleAsyncError = async () => {
    await executeWithErrorHandling(
      async () => {
        // 人工的な遅延
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (Math.random() > 0.5) {
          throw new CustomError(ErrorCode.NETWORK_ERROR, "ネットワークエラーが発生しました", { recoverable: true })
        }

        // 成功時の処理
        alert("非同期処理が成功しました")
      },
      {
        retries: 2,
        showError: true,
      },
    )
  }

  return (
    <EnhancedErrorBoundary>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>エラーハンドリングの例</CardTitle>
          <CardDescription>様々なエラーハンドリングパターンのデモ</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <ErrorDisplay error={error} onRetry={clearError} onDismiss={clearError} />}

          <div className="space-y-2">
            <Label htmlFor="input-value">テスト入力</Label>
            <Input
              id="input-value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="「error」または「global」と入力してエラーをテスト"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleLocalError} disabled={isLoading} className="w-full">
            ローカルエラーテスト
          </Button>

          <Button onClick={handleGlobalErrorExample} variant="outline" className="w-full">
            グローバルエラーテスト
          </Button>

          <Button onClick={handleAsyncError} variant="secondary" disabled={isLoading} className="w-full">
            非同期エラーテスト {isLoading && "..."}
          </Button>
        </CardFooter>
      </Card>
    </EnhancedErrorBoundary>
  )
}
