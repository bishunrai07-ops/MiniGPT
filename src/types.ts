import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  grade?: string;
  location?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    voiceName: string;
    customApiKey?: string;
    autoSpeak?: boolean;
  };
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Timestamp;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    mimeType: string;
  }[];
}
