# 爆标题 · 小红书爆款标题生成器

AI 一键生成小红书标题和正文大纲，支持种草、干货、悬念、数字、情感 5 种风格。

## 功能

- 输入主题 + 关键词，一次生成 5 条标题（Pro 10 条）
- 选中标题 → 一键生成正文大纲（结构 + 标签 + 配图建议）
- 12 个热门赛道快速选题模板
- 历史记录、**标题收藏**、复制全部、换一批
- **导出 Markdown** 文件
- 服务端限流：免费 10 次/天（按 IP）
- Pro 激活码：无限生成

## 快速开始

```bash
cd xhs-title-gen
npm install
cp .env.example .env.local
# 编辑 .env.local
npm run dev
```

## 激活码批量生成

```bash
# 生成 20 个码 + 发卡台账
npm run generate-codes -- --count 20 --output licenses/codes.txt --csv licenses/codes.csv

# 查看帮助
npm run generate-codes -- --help
```

## 部署上线

完整逐步命令见 **[DEPLOY.md](./DEPLOY.md)**（GitHub → Vercel → 环境变量 → 验证）。

## 环境变量

见 [.env.example](./.env.example)

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS 4
- DeepSeek API（OpenAI 兼容）
- 服务端 IP 限流 + Pro 激活码

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run generate-codes` | 批量生成 Pro 激活码 |
| `npm run test:app` | 测试 API 接入 |
