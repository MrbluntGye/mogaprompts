
import { ReactNode } from 'react';

export type AIModelType = 
  | 'seedream' 
  | 'nano-banana-pro' 
  | 'kling-01' 
  | 'chatgpt-ia'
  | 'flux-2-pro'
  | 'flux-2-flex'
  | 'flux-2-max' 
  | 'veo-3-pro'
  | 'sora-2'
  | 'kling-2-5-video'
  | 'kling-2-6-video'
  | 'kling-3-video'
  | 'minimax-hailuo-01'
  | 'minimax-hailuo-02';

export type ModelModality = 'image' | 'video';

export interface ModelParameter {
  id: string;
  label: string;
  label_es: string;
  type: 'select' | 'slider' | 'toggle';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string;
}

export interface AIModel {
  id: AIModelType;
  name: string;
  version: string;
  description: string;
  icon: ReactNode;
  color: string;
  engine: string;
  capabilities: string[];
  modality: ModelModality;
  negativeFormat: {
    prefix?: string;
    label?: string;
    isSuffix?: boolean;
  };
  parameters: ModelParameter[];
}

export interface TagItem {
  value: string;
  label_en: string;
  label_es: string;
}

export interface TagCategory {
  id: string;
  title: string;
  title_es: string;
  icon: ReactNode;
  borderColor: string;
  bgColor: string;
  shadowClass: string;
  activeClass: string;
  isNsfw?: boolean;
  items: TagItem[];
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
