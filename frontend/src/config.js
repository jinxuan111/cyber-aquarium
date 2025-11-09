// BSC 网络配置
export const BSC_TESTNET = {
  chainId: '0x61', // 97 in hex
  chainName: 'BSC Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com']
};

export const BSC_MAINNET = {
  chainId: '0x38', // 56 in hex
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org'],
  blockExplorerUrls: ['https://bscscan.com']
};

// 合约地址 (部署后填入)
export const CONTRACTS = {
  FISH_TOKEN: process.env.REACT_APP_FISH_TOKEN_ADDRESS || '',
  AQUARIUM: process.env.REACT_APP_AQUARIUM_CONTRACT_ADDRESS || ''
};

// 当前使用的网络
export const CURRENT_NETWORK = process.env.REACT_APP_CHAIN_ID === '56' 
  ? BSC_MAINNET 
  : BSC_TESTNET;

// FishToken ABI (简化版)
export const FISH_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// CyberAquarium ABI (简化版)
export const AQUARIUM_ABI = [
  "function mintGenesis(string memory tokenURI) payable",
  "function breed(uint256 parent1Id, uint256 parent2Id, string memory tokenURI) returns (uint256)",
  "function installCybernetics(uint256 tokenId)",
  "function getUserFishes(address user) view returns (uint256[])",
  "function getFishInfo(uint256 tokenId) view returns (tuple(uint256 id, bytes32 genesHash, uint8 generation, uint256 birthTime, uint256 lastBreedTime, uint256 parent1, uint256 parent2, uint8 rarity, bool isGenesis, uint8 cyberneticsCount))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function breedingCost() view returns (uint256)",
  "function mintingCost() view returns (uint256)",
  "function cyberneticsCost() view returns (uint256)",
  "event FishMinted(address indexed owner, uint256 indexed tokenId, bool isGenesis)",
  "event FishBred(uint256 indexed parent1, uint256 indexed parent2, uint256 indexed childId)"
];

// PancakeSwap Router (用于添加流动性)
export const PANCAKESWAP_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E'; // BSC Mainnet
export const PANCAKESWAP_ROUTER_TESTNET = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'; // BSC Testnet

// 游戏配置
export const GAME_CONFIG = {
  INITIAL_ENERGY: 1000,
  ENERGY_REGEN_RATE: 1, // 每秒恢复
  FISH_ENERGY_COST: 0.1, // 每条鱼每秒消耗
  BREEDING_COOLDOWN: 86400, // 1 天 (秒)
  MAX_CYBERNETICS: 5
};