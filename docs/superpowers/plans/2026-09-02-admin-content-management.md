# Admin 内容管理后台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `$subagent-driven-development`（推荐）或 `$executing-plans` 按任务逐项执行。本计划的步骤使用 checkbox 追踪。

**Goal:** 为 GoldSeason 网站建立一个仅 `ADMIN` 角色可见和可用的内容管理后台，让管理员直接上传产品资料、Customer Stories 真实评论图片和促销活动，并通过草稿/预览/发布流程在无需重新部署的情况下更新前台。

**Architecture:** 复用现有 NextAuth、Prisma/PostgreSQL 和 `User.role`，新增内容实体、图片元数据和统一的 `DRAFT/PUBLISHED/UNPUBLISHED` 状态。服务端通过 Supabase Storage 保存图片，所有 `/api/admin/*` 和 `/admin/*` 请求都执行服务端管理员校验；Products、首页和 Stories 通过服务端内容仓库读取已发布数据，在数据库没有已发布记录或暂时不可用时回退到当前静态快照。促销时间以 `America/New_York` 输入和计算、以 UTC 持久化。

**Tech Stack:** Next.js 14 App Router、React 18、TypeScript、Tailwind CSS、NextAuth、Prisma 5/PostgreSQL、Supabase Storage、Zod、React Hook Form、Vitest/Testing Library、Playwright、Vercel。

---

## 工作上下文与安全边界

- 实施工作树：`C:/tmp/brand-website-stories-production`。
- 目标 Vercel 项目：`brand-website`，团队：`ethan-sakima-project`，正式域名：`https://goldseason.vip`。
- 不要在 `C:/Brand WEB/website` 脏工作树中暂存、提交或重置用户未提交的样式、布局、指南和推荐器改动。
- 管理员邮箱：`goldseasonofficial001@gmail.com`。通过 `ADMIN_EMAIL` 环境变量配置；代码中只比较规范化后的邮箱，不在客户端渲染该值。
- Supabase 服务角色密钥只在 Route Handler/服务器模块使用，绝不导入客户端组件或写入公开环境变量。
- 图片上传不强制授权勾选；`sourceNote` 和 `altText` 是可选字段。管理员负责判断公开展示是否合适。
- 不执行 `prisma db push`、`prisma migrate reset` 或生产数据库迁移，直到预览环境验收完成并获得用户明确批准。

## 文件地图

### 身份、数据与服务端

- 修改 `prisma/schema.prisma`：增加内容、图片、促销模型和状态枚举。
- 创建 `prisma/migrations/20260902000000_add_admin_content_management/migration.sql`：仅添加新表、索引、约束和管理员角色回填。
- 修改 `src/lib/auth.ts`、`src/types/next-auth.d.ts`、`src/app/api/auth/signup/route.ts`：把 `role` 放入 JWT/Session，并按 `ADMIN_EMAIL` 给指定新账号授予管理员角色。
- 创建 `src/lib/admin/authorization.ts`：统一实现 `requireAdmin()`。
- 创建 `src/lib/content/types.ts`、`validation.ts)、`timezone.ts`、`promotions.ts`、`storage.ts)、`repository.ts`：共用 DTO、校验、ET 转换、促销计算、Storage 和前台查询。
- 创建 `scripts/promote-admin.ts`、`scripts/seed-content.ts`：管理员初始化和静态资料幂等导入。

### Admin 页面与 API

- 创建 `src/app/admin/layout.tsx`、`page.tsx`、`products/*`、`stories/*`、`promotions/*`、`preview/[type]/[id]/page.tsx`。
- 创建 `src/app/api/admin/products/*`、`stories/*`、`promotions/*` Route Handlers。
- 创建 `src/components/admin/AdminNav.tsx`、`MediaUploader.tsx`、`StatusBadge.tsx`、`ProductForm.tsx`、`StoryForm.tsx`、`PromotionForm.tsx`、`ContentPreview.tsx`。
- 修改 `src/components/layout/Header.tsx`：只为 `session.user.role === "ADMIN"` 渲染后台链接。

### 前台与验证

