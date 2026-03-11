# path.basename

> Node.js path 模块中的方法，用于从一个完整路径中提取文件名部分。

## 基本用法

```javascript
const path = require('path');

path.basename('/Users/mac/Documents/report.pdf');
// => 'report.pdf'

path.basename('/Users/mac/Documents/report.pdf', '.pdf');
// => 'report' （第二个参数可以去掉扩展名）

path.basename('/foo/bar/baz/');
// => 'baz'
```

## 简单来说

它就是取路径的最后一段：
- `/a/b/c.txt` → `c.txt`
- `/a/b/c/` → `c`

第二个可选参数 `ext` 可以指定要移除的扩展名，方便只拿到纯文件名。

## 常见场景

在文件上传或 RAG 知识库处理时，从文件路径中提取文件名用于展示或存储。

```javascript
// 实际例子
const filePath = '/uploads/documents/2026-03-11-report.pdf';
const fileName = path.basename(filePath);        // '2026-03-11-report.pdf'
const baseName = path.basename(filePath, '.pdf'); // '2026-03-11-report'
```
