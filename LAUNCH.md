# 爆标题 · 上架运营手册

> 部署清单 + 售卖文案 + 激活流程 + 日常运营

---

## 一、部署清单（逐步执行）

### 阶段 A：本地准备（10 分钟）

```powershell
cd E:\新项目\xhs-title-gen

# 1. 确认能构建
npm run build

# 2. 生成 30 个 Pro 激活码 + 发卡台账
npm run generate-codes -- --count 30 --output licenses/codes.txt --csv licenses/codes.csv

# 3. 生成 PRO_SECRET（PowerShell，复制输出）
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

准备以下信息（部署时要粘贴）：

| 变量 | 你的值 |
|------|--------|
| `OPENAI_API_KEY` | DeepSeek Key |
| `OPENAI_BASE_URL` | `https://api.deepseek.com/v1` |
| `OPENAI_MODEL` | `deepseek-v4-flash` |
| `PRO_LICENSE_CODES` | 脚本输出的整行（逗号分隔） |
| `PRO_SECRET` | 上一步生成的 32 位字符串 |
| `NEXT_PUBLIC_SITE_URL` | 部署后填真实域名 |

---

### 阶段 B：上传 GitHub（15 分钟）

1. 打开 [github.com/new](https://github.com/new) 创建仓库 `xhs-title-gen`（Private 或 Public）
2. 若本机无 Git，可下载 [Git for Windows](https://git-scm.com/download/win)，或使用 GitHub Desktop 拖拽上传

```powershell
cd E:\新项目\xhs-title-gen
git init
git add .
git commit -m "feat: 爆标题 v1.0 上线"
git branch -M main
git remote add origin https://github.com/你的用户名/xhs-title-gen.git
git push -u origin main
```

⚠️ 不要上传 `.env.local` 和 `licenses/`（已在 .gitignore）

---

### 阶段 C：Vercel 部署（10 分钟）

1. 打开 [vercel.com](https://vercel.com) → GitHub 登录
2. **Add New Project** → 选择 `xhs-title-gen`
3. **Environment Variables** 添加上表 6 个变量（Production + Preview 都勾选）
4. 点击 **Deploy**，等待 2–5 分钟
5. 获得域名，如：`https://xhs-title-gen.vercel.app`
6. 把 `NEXT_PUBLIC_SITE_URL` 改为该域名 → **Redeploy**

---

### 阶段 D：上线验证（5 分钟）

- [ ] 打开网站，顶部显示 **AI 已连接**
- [ ] 选「美妆种草」模板 → 生成标题 → 有真实内容
- [ ] 点「写正文」→ 大纲正常
- [ ] 点 **Pro** → 输入 `licenses/codes.txt` 中任一码 → 出现 **PRO** 徽章
- [ ] 手机浏览器访问正常

---

### 阶段 E：可选增强

- [ ] 绑定自定义域名（Vercel → Settings → Domains）
- [ ] DeepSeek 控制台设置余额告警
- [ ] 小红书发第一条演示帖（见下文文案）

---

## 二、上架售卖描述

### 产品名称

**爆标题 · 小红书 AI 写作助手**

### 一句话卖点

> 输入主题，10 秒出 5 条爆款标题 + 完整正文大纲，复制即发小红书。

### 小红书种草帖（可直接发）

**标题：**
```
日更博主必备！AI 帮我起标题再也不卡壳了 ✨
```

**正文：**
```
做小红书最痛苦的不是写正文，是起标题！！
每次对着空白标题框能发呆半小时 😭

最近用这个工具「爆标题」，真的省太多时间：

✅ 输入主题，一次出 5 条不同风格标题
✅ 种草 / 干货 / 悬念 / 对比 / 清单… 10 种风格
✅ 选中标题，一键生成正文大纲 + 标签
✅ 24 个赛道模板，美妆探店职场都有
✅ 复制即用，日更效率翻倍

免费版每天 10 次够试水
Pro 版无限生成，日更党必备

🔗 链接放评论区 / 主页
有问题评论区问我～

#小红书运营 #博主工具 #AI写作 #标题生成 #自媒体干货
```

### 闲鱼 / 朋友圈售卖文案

```
【爆标题 Pro】小红书 AI 标题+正文生成器 月卡

适合：日更博主、电商运营、小红书矩阵号

✅ 无限次标题生成（一次 10 条）
✅ 正文大纲 + 话题标签 + 配图建议
✅ 10 种爆款风格 + 24 个选题模板
✅ 收藏 / 历史 / Markdown 导出

💰 价格：
- 月卡 ¥49（30 天）
- 年卡 ¥99（365 天，限时）

📦 购买后 5 分钟内发激活码，网站输入即用
🔒 无需安装，浏览器打开就能用

下单备注「Pro」
```

### Pro 定价建议

| 套餐 | 价格 | 说明 |
|------|------|------|
| 免费版 | ¥0 | 10 次/天，5 条标题 |
| 月卡 | ¥49 | 无限次，10 条/次 |
| 年卡 | ¥99 | 同上，拉长期用户 |
| 团队 3 人 | ¥129/月 | 发 3 个码（手动） |

---

## 三、激活流程

### 用户侧（发给客户的说明，可直接复制）

```
【爆标题 Pro 激活教程】

1️⃣ 打开网站：https://你的域名.vercel.app
2️⃣ 点击右上角「Pro」按钮
3️⃣ 输入激活码：BAOTITLE-2026-XXXX
4️⃣ 点击「激活 Pro」
5️⃣ 看到顶部 PRO 徽章 = 成功！

Pro 权益：
· 无限次生成
· 一次 10 条标题
· 正文大纲不限

有效期 30 天，到期可续费
换浏览器需重新输入激活码

有问题微信联系：你的微信号
```

### 商家侧（你发卡流程）

```
1. 用户微信付款（备注：Pro月卡）
2. 打开 licenses/codes.csv
3. 找一个「未发放」的码
4. 微信发送：
   ─────────────
   感谢购买爆标题 Pro！
   激活码：BAOTITLE-2026-A3K9
   网站：https://xxx.vercel.app
   激活：点右上角 Pro → 输入码 → 激活
   有效期 30 天
   ─────────────
5. csv 改为：已发放 | 用户微信 | 2026-xx-xx
6. 若码用完了，运行：
   npm run generate-codes -- -n 20 -o licenses/batch2.txt -c licenses/batch2.csv
   追加到 Vercel 的 PRO_LICENSE_CODES → Redeploy
```

### 激活码批量生成

```powershell
npm run generate-codes -- --count 20 --output licenses/codes.txt --csv licenses/codes.csv
```

---

## 四、常见问题（客服话术）

**Q：激活码无效？**
> 请检查是否有多余空格，区分大小写。若仍不行联系我换码。

**Q：换手机/浏览器 Pro 没了？**
> 当前版本绑定浏览器 Cookie，换设备需重新输入激活码（一码可重复激活）。

**Q：免费版和 Pro 区别？**
> 免费 10 次/天、5 条标题；Pro 无限次、10 条标题。

**Q：能退款吗？**
> 激活码发出后不支持退款，建议先用免费版体验。

---

## 五、成本与利润（参考）

| 项目 | 月成本 |
|------|--------|
| Vercel | ¥0 |
| DeepSeek（500 用户 × 3 次/天） | ~¥90 |
| **10 个 Pro 用户 × ¥49** | **收入 ¥490** |

---

## 六、文件索引

| 文件 | 用途 |
|------|------|
| `DEPLOY.md` | 技术部署细节 |
| `LAUNCH.md` | 本文件：运营上架 |
| `scripts/generate-codes.mjs` | 激活码生成 |
| `licenses/codes.csv` | 发卡台账 |

---

*最后更新：2026-06-30 · 爆标题 v1.0*