- 修改 `src/app/products/page.tsx`、`src/app/stories/page.tsx)、`src/app/page.tsx`；创建 `src/components/products/ProductsCatalog.tsx` 和 `src/data/stories.ts`。
- 修改 `src/data/products.ts` 以保留只读静态 fallback。
- 创建与源文件相邻的 `*.test.ts(x)`，以及 `e2e/admin-content-permissions.spec.ts`、`admin-content-management.spec.ts`、`promotion-timezone.spec.ts`。
- 修改 `.env.example`、`README.md` 记录配置、迁移、seed 和部署顺序。

---

### Task 1: 建立内容数据模型和管理员会话角色

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260902000000_add_admin_content_management/migration.sql`
- Modify: `src/lib/auth.ts`
- Modify: `src/types/next-auth.d.ts`
- Modify: `src/app/api/auth/signup/route.ts`
- Create: `src/lib/admin/authorization.ts`
- Create: `src/lib/admin/authorization.test.ts`
- Create: `scripts/promote-admin.ts`
- Modify: `.env.example`

- [ ] **Step 1: 写管理员权限失败测试**

在 `src/lib/admin/authorization.test.ts` 中 mock `getServerSession` 和 `prisma.user.findUnique`，覆盖未登录 401、USER 403、ADMIN 返回 session 三种情况：

    vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
    vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: vi.fn() } } }));

    it("rejects USER", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "USER" } as never);
      await expect(requireAdmin()).rejects.toMatchObject({ status: 403 });
    });

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/admin/authorization.test.ts`。  
预期：FAIL，因为 `authorization.ts` 尚不存在。

- [ ] **Step 3: 增加 Prisma 模型和 SQL 迁移**

在 `prisma/schema.prisma` 保留现有模型，新增 `ContentStatus`、`Product`、`ProductImage`、`CustomerStory`、`StoryImage`、`Promotion`。字段必须覆盖：

    Product: name, model, category, tagline, description, price, originalPrice,
    amazonLink, weightCapacity, seatWidth, range, maxSpeed, productWeight,
    features Json, status, isFeatured, sortOrder, createdAt, updatedAt
    ProductImage: productId, storagePath, publicUrl, originalName, altText,
    sourceNote, sortOrder
    CustomerStory: displayName, location, quote, productId, source, tags Json,
    status, isFeatured, sortOrder, createdAt, updatedAt
    StoryImage: storyId, storagePath, publicUrl, originalName, altText,
    sourceNote, sortOrder
    Promotion: name, productId, startAt, endAt, salePrice, discountPercent,
    label, bannerImageUrl, status, isAutoScheduleEnabled, createdAt, updatedAt

    enum ContentStatus {
      DRAFT
      PUBLISHED
      UNPUBLISHED
    }

所有外键使用 `onDelete: Cascade`；为公开查询增加 `[status, sortOrder]` 索引，为图片增加 `[productId, sortOrder]` 和 `[storyId, sortOrder]` 索引。SQL 文件固定为 `prisma/migrations/20260902000000_add_admin_content_management/migration.sql`，只创建 `content_*` 表、索引、外键和管理员角色回填；不删除或重建 `users`、`orders`、`reviews`、`promo_codes`。

- [ ] **Step 4: 将 role 放入 JWT/Session 并限制注册提权**

认证成功返回 `role: user.role`；JWT 回调保存 `token.role`；Session 回调写入 `session.user.role`。在 `src/types/next-auth.d.ts` 增加 `AppRole = "USER" | "ADMIN"` 和对应 JWT/Session 字段。signup route 忽略请求体中的 `role`，仅当规范化邮箱等于 `process.env.ADMIN_EMAIL` 时写入 `ADMIN`，否则使用 Prisma 默认 `USER`。

- [ ] **Step 5: 实现统一 `requireAdmin()`**

`src/lib/admin/authorization.ts` 导出 `AdminAuthError`（含 `status`）、`getAdminSession()` 和 `requireAdmin()`。实现顺序固定为：`getServerSession(authOptions)` → 缺少 `session.user.id` 抛 401 → 按 user id 查询数据库 role → 非 ADMIN 抛 403 → 返回 `{ session, userId }`。页面和 API 不复制邮箱白名单判断。

- [ ] **Step 6: 添加管理员提升脚本和环境变量说明**

`scripts/promote-admin.ts` 读取 `ADMIN_EMAIL`，执行 `prisma.user.update({ where: { email }, data: { role: "ADMIN" } })`；邮箱不存在时退出码非零。新增 npm script `promote-admin`，并在 `.env.example` 记录 `ADMIN_EMAIL`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`SUPABASE_STORAGE_BUCKET=content-media`。服务密钥只能作为 Vercel 私有环境变量。

- [ ] **Step 7: 验证并提交**

运行：

    npx.cmd prisma format
    npx.cmd prisma validate
    npm.cmd test -- src/lib/admin/authorization.test.ts
    npx.cmd tsc --noEmit

预期：schema valid、权限测试通过、TypeScript 无错误。提交：

    git add prisma src/lib/admin src/lib/auth.ts src/types/next-auth.d.ts src/app/api/auth/signup/route.ts scripts/promote-admin.ts package.json .env.example
    git commit -m "feat: add admin content schema and role authorization"

---

### Task 2: 实现 Supabase Storage、文件校验和内容 DTO

**Files:**

- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/validation.ts`
- Create: `src/lib/content/storage.ts`
- Create: `src/lib/content/validation.test.ts`
- Create: `src/lib/content/storage.test.ts`

