export interface Market {
  id: string;
  question: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  outcomes?: string;
  active: boolean;
  closed: boolean;
  endDate?: string;
  volume24hr?: number;
  tokens?: Token[];
  clobTokenIds?: string[] | string; // Can be JSON string or array
}

export interface Token {
  token_id: string;
  outcome: string;
  price?: number;
}

export interface PricePoint {
  t: number;  // timestamp
  p: number;  // price
}

export interface ChartDataPoint {
  time: string;
  price: number;
}
