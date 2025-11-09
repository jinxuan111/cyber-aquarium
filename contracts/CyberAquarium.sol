// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFishToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function mintGameReward(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

/**
 * @title CyberAquarium
 * @dev 赛博鱼缸主合约 - BSC 链上
 * 管理鱼类 NFT、繁殖、基因系统
 */
contract CyberAquarium is 
    ERC721,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable,
    ReentrancyGuard 
{
    IFishToken public fishToken;
    
    // 计数器
    uint256 private _nextTokenId;
    
    // 费用设置
    uint256 public breedingCost = 10 * 10**18;     // 10 FISH
    uint256 public mintingCost = 50 * 10**18;      // 50 FISH
    uint256 public cyberneticsCost = 5 * 10**18;   // 5 FISH
    
    // 冷却时间
    uint256 public breedingCooldown = 1 days;
    
    // 创世鱼数量
    uint256 public constant MAX_GENESIS = 1000;
    uint256 public genesisCount;
    
    struct Fish {
        uint256 id;
        bytes32 genesHash;          // 基因哈希
        uint8 generation;           // 世代
        uint256 birthTime;          // 出生时间
        uint256 lastBreedTime;      // 最后繁殖时间
        uint256 parent1;            // 父母1 ID
        uint256 parent2;            // 父母2 ID
        uint8 rarity;               // 稀有度: 0=普通 1=稀有 2=传奇
        bool isGenesis;             // 是否创世鱼
        uint8 cyberneticsCount;     // 赛博义体数量
    }
    
    // 鱼类数据存储
    mapping(uint256 => Fish) public fishes;
    
    // 用户持有的鱼
    mapping(address => uint256[]) private userFishes;
    
    // 繁殖记录
    mapping(bytes32 => bool) public breedingPairs;
    
    // 事件
    event FishMinted(address indexed owner, uint256 indexed tokenId, bool isGenesis);
    event FishBred(uint256 indexed parent1, uint256 indexed parent2, uint256 indexed childId);
    event CyberneticsInstalled(uint256 indexed tokenId, uint8 count);
    event RewardClaimed(address indexed user, uint256 amount);
    
    constructor(address _fishToken) 
        ERC721("Cyber Fish NFT", "CFISH") 
        Ownable(msg.sender) 
    {
        fishToken = IFishToken(_fishToken);
    }
    
    /**
     * @dev 铸造创世鱼
     */
    function mintGenesis(string memory tokenURI) external payable nonReentrant {
        require(genesisCount < MAX_GENESIS, "Genesis sold out");
        require(
            fishToken.transferFrom(msg.sender, address(this), mintingCost),
            "Transfer failed"
        );
        
        uint256 tokenId = _nextTokenId++;
        genesisCount++;
        
        // 生成随机基因
        bytes32 genes = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            tokenId,
            blockhash(block.number - 1)
        ));
        
        // 稀有度判定
        uint8 rarity = _determineRarity(genes);
        
        fishes[tokenId] = Fish({
            id: tokenId,
            genesHash: genes,
            generation: 0,
            birthTime: block.timestamp,
            lastBreedTime: 0,
            parent1: 0,
            parent2: 0,
            rarity: rarity,
            isGenesis: true,
            cyberneticsCount: 0
        });
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        userFishes[msg.sender].push(tokenId);
        
        emit FishMinted(msg.sender, tokenId, true);
    }
    
    /**
     * @dev 繁殖系统
     */
    function breed(
        uint256 parent1Id,
        uint256 parent2Id,
        string memory tokenURI
    ) external nonReentrant returns (uint256) {
        require(ownerOf(parent1Id) == msg.sender, "Not owner of parent1");
        require(ownerOf(parent2Id) == msg.sender, "Not owner of parent2");
        require(parent1Id != parent2Id, "Cannot breed with itself");
        
        Fish storage parent1 = fishes[parent1Id];
        Fish storage parent2 = fishes[parent2Id];
        
        // 检查冷却时间
        require(
            block.timestamp >= parent1.lastBreedTime + breedingCooldown,
            "Parent1 on cooldown"
        );
        require(
            block.timestamp >= parent2.lastBreedTime + breedingCooldown,
            "Parent2 on cooldown"
        );
        
        // 收取繁殖费用（燃烧）
        fishToken.transferFrom(msg.sender, address(this), breedingCost);
        fishToken.burn(breedingCost);
        
        // 生成子代
        uint256 childId = _nextTokenId++;
        
        // 基因遗传和突变
        bytes32 childGenes = _inheritGenes(
            parent1.genesHash,
            parent2.genesHash,
            childId
        );
        
        uint8 generation = parent1.generation > parent2.generation
            ? parent1.generation + 1
            : parent2.generation + 1;
        
        uint8 rarity = _determineRarity(childGenes);
        
        fishes[childId] = Fish({
            id: childId,
            genesHash: childGenes,
            generation: generation,
            birthTime: block.timestamp,
            lastBreedTime: 0,
            parent1: parent1Id,
            parent2: parent2Id,
            rarity: rarity,
            isGenesis: false,
            cyberneticsCount: 0
        });
        
        // 更新父母繁殖时间
        parent1.lastBreedTime = block.timestamp;
        parent2.lastBreedTime = block.timestamp;
        
        _safeMint(msg.sender, childId);
        _setTokenURI(childId, tokenURI);
        
        userFishes[msg.sender].push(childId);
        
        // 记录繁殖对
        bytes32 pairHash = keccak256(abi.encodePacked(parent1Id, parent2Id));
        breedingPairs[pairHash] = true;
        
        emit FishBred(parent1Id, parent2Id, childId);
        
        // 繁殖奖励
        if (rarity == 2) {
            // 传奇鱼奖励 50 FISH
            fishToken.mintGameReward(msg.sender, 50 * 10**18);
        } else if (rarity == 1) {
            // 稀有鱼奖励 10 FISH
            fishToken.mintGameReward(msg.sender, 10 * 10**18);
        }
        
        return childId;
    }
    
    /**
     * @dev 安装赛博义体
     */
    function installCybernetics(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        
        Fish storage fish = fishes[tokenId];
        require(fish.cyberneticsCount < 5, "Max cybernetics reached");
        
        fishToken.transferFrom(msg.sender, address(this), cyberneticsCost);
        fishToken.burn(cyberneticsCost);
        
        fish.cyberneticsCount++;
        
        emit CyberneticsInstalled(tokenId, fish.cyberneticsCount);
    }
    
    /**
     * @dev 获取用户所有鱼
     */
    function getUserFishes(address user) external view returns (uint256[] memory) {
        return userFishes[user];
    }
    
    /**
     * @dev 获取鱼的详细信息
     */
    function getFishInfo(uint256 tokenId) external view returns (Fish memory) {
        return fishes[tokenId];
    }
    
    /**
     * @dev 基因遗传算法
     */
    function _inheritGenes(
        bytes32 parent1Genes,
        bytes32 parent2Genes,
        uint256 seed
    ) private view returns (bytes32) {
        bytes32 inherited = keccak256(abi.encodePacked(
            parent1Genes,
            parent2Genes,
            seed,
            block.timestamp
        ));
        
        // 5% 突变概率
        if (uint256(inherited) % 100 < 5) {
            inherited = keccak256(abi.encodePacked(inherited, "MUTATION"));
        }
        
        return inherited;
    }
    
    /**
     * @dev 稀有度判定
     */
    function _determineRarity(bytes32 genes) private pure returns (uint8) {
        uint256 value = uint256(genes) % 100;
        
        if (value >= 98) return 2;  // 2% 传奇
        if (value >= 85) return 1;  // 13% 稀有
        return 0;                    // 85% 普通
    }
    
    /**
     * @dev 更新费用
     */
    function updateCosts(
        uint256 _breedingCost,
        uint256 _mintingCost,
        uint256 _cyberneticsCost
    ) external onlyOwner {
        breedingCost = _breedingCost;
        mintingCost = _mintingCost;
        cyberneticsCost = _cyberneticsCost;
    }
    
    /**
     * @dev 更新冷却时间
     */
    function updateCooldown(uint256 _cooldown) external onlyOwner {
        breedingCooldown = _cooldown;
    }
    
    /**
     * @dev 提取合约中的代币
     */
    function withdrawTokens() external onlyOwner {
        uint256 balance = fishToken.balanceOf(address(this));
        fishToken.transferFrom(address(this), owner(), balance);
    }
    
    // 必需的重写函数
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}