- [ ] **Step 1: 写图片校验失败测试**

覆盖 JPG/PNG/WebP 通过、SVG/EXE 拒绝、单张超过 10 MB 拒绝、单条记录超过 12 张拒绝；空 `altText/sourceNote` 转为 null。测试使用 `new File([new Uint8Array(size)], "image.jpg", { type: "image/jpeg" })`，不访问真实 Storage。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/content/validation.test.ts`。  
预期：FAIL，因为内容模块尚不存在。

- [ ] **Step 3: 实现安全校验和 DTO**

`validation.ts` 导出：

    export const MAX_CONTENT_IMAGE_BYTES = 10 * 1024 * 1024;
    export const MAX_CONTENT_IMAGES = 12;
    export const allowedImageTypes = new Set([
      "image/jpeg", "image/png", "image/webp",
    ]);

    export function validateImage(file: File): File {
      if (!allowedImageTypes.has(file.type)) throw new Error("Unsupported image type");
      if (file.size > MAX_CONTENT_IMAGE_BYTES) throw new Error("Image exceeds 10 MB");
      return file;
    }

    export function sanitizeFileName(name: string): string {
      return name.normalize("NFKC")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 120) || "upload";
    }

另导出严格的 `productInputSchema`、`storyInputSchema`、`promotionInputSchema`，限制名称、评论、标签、金额、时间和状态值；客户端不能直接把状态改为 `PUBLISHED`。

- [ ] **Step 4: 实现服务端 Storage**

`storage.ts` 使用 `createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })`，导出 `uploadContentImage(scope, recordId, file, index)` 和 `removeContentImage(path)`。路径格式固定为 `products/<cuid>/<uuid>-<index>-<safe-name>` 或 `stories/<cuid>/<uuid>-<index>-<safe-name>`；只允许 JPG/PNG/WebP；上传返回 `storagePath/publicUrl/originalName`；Storage 错误必须抛出，不能静默吞掉。

- [ ] **Step 5: 测试失败传播和路径安全**

mock Supabase `upload/getPublicUrl/remove`，验证随机路径、公开 URL、原文件名元数据、Storage 错误传播，以及路径穿越字符串被拒绝。

- [ ] **Step 6: 验证并提交**

运行：

    npm.cmd test -- src/lib/content/validation.test.ts src/lib/content/storage.test.ts
    npx.cmd tsc --noEmit

预期：全部通过。提交：

    git add src/lib/content
    git commit -m "feat: add validated content image storage"

---

### Task 3: 建立受保护的 Admin 外壳和多图上传 UI

**Files:**

- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/components/admin/MediaUploader.tsx`
- Create: `src/components/admin/StatusBadge.tsx`
- Create: `src/components/admin/ContentPreview.tsx`
- Create: `src/components/admin/AdminShell.test.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: 写权限和上传交互测试**

测试 USER 不渲染 Admin 链接；ADMIN 渲染 `/admin` 链接；`MediaUploader` 通过 `fireEvent.change` 选择多张文件后显示缩略图、顺序、删除按钮和错误提示；空列表不可提交。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/components/admin/AdminShell.test.tsx`。  
预期：FAIL，因为 Admin 组件尚不存在。

