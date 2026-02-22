## 是什么
ethers.js是一个用于与以太坊区块链交互的JavaScript库。它提供了简单易用的API，使开发人员能够轻松地与智能合约进行交互、发送交易和查询区块链数据。
## 和web3.js的区别
+ web3.js
    + 社区庞大，文档丰富
    + api设计相对复杂
    + 包体积较大
    + 对ts支持相对较弱
    + 在某些操作中直接暴露私钥，安全性相对较低
+ ethers.js
    + 社区规模较小但增长迅速
    + api设计简单易用
    + 包体积较小
    + 对ts支持更好
    + 提供了更多的辅助函数和工具，简化了开发过程
    + 模块化设计，按需导入
## 核心模块
+ Provider：作为与区块链节点通信的接口，负责读取区块链数据（如账户余额、交易记录、智能合约状态等）。
+ Wallet：用于创建和管理以太坊钱包，包括生成地址、签名交易等。
+ Signer：用于签署交易，确保交易的合法性和有效性。
+ Contract：用于与智能合约进行交互，调用合约的方法、监听事件等。
+ Utils：提供了一些辅助函数和工具，例如地址校验、金额转换等。
    + isAddress(address) // 校验地址是否合法
    + parseUnits(amount, unit) // 处理任意精度的代币，更灵活
    + formatUnits(weiAmount, unit) // 将wei转换为指定单位，更灵活
    + parseEther(etherAmount) // 专门处理以太币，将以太币转换为wei，相当于parseUnits(amount, 18)
    + formatEther(weiAmount) // 将wei转换为以太币
    + keccak256(data) // 计算keccak256哈希值
    + sha256(data) // 计算sha256哈希值
## 加密操作
+ 密码学保证了区块链上的交易和数据的完整性和真实性，防止了未经授权的访问和篡改。同样的内容生成的hash值是唯一的，因此可以用于验证数据的完整性。
+ ethers.js提供了一些加密相关的功能，例如生成随机数、计算哈希值、签名交易等。
    + keccak256(data) // 生成一个 256 位的哈希值
    + sha256(data) // 生成一个 256 位的哈希值
    
## 如何使用 ethers.js 连接到以太坊网络？请写出三种不同的连接方式。
```
// 1. 连接到 Infura
const provider = new ethers.providers.InfuraProvider('mainnet', 'PROJECT_ID');

// 2. 连接到 Alchemy
const provider = new ethers.providers.AlchemyProvider('mainnet', 'API_KEY');

// 3. 自定义 RPC 节点
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/PROJECT_ID');

// 4. 连接到用户钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
```
## Infura 和 Alchemy是什么，有什么区别？
Infura 和 Alchemy 都是区块链开发领域知名的 RPC 服务提供商，它们为开发者提供便捷接入以太坊、Polygon、Solana 等主流区块链网络的接口，无需本地搭建和维护区块链节点，降低了开发门槛
## parseEther 和 parseUnits 有什么区别？什么时候使用哪个？
+ parseEther(etherAmount) // 专门处理以太币，固定 18 位小数，等价于 parseUnits(amount, 18)
+ parseUnits(amount, unit) // 处理 ERC-20 代币时使用 parseUnits

## 如何连接到用户钱包？
```
// 连接到用户钱包
if(window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // 请求用户授权连接钱包
    const accounts = await provider.send({
        method: 'eth_requestAccounts',
        params: []
    });
    // 获取用户钱包的第一个地址，用于签署交易
    const signer = provider.getSigner(accounts[0]);
    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
}
```
## 如何使用 ethers.js 发送一笔 ETH 转账？
```
async function sendETH() {
    // 创建钱包
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // 构建交易
    const tx = {
        to: '0x...',
        value: ethers.utils.parseEther('0.1'),
        gasLimit: 21000,
        gasPrice: ethers.utils.parseUnits('20', 'gwei')
    };
    
    // 发送交易
    const txResponse = await wallet.sendTransaction(tx);
    
    // 等待确认
    const receipt = await txResponse.wait();
    return receipt;
}
```
版本差异
- Ethers.js v5 ：使用 ethers.utils.parseEther() 语法
- Ethers.js v6 ：使用 ethers.parseEther() 语法（函数直接从主对象导出）
- Ethers.js v6 对 API 进行了重构，将许多实用工具函数从 utils 命名空间直接移到了 ethers 主对象上，使得 API 更加扁平化和易用

## 如何监听智能合约的事件
```
import { ethers } from 'ethers';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
// 创建合约实例
const contract = new ethers.Contract(contractAddress, contractABI, signer);
// 监听合约事件
contract.on("Transfer", (from, to, value, event) => {
    console.log("捕获到转账事件：");
    console.log("发送方：", from);
    console.log("接收方：", to);
    console.log("金额（wei）：", value.toString());
    console.log("事件完整信息：", event); // 包含区块号、交易哈希等元数据

    // 前端更新逻辑（如添加到交易记录列表）
    updateTransactionList({ from, to, value: ethers.utils.formatEther(value) });
});
```
