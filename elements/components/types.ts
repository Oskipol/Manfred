export type GameState = {
  text: string;
  chapter: number;
  level: number;
  history: string[];
  choices: (string | {choice?: string; text?: string})[];
  isFinished: boolean;
  savedAt?: string;
  currentStory?: StoryChapter;
  imageUrl?: string;
};

export type StoryChapter = {
  chapter: number;
  required_level: number;
  narration: string;
  knowledge: string;
  choices: (string | {choice?: string; text?: string; consequence?: string; knowledge_gain?: string})[];
  choice_levels?: number[];
  image_prompt?: string;
  title?: string;
  imageUrl?: string;
};

export type SavedGame = {
  gameState: GameState;
  savedAt: string;
  websiteUrl?: string;
  gameTitle?: string;
};