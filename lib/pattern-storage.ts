/**
 * 抽出されたデザインパターンの保存と管理
 */
import { PrismaClient } from "@prisma/client"
import type { DesignPatternDTO } from "@/types/design-patterns"

const prisma = new PrismaClient()

// 実際の実装では、データベースやファイルストレージを使用
let patternStorage: DesignPatternDTO[] = []

/**
 * デザインパターンをDBに保存
 */
export async function saveDesignPattern(pattern: DesignPatternDTO): Promise<void> {
  await prisma.designPattern.create({
    data: {
      name: pattern.name,
      layoutJson: pattern.layoutJson,
      paletteJson: pattern.paletteJson,
      fontFamily: pattern.fontFamily,
      pdfHash: pattern.pdfHash,
    },
  })
}

/**
 * PDFハッシュからデザインパターンを取得
 */
export async function getDesignPatternByPdfHash(pdfHash: string): Promise<DesignPatternDTO | null> {
  const pattern = await prisma.designPattern.findUnique({
    where: { pdfHash },
  })

  if (!pattern) return null

  return {
    name: pattern.name,
    layoutJson: pattern.layoutJson as any,
    paletteJson: pattern.paletteJson as any,
    fontFamily: pattern.fontFamily,
    pdfHash: pattern.pdfHash,
  }
}

/**
 * 全デザインパターンを取得
 */
export async function getAllDesignPatterns(): Promise<DesignPatternDTO[]> {
  const patterns = await prisma.designPattern.findMany({
    orderBy: { createdAt: "desc" },
  })

  return patterns.map((pattern) => ({
    name: pattern.name,
    layoutJson: pattern.layoutJson as any,
    paletteJson: pattern.paletteJson as any,
    fontFamily: pattern.fontFamily,
    pdfHash: pattern.pdfHash,
  }))
}

/**
 * デザインパターンを削除
 */
export async function deleteDesignPattern(pdfHash: string): Promise<void> {
  await prisma.designPattern.delete({
    where: { pdfHash },
  })
}

export async function getDesignPatterns(filters?: {
  tags?: string[]
  type?: string
  sourceFile?: string
}): Promise<DesignPatternDTO[]> {
  let patterns = [...patternStorage]

  if (filters?.tags) {
    patterns = patterns.filter((p) => filters.tags!.some((tag) => p.tags.includes(tag)))
  }

  if (filters?.type) {
    patterns = patterns.filter((p) => p.type === filters.type)
  }

  if (filters?.sourceFile) {
    patterns = patterns.filter((p) => p.sourceFile === filters.sourceFile)
  }

  return patterns.sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime())
}

export async function updateDesignPattern(patternId: string, updates: Partial<DesignPatternDTO>): Promise<void> {
  const index = patternStorage.findIndex((p) => p.id === patternId)
  if (index !== -1) {
    patternStorage[index] = {
      ...patternStorage[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  }
}
