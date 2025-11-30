
export interface SpendingProfile {
  flipkart: number;
  amazon: number;
  otherOnline: number;
  grocery: number;     // BigBasket, Blinkit, Offline Grocery
  utilities: number;   // Electricity, Water, Gas, Mobile
  fuel: number;        // Petrol, Diesel
  dining: number;      // Swiggy, Zomato, Restaurants
  movies: number;      // BookMyShow, PVR
  travel: number;      // Flights, Hotels, Uber/Ola
  offline: number;     // General retail
}

export interface RewardRate {
  rate: number; // Percentage, e.g., 0.05 for 5%
  cap?: number; // Individual monthly cap in currency units
  minSpend?: number;
}

export interface CardRewards {
  flipkart: RewardRate;
  amazon: RewardRate;
  otherOnline: RewardRate;
  grocery: RewardRate;
  utilities: RewardRate;
  fuel: RewardRate;
  dining: RewardRate;
  movies: RewardRate;
  travel: RewardRate;
  offline: RewardRate;
}

export interface SharedCap {
  categories: Array<keyof SpendingProfile>;
  cap: number; // Monthly cap in currency for these categories combined
  period?: 'monthly' | 'annual';
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  imageUrl: string;
  joiningFee: number;
  annualFee: number;
  feeWaiver: string;
  waiverThreshold?: number; // Annual spend required to waive fee
  joiningBonus?: string;
  rewards: CardRewards;
  sharedCaps?: SharedCap[]; // New field for shared limits
  features: string[];
  applyLink: string;
}

export interface SavingsBreakdown {
  category: string;
  spend: number;
  saved: number;
  rate: number;
  cap?: number;       // The limit applied if any
  isCapped?: boolean; // Whether the cap was hit
}

export interface RecommendationResult {
  card: CreditCard;
  monthlySavings: number;
  annualSavings: number;
  netAnnualSavings: number; // After fees (considering waiver)
  isFeeWaived: boolean;
  breakdown: SavingsBreakdown[];
}
