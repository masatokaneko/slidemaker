// jest-domのカスタムマッチャーを追加
import '@testing-library/jest-dom'

// グローバルなモックの設定
global.fetch = jest.fn()
global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

// テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks()
}) 