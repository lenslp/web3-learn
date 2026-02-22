## 区块链基础知识
1. 解释PoW、PoS、PoA、DPOW的区别和典型案例
    + PoW：工作量证明，通过解决复杂数学难题来竞争记账权，验证交易，获得奖励。典型案例：比特币、以太坊1.0
    + PoS：权益证明，按 “质押代币数量 + 时间” 分配记账权，质押越多、越久，机会越大。典型案例：以太坊2.0、Solana
    + DPoW：委托工作量证明，是 PoW 的一种变种，引入了委托机制
        - 双层验证：区块先在主网通过 PoW 生成，生成的区块被发送到一组委托的公证人节点，公证人节点对区块进行再次验证并签名
        - 优点：
            - 更加安全，攻击者要篡改被DPoW保护的区块链，不仅需要控制主链51%以上的算力，还需要同时能够修改比特币区块链上已经公证的区块证明；
            - 公证人节点分布在全球不同地区，进一步提高攻击难度
    + DPoS：委托权益证明，是 PoS 共识机制的一种改进版本
        - 代币持有者投票选举出一定数量的代表节点，这些代表节点负责验证交易和打包区块
        - 优点：交易速度快，能源消耗低，通过投票机制实现社区治理
        - 缺点：中心化程度高，易造成垄断
    + PoA：权威证明，基于身份和声誉的共识机制，通过预先选定的权威节点来验证交易，获得奖励。依赖节点可信度。典型案例：EOS、TRON。适用于企业内部或联盟间的区块链
2. 什么是双花攻击？
    + 双花攻击是指同一笔钱被重复花费的情况，例如一个人在交易中使用了自己的比特币，然后在另一个交易中又使用了相同的比特币。
    + 出现原因
        + 交易确认延迟：由于区块链的确认机制，交易需要等待一定的时间才能被确认，这就给双花攻击提供了机会。
        + 网络分叉现象：当多个节点同时开始挖矿时，可能会出现网络分叉现象，导致不同的区块被添加到区块链中。
    + 防范：
        + 交易验证：每个交易都需要被验证，确保交易的合法性和有效性。
        + 双花检测：通过记录所有交易并验证交易的顺序，来检测是否存在双花攻击。
        + 奖励机制：如果检测到双花攻击，相关的交易将被拒绝或撤销，并且相关的奖励将被取消。
3. 区块链的不可篡改性是如何实现的？
    + 区块链的不可篡改性是通过分布式账本和加密算法实现的。
    + 每个交易都被记录在一个区块中，并且每个区块都包含了前一个区块的哈希值。
    + 当一个新的交易被添加到区块链中时，它会被包含在一个新的区块中，并且这个新区块的哈希值会被包含在前一个区块中。
    + 这意味着，如果一个区块中的数据被篡改，那么这个区块的哈希值就会改变，而这个改变会被传递到后续的区块中。
    + 因此，要篡改一个区块中的数据，就需要改变这个区块以及后续的所有区块的哈希值，这是非常困难的。
    + 除此之外，即使攻击者重新计算了后续区块的哈希，仍需突破区块链的 共识机制 和 全网节点验证，这才是防御篡改的关键。
4. 什么是Gas费？为什么需要Gas？
    + Gas费是指在以太坊网络中执行智能合约或发送交易时需要支付的费用。
    + 每个操作都需要消耗一定的Gas，而Gas的价格是根据市场供需动态调整的。
    + 为什么需要Gas？
        + 防止滥用：Gas费可以防止用户滥用网络资源，例如发送大量的交易或执行复杂的智能合约，增加成本。
        + 确保网络安全：Gas费可以确保网络的安全，防止恶意用户利用网络资源进行攻击。
        + 激励矿工参与网络维护：Gas费可以作为激励机制，鼓励矿工参与网络的维护和安全运行。
5. 解释公钥、私钥、助记词的关系
    + 地址：用户在区块链网络中的唯一标识符，用于接收和发送加密货币。
    + 公钥：用于验证交易的发送者身份，通过公钥可以推导出用户的地址。
    + 私钥：用于签署交易，确保交易的合法性和有效性
    + 助记词：用于恢复私钥，方便用户备份和管理私钥
