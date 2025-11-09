const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署到 BSC...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.provider.getBalance(deployer.address)).toString(), "wei\n");

  // 1. 部署 FishToken
  console.log("📝 部署 FishToken ($FISH)...");
  const FishToken = await hre.ethers.getContractFactory("FishToken");
  const fishToken = await FishToken.deploy();
  await fishToken.waitForDeployment();
  const fishTokenAddress = await fishToken.getAddress();
  console.log("✅ FishToken 部署成功:", fishTokenAddress);
  console.log("   - 总供应量:", await fishToken.totalSupply());
  console.log("   - 名称:", await fishToken.name());
  console.log("   - 符号:", await fishToken.symbol(), "\n");

  // 2. 部署 CyberAquarium
  console.log("📝 部署 CyberAquarium...");
  const CyberAquarium = await hre.ethers.getContractFactory("CyberAquarium");
  const aquarium = await CyberAquarium.deploy(fishTokenAddress);
  await aquarium.waitForDeployment();
  const aquariumAddress = await aquarium.getAddress();
  console.log("✅ CyberAquarium 部署成功:", aquariumAddress);
  console.log("   - NFT 名称:", await aquarium.name());
  console.log("   - NFT 符号:", await aquarium.symbol(), "\n");

  // 3. 设置权限
  console.log("⚙️  配置合约权限...");
  const setMinterTx = await fishToken.setGameMinter(aquariumAddress, true);
  await setMinterTx.wait();
  console.log("✅ CyberAquarium 已授予铸币权限\n");

  // 4. 输出部署信息
  console.log("=" .repeat(60));
  console.log("🎉 部署完成!");
  console.log("=" .repeat(60));
  console.log("\n📋 合约地址:");
  console.log("   FishToken:      ", fishTokenAddress);
  console.log("   CyberAquarium:  ", aquariumAddress);
  
  console.log("\n🔧 配置信息:");
  console.log("   网络:", hre.network.name);
  console.log("   Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("   繁殖费用:", await aquarium.breedingCost(), "wei");
  console.log("   铸造费用:", await aquarium.mintingCost(), "wei");
  
  console.log("\n💡 下一步:");
  console.log("   1. 保存合约地址到 .env 文件");
  console.log("   2. 在 BSCScan 上验证合约:");
  console.log(`      npx hardhat verify --network ${hre.network.name} ${fishTokenAddress}`);
  console.log(`      npx hardhat verify --network ${hre.network.name} ${aquariumAddress} ${fishTokenAddress}`);
  console.log("   3. 添加流动性到 PancakeSwap");
  console.log("   4. 更新前端配置文件");
  
  console.log("\n📝 .env 配置:");
  console.log(`REACT_APP_FISH_TOKEN_ADDRESS=${fishTokenAddress}`);
  console.log(`REACT_APP_AQUARIUM_CONTRACT_ADDRESS=${aquariumAddress}`);
  console.log(`REACT_APP_CHAIN_ID=${(await hre.ethers.provider.getNetwork()).chainId}`);
  
  console.log("\n" + "=".repeat(60) + "\n");

  // 5. 保存部署信息到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FishToken: fishTokenAddress,
      CyberAquarium: aquariumAddress
    }
  };
  
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`✅ 部署信息已保存到 deployments-${hre.network.name}.json\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });