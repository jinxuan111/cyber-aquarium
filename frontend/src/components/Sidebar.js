import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  selectedFish, 
  selectedFish2, 
  onMintGenesis, 
  onBreed, 
  onInstallCybernetics,
  loading,
  connected
}) => {
  return (
    <div className="sidebar">
      {/* 操作面板 */}
      <div className="card operations-panel">
        <h3 className="card-title">🎮 操作面板</h3>
        
        {!connected ? (
          <div className="not-connected-message">
            <span className="warning-icon">⚠️</span>
            <p>请先连接钱包以使用游戏功能</p>
          </div>
        ) : (
          <div className="operations">
            {/* 铸造创世鱼 */}
            <button
              className="btn btn-success operation-btn"
              onClick={onMintGenesis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  处理中...
                </>
              ) : (
                <>
                  <span>🐟</span>
                  铸造创世鱼
                </>
              )}
            </button>
            <div className="operation-cost">费用: 50 FISH</div>

            {/* 繁殖 */}
            <button
              className="btn btn-primary operation-btn"
              onClick={onBreed}
              disabled={loading || !selectedFish || !selectedFish2}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  繁殖中...
                </>
              ) : (
                <>
                  <span>🧬</span>
                  繁殖鱼类
                </>
              )}
            </button>
            <div className="operation-cost">
              费用: 10 FISH
              {(!selectedFish || !selectedFish2) && (
                <span className="requirement"> (需选择2条鱼)</span>
              )}
            </div>

            {/* 安装赛博义体 */}
            <button
              className="btn btn-warning operation-btn"
              onClick={onInstallCybernetics}
              disabled={loading || !selectedFish}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  安装中...
                </>
              ) : (
                <>
                  <span>⚙️</span>
                  安装义体
                </>
              )}
            </button>
            <div className="operation-cost">
              费用: 5 FISH
              {!selectedFish && (
                <span className="requirement"> (需选择1条鱼)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 选中的鱼信息 */}
      {selectedFish && (
        <div className="card fish-detail-panel">
          <h3 className="card-title">🐠 鱼类详情</h3>
          
          <div className="detail-content">
            <div className="info-row">
              <span className="info-label">ID</span>
              <span className="info-value">#{selectedFish.id}</span>
            </div>

            <div className="info-row">
              <span className="info-label">世代</span>
              <span className="info-value">Gen {selectedFish.generation}</span>
            </div>

            <div className="info-row">
              <span className="info-label">稀有度</span>
              <span className={`badge badge-${selectedFish.rarity}`}>
                {selectedFish.rarity === 'legendary' && '✨ '}
                {selectedFish.rarity === 'rare' && '⭐ '}
                {selectedFish.rarity.toUpperCase()}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">类型</span>
              <span className="info-value">
                {selectedFish.isGenesis ? '创世鱼' : '繁殖鱼'}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">赛博义体</span>
              <span className="info-value">
                {selectedFish.cyberneticsCount}/5
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">基因哈希</span>
              <span className="info-value gene-hash">
                {selectedFish.genesHash?.substring(0, 10)}...
              </span>
            </div>

            {!selectedFish.isGenesis && (
              <>
                <div className="info-row">
                  <span className="info-label">父母1</span>
                  <span className="info-value">#{selectedFish.parent1}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">父母2</span>
                  <span className="info-value">#{selectedFish.parent2}</span>
                </div>
              </>
            )}

            <div className="info-row">
              <span className="info-label">出生时间</span>
              <span className="info-value">
                {new Date(selectedFish.birthTime * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 游戏提示 */}
      <div className="card tips-panel">
        <h3 className="card-title">💡 游戏提示</h3>
        <ul className="tips-list">
          <li>点击鱼可以选择它</li>
          <li>选择2条鱼可以进行繁殖</li>
          <li>繁殖有24小时冷却时间</li>
          <li>传奇鱼繁殖可获得50 FISH奖励</li>
          <li>稀有鱼繁殖可获得10 FISH奖励</li>
          <li>赛博义体可以提升鱼的能力</li>
          <li>创世鱼价值更高</li>
        </ul>
      </div>

      {/* BSC 链接 */}
      <div className="card links-panel">
        <h3 className="card-title">🔗 链接</h3>
        <div className="links">
          <a 
            href="https://testnet.bscscan.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn"
          >
            📊 BSCScan 浏览器
          </a>
          <a 
            href="https://pancakeswap.finance" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn"
          >
            🥞 PancakeSwap
          </a>
          <a 
            href="https://testnet.binance.org/faucet-smart" 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-btn"
          >
            🚰 获取测试币
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;