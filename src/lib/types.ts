export type TitleStyle =
  | "种草型"
  | "干货型"
  | "悬念型"
  | "数字型"
  | "情感型"
  | "对比型"
  | "清单型"
  | "故事型"
  | "热点型"
  | "提问型";

export const TITLE_STYLES: TitleStyle[] = [
  "种草型",
  "干货型",
  "悬念型",
  "数字型",
  "情感型",
  "对比型",
  "清单型",
  "故事型",
  "热点型",
  "提问型",
];

/** 默认选中的常用风格（用户可手动增减） */
export const DEFAULT_STYLES: TitleStyle[] = [
  "种草型",
  "干货型",
  "悬念型",
  "数字型",
  "情感型",
];

export interface GeneratedTitle {
  title: string;
  style: TitleStyle;
  reason: string;
  /** 爆款指数 0-100 */
  score: number;
}

export interface OutlineSection {
  heading: string;
  content: string;
}

export interface NoteOutline {
  opening: string;
  sections: OutlineSection[];
  closing: string;
  hashtags: string[];
  imageTips: string;
  firstComment: string;
  interactionHook: string;
  coverText: string;
}

export interface GenerateRequest {
  topic: string;
  keywords?: string;
  styles: TitleStyle[];
  count?: number;
}

export interface OutlineRequest {
  topic: string;
  keywords?: string;
  title: string;
  style: TitleStyle;
}

export interface ImitateRequest {
  referenceTitle: string;
  topic?: string;
  count?: number;
}

export interface ImitateResponse {
  analysis: string;
  titles: GeneratedTitle[];
  remaining: number;
  isPro: boolean;
}

export interface GenerateResponse {
  titles: GeneratedTitle[];
  remaining: number;
}

export interface CalendarDay {
  day: number;
  topic: string;
  suggestedStyle: TitleStyle;
  hook: string;
}

export interface CalendarRequest {
  niche: string;
  keywords?: string;
}
