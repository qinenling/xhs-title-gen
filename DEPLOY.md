# 爆标题 · Vercel 部署清单

按顺序执行，约 15–30 分钟完成首次上线。

---

## 前置准备

- [ ] Node.js 18+ 已安装（本地 `node -v` 能运行）
- [ ] GitHub 账号
- [ ] Vercel 账号（可用 GitHub 登录）
- [ ] DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）
- [ ] 本地项目能构建成功：`npm run build`

---

## 第一步：生成 Pro 激活码（本地）

```powershell
cd E:\新项目\xhs-title-gen

# 生成 20 个激活码 + 发卡台账 csv
node scripts/generate-codes.mjs --count 20 --output licenses/codes.txt --csv licenses/codes.csv
```

记下输出里的 `PRO_LICENSE_CODES=...` 整行，部署时要粘贴到 Vercel。

生成随机 `PRO_SECRET`（PowerShell）：

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## 第二步：推送代码到 GitHub

```powershell
cd E:\新项目\xhs-title-gen

git init
git add .
git commit -m "feat: 爆标题 MVP 上线"

# 在 github.com 新建空仓库 xhs-title-gen 后：
git branch -M main
git remote add origin https://github.com/你的用户名/xhs-title-gen.git
git push -u origin main
```

注意：`.env.local` 已在 `.gitignore`，不会上传密钥。

---

## 第三步：Vercel 导入项目

1. 打开 [https://vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → 选 `xhs-title-gen`
3. Framework Preset：**Next.js**（自动识别）
4. Root Directory：留空
5. 先不要点 Deploy，先配环境变量

---

## 第四步：配置环境变量

在 **Environment Variables** 添加（Production + Preview 都勾选）：

| Name | Value |
|------|--------|
| `OPENAI_API_KEY` | 你的 DeepSeek Key |
| `OPENAI_BASE_URL` | `https://api.deepseek.com/v1` |
| `OPENAI_MODEL` | `deepseek-v4-flash` |
| `PRO_LICENSE_CODES` | 第一步生成的逗号分隔激活码 |
| `PRO_SECRET` | 第一步生成的 32 位随机字符串 |
| `NEXT_PUBLIC_SITE_URL` | 先填 `https://占位.vercel.app`，部署后改成真实域名 |

点击 **Deploy**，等待 2–5 分钟。

---

## 第五步：部署后验证

部署完成会得到域名，例如：`https://xhs-title-gen-xxx.vercel.app`

1. 打开网站，顶部应显示 **AI 已连接**（不是演示模式）
2. 输入主题 → 生成标题 → 应返回真实 AI 内容
3. 点 **Pro** → 输入 `licenses/codes.txt` 里任一码 → 应显示 PRO 徽章
4. 更新 `NEXT_PUBLIC_SITE_URL` 为真实域名 → **Redeploy**

本地快速自检（可选）：

```powershell
cd E:\新项目\xhs-title-gen
npm run dev
node scripts/test-app.mjs
```

---

## 第六步：绑定自定义域名（可选）

1. 购买域名（阿里云/腾讯云）
2. Vercel → Project → **Settings → Domains**
3. 添加域名，按提示配置 DNS CNAME
4. 更新 `NEXT_PUBLIC_SITE_URL` 并 Redeploy

---

## 第七步：日常发卡流程

```
用户微信付款 ¥49
  → 从 licenses/codes.csv 取一个「未发放」的码
  → 微信发给用户
  → csv 标记「已发放」+ 用户微信 + 日期
```

新增一批码：

```powershell
node scripts/generate-codes.mjs --count 10 --output licenses/batch-2.txt --csv licenses/batch-2.csv
```

把新码**追加**到 Vercel 的 `PRO_LICENSE_CODES`（逗号连接旧码和新码）→ Redeploy。

---

## 一键 CLI 部署（可选）

已安装 Vercel CLI 时：

```powershell
npm i -g vercel
cd E:\新项目\xhs-title-gen
vercel login
vercel

# 首次会交互式配置；生产环境：
vercel --prod
```

环境变量仍建议在 Vercel 网页控制台配置，比 CLI 更直观。

---

## 常见问题

### 部署后显示「演示模式」

- 检查 `OPENAI_API_KEY` 是否在 Vercel 环境变量里
- 改 env 后必须 **Redeploy**

### 激活码无效

- 确认码在 `PRO_LICENSE_CODES` 里，无多余空格
- Redeploy 后再试

### 国内访问慢

- MVP 阶段可接受；用户量大再迁腾讯云 Web 应用托管

### DeepSeek 余额

- 在 DeepSeek 控制台设置余额告警
- 1000 次/天生成约 ¥2–6

---

## 成本预估（月）

| 项目 | 费用 |
|------|------|
| Vercel Hobby | ¥0 |
| DeepSeek API（小规模） | ¥20–100 |
| 域名（可选） | ¥30/年 |
| **合计** | **约 ¥20–100/月** |

10 个 Pro 用户 × ¥49 = ¥490/月，足以覆盖成本。

---

## 安全检查清单

- [ ] `PRO_SECRET` 已改为随机字符串（非默认值）
- [ ] API Key 只在 Vercel 环境变量，未提交 Git
- [ ] `.env.local` 未上传
- [ ] 激活码台账 csv 不要提交 Git（建议加入 `.gitignore`）

```gitignore
# 激活码台账（含未发放码）
licenses/
```
