import { savePatterns, getPatternsByHash, deletePatterns } from '@/lib/pattern-storage'
import { CustomError, ErrorCode } from '@/lib/error-handler'
import { PrismaClient } from '@prisma/client'

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    designPattern: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  })),
}))

describe('Pattern Storage', () => {
  const mockPatterns = [
    {
      type: 'color',
      value: '#1F2937',
      frequency: 0.3,
    },
    {
      type: 'layout',
      value: 'title-and-content',
      frequency: 0.5,
    },
  ]
  const mockPdfHash = 'mock-hash'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常にパターンを保存できること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.createMany as jest.Mock).mockResolvedValue({ count: 2 })

    await savePatterns(mockPatterns, mockPdfHash)
    expect(prisma.designPattern.createMany).toHaveBeenCalledWith({
      data: mockPatterns.map((pattern) => ({
        ...pattern,
        pdfHash: mockPdfHash,
      })),
    })
  })

  it('正常にパターンを取得できること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.findMany as jest.Mock).mockResolvedValue(mockPatterns)

    const result = await getPatternsByHash(mockPdfHash)
    expect(result).toEqual(mockPatterns)
    expect(prisma.designPattern.findMany).toHaveBeenCalledWith({
      where: { pdfHash: mockPdfHash },
    })
  })

  it('正常にパターンを削除できること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })

    await deletePatterns(mockPdfHash)
    expect(prisma.designPattern.deleteMany).toHaveBeenCalledWith({
      where: { pdfHash: mockPdfHash },
    })
  })

  it('パターンの保存に失敗した場合にエラーを投げること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.createMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    await expect(savePatterns(mockPatterns, mockPdfHash)).rejects.toThrow(CustomError)
    await expect(savePatterns(mockPatterns, mockPdfHash)).rejects.toMatchObject({
      code: ErrorCode.DATABASE_ERROR,
    })
  })

  it('パターンの取得に失敗した場合にエラーを投げること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    await expect(getPatternsByHash(mockPdfHash)).rejects.toThrow(CustomError)
    await expect(getPatternsByHash(mockPdfHash)).rejects.toMatchObject({
      code: ErrorCode.DATABASE_ERROR,
    })
  })

  it('パターンの削除に失敗した場合にエラーを投げること', async () => {
    const prisma = new PrismaClient()
    ;(prisma.designPattern.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'))

    await expect(deletePatterns(mockPdfHash)).rejects.toThrow(CustomError)
    await expect(deletePatterns(mockPdfHash)).rejects.toMatchObject({
      code: ErrorCode.DATABASE_ERROR,
    })
  })
}) 