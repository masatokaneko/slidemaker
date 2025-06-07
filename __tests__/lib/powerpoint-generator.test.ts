import { generatePowerPointFile } from '@/lib/powerpoint-generator'
import { CustomError, ErrorCode } from '@/lib/error-handler'

describe('PowerPoint Generator', () => {
  const mockYamlData = `
    title: "テストプレゼンテーション"
    slides:
      - type: "title"
        title: "タイトルスライド"
        subtitle: "サブタイトル"
      - type: "content"
        title: "コンテンツスライド"
        content: "テストコンテンツ"
      - type: "chart"
        title: "チャートスライド"
        chartData:
          type: "bar"
          data:
            labels: ["A", "B", "C"]
            datasets:
              - label: "データ1"
                data: [1, 2, 3]
  `

  it('正常にPowerPointファイルを生成できること', async () => {
    const result = await generatePowerPointFile(mockYamlData)
    expect(result).toBeDefined()
    expect(result instanceof Blob).toBe(true)
    expect(result.type).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation')
  })

  it('無効なYAMLデータでエラーを投げること', async () => {
    const invalidYaml = 'invalid: yaml: data:'
    await expect(generatePowerPointFile(invalidYaml)).rejects.toThrow(CustomError)
    await expect(generatePowerPointFile(invalidYaml)).rejects.toMatchObject({
      code: ErrorCode.INVALID_YAML_DATA,
    })
  })

  it('空のスライドデータでエラーを投げること', async () => {
    const emptyYaml = `
      title: "テスト"
      slides: []
    `
    await expect(generatePowerPointFile(emptyYaml)).rejects.toThrow(CustomError)
    await expect(generatePowerPointFile(emptyYaml)).rejects.toMatchObject({
      code: ErrorCode.EMPTY_SLIDES,
    })
  })

  it('無効なスライドタイプでエラーを投げること', async () => {
    const invalidSlideType = `
      title: "テスト"
      slides:
        - type: "invalid"
          title: "テスト"
    `
    await expect(generatePowerPointFile(invalidSlideType)).rejects.toThrow(CustomError)
    await expect(generatePowerPointFile(invalidSlideType)).rejects.toMatchObject({
      code: ErrorCode.INVALID_SLIDE_TYPE,
    })
  })
}) 