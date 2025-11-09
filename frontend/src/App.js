import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import Aquarium from './components/Aquarium';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FishDetails from './components/FishDetails';
import Toast from './components/Toast';
import './App.css';

function App() {
  const { 
    account, 
    balance, 
    fishToken, 
    aquarium, 
    connectWallet,
    refreshBalances,
    isConnecting 
  } = useWeb3();

  const [fishes, setFishes] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [selectedFish2, setSelectedFish2] = useState(null);
  const [environment, setEnvironment] = useState({
    temperature: 25,
    oxygen: 80,
    pH: 7.2,
    pollution: 10
  });
  const [energy, setEnergy] = useState(1000);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // 显示提示
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 加载用户的鱼
  const loadUserFishes = useCallback(async () => {
    if (!aquarium || !account) return;

    try {
      setLoading(true);
      const fishIds = await aquarium.getUserFishes(account);
      
      const fishesData = await Promise.all(
        fishIds.map(async (id) => {
          const info = await aquarium.getFishInfo(id);
          const tokenURI = await aquarium.tokenURI(id);
          
          return {
            id: id.toString(),
            genesHash: info.genesHash,
            generation: info.generation,
            birthTime: Number(info.birthTime),
            lastBreedTime: Number(info.lastBreedTime),
            parent1: info.parent1.toString(),
            parent2: info.parent2.toString(),
            rarity: ['common', 'rare', 'legendary'][info.rarity],
            isGenesis: info.isGenesis,
            cyberneticsCount: info.cyberneticsCount,
            tokenURI,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10
          };
        })
      );
      
      setFishes(fishesData);
      showToast(`加载了 ${fishesData.length} 条鱼`, 'success');
    } catch (error) {
      console.error('加载鱼失败:', error);
      showToast('加载失败: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [aquarium, account, showToast]);

  // 铸造创世鱼
  const mintGenesis = async () => {
    if (!aquarium || !fishToken) {
      showToast('请先连接钱包', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const mintCost = await aquarium.mintingCost();
      
      // 批准代币
      showToast('正在批准代币...', 'info');
      const approveTx = await fishToken.approve(
        await aquarium.getAddress(),
        mintCost
      );
      await approveTx.wait();
      
      // 铸造
      showToast('正在铸造创世鱼...', 'info');
      const mintTx = await aquarium.mintGenesis('ipfs://genesis-fish');
      await mintTx.wait();
      
      showToast('🎉 创世鱼铸造成功!', 'success');
      
      // 刷新数据
      await loadUserFishes();
      await refreshBalances();
      
    } catch (error) {
      console.error('铸造失败:', error);
      showToast('铸造失败: ' + (error.reason || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // 繁殖
  const breedFish = async () => {
    if (!selectedFish || !selectedFish2) {
      showToast('请选择两条鱼进行繁殖', 'error');
      return;
    }

    if (selectedFish.id === selectedFish2.id) {
      showToast('不能选择同一条鱼', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const breedCost = await aquarium.breedingCost();
      
      // 批准代币
      showToast('正在批准代币...', 'info');
      const approveTx = await fishToken.approve(
        await aquarium.getAddress(),
        breedCost
      );
      await approveTx.wait();
      
      // 繁殖
      showToast('正在繁殖中...', 'info');
      const breedTx = await aquarium.breed(
        selectedFish.id,
        selectedFish2.id,
        'ipfs://bred-fish'
      );
      await breedTx.wait();
      
      showToast('🐟 繁殖成功!', 'success');
      
      // 重置选择
      setSelectedFish(null);
      setSelectedFish2(null);
      
      // 刷新数据
      await loadUserFishes();
      await refreshBalances();
      
    } catch (error) {
      console.error('繁殖失败:', error);
      let errorMsg = '繁殖失败';
      
      if (error.message.includes('Parent1 on cooldown')) {
        errorMsg = '父母1 还在冷却期';
      } else if (error.message.includes('Parent2 on cooldown')) {
        errorMsg = '父母2 还在冷却期';
      } else if (error.reason) {
        errorMsg = error.reason;
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 安装赛博义体
  const installCybernetics = async () => {
    if (!selectedFish) {
      showToast('请选择一条鱼', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const cyberCost = await aquarium.cyberneticsCost();
      
      // 批准代币
      showToast('正在批准代币...', 'info');
      const approveTx = await fishToken.approve(
        await aquarium.getAddress(),
        cyberCost
      );
      await approveTx.wait();
      
      // 安装
      showToast('正在安装义体...', 'info');
      const tx = await aquarium.installCybernetics(selectedFish.id);
      await tx.wait();
      
      showToast('⚙️ 义体安装成功!', 'success');
      
      // 刷新数据
      await loadUserFishes();
      await refreshBalances();
      
    } catch (error) {
      console.error('安装失败:', error);
      let errorMsg = '安装失败';
      
      if (error.message.includes('Max cybernetics reached')) {
        errorMsg = '已达到最大义体数量(5个)';
      } else if (error.reason) {
        errorMsg = error.reason;
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 选择鱼
  const handleSelectFish = (fish) => {
    if (!selectedFish) {
      setSelectedFish(fish);
      showToast(`已选择: 鱼 #${fish.id}`, 'info');
    } else if (!selectedFish2 && selectedFish.id !== fish.id) {
      setSelectedFish2(fish);
      showToast(`已选择第二条: 鱼 #${fish.id}`, 'info');
    } else {
      setSelectedFish(fish);
      setSelectedFish2(null);
      showToast(`已选择: 鱼 #${fish.id}`, 'info');
    }
  };

  // 环境模拟
  useEffect(() => {
    const interval = setInterval(() => {
      setEnvironment(prev => ({
        temperature: Math.max(20, Math.min(30, prev.temperature + (Math.random() - 0.5) * 0.5)),
        oxygen: Math.max(60, Math.min(100, prev.oxygen + (Math.random() - 0.48) * 2)),
        pH: Math.max(6.5, Math.min(8.0, prev.pH + (Math.random() - 0.5) * 0.1)),
        pollution: Math.max(0, Math.min(100, prev.pollution + 0.1))
      }));
      
      // 能量消耗
      setEnergy(prev => Math.max(0, prev - fishes.length * 0.1));
    }, 2000);

    return () => clearInterval(interval);
  }, [fishes.length]);

  // 加载用户鱼类
  useEffect(() => {
    if (account && aquarium) {
      loadUserFishes();
    }
  }, [account, aquarium, loadUserFishes]);

  return (
    <div className="app">
      <Header
        account={account}
        balance={balance}
        energy={energy}
        fishCount={fishes.length}
        onConnect={connectWallet}
        isConnecting={isConnecting}
      />

      <div className="main-content">
        <Aquarium
          fishes={fishes}
          selectedFish={selectedFish}
          selectedFish2={selectedFish2}
          onSelectFish={handleSelectFish}
          environment={environment}
        />

        <Sidebar
          selectedFish={selectedFish}
          selectedFish2={selectedFish2}
          onMintGenesis={mintGenesis}
          onBreed={breedFish}
          onInstallCybernetics={installCybernetics}
          loading={loading}
          connected={!!account}
        />
      </div>

      {selectedFish && (
        <FishDetails
          fish={selectedFish}
          onClose={() => setSelectedFish(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;