## ORM是什么
ORM（Object-Relational Mapping）是一种编程技术，用于将关系型数据库中的数据映射为对象，使开发人员可以使用面向对象的方式来操作数据库。

## Prisma
Prisma 是一个用于数据库访问的 ORM（对象关系映射）工具，它提供了一种简单、类型安全的方式来与数据库进行交互。Prisma 支持多种数据库，包括 MySQL、PostgreSQL、SQLite 等。
### 安装 Prisma
```typescript
npm install prisma
```
### 初始化 Prisma 项目
```typescript
npx prisma init
```
### 配置数据库连接
在 `prisma/schema.prisma` 文件中配置数据库连接，例如：
```typescript
datasource db {
  provider = "mysql"
  url      = "mysql://root:password@localhost:3306/mydatabase"
}
```
### 数据库迁移
+ 使用 Prisma 迁移工具将数据库模型迁移到数据库中，在数据库中创建对应的表结构
+ 默认会执行 npx prisma generate，生成 Prisma 客户端代码
```typescript
npx prisma migrate dev --name init
// 修改schema.prisma后创建新迁移并重新同步到数据库
npx prisma migrate dev --name <name>
// 直接将 schema.prisma 中的模型同步到数据库，不生成迁移文件
px prisma db push
// 部署迁移文件到生产数据库
npx prisma migrate deploy
// 从数据库中拉取最新的模型定义到 schema.prisma 文件中
npx prisma db pull
```
### 生成 Prisma 客户端
+ schema.prisma 更改后，需要手动调用 npx prisma generate 生成 Prisma 客户端代码
```typescript
npx prisma generate
```
### 使用 Prisma 客户端
在代码中引入 Prisma 客户端，例如：
```typescript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```
### 连接数据库
在代码中连接数据库，例如：
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
### 执行数据库操作
使用 Prisma 客户端执行数据库操作，例如：
```typescript
// 创建一个项目
const newProject = await prisma.project.create({
  data: {
    name: 'My Project',
    description: 'A new project',
  },
});
// 查询所有项目
const allProjects = await prisma.project.findMany();
// 查询项目详情
const project = await prisma.project.findUnique({
  where: {
    id: newProject.id,
  },
});
// 删除项目
await prisma.project.delete({
  where: {
    id: newProject.id,
  },
});
// 更新项目
await prisma.project.update({
  where: {
    id: newProject.id,
  },
  data: {
    name: 'Updated Project Name',
  },
});
// 查询项目名称是否已存在
const projectNameExists = await prisma.project.findFirst({
  where: {
    name: 'Updated Project Name',
  },
});
```
### 表结构设计
+ @map： 映射的是模型中某个字段的名字，映射为数据库中的字段名
+ @@map：映射的是模型的表名，映射为数据库中的表名
+ @id：主键，默认会创建一个自增的整数序列
+ @default：默认值
+ autoincrement()：Prisma 提供的一个默认值生成器函数，用于生成自增的整数序列
+ @unique：唯一值
+ @default(now())：仅创建时生成
+ @updatedAt：创建和生成时，自动更新
```typescript
model Platform {
  id            Int      @id @default(autoincrement())
  platformCode  String   @unique @map("platform_code")
  platformName  String   @map("platform_name")
  platformUrl   String?  @map("platform_url")
  isActive      Boolean  @default(true) @map("is_active")
  config        String? 
  fieldMapping  String?  @map("field_mapping")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  roomStatusData RoomStatusData[]
  dataSources    DataSource[]
  transformationRules DataTransformationRule[]

  @@map("platforms")
}
```
+ 建立一对多关系
  - platform ：关系字段名，在代码中可以通过此名称访问关联的 Platform 对象
  - Platform ：关联的目标模型类型
  - fields: [platformId] ：指定当前模型中用于建立关系的外键字段名
  - references: [id] ：指定目标模型中被引用的字段名（通常是主键）
```typescript
// 建立Platform表和当前表的一对多关系
platform Platform @relation(fields: [platformId], references: [id])
```
