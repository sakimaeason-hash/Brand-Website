# 新品与优惠后台联动实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use $subagent-driven-development or $executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 让管理员安全地添加、移除新品展示，前台只展示真实发布商品及有效促销。

**Architecture:** 在现有 Product 上增加独立 isNewArrival 标记，复用产品编辑与促销 CRUD；新增轻量后台展示管理页和带鉴权、并发校验的标记 API。前台改用严格数据库查询，不回退到静态示例数据；保留 GoldSeason 品牌视觉。

**Tech Stack:** 现有 Next.js App Router、React、Prisma/PostgreSQL、Tailwind、Vitest、Testing Library、Playwright。

## 已批准的设计与范围

**最终执行状态（2026-09-28）：任务1、2、3本地实现与验证完成。** 原步骤清单保留为实施时计划；最终证据以 `docs/new-arrivals-admin.md` 的验证结果为准。473测试、类型、Lint、生产构建通过；8项离线浏览器检查通过；需求及质量复审通过。未执行真实数据库E2E、生产迁移、提交或部署。

**后续授权（2026-09-28）：** 用户同意提交 GitHub 并部署至 `ethan-sakima-project/brand-website`、`goldseason.vip`。此前“不提交、不部署”的边界仅适用于已完成的本地实施阶段。上线顺序为：重新验证 → 核对生产目标及迁移历史 → 提交修复分支 → 在暂不绑定域名的生产部署中执行受检查迁移与构建 → 验证 → 切换正式域名。独立 PostgreSQL 迁移验证和 9 项迁移保护测试已通过；实际发布结果另记操作文档。

- 2026-09-24 用户确认：新品标记、复用促销、真实前台数据、保留样式、无内容空状态。
- 2026-09-28 继续实施。独立工作树 `C:/Users/PC/.config/superpowers/worktrees/website/new-arrivals-admin`，基线 `b04f48e`，分支 `codex/new-arrivals-admin`。
- 不接触生产数据库、环境密钥、线上媒体；不部署、不推送；不混入欧洲支付开发改动。
- 取消新品展示只改标记，不删除商品、不改变发布状态、SKU、图片或库存。
- 数据库字段默认 false；旧商品不会擅自变成新品。生成迁移文件但本轮不在生产执行。

## Task 1：新品标记和后台操作

**Files:**
- Modify: `prisma/schema.prisma`, `src/lib/catalog/product-validation.ts`, `src/lib/catalog/product-service.ts`
- Modify: `src/components/admin/ProductOverviewFields.tsx`, `ProductEditorTypes.ts`, `ProductForm.tsx`, `src/app/admin/products/[id]/page.tsx`
- Create: `prisma/migrations/20260928000000_add_product_new_arrival/migration.sql`
- Create: `src/app/api/admin/products/[id]/new-arrival/route.ts`, `src/components/admin/NewArrivalsManager.tsx`, `src/app/admin/new-arrivals/page.tsx`
- Modify: `src/components/admin/AdminNav.tsx`, `src/app/admin/page.tsx`
- Tests: 对应 schema、service、form、API、manager、page 测试。

- [ ] 先红测：true/false 可保存；缺省兼容旧输入；切换标记不影响其它商品字段；普通用户/未登录拒绝；无效 JSON/布尔/版本、404/409、网络错误有可读提示。

```ts
expect(productAggregateInputSchema.parse({ ...validInput, isNewArrival: true }).isNewArrival).toBe(true);
expect(productAggregateInputSchema.parse({ ...validInput, isNewArrival: false }).isNewArrival).toBe(false);
```

- [ ] 运行 `npm test -- src/lib/catalog/product-validation.test.ts`，确认新字段未支持导致失败。
- [ ] 实现字段与表单。Prisma:

```prisma
isNewArrival Boolean @default(false)
```

```sql
ALTER TABLE "content_products" ADD COLUMN "isNewArrival" BOOLEAN NOT NULL DEFAULT false;
```

```ts
// 老客户端没发送新标记时，不覆盖已存在的标记。
isNewArrival: z.boolean().optional(),
// productData 中仅写入 input.isNewArrival，undefined 由 Prisma 省略。
```

