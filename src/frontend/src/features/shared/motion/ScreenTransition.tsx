import { useReducedMotion } from './useReducedMotion';
import { useEffect, useState } from 'react';

interface ScreenTransitionProps {
  children: React.ReactNode;
  transitionKey: string;
}

export function ScreenTransition({ children, transitionKey }: ScreenTransitionProps) {
  const reducedMotion = useReducedMotion();
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 300);
    return () => clearTimeout(timer);
  }, [transitionKey]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      className={isEntering ? 'animate-fade-slide-in' : ''}
      style={{
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  );
}
