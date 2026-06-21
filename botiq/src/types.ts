export type ViewId = 'overview' | 'conversations' | 'builder' | 'analytics' | 'settings';
export type ChannelId = 'whatsapp' | 'web' | 'sms';
export type ConvStatus = 'bot' | 'agent' | 'resolved';
export type SpeedId = '1x' | '2x' | 'fast';

export interface PropertyCard {
  id: string;
  title: string;
  price: string;
  sqft: string;
  status: string;
  image?: string;
  location?: string;
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user' | 'agent';
  text?: string;
  timestamp: string;
  quickReplies?: string[];
  propertyCards?: PropertyCard[];
  actionButtons?: string[];
  read?: boolean;
  delivered?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  phone: string;
  channel: ChannelId;
  preview: string;
  time: string;
  unread?: number;
  status: ConvStatus;
  messages: ChatMessage[];
  lead: {
    intent: string;
    stage: string;
    confidence: number;
  };
  stats: {
    messages: number;
    resolution: string;
    timeToBook: string;
  };
}

export interface BotItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
  live: boolean;
  channels: ChannelId[];
}

export interface FlowStep {
  kind: 'typing' | 'bot' | 'quickReplies' | 'user' | 'propertyCards' | 'finalButtons';
  text?: string;
  options?: string[];
  autoSelect?: number;
  cards?: PropertyCard[];
  pause?: number;
}
