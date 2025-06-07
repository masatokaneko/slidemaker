// 🔴 最高優先度: データベース接続とPrismaセットアップ

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// データベース接続テスト
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// データベースの初期化
export async function initializeDatabase(): Promise<void> {
  try {
    // テーブルの存在確認
    const userCount = await prisma.user.count()
    console.log(`📊 Current user count: ${userCount}`)

    // 必要に応じて初期データの作成
    if (userCount === 0) {
      console.log("🔄 Creating initial data...")
      // 初期データ作成ロジックをここに追加
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})
