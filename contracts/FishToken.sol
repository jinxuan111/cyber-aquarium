// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FishToken
 * @dev 赛博鱼缸治理代币 $FISH (BEP20)
 * 部署在 BSC 链上
 */
contract FishToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 10亿枚
    
    // 代币分配
    uint256 public constant TEAM_ALLOCATION = 100_000_000 * 10**18;      // 10% 团队
    uint256 public constant LIQUIDITY_ALLOCATION = 200_000_000 * 10**18; // 20% 流动性
    uint256 public constant GAME_REWARDS = 500_000_000 * 10**18;         // 50% 游戏奖励
    uint256 public constant COMMUNITY = 200_000_000 * 10**18;            // 20% 社区
    
    // 游戏合约（有铸币权限）
    mapping(address => bool) public gameMinters;
    
    // 已铸造的游戏奖励
    uint256 public totalGameRewardsMinted;
    
    event GameMinterUpdated(address indexed minter, bool status);
    event GameRewardMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("Cyber Fish Token", "FISH") Ownable(msg.sender) {
        // 初始分配
        _mint(msg.sender, TEAM_ALLOCATION);
        _mint(msg.sender, LIQUIDITY_ALLOCATION);
        _mint(msg.sender, COMMUNITY);
    }
    
    /**
     * @dev 设置游戏合约铸币权限
     */
    function setGameMinter(address minter, bool status) external onlyOwner {
        gameMinters[minter] = status;
        emit GameMinterUpdated(minter, status);
    }
    
    /**
     * @dev 游戏合约铸造奖励代币
     */
    function mintGameReward(address to, uint256 amount) external {
        require(gameMinters[msg.sender], "FishToken: Not authorized minter");
        require(
            totalGameRewardsMinted + amount <= GAME_REWARDS,
            "FishToken: Exceeds game rewards allocation"
        );
        
        totalGameRewardsMinted += amount;
        _mint(to, amount);
        
        emit GameRewardMinted(to, amount);
    }
    
    /**
     * @dev 批量空投
     */
    function airdrop(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(recipients.length == amounts.length, "FishToken: Length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }
}