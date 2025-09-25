import React from 'react';

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'rainbow';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  onClick?: () => void;
}

const GlowingBorder: React.FC<GlowingBorderProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  intensity = 'medium',
  animated = true,
  onClick
}) => {
  const getGlowClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-lg';
    const intensityClasses = {
      low: 'glow-border-low',
      medium: 'glow-border-medium',
      high: 'glow-border-high'
    };
    const colorClasses = {
      blue: 'glow-blue',
      purple: 'glow-purple',
      pink: 'glow-pink',
      green: 'glow-green',
      orange: 'glow-orange',
      rainbow: 'glow-rainbow'
    };
    const animationClass = animated ? 'glow-animated' : '';
    
    return `${baseClasses} ${intensityClasses[intensity]} ${colorClasses[glowColor]} ${animationClass}`;
  };

  return (
    <div className={`${getGlowClasses()} ${className}`} onClick={onClick}>
      {/* Glow effect layers */}
      <div className="glow-layer-1"></div>
      <div className="glow-layer-2"></div>
      <div className="glow-layer-3"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlowingBorder;