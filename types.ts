export type MashResults = { [key: string]: string };

export interface Player {
  name: string;
  photo?: { // The original user-provided photo
    base64: string;
    mimeType: string;
  };
  avatarHistory?: string[]; // All generated avatars, for the editing feature
  selectedAvatarIndex?: number; // Index of the chosen avatar in history
}

export interface Players {
  mode: 'solo' | 'coop';
  player1: Player; // In 'sabotage' mode, this is the user playing FOR the friend.
  player2?: Player; // In 'sabotage' mode, this is the friend. In 'coop', the second player.
  relationship?: string;
  togetherPhoto?: Player['photo']; // For the fun, shared photo in coop mode
}

export interface Avatar {
  prompt: string;
  base64Image: string;
}

export type StoryTone = 'sassy' | 'wholesome' | 'roasty';

export interface LibraryCategory {
  [key: string]: string[] | LibraryCategory;
}

export interface Category {
  id: string;
  name: string;
  options: string[] | LibraryCategory;
}

// New type for managing selectable default and custom categories
export interface CategoryConfig {
  key: string;
  name: string;
  icon: string;
  isCustom: boolean;
  isSelected: boolean;
}


export interface StoryMode {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface StylePreset {
  id:string;
  title: string;
  description: string;
  emoji: string;
}

export interface SharePlatform {
  name: string;
  emoji: string;
  url: string;
  action?: 'download' | 'copy';
}

export interface ChallengeEntry {
  id: string;
  userId: string; // Placeholder for user identification
  mashResult: MashResults;
  avatar: Avatar;
  shares: number;
  votes: { spotOn: number; nah: number };
  submittedAt: Date;
}