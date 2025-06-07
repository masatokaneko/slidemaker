import type { ISlideLayout, ISlideMaster } from "pptxgenjs"
import { CustomError, ErrorCode } from "./error-handler"

export interface BCGTemplateOptions {
  title?: string
  subtitle?: string
  footer?: string
  logo?: string
  theme?: "light" | "dark"
  colorScheme?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
  }
}

export function applyBCGTemplate(pptx: any, options: BCGTemplateOptions = {}): void {
  try {
    // マスタースライドの設定
    const masterSlide = pptx.addMaster({
      title: "BCG Master",
      objects: [
        {
          text: {
            text: options.title || "BCG Style",
            options: {
              x: "5%",
              y: "5%",
              w: "90%",
              h: "10%",
              fontSize: 24,
              color: options.colorScheme?.text || "#1F2937",
              fontFace: "Arial",
              bold: true,
            },
          },
        },
        {
          text: {
            text: options.subtitle || "",
            options: {
              x: "5%",
              y: "15%",
              w: "90%",
              h: "5%",
              fontSize: 16,
              color: options.colorScheme?.text || "#4B5563",
              fontFace: "Arial",
            },
          },
        },
        {
          text: {
            text: options.footer || "© BCG Style",
            options: {
              x: "5%",
              y: "90%",
              w: "90%",
              h: "5%",
              fontSize: 12,
              color: options.colorScheme?.text || "#6B7280",
              fontFace: "Arial",
            },
          },
        },
      ],
      background: {
        color: options.colorScheme?.background || "#FFFFFF",
      },
    })

    // ロゴの追加
    if (options.logo) {
      masterSlide.addImage({
        data: options.logo,
        x: "85%",
        y: "5%",
        w: "10%",
        h: "10%",
      })
    }

    // レイアウトの定義
    const layouts: ISlideLayout[] = [
      {
        name: "TITLE",
        title: "Title Slide",
        objects: [
          {
            text: {
              text: "Title",
              options: {
                x: "10%",
                y: "30%",
                w: "80%",
                h: "20%",
                fontSize: 44,
                color: options.colorScheme?.primary || "#1F2937",
                fontFace: "Arial",
                bold: true,
              },
            },
          },
          {
            text: {
              text: "Subtitle",
              options: {
                x: "10%",
                y: "55%",
                w: "80%",
                h: "10%",
                fontSize: 24,
                color: options.colorScheme?.secondary || "#4B5563",
                fontFace: "Arial",
              },
            },
          },
        ],
      },
      {
        name: "TITLE_AND_CONTENT",
        title: "Title and Content",
        objects: [
          {
            text: {
              text: "Title",
              options: {
                x: "5%",
                y: "5%",
                w: "90%",
                h: "10%",
                fontSize: 32,
                color: options.colorScheme?.primary || "#1F2937",
                fontFace: "Arial",
                bold: true,
              },
            },
          },
          {
            text: {
              text: "Content",
              options: {
                x: "5%",
                y: "20%",
                w: "90%",
                h: "70%",
                fontSize: 18,
                color: options.colorScheme?.text || "#374151",
                fontFace: "Arial",
              },
            },
          },
        ],
      },
      {
        name: "TWO_CONTENT",
        title: "Two Content",
        objects: [
          {
            text: {
              text: "Title",
              options: {
                x: "5%",
                y: "5%",
                w: "90%",
                h: "10%",
                fontSize: 32,
                color: options.colorScheme?.primary || "#1F2937",
                fontFace: "Arial",
                bold: true,
              },
            },
          },
          {
            text: {
              text: "Left Content",
              options: {
                x: "5%",
                y: "20%",
                w: "42%",
                h: "70%",
                fontSize: 18,
                color: options.colorScheme?.text || "#374151",
                fontFace: "Arial",
              },
            },
          },
          {
            text: {
              text: "Right Content",
              options: {
                x: "53%",
                y: "20%",
                w: "42%",
                h: "70%",
                fontSize: 18,
                color: options.colorScheme?.text || "#374151",
                fontFace: "Arial",
              },
            },
          },
        ],
      },
      {
        name: "CHART",
        title: "Chart",
        objects: [
          {
            text: {
              text: "Title",
              options: {
                x: "5%",
                y: "5%",
                w: "90%",
                h: "10%",
                fontSize: 32,
                color: options.colorScheme?.primary || "#1F2937",
                fontFace: "Arial",
                bold: true,
              },
            },
          },
          {
            chart: {
              options: {
                x: "5%",
                y: "20%",
                w: "90%",
                h: "70%",
              },
            },
          },
        ],
      },
    ]

    // レイアウトの適用
    layouts.forEach((layout) => {
      pptx.defineLayout({
        name: layout.name,
        width: 10,
        height: 5.625,
        ...layout,
      })
    })

    // テーマの設定
    pptx.defineLayout({
      name: "BCG_THEME",
      width: 10,
      height: 5.625,
      colorScheme: {
        primary: options.colorScheme?.primary || "#1F2937",
        secondary: options.colorScheme?.secondary || "#4B5563",
        accent: options.colorScheme?.accent || "#3B82F6",
        background: options.colorScheme?.background || "#FFFFFF",
        text: options.colorScheme?.text || "#374151",
      },
    })
  } catch (error) {
    throw new CustomError(ErrorCode.TEMPLATE_APPLICATION_ERROR, "テンプレートの適用に失敗しました", {
      originalError: error,
    })
  }
}
