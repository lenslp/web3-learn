# cursor-api CLI 开发文档

## 概述

`cursor-api` 用于从 Swagger/OpenAPI 文档自动生成 TypeScript API 文件。本文档面向使用与扩展该 CLI 的开发者。

## 技术栈

- **commander**：命令行参数解析
- **chalk**：终端输出着色
- **inquirer**：交互式提示（init 覆盖确认）
- **fs-extra**：文件读写
- **Node.js**：>= 14.0.0

## 入口与执行

- 入口文件：`src/cli/command.ts`（编译后为 `dist/cli/command.js`）
- `package.json` 中 `bin.cursor-api` 指向该编译产物
```json
"bin": {
    "cursor-api": "dist/cli/command.js"
},
```
- 首行 `#!/usr/bin/env node` 保证以 Node 直接执行

## 命令说明

### 1. init — 初始化配置

```bash
cursor-api init
```

**作用**：在项目根目录生成 `astroCoder.config.ts`。

**逻辑**：

- 若已存在同名文件，通过 inquirer 询问是否覆盖（默认不覆盖）
- 从 `src/templates/astroCoder.config.ts.template` 读取模板并写入当前目录
- 失败时打印错误并 `process.exit(1)`

### 2. generate / gen — 按配置生成 API

```bash
cursor-api generate [tags]
cursor-api gen [tags]
```

**参数**：

- `tags`（可选）：逗号分隔的 API 标签，用于按 tag 过滤要生成的接口，如 `cursor-api gen user,order`

**选项**：

- `-c, --config <path>`：配置文件路径，默认 `astroCoder.config.ts`

**逻辑**：

1. 使用 `loadConfig(options.config)` 加载配置
2. 调用 `checkBranchMatch(config.branch)` 校验当前 Git 分支是否与配置的 `branch` 一致，不一致则退出
3. 调用 `checkGitStatus()` 检查是否有未提交更改，有则仅提示，不阻断
4. 将 `tags` 按逗号拆分并 trim 得到 `selectedTags`，未传则为 `undefined`
5. 调用 `generateApiFiles(config, selectedTags)` 生成文件
6. 异常时打印错误并 `process.exit(1)`

### 3. 默认命令（无子命令时）

```bash
cursor-api [tags]
```

行为与 `generate [tags]` 相同：同样支持 `-c/--config`，同样做分支检查、Git 状态提示、标签解析后调用 `generateApiFiles`。

## 配置文件

- 格式：TypeScript（`.ts`）或 JavaScript，推荐使用 `astroCoder.config.ts`
- 必须导出名为 `config` 的对象（或 JS 的 `default`/模块本身为配置对象）

**配置项（AstroCoderConfig）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `branch` | string | 允许执行生成的分支名，与当前 Git 分支比对 |
| `apiDocs` | array | API 文档列表，每项含 `url`（Swagger 地址）和可选 `prefix` |
| `requestPath` | string | 生成代码中 request 的导入路径，如 `@/utils/request` |
| `outputPath` | string | 生成 API 文件的输出目录，如 `src/astroCode-api/` |

配置加载逻辑见 `src/config/index.ts`：TS 文件通过 ts-node 动态编译后 `require`，会清缓存以保证修改生效。

## 依赖模块说明

- **config**（`../config`）：`loadConfig(configPath)` 读取并返回配置
- **generator**（`../generator`）：`generateApiFiles(config, selectedTags)` 拉取文档并生成 TS 文件
- **git**（`../git`）：`checkBranchMatch(branch)`、`checkGitStatus()` 分支与工作区状态检查

## 目录结构（与 CLI 相关）

```
src/
├── cli/
│   └── command.ts      # CLI 入口，定义命令与 action
├── config/
│   └── index.ts        # 配置加载
├── generator/          # 生成逻辑（被 CLI 调用）
├── git/
│   └── index.ts        # 分支与状态检查
└── templates/
    └── astroCoder.config.ts.template  # init 使用的配置模板
```

## 扩展与开发注意点

1. **新增子命令**：在 `program` 上继续 `program.command('子命令名')`，链式 `.description().option().action()`，最后保持 `program.parse()` 在末尾。
2. **新增全局选项**：可在根 `program` 上 `.option()`，在各 command 的 `action` 中通过 `options` 获取。
3. **init 模板**：修改配置默认值时，应同步改 `src/templates/astroCoder.config.ts.template`，否则 `init` 生成的内容会与类型/文档不一致。
4. **错误退出**：所有命令在捕获到错误时统一 `process.exit(1)`，并可用 chalk 标红关键信息。
5. **commander 版本**：当前为 9.x，子命令与选项 API 以 9.x 为准。

## 本地调试

```bash
# 在 astroCoder-cursor-api 目录
yarn build
node dist/cli/command.js --help
node dist/cli/command.js init
node dist/cli/command.js -c ./astroCoder.config.ts
```

使用 `npm link` 或 `yarn link` 后，可在任意目录直接执行 `cursor-api` 进行联调。
