export interface SubscriptionPlan {
  author: string;
  heading: string;
  plans: {
    light: string;
    standard: string;
    premium: string;
  };
  description: string;
  thumbnail: {
    heading: string;
    description: string;
  };
  plan: {
    id: string;
    name: string;
    basePrice: number;
    initialCost: number;
    monthlyFee: number;
    taxRate: number;
    description: string;
  }[];
  packageContents: {
    id: string;
    name: string;
    description: string;
  }[];
}
