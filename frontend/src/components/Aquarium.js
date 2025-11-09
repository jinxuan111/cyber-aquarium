import React, { useState, useEffect } from 'react';
import CyberFish from './CyberFish';
import './Aquarium.css';

const Aquarium = ({ fishes, selectedFish, selectedFish2, onSelectFish, environment }) => {
  const [particles, setParticles] = useState([]);

  // 生成粒子效果
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev.filter(p => p.life > 0)];
        
        // 添加新粒子
        if (newParticles.length < 50) {
          for (let i = 0; i < 3; i++) {
            newParticles.push({
              id: Date.now() + Math.random(),
              x: Math.random() * 100,
              y: 100,
              life: 100,
              speed: Math.random() * 0.5 + 0.1,
              size: Math.random() * 3 + 1
            });
          }
        }
        
        // 更新粒子位置
        return newParticles.map(p => ({
          ...p,
          y: p.y - p.speed,
          life: p.life - 1
        }));
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // 获取环境状态颜色
  const getEnvColor = (value, min, max, optimal) => {
    const diff = Math.abs(value - optimal);
    const range = max - min;
    const percent = diff / range;
    
    if (percent < 0.1) return '#0f0';
    if (percent < 0.3) return '#0ff';
    if (percent < 0.5) return '#ff0';
    return '#f00';
  };

  return (
    <div className="aquarium">
      {/* 背景粒子 */}
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.life / 100 * 0.5
          }}
        />
      ))}

      {/* 环境信息显示 */}
      <div className="environment-panel">
        <div className="env-item">
          <span className="env-label">温度</span>
          <span 
            className="env-value" 
            style={{ color: getEnvColor(environment.temperature, 20, 30, 25) }}
          >
            {environment.temperature.toFixed(1)}°C
          </span>
        </div>
        
        <div className="env-item">
          <span className="env-label">氧气</span>
          <span 
            className="env-value"
            style={{ color: getEnvColor(environment.oxygen, 60, 100, 90) }}
          >
            {environment.oxygen.toFixed(0)}%
          </span>
        </div>
        
        <div className="env-item">
          <span className="env-label">pH值</span>
          <span 
            className="env-value"
            style={{ color: getEnvColor(environment.pH, 6.5, 8.0, 7.2) }}
          >
            {environment.pH.toFixed(1)}
          </span>
        </div>
        
        <div className="env-item">
          <span className="env-label">污染</span>
          <span 
            className="env-value"
            style={{ color: environment.pollution > 50 ? '#f00' : environment.pollution > 30 ? '#ff0' : '#0f0' }}
          >
            {environment.pollution.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 鱼缸内容 */}
      <div className="tank">
        {fishes.length === 0 ? (
          <div className="empty-tank">
            <div className="empty-message">
              <span className="empty-icon">🐟</span>
              <h3>鱼缸是空的</h3>
              <p>点击右侧"铸造创世鱼"开始你的赛博养鱼之旅</p>
            </div>
          </div>
        ) : (
          fishes.map(fish => (
            <CyberFish
              key={fish.id}
              fish={fish}
              isSelected={
                selectedFish?.id === fish.id || selectedFish2?.id === fish.id
              }
              selectionNumber={
                selectedFish?.id === fish.id ? 1 :
                selectedFish2?.id === fish.id ? 2 : 0
              }
              onSelect={() => onSelectFish(fish)}
            />
          ))
        )}
      </div>

      {/* 选择提示 */}
      {(selectedFish || selectedFish2) && (
        <div className="selection-hint">
          {selectedFish && (
            <div className="selected-badge badge-1">
              已选择 1: 鱼 #{selectedFish.id}
            </div>
          )}
          {selectedFish2 && (
            <div className="selected-badge badge-2">
              已选择 2: 鱼 #{selectedFish2.id}
            </div>
          )}
        </div>
      )}

      {/* 数据流效果 */}
      <div className="data-stream">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="data-line"
            style={{
              left: `${20 + i * 20}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Aquarium;