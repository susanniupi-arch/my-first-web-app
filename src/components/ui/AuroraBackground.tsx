import React from 'react';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-container">
          {/* Aurora Layer 1 */}
          <div className="aurora-layer aurora-layer-1"></div>
          {/* Aurora Layer 2 */}
          <div className="aurora-layer aurora-layer-2"></div>
          {/* Aurora Layer 3 */}
          <div className="aurora-layer aurora-layer-3"></div>
          {/* Aurora Layer 4 */}
          <div className="aurora-layer aurora-layer-4"></div>
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;