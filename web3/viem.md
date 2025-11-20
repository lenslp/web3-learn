### PublicClient、createPublicClient
+ 用于与区块链网络进行 只读交互。它允许应用程序连接到区块链节点，查询区块链数据和状态，而不需要发送交易或修改区块链状态。
```typescript
import { sepolia } from "viem/chains";
import { PublicClient, createPublicClient, http } from 'viem'

export const viemClients = (chaiId: number): PublicClient => {
  const clients: {
    [key: number]: PublicClient
  } = {
    [sepolia.id]: createPublicClient({
      chain: sepolia,
      transport: http('https://sepolia.infura.io/v3/d8ed0bd1de8242d998a1405b6932ab33')
    })
  }
  return clients[chaiId]
}
```

### getContract
+ 获取合约
```typescript
import { getContract } from 'viem'

const c = getContract({
    abi,
    address,
    client: {
      public: viemClients(chainId),
      wallet: signer,
    },
})
```