- [ ] **Step 3: 实现 Admin layout**

layout 首先调用 `requireAdmin()`；401 跳转 `/auth/signin?callbackUrl=/admin`；403 渲染无权限页面并返回 403；成功时渲染 AdminNav 和主内容。预览页面和列表页面均不能在客户端绕过该检查。

- [ ] **Step 4: 实现多图上传组件**

组件使用 `useState<PendingMedia[]>`，同时支持 `onDrop` 和 `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`；按选择顺序显示预览缩略图；超过 12 张、超过 10 MB 或 MIME 不允许时在对应文件旁显示错误；向父表单返回 `File[]`、排序和删除回调，不直接调用 Supabase。

- [ ] **Step 5: 只为 ADMIN 渲染 Header 入口**

桌面和移动用户菜单都使用同一条件：

    {session.user?.role === "ADMIN" && (
      <Link href="/admin" onClick={() => setUserMenuOpen(false)}>
        Admin
      </Link>
    )}

不要仅用 CSS 隐藏；页面、预览和 API 仍由服务端保护。

- [ ] **Step 6: 验证并提交**

运行：`npm.cmd test -- src/components/admin/AdminShell.test.tsx`。  
预期：全部通过。提交：

    git add src/app/admin src/components/admin src/components/layout/Header.tsx
    git commit -m "feat: add protected admin shell and multi-image uploader"

---

### Task 4: 完成 Products 草稿、预览、发布和图片 CRUD

**Files:**

- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`
- Create: `src/app/api/admin/products/route.test.ts`
- Create: `src/components/admin/ProductForm.tsx`
- Create: `src/components/admin/ProductForm.test.tsx`
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: 写 Products Route Handler 失败测试**

mock `requireAdmin`、Prisma 和 Storage，验证：

- 未登录 401、USER 403；
- 缺少 `name/model/price` 400；
- POST 默认保存 `DRAFT)，忽略客户端伪造的 `PUBLISHED`；
- multipart 多图按顺序写入 `ProductImage.sortOrder`；
- PATCH 的 `updatedAt` 不一致返回 409；
- 发布重新校验名称、型号、价格和至少一张图片；
- Storage 删除失败时保留数据库引用并返回 502。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/app/api/admin/products/route.test.ts`。  
预期：FAIL，因为 Products handlers 尚不存在。

- [ ] **Step 3: 实现 POST/GET**

POST 接收 FormData：`payload` 为 JSON、`images` 为多个 File；先做 Zod 校验，再创建草稿并逐张上传；任一上传失败时删除已上传路径和刚创建记录。GET 只允许 Admin 读取草稿，公开读取不走此接口。

- [ ] **Step 4: 实现 PATCH action**

`PATCH /api/admin/products/[id]` 支持 `save-draft`、`publish`、`unpublish`、`delete`。发布强制 `status = PUBLISHED`；下线设为 `UNPUBLISHED`；删除要求 `{ confirm: true }`，先清理 Storage 再删数据库。所有写入比较请求中的 `updatedAt`。

- [ ] **Step 5: 实现表单和列表**

ProductForm 覆盖名称、型号、分类、tagline、description、原价、售价、购买链接、体重承重、有效座宽、续航、速度、整车重量、features、首页推荐、排序和 MediaUploader。保存草稿后显示成功状态；预览链接为 `/admin/preview/products/<id>`；列表显示状态、缩略图、更新时间和操作按钮。

- [ ] **Step 6: 验证并提交**

运行：

    npm.cmd test -- src/app/api/admin/products/route.test.ts src/components/admin/ProductForm.test.tsx
    npx.cmd tsc --noEmit

提交：

    git add src/app/api/admin/products src/app/admin/products src/components/admin/ProductForm.tsx src/components/admin/ProductForm.test.tsx
    git commit -m "feat: add admin product draft workflow"

---

### Task 5: 完成 Customer Stories 评论和真实图片管理

**Files:**

- Create: `src/app/api/admin/stories/route.ts`
- Create: `src/app/api/admin/stories/[id]/route.ts`
- Create: `src/app/api/admin/stories/route.test.ts`
- Create: `src/components/admin/StoryForm.tsx`
- Create: `src/components/admin/StoryForm.test.tsx`
- Create: `src/app/admin/stories/page.tsx`
- Create: `src/app/admin/stories/new/page.tsx`
- Create: `src/app/admin/stories/[id]/page.tsx`

- [ ] **Step 1: 写 Stories API 失败测试**

验证普通用户不能读取草稿；管理员可以创建无图片草稿；多图顺序保持；`displayName) 和 `quote` 必填；`source)、`sourceNote)、`altText)、`location` 可为空；发布不强制授权字段；下线后前台查询不到；删除图片同步调用 Storage 删除。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/app/api/admin/stories/route.test.ts`。  
预期：FAIL，因为 Stories handlers 尚不存在。

