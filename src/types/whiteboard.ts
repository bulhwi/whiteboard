export interface DrawPoint {
  x: number;
  y: number;
}

export interface DrawStroke {
  id: string;
  points: DrawPoint[];
  color: string;
  thickness: number;
  timestamp: number;
}

export interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  timestamp: number;
}

export interface User {
  id: string;
  nickname: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
}

export interface WhiteboardState {
  strokes: DrawStroke[];
  textElements: TextElement[];
  users: User[];
  messages: ChatMessage[];
}

export type Tool = 'pen' | 'text' | 'eraser';

export type PenColor = 'black' | 'red' | 'blue';
export type PenThickness = 2 | 5;