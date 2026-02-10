import { SubscriptionPlan } from '../../backend';

export interface PlanDetails {
  id: SubscriptionPlan;
  price: string;
  chatLimit: number;
  validity?: string;
  features: string[];
}

export const PLAN_CATALOG: PlanDetails[] = [
  {
    id: SubscriptionPlan.plan98,
    price: '₹98',
    chatLimit: 2,
    features: ['Chat with up to 2 people'],
  },
  {
    id: SubscriptionPlan.plan199,
    price: '₹199',
    chatLimit: 7,
    features: ['Chat with up to 7 people'],
  },
  {
    id: SubscriptionPlan.plan399,
    price: '₹399',
    chatLimit: 7,
    validity: 'Valid for 2 months',
    features: ['Chat with up to 7 people', 'Valid for 2 months'],
  },
];
