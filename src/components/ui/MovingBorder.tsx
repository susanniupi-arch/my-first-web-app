import React from 'react';

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'rainbow';
  speed?: 'slow' | 'medium' | 'fast';
  thickness?: number;
}

const MovingBorder: React.FC<MovingBorderProps> = ({
  children,
  className = '',
  borderColor = 'blue',
  speed = 'medium',
  thickness = 2
}) => {
  const getSpeedClass = () => {
    const speedClasses = {
      slow: 'moving-border-slow',
      medium: 'moving-border-medium',
      fast: 'moving-border-fast'
    };
    return speedClasses[speed];
  };

  const getColorClass = () => {
    const colorClasses = {
      blue: 'moving-border-blue',
      purple: 'moving-border-purple',
      pink: 'moving-border-pink',
      green: 'moving-border-green',
      orange: 'moving-border-orange',
      rainbow: 'moving-border-rainbow'
    };
    return colorClasses[borderColor];
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ '--border-thickness': `${thickness}px` } as React.CSSProperties}
    >
      {/* Moving border effect */}
      <div className={`moving-border-container ${getSpeedClass()} ${getColorClass()}`}>
        <div className="moving-border-line moving-border-top"></div>
        <div className="moving-border-line moving-border-right"></div>
        <div className="moving-border-line moving-border-bottom"></div>
        <div className="moving-border-line moving-border-left"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default MovingBorder;