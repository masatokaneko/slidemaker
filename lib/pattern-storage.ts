/**
 * 抽出されたデザインパターンの保存と管理
 */
import type { DesignPattern } from "@/types/design-patterns"

// 実際の実装では、データベースやファイルストレージを使用
let patternStorage: DesignPattern[] = []

export async function saveDesignPattern(pattern: DesignPattern): Promise<void> {
  // パターンをストレージに保存
  patternStorage.push({
    ...pattern,
    savedAt: new Date().toISOString(),
  })

  // 実際の実装では、データベースに保存
  console.log("Pattern saved:", pattern.name)
}

export async function getDesignPatterns(filters?: {
  tags?: string[]
  type?: string
  sourceFile?: string
}): Promise<DesignPattern[]> {
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

export async function deleteDesignPattern(patternId: string): Promise<void> {
  patternStorage = patternStorage.filter((p) => p.id !== patternId)
}

export async function updateDesignPattern(patternId: string, updates: Partial<DesignPattern>): Promise<void> {
  const index = patternStorage.findIndex((p) => p.id === patternId)
  if (index !== -1) {
    patternStorage[index] = {
      ...patternStorage[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
  }
}
