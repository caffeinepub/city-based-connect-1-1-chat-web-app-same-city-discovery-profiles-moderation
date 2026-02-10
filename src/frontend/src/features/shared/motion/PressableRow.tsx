import { useReducedMotion } from './useReducedMotion';
import { useState } from 'react';

interface PressableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PressableRow({ children, onClick, className = '' }: PressableRowProps) {
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
        backgroundColor: !reducedMotion && isPressed ? 'oklch(var(--muted) / 0.5)' : undefined,
        transition: reducedMotion ? 'none' : 'background-color 0.1s ease',
      }}
    >
      {children}
    </div>
  );
}
