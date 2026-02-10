import { useReducedMotion } from './useReducedMotion';
import { Heart, Sparkles } from 'lucide-react';

interface AmbientSparklesProps {
  className?: string;
}

export function AmbientSparkles({ className = '' }: AmbientSparklesProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  const sparkles = [
    { icon: Heart, delay: '0s', left: '15%', top: '20%' },
    { icon: Sparkles, delay: '1s', left: '85%', top: '30%' },
    { icon: Heart, delay: '2s', left: '25%', top: '70%' },
    { icon: Sparkles, delay: '1.5s', left: '75%', top: '60%' },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {sparkles.map((sparkle, i) => {
        const Icon = sparkle.icon;
        return (
          <div
            key={i}
            className="absolute animate-float-up"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              animationDelay: sparkle.delay,
              animationIterationCount: 'infinite',
            }}
          >
            <Icon className="h-4 w-4 text-primary/30 animate-sparkle" />
          </div>
        );
      })}
    </div>
  );
}
