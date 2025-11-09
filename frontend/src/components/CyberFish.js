import React, { useState, useEffect } from 'react';
import './CyberFish.css';

const CyberFish = ({ fish, isSelected, selectionNumber, onSelect }) => {
  const [pos, setPos] = useState({ x: fish.x, y: fish.y });
  const [velocity, setVelocity] = useState({
    x: (Math.random() - 0.5) * 1.5,
    y: (Math.random() - 0.5) * 1.5
  });

  // 基因转视觉属性
  const getVisuals = () => {
    // 使用基因哈希生成颜色
    const hash = fish.genesHash || '0x0000000000000000000000000000000000000000000000000000000000000000';
    const seed = parseInt(hash.slice(2, 10), 16);
    
    const hue = (seed % 360);
    const saturation = 60 + ((seed >> 8) % 40);
    const size = 30 + ((seed >> 16) % 30);
    const glow = ((seed >> 24) % 100) / 100;
    
    return { hue, saturation, size, glow };
  };

  const visuals = getVisuals();

  // 鱼的移动
  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;

        // 边界检测和反弹
        if (newX < 0 || newX > 100) {
          newVelX = -velocity.x;
          newX = Math.max(0, Math.min(100, newX));
        }
        if (newY < 0 || newY > 100) {
          newVelY = -velocity.y;
          newY = Math.max(0, Math.min(100, newY));
        }

        // 随机改变方向
        if (Math.random() < 0.02) {
          newVelX += (Math.random() - 0.5) * 0.3;
          newVelY += (Math.random() - 0.5) * 0.3;
          
          // 限制速度
          const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
          if (speed > 2) {
            newVelX = (newVelX / speed) * 2;
            newVelY = (newVelY / speed) * 2;
          }
        }

        setVelocity({ x: newVelX, y: newVelY });
        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [velocity]);

  const getRarityColor = () => {
    switch (fish.rarity) {
      case 'legendary': return '#ffd700';
      case 'rare': return '#0ff';
      default: return '#888';
    }
  };

  return (
    <div
      className={`cyber-fish ${isSelected ? 'selected' : ''} rarity-${fish.rarity}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${visuals.size}px`,
        height: `${visuals.size}px`,
        transform: `scaleX(${velocity.x > 0 ? 1 : -1})`,
      }}
      onClick={onSelect}
    >
      {/* 选择标记 */}
      {isSelected && (
        <div 
          className="selection-marker"
          style={{
            borderColor: selectionNumber === 1 ? '#0ff' : '#0f0'
          }}
        >
          {selectionNumber}
        </div>
      )}

      {/* 鱼的 SVG */}
      <svg viewBox="0 0 100 100" className="fish-svg">
        <defs>
          <filter id={`glow-${fish.id}`}>
            <feGaussianBlur stdDeviation={visuals.glow * 8} result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <linearGradient id={`gradient-${fish.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: `hsl(${visuals.hue}, ${visuals.saturation}%, 30%)` }} />
            <stop offset="100%" style={{ stopColor: `hsl(${visuals.hue}, ${visuals.saturation}%, 60%)` }} />
          </linearGradient>
        </defs>
        
        {/* 鱼身 */}
        <ellipse
          cx="55" cy="50" rx="35" ry="22"
          fill={`url(#gradient-${fish.id})`}
          filter={`url(#glow-${fish.id})`}
          opacity="0.9"
        />
        
        {/* 尾巴 */}
        <path
          d="M 20 50 L 5 40 L 5 60 Z"
          fill={`hsl(${visuals.hue}, ${visuals.saturation}%, 40%)`}
          opacity="0.8"
        />
        
        {/* 背鳍 */}
        <path
          d="M 50 28 L 45 15 L 60 15 L 55 28 Z"
          fill={`hsl(${visuals.hue}, ${visuals.saturation}%, 50%)`}
          opacity="0.7"
        />
        
        {/* 腹鳍 */}
        <ellipse
          cx="50" cy="65" rx="8" ry="12"
          fill={`hsl(${visuals.hue}, ${visuals.saturation}%, 50%)`}
          opacity="0.7"
        />
        
        {/* 眼睛 */}
        <circle cx="75" cy="45" r="5" fill="#0ff" opacity="0.9" />
        <circle cx="75" cy="45" r="2" fill="#000" />
        
        {/* 赛博纹路 */}
        {fish.cyberneticsCount > 0 && (
          <>
            <line x1="30" y1="50" x2="70" y2="50" 
                  stroke="#0ff" strokeWidth="1" opacity="0.6" 
                  strokeDasharray="2,2" />
            <line x1="40" y1="45" x2="60" y2="55" 
                  stroke="#0ff" strokeWidth="0.5" opacity="0.4" />
            <circle cx="50" cy="50" r="3" fill="#0ff" opacity="0.8">
              <animate attributeName="opacity" 
                       values="0.8;1;0.8" 
                       dur="1s" 
                       repeatCount="indefinite"/>
            </circle>
          </>
        )}
        
        {/* 创世鱼标记 */}
        {fish.isGenesis && (
          <text x="50" y="85" 
                fontSize="12" 
                fill="#ffd700" 
                textAnchor="middle"
                fontWeight="bold">
            G0
          </text>
        )}
      </svg>

      {/* 信息卡片 */}
      <div className="fish-info-card">
        <div className="fish-id">#{fish.id}</div>
        <div className="fish-gen">Gen {fish.generation}</div>
        {fish.cyberneticsCount > 0 && (
          <div className="fish-cyber">⚙️ x{fish.cyberneticsCount}</div>
        )}
        <div 
          className="fish-rarity"
          style={{ color: getRarityColor() }}
        >
          {fish.rarity === 'legendary' && '✨'}
          {fish.rarity === 'rare' && '⭐'}
          {fish.rarity}
        </div>
      </div>

      {/* 稀有度光环 */}
      {fish.rarity === 'legendary' && (
        <div className="legendary-aura"></div>
      )}
    </div>
  );
};

export default CyberFish;