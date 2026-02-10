import { ReactNode } from 'react';

interface EmptyStateProps {
  imageSrc: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ imageSrc, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <img src={imageSrc} alt={title} className="h-48 w-auto opacity-80" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