- [ ] **Step 3: 实现 Stories CRUD**

沿用 Products 的 multipart 和 action 语义。tags 只接受 `Travel`、`Comfort`、`Support`、`New User`、`Family`、`Independence`；发布要求显示名称和评论正文，图片可选；没有图片时前台显示首字母回退。

- [ ] **Step 4: 实现 StoryForm**

表单覆盖评论者、地点、评论内容、关联产品、来源、标签、图片、替代文本、来源备注、精选和排序；预览链接为 `/admin/preview/stories/<id>`；保存草稿、发布、下线和删除显示服务端错误。

- [ ] **Step 5: 验证并提交**

运行：

    npm.cmd test -- src/app/api/admin/stories/route.test.ts src/components/admin/StoryForm.test.tsx
    npx.cmd tsc --noEmit

提交：

    git add src/app/api/admin/stories src/app/admin/stories src/components/admin/StoryForm.tsx src/components/admin/StoryForm.test.tsx
    git commit -m "feat: add admin customer stories workflow"

---

### Task 6: 完成 ET 大促排期、价格计算和管理页面

**Files:**

- Create: `src/lib/content/timezone.ts`
- Create: `src/lib/content/timezone.test.ts`
- Create: `src/lib/content/promotions.ts`
- Create: `src/lib/content/promotions.test.ts`
- Create: `src/app/api/admin/promotions/route.ts`
- Create: `src/app/api/admin/promotions/[id]/route.ts`
- Create: `src/app/api/admin/promotions/route.test.ts`
- Create: `src/components/admin/PromotionForm.tsx`
- Create: `src/components/admin/PromotionForm.test.tsx`
- Create: `src/app/admin/promotions/page.tsx`
- Create: `src/app/admin/promotions/new/page.tsx`
- Create: `src/app/admin/promotions/[id]/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: 写 ET/夏令时失败测试**

覆盖 `America/New_York` 的冬季、夏季、3 月夏令时切换周和结束边界。测试断言 `etInputToUtc("2026-07-01T12:00")`、`utcToEtInput(date)` 可往返，且 `isWithinPromotionWindow(end, start, end)` 为 false；不能使用固定 UTC−5。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/content/timezone.test.ts`。  
预期：FAIL，因为时区模块尚不存在。

- [ ] **Step 3: 实现时区工具和促销函数**

加入 `date-fns-tz`，导出：

    export const PROMOTION_TIME_ZONE = "America/New_York";
    export function etInputToUtc(value: string): Date;
    export function utcToEtInput(value: Date): string;
    export function isWithinPromotionWindow(now: Date, start: Date, end: Date): boolean;

