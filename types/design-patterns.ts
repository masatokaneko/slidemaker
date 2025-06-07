export interface DesignPattern {
  id: string
  name: string
  type: string
  tags: string[]
  layout: LayoutAnalysis
  colors: ColorPalette
  typography: TypographyAnalysis
  elements: ElementAnalysis
  thumbnail: string
  sourceFile: string
  extractedAt: string
  confidence: number
}

export interface LayoutAnalysis {
  type: string
  regions: LayoutRegion[]
  gridStructure: {
    columns: number
    rows: number
    alignment: string
  }
}

export interface LayoutRegion {
  type: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
}

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  palette: ColorInfo[]
}

export interface ColorInfo {
  color: string
  usage: string
  percentage: number
}

export interface TypographyAnalysis {
  fonts: string[]
  sizes: number[]
  hierarchy: string[]
  alignment: string
}

export interface ElementAnalysis {
  hasCharts: boolean
  hasImages: boolean
  hasIcons: boolean
}

// PDFから抽出したデザインパターン情報のDTO
export interface DesignPatternDTO {
  name: string;
  layoutJson: {
    elements: Array<{
      bbox: [number, number, number, number]; // [x1, y1, x2, y2]
      zIndex: number;
      type: string;
    }>;
  };
  paletteJson: {
    colors: string[]; // HEX形式
  };
  fontFamily: string;
  pdfHash: string;
}
