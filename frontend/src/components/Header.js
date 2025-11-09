import React from 'react';
import './Header.css';

const Header = ({ account, balance, energy, fishCount, onConnect, isConnecting }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">
          <span className="logo-icon">🐟</span>
          CYBER AQUARIUM
        </h1>
        
        <div className="stats">
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <span className="stat-value">{parseFloat(balance.fish).toFixed(2)}</span>
            <span className="stat-label">FISH</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <span className="stat-value">{Math.floor(energy)}</span>
            <span className="stat-label">ENERGY</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-icon">🐠</span>
            <span className="stat-value">{fishCount}</span>
            <span className="stat-label">FISHES</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {account ? (
          <div className="wallet-info">
            <div className="wallet-badge connected">
              <span className="status-dot"></span>
              <span className="wallet-address">
                {account.substring(0, 6)}...{account.substring(38)}
              </span>
            </div>
            <div className="bnb-balance">
              {parseFloat(balance.bnb).toFixed(4)} BNB
            </div>
          </div>
        ) : (
          <button 
            className="btn btn-primary connect-btn" 
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="loading-spinner"></span>
                连接中...
              </>
            ) : (
              <>
                <span>🔌</span>
                连接钱包
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;