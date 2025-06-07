import { extractDesignPatterns } from '@/lib/pdf-analyzer'
import { CustomError, ErrorCode } from '@/lib/error-handler'

describe('PDF Analyzer', () => {
  const mockPdfBuffer = Buffer.from('mock pdf content')
  const mockPdfHash = 'mock-hash'

  it('正常にデザインパターンを抽出できること', async () => {
    const result = await extractDesignPatterns(mockPdfBuffer, mockPdfHash)
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('type')
    expect(result[0]).toHaveProperty('value')
  })

  it('無効なPDFファイルでエラーを投げること', async () => {
    const invalidBuffer = Buffer.from('invalid content')
    await expect(extractDesignPatterns(invalidBuffer, mockPdfHash)).rejects.toThrow(CustomError)
    await expect(extractDesignPatterns(invalidBuffer, mockPdfHash)).rejects.toMatchObject({
      code: ErrorCode.FILE_PROCESSING_ERROR,
    })
  })

  it('空のPDFファイルでエラーを投げること', async () => {
    const emptyBuffer = Buffer.from('')
    await expect(extractDesignPatterns(emptyBuffer, mockPdfHash)).rejects.toThrow(CustomError)
    await expect(extractDesignPatterns(emptyBuffer, mockPdfHash)).rejects.toMatchObject({
      code: ErrorCode.FILE_PROCESSING_ERROR,
    })
  })

  it('PDFハッシュが一致しない場合にエラーを投げること', async () => {
    const differentHash = 'different-hash'
    await expect(extractDesignPatterns(mockPdfBuffer, differentHash)).rejects.toThrow(CustomError)
    await expect(extractDesignPatterns(mockPdfBuffer, differentHash)).rejects.toMatchObject({
      code: ErrorCode.FILE_PROCESSING_ERROR,
    })
  })
}) 