import type PptxGenJS from "pptxgenjs"

export function applyBCGTemplate(pptx: PptxGenJS, tags: string[]) {
  // BCGスタイルのマスターテンプレート設定
  pptx.defineLayout({
    name: "BCG_STANDARD",
    width: 10,
    height: 7.5,
  })

  // デフォルトフォント設定
  pptx.defineSlideMaster({
    title: "BCG_MASTER",
    background: { color: "FFFFFF" },
    objects: [
      // フッター
      {
        rect: {
          x: 0,
          y: 7,
          w: 10,
          h: 0.5,
          fill: "F8FAFC",
        },
      },
      // ページ番号プレースホルダー
      {
        text: {
          text: "{{slide_number}}",
          options: {
            x: 9,
            y: 7.1,
            w: 0.8,
            h: 0.3,
            fontSize: 10,
            fontFace: "Arial",
            color: "6B7280",
            align: "right",
          },
        },
      },
    ],
  })

  // カラーパレット設定（タグに基づく）
  const colorScheme = getColorScheme(tags)
  pptx.setLayout("BCG_STANDARD")
}

function getColorScheme(tags: string[]) {
  if (tags.includes("データ分析")) {
    return {
      primary: "1E40AF", // 深い青
      secondary: "3B82F6", // 青
      accent: "EF4444", // 赤
      success: "10B981", // 緑
      background: "F8FAFC", // 薄いグレー
    }
  } else if (tags.includes("戦略")) {
    return {
      primary: "7C2D12", // 深い茶色
      secondary: "DC2626", // 赤
      accent: "F59E0B", // オレンジ
      success: "059669", // 緑
      background: "FEF7ED", // 薄いオレンジ
    }
  } else {
    // デフォルトBCGカラー
    return {
      primary: "1F2937", // ダークグレー
      secondary: "3B82F6", // 青
      accent: "EF4444", // 赤
      success: "10B981", // 緑
      background: "FFFFFF", // 白
    }
  }
}
