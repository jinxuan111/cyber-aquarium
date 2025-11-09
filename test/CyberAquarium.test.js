const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Cyber Aquarium Tests", function () {
  let fishToken, aquarium;
  let owner, user1, user2;
  
  beforeEach(async function () {
    // 获取签名者
    [owner, user1, user2] = await ethers.getSigners();
    
    // 部署 FishToken
    const FishToken = await ethers.getContractFactory("FishToken");
    fishToken = await FishToken.deploy();
    await fishToken.waitForDeployment();
    
    // 部署 CyberAquarium
    const CyberAquarium = await ethers.getContractFactory("CyberAquarium");
    aquarium = await CyberAquarium.deploy(await fishToken.getAddress());
    await aquarium.waitForDeployment();
    
    // 授予 Aquarium 铸币权限
    await fishToken.setGameMinter(await aquarium.getAddress(), true);
    
    // 给测试用户一些 FISH
    await fishToken.transfer(user1.address, ethers.parseEther("1000"));
    await fishToken.transfer(user2.address, ethers.parseEther("1000"));
  });
  
  describe("FishToken", function () {
    it("应该正确部署", async function () {
      expect(await fishToken.name()).to.equal("Cyber Fish Token");
      expect(await fishToken.symbol()).to.equal("FISH");
    });
    
    it("应该有正确的初始供应", async function () {
      const totalSupply = await fishToken.totalSupply();
      const expected = ethers.parseEther("300000000"); // 3亿枚初始
      expect(totalSupply).to.equal(expected);
    });
    
    it("应该允许授权的合约铸造奖励", async function () {
      const amount = ethers.parseEther("100");
      await aquarium.connect(owner).mintingCost();
      
      // 检查铸币权限
      expect(await fishToken.gameMinters(await aquarium.getAddress())).to.be.true;
    });
  });
  
  describe("CyberAquarium", function () {
    it("应该正确部署", async function () {
      expect(await aquarium.name()).to.equal("Cyber Fish NFT");
      expect(await aquarium.symbol()).to.equal("CFISH");
    });
    
    it("应该能够铸造创世鱼", async function () {
      const mintCost = await aquarium.mintingCost();
      
      // 批准支付
      await fishToken.connect(user1).approve(await aquarium.getAddress(), mintCost);
      
      // 铸造
      await expect(
        aquarium.connect(user1).mintGenesis("ipfs://test")
      ).to.emit(aquarium, "FishMinted");
      
      // 检查所有权
      expect(await aquarium.ownerOf(0)).to.equal(user1.address);
      
      // 检查鱼的信息
      const fishInfo = await aquarium.getFishInfo(0);
      expect(fishInfo.generation).to.equal(0);
      expect(fishInfo.isGenesis).to.be.true;
    });
    
    it("应该能够繁殖鱼", async function () {
      // 先铸造两条创世鱼
      const mintCost = await aquarium.mintingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        mintCost * 2n
      );
      
      await aquarium.connect(user1).mintGenesis("ipfs://test1");
      await aquarium.connect(user1).mintGenesis("ipfs://test2");
      
      // 快进时间 (跳过冷却期)
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 天
      await ethers.provider.send("evm_mine");
      
      // 批准繁殖费用
      const breedCost = await aquarium.breedingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        breedCost
      );
      
      // 繁殖
      await expect(
        aquarium.connect(user1).breed(0, 1, "ipfs://child")
      ).to.emit(aquarium, "FishBred");
      
      // 检查子代
      const childInfo = await aquarium.getFishInfo(2);
      expect(childInfo.generation).to.equal(1);
      expect(childInfo.parent1).to.equal(0);
      expect(childInfo.parent2).to.equal(1);
      expect(childInfo.isGenesis).to.be.false;
    });
    
    it("不应该允许在冷却期内繁殖", async function () {
      // 铸造两条鱼
      const mintCost = await aquarium.mintingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        mintCost * 2n
      );
      
      await aquarium.connect(user1).mintGenesis("ipfs://test1");
      await aquarium.connect(user1).mintGenesis("ipfs://test2");
      
      // 尝试立即繁殖 (应该失败)
      const breedCost = await aquarium.breedingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        breedCost
      );
      
      await expect(
        aquarium.connect(user1).breed(0, 1, "ipfs://child")
      ).to.be.revertedWith("Parent1 on cooldown");
    });
    
    it("应该能够安装赛博义体", async function () {
      // 铸造鱼
      const mintCost = await aquarium.mintingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        mintCost
      );
      await aquarium.connect(user1).mintGenesis("ipfs://test");
      
      // 安装义体
      const cyberCost = await aquarium.cyberneticsCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        cyberCost
      );
      
      await expect(
        aquarium.connect(user1).installCybernetics(0)
      ).to.emit(aquarium, "CyberneticsInstalled");
      
      // 检查义体数量
      const fishInfo = await aquarium.getFishInfo(0);
      expect(fishInfo.cyberneticsCount).to.equal(1);
    });
    
    it("不应该允许安装超过 5 个义体", async function () {
      // 铸造鱼
      const mintCost = await aquarium.mintingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        mintCost
      );
      await aquarium.connect(user1).mintGenesis("ipfs://test");
      
      // 安装 5 个义体
      const cyberCost = await aquarium.cyberneticsCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        cyberCost * 6n
      );
      
      for (let i = 0; i < 5; i++) {
        await aquarium.connect(user1).installCybernetics(0);
      }
      
      // 尝试安装第 6 个 (应该失败)
      await expect(
        aquarium.connect(user1).installCybernetics(0)
      ).to.be.revertedWith("Max cybernetics reached");
    });
    
    it("应该正确返回用户的鱼", async function () {
      // 铸造 3 条鱼
      const mintCost = await aquarium.mintingCost();
      await fishToken.connect(user1).approve(
        await aquarium.getAddress(),
        mintCost * 3n
      );
      
      await aquarium.connect(user1).mintGenesis("ipfs://test1");
      await aquarium.connect(user1).mintGenesis("ipfs://test2");
      await aquarium.connect(user1).mintGenesis("ipfs://test3");
      
      const userFishes = await aquarium.getUserFishes(user1.address);
      expect(userFishes.length).to.equal(3);
    });
  });
  
  describe("权限控制", function () {
    it("只有 owner 可以更新费用", async function () {
      await expect(
        aquarium.connect(user1).updateCosts(
          ethers.parseEther("20"),
          ethers.parseEther("100"),
          ethers.parseEther("10")
        )
      ).to.be.reverted;
      
      // Owner 可以更新
      await aquarium.connect(owner).updateCosts(
        ethers.parseEther("20"),
        ethers.parseEther("100"),
        ethers.parseEther("10")
      );
      
      expect(await aquarium.breedingCost()).to.equal(ethers.parseEther("20"));
    });
    
    it("只有授权的合约可以铸造奖励", async function () {
      await expect(
        fishToken.connect(user1).mintGameReward(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("FishToken: Not authorized minter");
    });
  });
});