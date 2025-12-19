export type PlanId = 'weekly' | 'monthly' | 'lifetime';

export type Entitlements = {
  plan: PlanId;
  journal: boolean;
  scriptsIncluded: number | 'unlimited';
  period: 'week' | 'month' | 'lifetime';
  priceLabel: string;
};

export const PLANS: Record<PlanId, Entitlements> = {
  weekly: {
    plan: 'weekly',
    journal: true,
    scriptsIncluded: 10,
    period: 'week',
    priceLabel: '$4.99 / week',
  },
  monthly: {
    plan: 'monthly',
    journal: true,
    scriptsIncluded: 25,
    period: 'month',
    priceLabel: '$9.99 / month',
  },
  lifetime: {
    plan: 'lifetime',
    journal: true,
    scriptsIncluded: 'unlimited',
    period: 'lifetime',
    priceLabel: '$49.99 lifetime',
  },
};

export const DEFAULT_FREE = {
  journal: true,
  scriptsIncluded: 5,
};