## 钱包集成与交互
1. 钱包
    + 钱包是用户存储和管理加密货币的工具，包括私钥、公钥、地址等。
        + 地址：用户在区块链网络中的唯一标识符，用于接收和发送加密货币。
        + 私钥：用户的唯一凭证，用于签署交易，确保交易的合法性和有效性。
        + 助记词：用于恢复私钥，方便用户备份和管理私钥。
        + 公钥：用于验证交易的发送者身份，通过公钥可以推导出用户的地址。
    + 钱包可以分为软件钱包（如MetaMask、WalletConnect、OKX Wallet、Trust Wallet等）和硬件钱包（如Ledger、Trezor OneKey等）。
2. 如何检测用户是否安装了钱包？
```
function isWalletInstalled() {
    return typeof window.ethereum !== 'undefined';
}
```
3. 钱包连接、断开连接的处理
```
function connectWallet() {
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
    });
    return accounts[0];
}
// 监听账户变化
window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
        // 用户断开连接
    } else {
        // 切换账户
    }
});
```
4. 如何获取用户的钱包地址？
```
function getWalletAddress() {
    if (isWalletInstalled()) {
        return window.ethereum.selectedAddress;
    }
    return null;
}
```
5. 如何获取钱包的余额？
```
function getWalletBalance() {
        const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [钱包地址, 'latest']
        });
        // 转换为 ETH（用 ethers.js 或手动除以 1e18）
        return ethers.utils.formatEther(balance);
}
```
## Web3.js / Ethers.js 使用
1. 两个库的区别和选择理由
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
    + 安全性高，不会直接暴露私钥
```
// 面试官常问：如何调用智能合约方法？
import { ethers } from 'ethers';
// 1.连接提供者
const provider = new ethers.providers.Web3Provider(window.ethereum); // v5
const provider = new ethers.providers.BrowserProvider(window.ethereum); // v6
// 获取签名者
const signer = provider.getSigner();
// 创建合约实例
const contract = new ethers.Contract(contractAddress, abi, signer);
// 获取合约余额
const balance = await contract.balanceOf(userAddress);
// 调用合约方法
const tx = await contract.transfer(toAddress, amount);
// 等待交易确认
await tx.wait(); 
```
2. ABI的作用和结构
    + ABI（Application Binary Interface）是以太坊智能合约的接口描述
    主要作用是：
     - 定义智能合约与外部世界（包括DApp前端、其他合约）之间的交互规范。
     - 将合约的方法和事件转换为计算机可以理解的二进制格式，以便在以太坊网络上进行交互。
    + ABI的结构是一个JSON数组，每个元素代表合约的一个方法、事件或状态变量。
    + 每个元素都包含了方法的名称、参数类型和返回值类型等信息。

3. ethers.js 核心模块是什么？
    + Provider：作为与区块链节点通信的接口，负责读取区块链数据（如账户余额、交易记录、余额等）。
    + Wallet：本地钱包管理，用于签署交易和管理私钥。
    + Signer：用于签署交易，确保交易的合法性和有效性。
    + Contract：用于与智能合约进行交互，调用合约的方法、监听事件等。
    + Utils：提供了一些辅助函数和工具，例如地址校验、金额转换等。

4. 什么时候使用不同类型的Provider？
    + 当需要连接特定自定义节点，使用`ethers.providers.JsonRpcProvider`。
    + 当需要与Infura等节点进行交互时，使用`ethers.providers.InfuraProvider`。
    + 当需要与Alchemy等节点进行交互时，使用`ethers.providers.AlchemyProvider`。
    + 当需要连接用户钱包，使用`ethers.providers.Web3Provider / ethers.providers.BrowserProvider`。

## 知名的公链和特点
1. Ethereum
    + 智能合约平台，支持开发者构建去中心化应用（DApps）
    + 每个区块包含多个交易，需矿工通过 PoW（合并前）/PoS（合并后）共识打包确认
    + 交易需支付 Gas 费，费用高低影响打包优先级，用于激励网络维护者
2. 比特币（Bitcoin）
    + 去中心化的数字货币，基于区块链技术
    + 每个区块包含多个交易，通过 PoW 共识机制由矿工打包确认，区块间隔约 10 分钟
    + 不支持原生智能合约
4. Solana
    + 基于Rust的区块链平台，强调高吞吐量和低延迟
    + 采用 PoH（历史证明）+ PoS（权益证明）混合共识，无需挖矿，交易确认速度快
    + 支持智能合约开发，主要使用 Rust 语言，合约运行在 Sealevel 虚拟机上
