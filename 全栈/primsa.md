## ORM是什么
ORM（Object-Relational Mapping）是一种编程技术，用于将关系型数据库中的数据映射为对象，使开发人员可以使用面向对象的方式来操作数据库。

## Prisma
Prisma 是一个用于数据库访问的 ORM（对象关系映射）工具，它提供了一种简单、类型安全的方式来与数据库进行交互。Prisma 支持多种数据库，包括 MySQL、PostgreSQL、SQLite 等。
### 安装 Prisma
```
npm install prisma
```
### 初始化 Prisma 项目
```
npx prisma init
```
### 配置数据库连接
在 `prisma/schema.prisma` 文件中配置数据库连接，例如：
```
datasource db {
  provider = "mysql"
  url      = "mysql://root:password@localhost:3306/mydatabase"
}
```
### 数据库迁移
+ 使用 Prisma 迁移工具将数据库模型迁移到数据库中，在数据库中创建对应的表结构
+ 默认会执行 npx prisma generate，生成 Prisma 客户端代码
```
npx prisma migrate dev --name init
```
### 生成 Prisma 客户端
+ schema.prisma 更改后，需要手动调用 npx prisma generate 生成 Prisma 客户端代码
```
npx prisma generate
```
### 使用 Prisma 客户端
在代码中引入 Prisma 客户端，例如：
```
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```
### 连接数据库
在代码中连接数据库，例如：
```
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
### 执行数据库操作
使用 Prisma 客户端执行数据库操作，例如：
```
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