`promotions.ts` 导出纯函数：优先 `salePrice)，否则按 `discountPercent` 计算并四舍五入两位；只有 `PUBLISHED`、自动排期开启且当前 UTC 在 `[startAt, endAt)` 时返回 active promotion。

- [ ] **Step 4: 实现 Promotions API**

发布前拒绝结束早于开始、促销价和折扣同时存在、二者都为空、折扣不在 0 到 100、关联产品不存在。列表显示 `draft/scheduled/active/ended/paused` 派生状态；暂停设为 `UNPUBLISHED`；结束由时间计算，不修改产品原价。

- [ ] **Step 5: 实现 PromotionForm**

表单显示“时间按美国东部时间 ET”，使用 `datetime-local`；填写活动名称、关联产品、促销价或折扣、标签、活动图片、自动排期和状态；客户端不决定最终促销状态，所有 action 调用服务端 API。

- [ ] **Step 6: 验证并提交**

运行：

    npm.cmd test -- src/lib/content/timezone.test.ts src/lib/content/promotions.test.ts src/app/api/admin/promotions/route.test.ts src/components/admin/PromotionForm.test.tsx
    npx.cmd tsc --noEmit

提交：

    git add src/lib/content/timezone.ts src/lib/content/promotions.ts src/lib/content/*.test.ts src/app/api/admin/promotions src/app/admin/promotions src/components/admin/PromotionForm.tsx package.json package-lock.json
    git commit -m "feat: add ET scheduled promotions"

---

### Task 7: 建立内容仓库、静态 seed 和前台读取切换

**Files:**

- Create: `src/lib/content/repository.ts`
- Create: `src/lib/content/repository.test.ts`
- Create: `src/data/stories.ts`
- Create: `scripts/seed-content.ts`
- Create: `src/components/products/ProductsCatalog.tsx`
- Modify: `src/data/products.ts`
- Modify: `src/app/products/page.tsx`
- Modify: `src/app/stories/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `package.json`

- [ ] **Step 1: 写 repository 失败测试**

mock Prisma，验证只返回 `PUBLISHED)；草稿不会出现在公开查询；数据库有已发布记录时优先数据库；查询失败或没有记录时回退静态快照；图片按 `sortOrder) 排序；促销计算不接受客户端时间。

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/content/repository.test.ts`。  
预期：FAIL，因为 repository 尚不存在。

- [ ] **Step 3: 抽出静态快照和幂等 seed**

将现有 Stories 八条评论和精选故事移至 `src/data/stories.ts`，保留四张核验图片和无图首字母回退；Products 继续从 `src/data/products.ts` 提供 fallback。seed 脚本按稳定的 `model/name` 查找并 upsert，重复执行不得创建重复记录；只登记现有 `public` 图片路径，不重复上传。

- [ ] **Step 4: 实现 repository**

导出：

    export async function listPublishedProducts(): Promise<ReadonlyArray<PublicProduct>>;
    export async function listPublishedStories(): Promise<ReadonlyArray<PublicStory>>;
    export async function getAdminContentSummary(): Promise<AdminContentSummary>;
    export async function getDraftPreview(
      type: "products" | "stories" | "promotions",
      id: string,
    ): Promise<AdminPreview>;

公开函数只返回 `PUBLISHED) DTO；捕获数据库连接错误后回退静态快照；preview 不回退，找不到记录返回 404。

- [ ] **Step 5: 抽出 Products 客户端交互**

把 Products 页的 `useState/useMemo/useCart` 逻辑移动到 `ProductsCatalog.tsx`；页面改为服务端组件并调用 `listPublishedProducts()`。价格显示优先使用 repository 返回的 active promotion；前台不显示草稿。

- [ ] **Step 6: 切换 Stories 和首页**

Stories 使用已发布数据，保留筛选、图片失败回退和无图首字母；首页精选产品、Testimonials 和促销横幅使用 repository；数据库不可用时继续显示当前静态内容。

- [ ] **Step 7: 运行 seed 和回归测试**

新增 npm script `seed:content`，运行：

    npx.cmd prisma generate
    npm.cmd run seed:content
    npm.cmd test -- src/lib/content/repository.test.ts src/app/stories/page.test.tsx src/data/products.test.ts
    npx.cmd tsc --noEmit

预期：seed 幂等、仅已发布内容出现在公开 repository、四张 Stories 图片和 Eleanor 无占位图测试通过。提交：

    git add src/lib/content/repository.ts src/lib/content/repository.test.ts src/data/stories.ts scripts/seed-content.ts src/data/products.ts src/app/products/page.tsx src/components/products/ProductsCatalog.tsx src/app/stories/page.tsx src/app/page.tsx package.json
    git commit -m "feat: serve published content with static fallback"

---

### Task 8: 预览路由、端到端测试、预览部署和生产门禁

**Files:**

