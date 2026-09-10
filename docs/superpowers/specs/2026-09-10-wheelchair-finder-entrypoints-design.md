---
title: "轮椅适配 Finder 可发现入口"
type: "design"
status: "approved"
last_updated: "2026-09-10"
---

# 轮椅适配 Finder 可发现入口

## 目标

让用户无需记住或手动输入 `/wheelchair-finder`，即可在网站中明确找到“选择适合自己的轮椅”功能。现有 Finder 页面、测量流程、硬性筛选规则和推荐算法保持不变。

## 用户体验方案

同一个入口名称和目标地址统一使用 `Find Your Perfect Fit`，并在三个高可见位置出现：

1. 桌面端顶部导航增加 `Find Your Fit` 链接，指向 `/wheelchair-finder`。
2. 移动端展开菜单增加同名链接，保证小屏用户无需使用桌面导航。
3. 首页首屏主要行动区增加 `Find Your Perfect Fit` 按钮，位于现有首屏行动按钮附近，直接进入 Finder。

链接使用 Next.js `Link`，不打开新窗口。现有 Products、New Arrivals、Home Guides、Stories、Support、Amazon Stores、账户和购物车入口保留原位置及行为。桌面和移动端入口都需要有清晰的键盘焦点样式，并使用现有按钮、文字和颜色规范。

## 组件和数据流

- `src/components/layout/Header.tsx`：扩展共享 `navLinks`，让桌面导航和移动菜单复用同一 Finder 链接。
- `src/components/HomePageClient.tsx`：在首屏 CTA 区增加 Finder `Link`/`Button`，不改变现有产品 CTA。
- 不新增 API、数据库字段、环境变量或业务状态；目标路由仍由 `src/app/wheelchair-finder/page.tsx` 提供。

## 测试和验收

- Header 测试验证桌面/移动导航都渲染 `/wheelchair-finder` 链接。
- 首页测试验证首屏 CTA 渲染 `/wheelchair-finder` 链接。
- 运行相关单元测试、TypeScript 检查和 lint。
- 使用生产构建或 E2E 检查桌面及移动视口均能从入口到达 `/wheelchair-finder`，且不产生横向溢出。

## 不在本次范围

- 不修改 Finder 的体重承重、有效座宽等筛选规则。
- 不修改产品目录、SKU、配件、Amazon 链接或数据库。
- 不执行数据库迁移，不改变登录权限，不新增支付功能。

## 关联文件

- `src/components/layout/Header.tsx`
- `src/components/HomePageClient.tsx`
- `src/app/wheelchair-finder/page.tsx`
