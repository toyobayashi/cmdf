declare namespace cmdf {
  export enum CodePage {
    CP_ACP = 0,
    CP_OEMCP = 1,
    CP_MACCP = 2,
    CP_THREAD_ACP = 3,
    CP_SYMBOL = 42,
    IBM437 = 437,
    SHIFT_JIS = 932,
    GB2312 = 936,
    BIG5 = 950,
    CP_UTF7 = 65000,
    CP_UTF8 = 65001
  }
  
  export interface FallbackFont {
    file: string
    name: string
    scale: [number, number]
  }
  
  export function generateRegistryScript (codePage: number | string, fontName: string, fallback?: FallbackFont): Buffer
}

export = cmdf
