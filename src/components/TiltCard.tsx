import React from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`transition-transform duration-300 hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};
