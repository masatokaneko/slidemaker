import { generateChart } from '@/lib/chart-generator'
import { CustomError, ErrorCode } from '@/lib/error-handler'

describe('Chart Generator', () => {
  const mockChartData = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        label: 'データ1',
        data: [1, 2, 3],
      },
    ],
  }

  it('正常にチャートを生成できること', async () => {
    const result = await generateChart({
      type: 'bar',
      data: mockChartData,
    })
    expect(result).toBeDefined()
    expect(result.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('無効なチャートデータでエラーを投げること', async () => {
    const invalidData = {
      labels: [],
      datasets: [],
    }
    await expect(
      generateChart({
        type: 'bar',
        data: invalidData,
      }),
    ).rejects.toThrow(CustomError)
    await expect(
      generateChart({
        type: 'bar',
        data: invalidData,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CHART_DATA,
    })
  })

  it('データセットのデータ数がラベル数と一致しない場合にエラーを投げること', async () => {
    const mismatchedData = {
      labels: ['A', 'B'],
      datasets: [
        {
          label: 'データ1',
          data: [1, 2, 3],
        },
      ],
    }
    await expect(
      generateChart({
        type: 'bar',
        data: mismatchedData,
      }),
    ).rejects.toThrow(CustomError)
    await expect(
      generateChart({
        type: 'bar',
        data: mismatchedData,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CHART_DATA,
    })
  })

  it('カスタムカラーを適用できること', async () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF']
    const result = await generateChart({
      type: 'bar',
      data: mockChartData,
      options: {
        colors: customColors,
      },
    })
    expect(result).toBeDefined()
    expect(result.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('無効なカラーコードでエラーを投げること', async () => {
    const invalidColors = ['#INVALID']
    await expect(
      generateChart({
        type: 'bar',
        data: mockChartData,
        options: {
          colors: invalidColors,
        },
      }),
    ).rejects.toThrow(CustomError)
    await expect(
      generateChart({
        type: 'bar',
        data: mockChartData,
        options: {
          colors: invalidColors,
        },
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CHART_DATA,
    })
  })
}) 