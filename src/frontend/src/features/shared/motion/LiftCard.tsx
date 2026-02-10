import { useReducedMotion } from './useReducedMotion';
import { useState } from 'react';

interface LiftCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function LiftCard({ children, onClick, className = '' }: LiftCardProps) {
  const reducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => {
    if (!reducedMotion) {
      setIsPressed(true);
    }
  };

  const handlePointerUp = () => {
    if (!reducedMotion) {
      setIsPressed(false);
    }
  };

  const handlePointerLeave = () => {
    if (!reducedMotion) {
      setIsPressed(false);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`${className} cursor-pointer`}
      style={{
        transform: !reducedMotion && isPressed ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: !reducedMotion && isPressed 
          ? '0 12px 24px -4px rgba(0,0,0,0.12), 0 6px 12px -2px rgba(0,0,0,0.08)' 
          : undefined,
        transition: reducedMotion ? 'none' : 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}
