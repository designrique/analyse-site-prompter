
export interface ColorInfo {
  name: string;
  hex: string;
  description: string;
}

export interface TypographyInfo {
  headings: {
    fontFamily: string;
    fontWeight: string;
    description: string;
  };
  body: {
    fontFamily: string;
    fontWeight: string;
    description: string;
  };
}

export interface ComponentInfo {
  name: string;
  description: string;
}

export interface AnalysisResult {
  overallEvaluation: string;
  colorPalette: ColorInfo[];
  typography: TypographyInfo;
  mainComponents: ComponentInfo[];
  developmentPrompts: string[];
}
