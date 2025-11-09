import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  CURRENT_NETWORK, 
  CONTRACTS, 
  FISH_TOKEN_ABI, 
  AQUARIUM_ABI 
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

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask!');
      return false;
    }

    try {
      setIsConnecting(true);

      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // 检查并切换到 BSC 网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CURRENT_NETWORK.chainId }]
        });
      } catch (switchError) {
        // 如果网络不存在，添加它
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CURRENT_NETWORK]
          });
        } else {
          throw switchError;
        }
      }

      // 创建 provider 和 signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());

      // 初始化合约
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

      // 获取余额
      await updateBalances(accounts[0], web3Provider, fishTokenContract);

      console.log('✅ 钱包连接成功');
      return true;
    } catch (error) {
      console.error('连接钱包失败:', error);
      alert('连接失败: ' + error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // 更新余额
  const updateBalances = async (address, web3Provider, fishTokenContract) => {
    try {
      const bnbBalance = await web3Provider.getBalance(address);
      const fishBalance = await fishTokenContract.balanceOf(address);

      setBalance({
        bnb: ethers.formatEther(bnbBalance),
        fish: ethers.formatEther(fishBalance)
      });
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  // 监听账户和网络变化
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // 用户断开连接
        setAccount(null);
        setSigner(null);
        setFishToken(null);
        setAquarium(null);
      } else if (accounts[0] !== account) {
        // 用户切换账户
        setAccount(accounts[0]);
        if (provider && fishToken) {
          updateBalances(accounts[0], provider, fishToken);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      // 刷新页面以重新初始化
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, provider, fishToken]);

  // 自动重连
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });
        if (accounts.length > 0) {
          connectWallet();
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