import React, { useState, useRef, MouseEvent } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  perspective?: number;
  maxRotation?: number;
  scale?: number;
  glare?: boolean;
  borderGlow?: boolean;
  onClick?: () => void;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  perspective = 1000,
  maxRotation = 15,
  scale = 1.05,
  glare = true,
  borderGlow = true,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({});

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 计算旋转角度
    const rotateX = ((y - centerY) / centerY) * maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;
    
    // 设置变换
    setTransform(`
      perspective(${perspective}px)
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(${scale}, ${scale}, ${scale})
    `);

    // 设置眩光效果
    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%)`,
        opacity: 1
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    if (glare) {
      setGlareStyle({ opacity: 0 });
    }
  };

  const handleMouseEnter = () => {
    if (glare) {
      setGlareStyle({ opacity: 0 });
    }
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        transform: transform,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      {borderGlow && (
        <div className="card-3d-glow" />
      )}
      <div className="card-3d-content">
        {children}
      </div>
      {glare && (
        <div 
          className="card-3d-glare"
          style={{
            ...glareStyle,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
    </div>
  );
};

export default Card3D;