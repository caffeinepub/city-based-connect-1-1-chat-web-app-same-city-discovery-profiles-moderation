import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_CATALOG, PlanDetails } from './plans';
import { useActivatePlan, useGetPlan } from '../../hooks/useQueries';
import { SubscriptionPlan } from '../../backend';

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePromptDialog({ open, onOpenChange }: UpgradePromptDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const activatePlanMutation = useActivatePlan();
  const { data: currentPlan } = useGetPlan();

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      await activatePlanMutation.mutateAsync(selectedPlan);
      toast.success('Plan activated successfully!');
      onOpenChange(false);
      setSelectedPlan(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate plan');
    }
  };

  const isPlanActive = (planId: SubscriptionPlan) => {
    return currentPlan === planId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose a plan to connect with more people
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {PLAN_CATALOG.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              active={isPlanActive(plan.id)}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full"
            disabled={activatePlanMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpgrade}
            className="flex-1 rounded-full"
            disabled={!selectedPlan || activatePlanMutation.isPending}
          >
            {activatePlanMutation.isPending ? 'Activating...' : 'Activate Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PlanCardProps {
  plan: PlanDetails;
  selected: boolean;
  active: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, selected, active, onSelect }: PlanCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={active}
      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
        active
          ? 'border-primary bg-primary/5 opacity-60'
          : selected
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background hover:border-primary/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground">{plan.price}</h3>
            {plan.validity && (
              <span className="text-sm text-muted-foreground">({plan.validity})</span>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {active && (
            <div className="mt-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Current Plan
            </div>
          )}
        </div>
        <div
          className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all ${
            selected
              ? 'border-primary bg-primary'
              : 'border-muted-foreground bg-background'
          }`}
        >
          {selected && <Check className="h-full w-full text-primary-foreground" />}
        </div>
      </div>
    </button>
  );
}
