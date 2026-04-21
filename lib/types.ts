export type Currency = "BRL" | "USD" | "EUR";

export type ActivityTime = "manhã" | "tarde" | "noite";

export type ActivityCategory =
  | "comida"
  | "bebida"
  | "atividade"
  | "transporte"
  | "hospedagem"
  | "outro";

export interface ActivityImage {
  url: string;
  alt: string;
  photographer: { name: string; profileUrl: string };
}

export interface Activity {
  time: ActivityTime;
  name: string;
  description: string;
  estimatedCost: number;
  category: ActivityCategory;
  imageQuery?: string;
  image?: ActivityImage | null;
}

export interface ItineraryDay {
  _uid?: string;
  day: number;
  title: string;
  activities: Activity[];
  dailyTotal: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface Itinerary {
  city: string;
  days: ItineraryDay[];
  totalCost: number;
  averageDailyCost: number;
  currency: string;
  localCurrency: string;
  localCurrencyRate: number;
  tips: string[];
  usage?: TokenUsage;
}

export interface ItineraryRequestInput {
  city: string;
  days: number;
  keywords: string[];
  currency: Currency;
}
