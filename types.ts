export interface MashResults {
  [key: string]: string;
}

export interface Avatar {
  prompt: string;
  base64Image: string;
}

export type StoryTone = 'cheeky' | 'wholesome' | 'roasty';

export interface Category {
  id: string;
  name: string;
  options: string[];
}

export interface StoryMode {
  id: string;
  title: string;
  description: string;
  emoji: string;
}