- [ ] JSON PATCH `/api/admin/products/:id/new-arrival` 输入 `{ isNewArrival: boolean, updatedAt: ISO string }`；先 requireAdmin；用 `updateMany({where:{id,updatedAt},data:{isNewArrival}})` 原子 CAS；返回新版本。真实不存在404、版本过期409；不提供删除语义，不绕过发布校验。
- [ ] 管理页显式 requireAdmin，查询商品并显示名称/状态/标记/添加或移除按钮；提示“仅已发布且有效的商品会在前台展示”；链接产品编辑及现有促销管理；普通用户无新入口。
- [ ] 产品表单保留独立的首页精选开关，新开关名 `Show in New Arrivals`，说明保存草稿后仍需发布；独立管理页即时改变展示标记但保留原发布状态。
- [ ] 运行相关测试确认变绿；生成 Prisma Client，不执行数据库迁移。

## Task 2：前台真实内容和失效保护

**Files:**
- Modify: `src/lib/content/repository.ts`, `src/app/new-arrivals/page.tsx`
- Create: `src/components/new-arrivals/NewArrivalsContent.tsx`
- Modify: `src/app/api/admin/products/[id]/route.ts`, `src/app/api/admin/promotions/[id]/route.ts`（仅缓存失效）
- Tests: `src/lib/content/repository.test.ts`, `src/app/new-arrivals/page.test.tsx`, 展示组件测试。

- [ ] 先红测：标记true且有效发布才展示；false、草稿、下架、归档类别、无SKU不展示；未开始、到期、暂停、草稿促销不展示；DB失败抛出，绝不回退静态商品。
- [ ] 新增严格查询函数 `listNewArrivalsContent()`：复用现有 publishedProductInclude 单次读已发布产品，通过 toPublicProduct 检查可公开性，再提取有效关联促销。

```ts
type NewArrivalsContent = {
  products: readonly PublicProduct[];
  offers: readonly { promotion: PublicPromotion; product: PublicProduct }[];
};
```

- [ ] 公开函数不 catch 数据库错误；page 为 `force-dynamic`，在页面边界提供明确失败状态和重试入口。合法空列表分别显示暂无新品/暂无优惠。
- [ ] 前台沿用暖白、深棕和陶土色；使用后台产品图，不显示虚构型号、库存、套餐、优惠码或假订阅成功。卡片 CTA 只指向已有 `/products` 或有效 Amazon SKU 链接，不构造不存在的产品详情路由。
- [ ] 使用已有 SKU 价格，不误把产品级优惠套在有独立定价的 SKU；活动优惠说明清楚标注适用范围和结束时间（ET），允许选择SKU再购买。保留外链安全属性。
- [ ] 商品发布/下架/删除/保存草稿及促销增改下架删除后，使 `/new-arrivals` 缓存失效。活动时间由服务端每次请求判断。
- [ ] 运行 repository、页面、组件及API回归测试，确认红绿链路。

## Task 3：验证、审查与操作说明

**Files:** `docs/new-arrivals-admin.md`；必要的本地浏览器测试文件。

- [x] 无本轮残留改动；依赖按lock安装；`npx prisma generate`；基线 `npm test`：62文件、401测试通过。
- [ ] 全量 `npm test`、`npm run lint`、`npx tsc --noEmit`、本地虚拟数据库环境 `npm run build`；不用生产凭据。
- [ ] 桌面与窄屏检查前台空/错误/内容状态、长名称、按钮可访问性；后端鉴权、CAS、展示移除用自动化测试验证。如没有独立测试DB，明确不声称完成真实数据库E2E。
- [ ] 按 subagent-driven-development 完成需求符合性及代码质量两阶段审查，修复重要问题后复查。
- [ ] 写操作说明：新品添加/取消、活动创建发布、空状态、迁移部署顺序；记录未运行的生产迁移及未部署边界。
- [ ] 完成后保留修复工作树与补丁，交付验证结果；后续提交/上线由用户另行确认。
