import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  CONTRACTS, 
  FISH_TOKEN_ABI, 
  AQUARIUM_ABI,
  BSC_TESTNET,
  BSC_MAINNET
} from '../config';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [fishToken, setFishToken] = useState(null);
  const [aquarium, setAquarium] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState({ bnb: '0', fish: '0' });
  const [isConnecting, setIsConnecting] = useState(false);

  // 获取当前网络配置
  const getCurrentNetwork = () => {
    const targetChainId = process.env.REACT_APP_CHAIN_ID || '97';
    return targetChainId === '56' ? BSC_MAINNET : BSC_TESTNET;
  };

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask 钱包!\n\n下载地址: https://metamask.io/download/');
      return false;
    }

    try {
      setIsConnecting(true);
      const currentNetwork = getCurrentNetwork();

      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('账户已连接:', accounts[0]);

      // 检查并切换网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: currentNetwork.chainId }]
        });
        console.log('已切换到目标网络');
      } catch (switchError) {
        // 如果网络不存在，添加它
        if (switchError.code === 4902) {
          console.log('网络不存在，正在添加...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [currentNetwork]
          });
          console.log('网络添加成功');
        } else {
          throw switchError;
        }
      }

      // 创建 provider 和 signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      console.log('Provider 创建成功');
      console.log('当前网络:', network.chainId.toString());

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());

      // 检查合约地址是否配置
      if (!CONTRACTS.FISH_TOKEN || !CONTRACTS.AQUARIUM) {
        console.warn('⚠️ 合约地址未配置，请先部署合约');
        alert('合约地址未配置！\n\n请先:\n1. 部署智能合约\n2. 在 .env 中配置合约地址\n3. 重启前端应用');
        return true; // 钱包连接成功，但合约未配置
      }

      // 初始化合约
      try {
        const fishTokenContract = new ethers.Contract(
          CONTRACTS.FISH_TOKEN,
          FISH_TOKEN_ABI,
          web3Signer
        );
        const aquariumContract = new ethers.Contract(
          CONTRACTS.AQUARIUM,
          AQUARIUM_ABI,
          web3Signer
        );

        setFishToken(fishTokenContract);
        setAquarium(aquariumContract);

        console.log('合约初始化成功');

        // 获取余额
        await updateBalances(accounts[0], web3Provider, fishTokenContract);
      } catch (contractError) {
        console.error('合约初始化失败:', contractError);
        alert('合约初始化失败！\n\n可能的原因:\n1. 合约地址错误\n2. 网络不匹配\n3. 合约未部署');
      }

      console.log('✅ 钱包连接成功');
      return true;

    } catch (error) {
      console.error('连接钱包失败:', error);
      
      let errorMessage = '连接失败: ';
      if (error.code === 4001) {
        errorMessage += '用户拒绝了连接请求';
      } else if (error.code === -32002) {
        errorMessage += 'MetaMask 请求待处理，请打开 MetaMask';
      } else {
        errorMessage += error.message || '未知错误';
      }
      
      alert(errorMessage);
      return false;

    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 更新余额
  const updateBalances = async (address, web3Provider, fishTokenContract) => {
    try {
      // 获取 BNB 余额
      const bnbBalance = await web3Provider.getBalance(address);
      
      // 获取 FISH 余额
      let fishBalance = ethers.parseEther('0');
      if (fishTokenContract) {
        try {
          fishBalance = await fishTokenContract.balanceOf(address);
        } catch (e) {
          console.warn('无法获取 FISH 余额:', e.message);
        }
      }

      setBalance({
        bnb: ethers.formatEther(bnbBalance),
        fish: ethers.formatEther(fishBalance)
      });

      console.log('余额更新:', {
        bnb: ethers.formatEther(bnbBalance),
        fish: ethers.formatEther(fishBalance)
      });

    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts) => {
      console.log('账户变化:', accounts);
      if (accounts.length === 0) {
        // 用户断开连接
        console.log('用户已断开连接');
        setAccount(null);
        setSigner(null);
        setFishToken(null);
        setAquarium(null);
        setBalance({ bnb: '0', fish: '0' });
      } else if (accounts[0] !== account) {
        // 用户切换账户
        console.log('用户切换账户到:', accounts[0]);
        setAccount(accounts[0]);
        if (provider && fishToken) {
          updateBalances(accounts[0], provider, fishToken);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      console.log('网络变化:', newChainId);
      // 刷新页面以重新初始化
      window.location.reload();
    };

    const handleDisconnect = () => {
      console.log('断开连接');
      setAccount(null);
      setSigner(null);
      setFishToken(null);
      setAquarium(null);
      setBalance({ bnb: '0', fish: '0' });
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, provider, fishToken]);

  // 自动重连（如果之前已连接）
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            console.log('检测到已连接的账户，自动重连...');
            await connectWallet();
          }
        } catch (error) {
          console.error('检查连接状态失败:', error);
        }
      }
    };
    checkConnection();
  }, [connectWallet]);

  // 刷新余额
  const refreshBalances = useCallback(async () => {
    if (account && provider && fishToken) {
      await updateBalances(account, provider, fishToken);
    }
  }, [account, provider, fishToken]);

  return {
    account,
    provider,
    signer,
    fishToken,
    aquarium,
    chainId,
    balance,
    isConnecting,
    connectWallet,
    refreshBalances
  };
};