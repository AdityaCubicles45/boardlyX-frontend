
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 md:p-5 ${onClick ? 'cursor-pointer hover:bg-white/5 transition-colors duration-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
