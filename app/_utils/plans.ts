export type PlanId = 'weekly' | 'monthly' | 'lifetime';

export type PlanDetails = {
  plan: string;
  priceLabel: string;
  scriptsIncluded: number | 'unlimited';
};

export const PLANS: Record<PlanId, PlanDetails> = {
  weekly: {
    plan: 'Weekly',
    priceLabel: '$2.99/wk',
    scriptsIncluded: 10,
  },
  monthly: {
    plan: 'Monthly',
    priceLabel: '$9.99/mo',
    scriptsIncluded: 25,
  },
  lifetime: {
    plan: 'Lifetime',
    priceLabel: '$49.99',
    scriptsIncluded: 'unlimited',
  },
};
