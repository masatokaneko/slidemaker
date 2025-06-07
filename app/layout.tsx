import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { EnhancedErrorBoundary } from "@/components/enhanced-error-boundary"
import { ErrorProvider } from "@/contexts/error-context"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PPTスライド生成システム",
  description: "AI駆動のプロフェッショナルなプレゼンテーション作成ツール",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <EnhancedErrorBoundary
          resetOnPropsChange={true}
          onError={(error, errorInfo) => {
            // グローバルエラーログ
            console.error("Global error caught:", error, errorInfo)

            // 本番環境では外部エラー追跡サービスに送信
            if (process.env.NODE_ENV === "production") {
              // 例: Sentry.captureException(error)
            }
          }}
        >
          <ErrorProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </AuthProvider>
          </ErrorProvider>
        </EnhancedErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
