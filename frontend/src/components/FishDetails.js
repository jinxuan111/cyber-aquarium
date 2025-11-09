import React from 'react';
import './FishDetails.css';

const FishDetails = ({ fish, onClose }) => {
  if (!fish) return null;

  const getRarityColor = () => {
    switch (fish.rarity) {
      case 'legendary': return '#ffd700';
      case 'rare': return '#0ff';
      default: return '#888';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>鱼类详细信息</h2>
          <div 
            className={`rarity-badge badge-${fish.rarity}`}
            style={{ color: getRarityColor() }}
          >
            {fish.rarity === 'legendary' && '✨ '}
            {fish.rarity === 'rare' && '⭐ '}
            {fish.rarity.toUpperCase()}
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>基本信息</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Token ID</span>
                <span className="detail-value">#{fish.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">世代</span>
                <span className="detail-value">Generation {fish.generation}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">类型</span>
                <span className="detail-value">
                  {fish.isGenesis ? '🌟 创世鱼' : '🧬 繁殖鱼'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">赛博义体</span>
                <span className="detail-value">
                  {fish.cyberneticsCount}/5 个
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>基因信息</h3>
            <div className="gene-info">
              <span className="gene-label">基因哈希:</span>
              <span className="gene-value">{fish.genesHash}</span>
            </div>
            <div className="gene-visual">
              <div className="gene-bar" style={{ width: '60%', background: '#0ff' }}>
                <span>速度</span>
              </div>
              <div className="gene-bar" style={{ width: '80%', background: '#0f0' }}>
                <span>智力</span>
              </div>
              <div className="gene-bar" style={{ width: '70%', background: '#ff0' }}>
                <span>能量效率</span>
              </div>
              <div className="gene-bar" style={{ width: '90%', background: '#f0f' }}>
                <span>发光强度</span>
              </div>
            </div>
          </div>

          {!fish.isGenesis && (
            <div className="detail-section">
              <h3>血统信息</h3>
              <div className="parents-info">
                <div className="parent-card">
                  <span className="parent-label">父母 1</span>
                  <span className="parent-id">#{fish.parent1}</span>
                </div>
                <div className="parent-separator">×</div>
                <div className="parent-card">
                  <span className="parent-label">父母 2</span>
                  <span className="parent-id">#{fish.parent2}</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>时间信息</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">出生时间</span>
                <span className="detail-value">
                  {new Date(fish.birthTime * 1000).toLocaleString()}
                </span>
              </div>
              {fish.lastBreedTime > 0 && (
                <div className="detail-item">
                  <span className="detail-label">最后繁殖</span>
                  <span className="detail-value">
                    {new Date(fish.lastBreedTime * 1000).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {fish.tokenURI && (
            <div className="detail-section">
              <h3>NFT 数据</h3>
              <a 
                href={fish.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                target="_blank"
                rel="noopener noreferrer"
                className="ipfs-link"
              >
                📄 查看 IPFS 元数据
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FishDetails;