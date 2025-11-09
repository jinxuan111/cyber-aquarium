#!/bin/bash

echo "🐟 Cyber Aquarium - 项目初始化脚本"
echo "===================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 创建 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并填入你的私钥和 API keys!"
else
    echo "✅ .env 文件已存在"
fi

# 创建前端目录结构
echo ""
echo "📁 创建前端目录结构..."
mkdir -p frontend/src/components
mkdir -p frontend/src/hooks
mkdir -p frontend/src/utils
mkdir -p frontend/public

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

# 编译合约
echo ""
echo "🔨 编译智能合约..."
npx hardhat compile

echo ""
echo "===================================="
echo "🎉 初始化完成!"
echo ""
echo "📋 下一步:"
echo "   1. 编辑 .env 文件，填入你的私钥"
echo "   2. 获取 BSC 测试网 BNB:"
echo "      https://testnet.binance.org/faucet-smart"
echo "   3. 部署合约:"
echo "      npm run deploy:testnet"
echo "   4. 更新前端配置 (.env 中的合约地址)"
echo "   5. 启动前端:"
echo "      npm run frontend"
echo ""
echo "📖 查看 README.md 获取详细文档"
echo "===================================="