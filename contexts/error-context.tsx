"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { ErrorHandler } from "@/lib/error-handler"
import { ErrorDisplay } from "@/components/error-boundary"

interface ErrorContextType {
  globalError: Error | null
  setGlobalError: (error: Error | null) => void
  clearGlobalError: () => void
  handleGlobalError: (error: Error, context?: string) => void
  isErrorVisible: boolean
  hideError: () => void
  showError: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [globalError, setGlobalError] = useState<Error | null>(null)
  const [isErrorVisible, setIsErrorVisible] = useState(true)
  const errorHandler = ErrorHandler.getInstance()

  const clearGlobalError = useCallback(() => {
    setGlobalError(null)
  }, [])

  const handleGlobalError = useCallback(
    (error: Error, context?: string) => {
      errorHandler.logError(error, { context, global: true })
      setGlobalError(error)
      setIsErrorVisible(true)
    },
    [errorHandler],
  )

  const hideError = useCallback(() => {
    setIsErrorVisible(false)
  }, [])

  const showError = useCallback(() => {
    setIsErrorVisible(true)
  }, [])

  return (
    <ErrorContext.Provider
      value={{
        globalError,
        setGlobalError,
        clearGlobalError,
        handleGlobalError,
        isErrorVisible,
        hideError,
        showError,
      }}
    >
      {globalError && isErrorVisible && (
        <div className="fixed top-4 right-4 left-4 z-50 max-w-md mx-auto">
          <ErrorDisplay
            error={globalError}
            onRetry={() => {
              // リトライロジックがあれば実装
              clearGlobalError()
            }}
            onDismiss={clearGlobalError}
          />
        </div>
      )}
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorContext() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error("useErrorContext must be used within an ErrorProvider")
  }
  return context
}
