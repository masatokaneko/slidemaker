const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.config.jsと.envファイルを読み込むためのパス
  dir: './',
})

// Jestに渡すカスタム設定
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfigは非同期のNext.jsの設定を読み込むために使用
module.exports = createJestConfig(customJestConfig) 