- Create: `src/app/admin/preview/[type]/[id]/page.tsx`
- Create: `e2e/admin-content-permissions.spec.ts`
- Create: `e2e/admin-content-management.spec.ts`
- Create: `e2e/promotion-timezone.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `README.md`
- Modify: `.env.example`

- [ ] **Step 1: 写权限 E2E 测试**

使用预置 USER/ADMIN 测试账号，验证 USER 看不到 `Admin` 链接，访问 `/admin` 得到 403；ADMIN 可以进入 `/admin/products/new`，填写名称、型号、价格、体重承重、有效座宽，上传 fixture 图片，保存草稿、打开 preview、发布并看到 `PUBLISHED`。

- [ ] **Step 2: 写多图和促销 E2E 测试**

验证 Products 和 Stories 一次选择多图后顺序正确；促销在当前 ET 窗口内显示标签和促销价，结束后恢复原价；3 月夏令时切换日期不偏移一小时。

- [ ] **Step 3: 实现预览路由**

预览路由调用 `requireAdmin()` 和 `getDraftPreview()`，未知 type/id 返回 404；设置 `robots: { index: false, follow: false }`；预览页面显示 `DRAFT) 徽标和“仅管理员可见”提示，复用前台卡片但不改变公开查询。

- [ ] **Step 4: 更新 README 和环境变量文档**

明确顺序：配置 Supabase bucket 和 Vercel 私有环境变量 → 在预览数据库执行迁移 → 注册/提升管理员 → 运行 `seed:content` → 部署 Preview → 浏览器验收 → 获得用户批准后执行生产迁移和 `vercel deploy --prod`。说明图片格式、10 MB/12 张限制、ET 时区、草稿规则和删除行为。不得写入真实密钥。

- [ ] **Step 5: 运行完整静态验证**

运行：

    npm.cmd test
    npm.cmd run lint
    npx.cmd tsc --noEmit
    npx.cmd prisma validate
    npm.cmd run build
    npm.cmd run test:e2e

预期：测试全部通过；lint 仅保留已有 `<img>` 警告；TypeScript、Prisma validate、Next build 和 E2E 均成功；构建命令包含 `prisma generate && next build`。

- [ ] **Step 6: 创建预览数据库并部署 Preview**

使用独立预览数据库连接串执行 `npx.cmd prisma migrate deploy`、`npm.cmd run promote-admin`、`npm.cmd run seed:content`，然后运行：

    npx.cmd vercel deploy --yes --scope ethan-sakima-project --project brand-website

预期返回 READY Preview URL。用该 URL 验证管理员上传/草稿/预览/发布、USER 403、多图顺序、ET 促销和 Stories 四张核验图片。

- [ ] **Step 7: 生产门禁**

把 Preview URL、迁移输出、测试结果、环境变量清单和已知限制交给用户复核；在用户明确批准前，不执行生产迁移、不运行 `vercel deploy --prod`、不切换 `goldseason.vip`。

- [ ] **Step 8: 获得批准后生产发布**

确认项目为 `brand-website`、团队为 `ethan-sakima-project`，执行生产迁移、管理员提升、幂等 seed 和带 `--prod --scope ethan-sakima-project --project brand-website` 的部署。使用部署命令输出的生产 URL 执行 `vercel inspect`；只有状态 `READY`、`goldseason.vip/admin` 的 USER/ADMIN 权限检查和三类前台内容线上检查全部通过，才报告生产完成。

---

## 计划自检

- 单管理员邮箱与 `ADMIN` 角色：Task 1、Task 3、Task 8。
- 普通用户隐藏入口、直接访问和 API 403：Task 1、Task 3、Task 8。
- Products 多字段、多图、草稿/预览/发布/下线/删除：Task 2–4。
- Customer Stories 图片、来源/备注可选、无图首字母：Task 2、Task 5、Task 7。
- Promotions ET 排期、促销价/折扣、自动开始/结束：Task 6–7。
- Supabase Storage、格式/大小/数量和孤立文件清理：Task 2、Task 4–5。
- 前台数据库优先、静态回退、只读取 `PUBLISHED`：Task 7。
- 并发编辑、结构化错误、服务端重新校验：Task 4–6。
- 自动化、浏览器、构建和正式域名验收：Task 8。
- 已扫描本计划，未发现 TODO、TBD 或“稍后补充”等占位指令；迁移目录、文件路径、测试命令和提交命令均已固定。
