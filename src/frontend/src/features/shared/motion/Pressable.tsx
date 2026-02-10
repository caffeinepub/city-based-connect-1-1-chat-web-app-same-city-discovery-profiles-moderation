import { useReducedMotion } from './useReducedMotion';
import { useState } from 'react';

interface PressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  asChild?: boolean;
}

export function Pressable({ children, onPress, className = '', disabled = false }: PressableProps) {
  const reducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = () => {
    if (!disabled && !reducedMotion) {
      setIsPressed(true);
    }
  };

  const handlePointerUp = () => {
    if (!disabled && !reducedMotion) {
      setIsPressed(false);
    }
  };

  const handlePointerLeave = () => {
    if (!disabled && !reducedMotion) {
      setIsPressed(false);
    }
  };

  const handleClick = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={`${className} ${
        !reducedMotion && isPressed ? 'animate-press-bounce' : ''
      } ${disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
      style={{
        transform: !reducedMotion && isPressed ? 'scale(0.96)' : 'scale(1)',
        transition: reducedMotion ? 'none' : 'transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {children}
    </div>
  );
}
