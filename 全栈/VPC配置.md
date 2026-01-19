# AWS VPC Serverless（Lambda/Node.js）部署网络配置文档（1 公有 + 3 私有 + NAT 出网）

> 目标：在一个 VPC 内规划 4 个子网  
> - 1 个 **Public Subnet（对外）**：连接 IGW，并承载 NAT Gateway  
> - 3 个 **Private Subnet（内部）**：部署 Node.js / Lambda（或其他计算），通过 NAT 出网  
> - 公有子网：直连 Internet  
> - 私有子网：只允许“出网”，不允许公网直接访问（更安全）

---

## 1. 架构目标与说明

### 1.1 组件作用解释

- **VPC**：AWS 私有网络隔离空间
- **Subnet（子网）**：VPC 内的网络分段，且 **一个子网只能属于一个 AZ**
- **AZ（Availability Zone，可用区）**：同 Region 内多个相对独立的数据中心区域（如 us-east-1a / 1b / 1c）
- **IGW（Internet Gateway）**：互联网网关，提供 VPC 访问公网能力
- **NAT Gateway**：为私有子网提供公网访问能力（**只出不进**）

### 1.2 出网路径（最终效果）

#### Public Subnet 出网路径
Public Subnet → Route Table（0.0.0.0/0 → IGW）→ IGW → Internet

#### Private Subnet 出网路径
Private Subnet → Route Table（0.0.0.0/0 → NAT）→ NAT Gateway（位于 Public Subnet）→ IGW → Internet

> ✅ 私有子网可出网  
> ❌ 公网无法主动访问私有子网

---

## 2. 当前设计（最终落地结构）

### 2.1 子网规划（4 个子网）

| 子网类型 | AZ | 子网数量 | 用途 |
|---|---|---:|---|
| Public Subnet | us-east-1c | 1 | 对外出口、放 NAT Gateway |
| Private Subnet | us-east-1a / 1b / 1d | 3 | 部署 Node.js / Lambda |

> 说明：私有子网分布在多个 AZ，便于高可用与并发扩展  
> 当前方案为“单 NAT Gateway（Zonal）省钱版”，可用于学习/测试/开发环境

---

## 3. Route Table（路由表）配置

### 3.1 公有路由表（public-rt）

#### 路由规则（Routes）
必须包含：

- `172.31.0.0/16 -> local`
- `0.0.0.0/0 -> Internet Gateway (igw-xxxxxx)`

#### 子网关联（Subnet associations）
- 只关联 **1 个 Public Subnet**

---

### 3.2 私有路由表（private-rt）

#### 路由规则（Routes）
必须包含：

- `172.31.0.0/16 -> local`
- `0.0.0.0/0 -> NAT Gateway (nat-xxxxxx)`

> 关键：私有子网能否出网，取决于这条 `0.0.0.0/0 -> NAT`

#### 子网关联（Subnet associations）
- 关联 **3 个 Private Subnet**

---

## 4. NAT Gateway 配置

### 4.1 NAT Gateway 创建选项（控制台）

进入：VPC → NAT gateways → Create NAT gateway

#### 推荐选择（本次实现）
- **Availability mode**：✅ `Zonal`
- **Subnet**：✅ 选择 Public Subnet（对外子网）
- **Connectivity type**：✅ `Public`
- **Elastic IP allocation ID**：✅ Allocate Elastic IP 并绑定

> 说明：Public NAT 必须绑定 EIP 才能正常出网

---

## 5. AWS 控制台修改步骤（完整流程）

### Step 1：确认 IGW 已绑定 VPC
路径：VPC → Internet gateways  
- 状态应为：Attached（已挂载到目标 VPC）

---

### Step 2：创建 public-rt 并配置 IGW 出网
路径：VPC → Route tables → Create route table

1. Create Route Table：`public-rt`
2. Routes → Edit routes：新增  
   - `0.0.0.0/0 -> IGW`
3. Subnet associations：只绑定 Public Subnet

---

### Step 3：创建 NAT Gateway（放在 Public Subnet）
路径：VPC → NAT gateways → Create NAT gateway

1. Availability mode：Zonal
2. Subnet：Public Subnet
3. Connectivity type：Public
4. Allocate Elastic IP
5. Create NAT gateway，并等待 Available

---

### Step 4：创建 private-rt 并配置 NAT 出网
路径：VPC → Route tables → Create route table

1. Create Route Table：`private-rt`
2. Routes → Edit routes：新增  
   - `0.0.0.0/0 -> NAT Gateway`
3. Subnet associations：绑定 3 个 Private Subnet

---

## 6. 校验清单（最终检查）

### 6.1 public-rt 检查
- [ ] 有 `0.0.0.0/0 -> IGW`
- [ ] 只绑定 Public Subnet（1 个）

### 6.2 private-rt 检查
- [ ] 有 `0.0.0.0/0 -> NAT Gateway`
- [ ] 绑定了 3 个 Private Subnet

### 6.3 NAT Gateway 检查
- [ ] NAT 状态为 Available
- [ ] NAT 位于 Public Subnet
- [ ] NAT 绑定了 Elastic IP

---

## 7. 成本 / 可用性说明（重要）

### 7.1 当前方案：单 NAT Gateway（Zonal）
✅ 优点：
- 成本较低
- 配置简单
- 满足私网出网需求

⚠️ 风险/缺点：
- NAT 是单点（AZ 出问题私网出网会受影响）
- 3 个私有子网跨 AZ 访问 NAT 会有跨 AZ 流量成本

---

### 7.2 生产建议（高可用方案）
如果用于生产环境建议：
- 每个 AZ 1 个 Public Subnet
- 每个 AZ 1 个 NAT Gateway
- 每个 Private Subnet 指向同 AZ NAT（避免单点 + 减少跨 AZ 费用）

---

## 8. Serverless（Lambda / Node.js）部署建议

### 8.1 Lambda 是否需要进 VPC？
- 若 Lambda 需要访问 RDS / Redis / 内部服务：✅ 需要进 VPC（用 Private Subnet）
- 若 Lambda 不需要访问 VPC 内资源：✅ 可以不进 VPC（可减少 NAT 成本与复杂度）

### 8.2 Lambda 进入 VPC 的选择
- Subnets：选择 3 个 Private Subnet
- Security Group：选择允许访问目标资源的 SG

---

## 9. 最终结论

✅ 你当前网络结构已满足目标：

- 1 个 Public Subnet：通过 IGW 对外（并承载 NAT）
- 3 个 Private Subnet：通过 NAT Gateway 出网
- 公私子网路由分离（public-rt / private-rt）
- 安全边界清晰：私网只出不进
