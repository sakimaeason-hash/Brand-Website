# GoldSeason 网站内容更新说明

## 更新日期
2025-04-30

## 更新内容

### 新增博客文章

已将 `C:\Users\PC\Desktop\homeguide` 文件夹中的英文无障碍家居指南内容添加到官网博客板块。

#### 1. 厨房无障碍改造指南
**文件位置:** `src/app/blog/kitchen-accessibility-guide/page.tsx`

**链接:** http://localhost:3021/blog/kitchen-accessibility-guide

**主要内容:**
- 改造前评估（用户能力、厨房测量）
- 门道和通道宽度标准
- 台面高度修改（28-34英寸推荐高度）
- 水槽改造（深度≤6英寸，杠杆式水龙头）
- 炉灶/电磁炉选择与安全
- 储物空间优化（低/中/高区域规划）
- 三档预算方案（$140-445 / $1,200-2,500 / $5,000+）
- 产品推荐（美国购买渠道）
- 安全注意事项

#### 2. 户外花园无障碍改造指南
**文件位置:** `src/app/blog/outdoor-garden-accessibility/page.tsx`

**链接:** http://localhost:3021/blog/outdoor-garden-accessibility

**主要内容:**
- 入口坡道设计标准（ADA规范）
  - 坡度 ≤1:12
  - 宽度 ≥36英寸（推荐48英寸）
  - 扶手、防滑、边缘保护
- 花园小径改造（宽度60-72英寸）
- 种植区无障碍设计
  - 抬高花坛高度 24-36英寸
  - 膝部空间：宽30英寸/高27英寸/深19英寸
- 坡道类型选择（混凝土/铝制/便携式）
- 三档预算方案（$120-450 / $1,200-4,000 / $4,000-25,000+）
- 不同气候区域的考虑因素
- 安全与应急准备

### 博客列表页更新
**文件位置:** `src/app/blog/page.tsx`

**更新内容:**
- 在 `blogPosts` 数组中新增两篇指南文章
- 文章分类为 "Guides"
- 阅读时间：15-18分钟
- 缩略图标记：Kitchen / Garden

## 访问地址

### 博客首页（文章列表）
http://localhost:3021/blog

### 厨房指南详情页
http://localhost:3021/blog/kitchen-accessibility-guide

### 户外花园指南详情页
http://localhost:3021/blog/outdoor-garden-accessibility

## 内容来源

原文档位置：`C:\Users\PC\Desktop\homeguide\`

### 原始文件：
- `content-kitchen-wheelchair-electric-en.md` - 厨房无障碍指南（英文）
- `content-outdoor-wheelchair-electric-en.md` - 户外花园无障碍指南（英文）

### 注意：
卧室改造指南文件 (`content-bedroom-wheelchair-electric.md`) 内容为中文，未添加到英文官网。
如需添加，需要提供英文版本。

## 技术说明

### 文件结构：
```
website/src/app/blog/
├── page.tsx                          # 博客列表页（已更新）
├── kitchen-accessibility-guide/
│   └── page.tsx                      # 厨房指南详情页（新增）
└── outdoor-garden-accessibility/
    └── page.tsx                      # 户外指南详情页（新增）
```

### 页面特点：
- 使用 Next.js App Router
- 服务器组件（Server Components）
- 支持 SEO metadata
- 响应式设计（适配移动端）
- 品牌色彩一致（#2AAAA0, #F5A623）

## 后续建议

### 内容优化：
1. 添加实际的产品图片和场景照片
2. 为每篇文章添加目录导航（Table of Contents）
3. 添加相关文章推荐
4. 集成搜索功能

### 卧室指南：
如需添加卧室无障碍指南，需先准备英文版本内容。
中文版本内容可参考：`content-bedroom-wheelchair-electric.md`

## Git 提交

```bash
提交哈希: faff4c8
提交信息: feat: Add accessibility guides to blog section
```

## 参考资料

- ADA Standards for Accessible Design
- ANSI A117.1 Accessible and Usable Buildings
- AARP HomeFit Guide
