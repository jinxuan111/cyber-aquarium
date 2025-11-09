# 🐟 Cyber Aquarium - 赛博鱼缸

基于 BSC 链的 GameFi + NFT 项目

## 📋 项目简介

赛博鱼缸是一个创新的区块链游戏,结合了:
- **NFT 系统**: 每条鱼都是独特的 ERC-721 NFT
- **代币经济**: $FISH (BEP-20) 治理代币
- **繁殖系统**: 基因遗传和突变机制
- **Play-to-Earn**: 通过养鱼获得奖励
- **赛博朋克美学**: 霓虹、故障艺术、全息界面

## 🏗️ 项目结构

```
cyber-aquarium/
├── contracts/              # 智能合约
│   ├── FishToken.sol      # $FISH 代币合约
│   └── CyberAquarium.sol  # 主游戏合约
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── hooks/        # React Hooks
│   │   ├── config.js     # 配置文件
│   │   └── App.js        # 主应用
│   └── public/
├── scripts/               # 部署脚本
│   └── deploy.js
├── test/                  # 测试文件
├── hardhat.config.js      # Hardhat 配置
├── package.json
└── .env                   # 环境变量
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 16.x
- npm 或 yarn
- MetaMask 钱包
- BSC 测试网 BNB (从水龙头获取)

### 2. 安装依赖

```bash
# 克隆项目
git clone <your-repo>
cd cyber-aquarium

# 安装所有依赖
npm run install-all

# 或者分别安装
npm install              # 安装合约依赖
cd frontend && npm install  # 安装前端依赖
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填入配置:

```bash
cp .env.example .env
```

编辑 `.env`:
```env
# 你的钱包私钥 (不要泄露!)
PRIVATE_KEY=your_private_key_here

# BSCScan API Key (用于验证合约)
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### 4. 编译合约

```bash
npx hardhat compile
```

### 5. 部署到 BSC 测试网

```bash
# 确保钱包有足够的测试网 BNB
npx hardhat run scripts/deploy.js --network bscTestnet
```

部署成功后会看到:
```
✅ FishToken 部署成功: 0x...
✅ CyberAquarium 部署成功: 0x...
```

保存这些地址到 `.env`:
```env
REACT_APP_FISH_TOKEN_ADDRESS=0x...
REACT_APP_AQUARIUM_CONTRACT_ADDRESS=0x...
REACT_APP_CHAIN_ID=97
```

### 6. 验证合约 (可选但推荐)

```bash
npx hardhat verify --network bscTestnet <FishToken地址>
npx hardhat verify --network bscTestnet <Aquarium地址> <FishToken地址>
```

### 7. 启动前端

```bash
cd frontend
npm start
```

访问 `http://localhost:3000`

## 🎮 游戏功能

### 代币系统

**$FISH Token (BEP-20)**
- 总供应: 10 亿枚
- 分配:
  - 10% 团队
  - 20% 流动性
  - 50% 游戏奖励
  - 20% 社区

### NFT 系统

**鱼类 NFT (ERC-721)**
- 每条鱼都是独特的 NFT
- 链上存储基因哈希
- IPFS 存储元数据和图像

### 繁殖机制

1. 选择两条鱼作为父母
2. 支付 10 $FISH (燃烧)
3. 基因遗传 + 5% 突变概率
4. 繁殖传奇鱼获得 50 $FISH 奖励

### 稀有度系统

- **普通** (85%): 基础鱼
- **稀有** (13%): 特殊基因
- **传奇** (2%): 极其罕见

### 赛博义体

- 每条鱼最多安装 5 个义体
- 每个义体 5 $FISH
- 提升鱼的能力

## 🔧 开发指南

### 本地测试

```bash
# 启动本地节点
npx hardhat node

# 在另一个终端部署
npx hardhat run scripts/deploy.js --network localhost

# 运行测试
npx hardhat test
```

### 合约交互

使用 Hardhat Console:
```bash
npx hardhat console --network bscTestnet

> const FishToken = await ethers.getContractFactory("FishToken")
> const fish = await FishToken.attach("0x...")
> await fish.balanceOf("0x...")
```

### 添加新功能

1. 修改合约: `contracts/*.sol`
2. 重新编译: `npx hardhat compile`
3. 更新部署脚本: `scripts/deploy.js`
4. 更新前端 ABI: `frontend/src/config.js`

## 📊 经济模型

### 收入来源
- 繁殖费用 (燃烧)
- NFT 铸造费用
- 赛博义体安装费用

### 支出
- 游戏奖励 (繁殖传奇鱼)
- 质押收益
- 流动性挖矿

### 通缩机制
- 繁殖费用 100% 燃烧
- 部分交易费用燃烧

## 🔐 安全提示

**⚠️ 重要提醒:**

1. **永远不要提交私钥到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - 使用环境变量管理敏感信息

2. **智能合约审计**
   - 主网部署前必须审计
   - 推荐: CertiK, SlowMist, PeckShield

3. **测试充分**
   - 在测试网上充分测试
   - 使用 Hardhat 本地测试

4. **限制权限**
   - 使用多签钱包管理合约
   - 考虑时间锁机制

## 🌐 网络信息

### BSC 测试网
- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545
- 浏览器: https://testnet.bscscan.com
- 水龙头: https://testnet.binance.org/faucet-smart

### BSC 主网
- Chain ID: 56
- RPC: https://bsc-dataseed1.binance.org
- 浏览器: https://bscscan.com

## 📚 资源链接

- **BSC 文档**: https://docs.bnbchain.org
- **Hardhat 文档**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com
- **Ethers.js**: https://docs.ethers.org
- **PancakeSwap**: https://pancakeswap.finance

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 🎯 路线图

### Phase 1: MVP (当前)
- ✅ 基础合约
- ✅ 代币发行
- ✅ NFT 铸造
- ✅ 繁殖系统

### Phase 2: 扩展
- [ ] PvP 竞技场
- [ ] 质押系统
- [ ] DAO 治理
- [ ] 移动端支持

### Phase 3: 元宇宙
- [ ] 3D 鱼缸
- [ ] VR 支持
- [ ] 跨链桥
- [ ] 社交功能

## 💬 联系方式

- Discord: [待建立]
- Twitter: [待建立]
- Telegram: [待建立]

---

**Happy Coding! 🚀**