# Dynamic Product Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $subagent-driven-development (recommended) or $executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 GoldSeason 实现管理员可维护的动态产品品类、规格模板、多 SKU、包装内含物和兼容配件，并让商品目录与电动/手动轮椅推荐器读取同一份已发布数据，同时继续通过 Amazon 链接完成购买。

**Architecture:** Prisma/PostgreSQL 保存关系实体，受模板约束的产品与 SKU 规格保存在结构化 JSON 中；独立领域模块负责单位规范化、模板校验、发布校验和公开 DTO 映射。Admin API 通过事务写入产品聚合，商品目录和 Wheelchair Finder 只读取已发布且通过校验的活动 SKU；现有静态数据仅用于迁移和迁移前回退，不再作为长期第二数据源。

**Tech Stack:** Next.js 14 App Router、React 18、TypeScript、Prisma 5/PostgreSQL、Zod、Tailwind CSS、NextAuth、Vercel Blob、Vitest/Testing Library、Playwright、Vercel。

---

## 工作上下文和范围

- 工作树：`C:/tmp/brand-website-stories-production`。
- 当前分支：`codex/admin-content-management`。
- 设计规格：`docs/superpowers/specs/2026-09-08-dynamic-product-publishing-design.md`。
- 目标 Vercel 项目：`brand-website`；正式域名：`https://goldseason.vip`。
- 保留购物车到 Amazon 的现有购买路径。本计划不安装 Stripe、不创建支付会话、不接收银行卡资料、不实现站内订单付款。
- 不修改 Stories、Promotions 或认证行为，除非类型兼容或回归测试确实需要。
- 不执行破坏性 Prisma 命令。生产数据库只运行已审查的 `prisma migrate deploy` 和幂等迁移脚本。

## 文件职责

### 领域和数据

- 修改 `prisma/schema.prisma`：新增品类、模板字段、SKU、包装内含物和配件关系。
- 创建 `prisma/migrations/20260908000000_add_dynamic_product_catalog/migration.sql`：非破坏性新增表、内置品类和旧分类回填。
- 创建 `src/lib/catalog/types.ts`：动态规格、公开商品、SKU、品类和字段错误 DTO。
- 创建 `src/lib/catalog/semantic-fields.ts`：推荐器依赖的受保护语义字段注册表。
- 创建 `src/lib/catalog/units.ts`：英制/公制输入到规范单位的纯函数。
- 创建 `src/lib/catalog/specifications.ts`：按模板解析和规范化规格 JSON。
- 创建 `src/lib/catalog/publish-validation.ts`：产品聚合发布校验。
- 创建 `src/lib/catalog/category-service.ts`：品类模板新增、编辑、归档规则。
- 创建 `src/lib/catalog/product-service.ts`：产品、SKU、内含物和配件的事务写入。
- 创建 `src/lib/catalog/public-catalog.ts`：数据库记录到前台和推荐器 DTO 的映射。

### Admin API 和页面

- 创建 `src/app/api/admin/product-categories/route.ts` 和 `[id]/route.ts`。
- 创建 `src/app/admin/product-categories/page.tsx`、`new/page.tsx`、`[id]/page.tsx`。
- 创建 `src/components/admin/CategoryForm.tsx` 和 `SpecificationTemplateEditor.tsx`。
- 修改 `src/app/api/admin/products/route.ts` 和 `[id]/route.ts`。
- 重构 `src/components/admin/ProductForm.tsx`；创建 `ProductOverviewFields.tsx`、`ProductSpecificationEditor.tsx`、`ProductVariantEditor.tsx`、`ProductAccessoriesEditor.tsx`。
- 修改产品新建/编辑页面，使服务端加载活动品类、字段模板和可关联配件。

### 前台和推荐器

- 修改 `src/lib/content/repository.ts`，返回动态公开商品 DTO。
- 创建 `src/components/products/ProductCategoryNav.tsx`、`ProductVariantSelector.tsx`、`ProductSpecifications.tsx`、`ProductAccessories.tsx`。
- 修改 `src/components/products/ProductsCatalog.tsx`、`src/components/HomePageClient.tsx` 和相关测试。
- 修改 `src/lib/wheelchair/types.ts`、`assessment-schema.ts`、`recommend.ts` 和测试。
- 创建 `src/lib/wheelchair/catalog.ts`，把动态规格转换为推荐候选。
- 创建 `src/components/wheelchair/WheelchairFinderClient.tsx`；把 `src/app/wheelchair-finder/page.tsx` 改成服务器数据入口。
- 修改 `src/hooks/useWheelchairAssessment.ts`、`FinderResults.tsx` 和测试。

### 迁移、说明与验收

- 创建 `scripts/seed-product-categories.ts` 和 `scripts/migrate-product-catalog.ts`。
- 修改 `scripts/seed-content.ts`，后续种子使用动态品类和默认 SKU。
- 修改 `package.json`、`README.md`、`.env.example` 和 `.gitignore`。
- 创建 `e2e/admin-product-catalog.spec.ts` 和 `e2e/dynamic-wheelchair-finder.spec.ts`。

---

### Task 1: 建立动态规格类型、受保护语义和单位规范化

**Files:**

- Create: `src/lib/catalog/types.ts`
- Create: `src/lib/catalog/semantic-fields.ts`
- Create: `src/lib/catalog/units.ts`
- Create: `src/lib/catalog/units.test.ts`
- Create: `src/lib/catalog/specifications.ts`
- Create: `src/lib/catalog/specifications.test.ts`

- [x] **Step 1: 写单位和规格解析失败测试**

在 `units.test.ts` 覆盖 `lb -> kg`、`in -> mm`、`mi -> km`、`mph -> km/h`，并拒绝 `NaN`、负值和不属于单位族的单位。在 `specifications.test.ts` 构造长度、重量、布尔、选项和三维尺寸字段，验证缺失值不会被转换为零：

```ts
it("normalizes US measurements without losing the entered value", () => {
  expect(normalizeNumber(330, "lb", "WEIGHT")).toEqual({
    inputValue: 330,
    inputUnit: "lb",
    normalizedValue: expect.closeTo(149.685, 3),
    normalizedUnit: "kg",
  });
});

it("keeps NOT_PROVIDED distinct from zero", () => {
  expect(normalizeSpecification(field, {
    status: "NOT_PROVIDED",
    value: null,
    unit: "in",
  })).toEqual({ status: "NOT_PROVIDED", value: null });
});
```

- [x] **Step 2: 运行测试并确认按预期失败**

运行：

```powershell
npm.cmd test -- src/lib/catalog/units.test.ts src/lib/catalog/specifications.test.ts
```

预期：FAIL，提示 `@/lib/catalog/units` 和 `specifications` 不存在。

- [x] **Step 3: 定义稳定 DTO**

在 `types.ts` 定义并导出以下核心类型，后续模块必须复用，不能复制近似接口：

```ts
export type SpecificationStatus = "PROVIDED" | "NOT_PROVIDED" | "CONFLICTING";
export type RecommendationProfile = "NONE" | "POWERED_WHEELCHAIR" | "MANUAL_WHEELCHAIR";
export type SpecificationScope = "PRODUCT" | "VARIANT";
export type SpecificationDataType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DIMENSIONS";
export type UnitFamily = "NONE" | "LENGTH" | "WEIGHT" | "DISTANCE" | "SPEED" | "POWER" | "VOLTAGE" | "CAPACITY_AH" | "ENERGY_WH" | "ANGLE";

export type DimensionsValue = { length: number; width: number; height: number };
export type SpecificationInput = {
  status: SpecificationStatus;
  value: string | number | boolean | DimensionsValue | null;
  unit?: string | null;
  sourceNote?: string | null;
};
export type StoredSpecification = SpecificationInput & {
  inputValue?: number | DimensionsValue;
  inputUnit?: string;
  normalizedValue?: number | DimensionsValue;
  normalizedUnit?: string;
};
export type SpecificationMap = Record<string, StoredSpecification>;

export type FieldError = {
  tab: "overview" | "specifications" | "variants" | "accessories" | "media";
  fieldKey: string;
  variantId?: string;
  message: string;
};
```

- [x] **Step 4: 建立受保护语义注册表**

`semantic-fields.ts` 导出 `SEMANTIC_FIELDS`、`POWERED_REQUIRED_SEMANTICS` 和 `MANUAL_REQUIRED_SEMANTICS`。语义键至少包含：

```ts
export const SEMANTIC_FIELDS = {
  maxUserWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  effectiveSeatWidth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatDepth: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatHeight: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  seatToFootrest: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  overallDimensions: { dataType: "DIMENSIONS", unitFamily: "LENGTH", canonicalUnit: "mm" },
  foldedDimensions: { dataType: "DIMENSIONS", unitFamily: "LENGTH", canonicalUnit: "mm" },
  netWeightWithoutBattery: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  productWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  batteryWeight: { dataType: "NUMBER", unitFamily: "WEIGHT", canonicalUnit: "kg" },
  range: { dataType: "NUMBER", unitFamily: "DISTANCE", canonicalUnit: "km" },
  turningRadius: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  obstacleHeight: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  frontWheelDiameter: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  rearWheelDiameter: { dataType: "NUMBER", unitFamily: "LENGTH", canonicalUnit: "mm" },
  tireClass: { dataType: "SELECT", unitFamily: "NONE", canonicalUnit: null },
  propulsionType: { dataType: "SELECT", unitFamily: "NONE", canonicalUnit: null },
  batteryRemovable: { dataType: "BOOLEAN", unitFamily: "NONE", canonicalUnit: null },
  batteryVoltage: { dataType: "NUMBER", unitFamily: "VOLTAGE", canonicalUnit: "V" },
  batteryCapacityAh: { dataType: "NUMBER", unitFamily: "CAPACITY_AH", canonicalUnit: "Ah" },
} as const;
```

`POWERED_REQUIRED_SEMANTICS` 包含设计文档第 7 节规定的全部电动轮椅字段；`MANUAL_REQUIRED_SEMANTICS` 包含手动轮椅字段。最大承重和有效座宽在两个列表中都标记为硬筛选字段。

- [x] **Step 5: 实现单位和模板驱动的规格规范化**

`units.ts` 只实现已列出的单位族和显式转换表；`specifications.ts` 导出：

```ts
export function normalizeSpecification(
  field: SpecificationFieldDefinition,
  input: SpecificationInput,
): StoredSpecification;

export function normalizeSpecificationMap(
  fields: readonly SpecificationFieldDefinition[],
  input: Record<string, SpecificationInput>,
  scope: SpecificationScope,
): SpecificationMap;
```

实现必须满足：`NOT_PROVIDED` 不要求值；`CONFLICTING` 保留 `sourceNote`；数字和尺寸按单位族换算；文本和选项 trim；未知字段、错误单位、错误数据类型和超出字段 `minValue/maxValue` 的值抛出含字段键的 `SpecificationInputError`。

- [x] **Step 6: 运行测试和类型检查**

```powershell
npm.cmd test -- src/lib/catalog/units.test.ts src/lib/catalog/specifications.test.ts
npx.cmd tsc --noEmit
```

预期：全部 PASS，TypeScript 无错误。

- [x] **Step 7: 提交领域基础**

```powershell
git add src/lib/catalog
git commit -m "feat: add catalog specification domain"
```

---

### Task 2: 新增 Prisma 关系模型、内置品类和幂等种子

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260908000000_add_dynamic_product_catalog/migration.sql`
- Create: `src/lib/catalog/builtin-templates.ts`
- Create: `src/lib/catalog/builtin-templates.test.ts`
- Create: `scripts/seed-product-categories.ts`
- Create: `src/seed-product-categories.test.ts`
- Modify: `package.json`

- [x] **Step 1: 写内置模板和幂等种子失败测试**

测试必须断言四个产品品类和一个配件品类具有稳定 slug；电动/手动模板包含正确受保护字段；重复执行 seed 不增加重复品类或字段：

```ts
expect(BUILTIN_CATEGORIES.map((item) => item.slug)).toEqual([
  "powered-wheelchairs",
  "manual-wheelchairs",
  "mobility-scooters",
  "shower-chairs",
  "accessories",
]);
expect(powered.fields.find((field) => field.semanticKey === "effectiveSeatWidth"))
  .toMatchObject({ isProtected: true, requiredForRecommendation: true });
```

- [x] **Step 2: 运行测试并确认失败**

运行：`npm.cmd test -- src/lib/catalog/builtin-templates.test.ts src/seed-product-categories.test.ts`。

预期：FAIL，因为模板和 seed 尚不存在。

- [x] **Step 3: 扩展 Prisma schema**

新增以下枚举和模型；保留 `Product.category` 作为本次兼容迁移字段，不在此版本删除：

```prisma
enum ProductCategoryRole {
  PRODUCT
  ACCESSORY
}

enum RecommendationProfile {
  NONE
  POWERED_WHEELCHAIR
  MANUAL_WHEELCHAIR
}

enum CatalogRecordStatus {
  ACTIVE
  ARCHIVED
}

enum SpecificationScope {
  PRODUCT
  VARIANT
}

enum SpecificationDataType {
  TEXT
  NUMBER
  BOOLEAN
  SELECT
  DIMENSIONS
}

model ProductCategory {
  id                    String                @id @default(cuid())
  name                  String
  slug                  String                @unique
  description           String?
  role                  ProductCategoryRole   @default(PRODUCT)
  recommendationProfile RecommendationProfile @default(NONE)
  status                CatalogRecordStatus   @default(ACTIVE)
  sortOrder             Int                   @default(0)
  templateVersion       Int                   @default(1)
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
  fields                SpecificationField[]
  products              Product[]

  @@index([status, sortOrder])
  @@map("content_product_categories")
}

model SpecificationField {
  id                        String                    @id @default(cuid())
  categoryId                String
  key                       String
  label                     String
  group                     String
  scope                     SpecificationScope
  dataType                  SpecificationDataType
  unitFamily                String                    @default("NONE")
  defaultDisplayUnit        String?
  options                   Json                      @default("[]")
  helpText                  String?
  minValue                  Decimal?                  @db.Decimal(12, 4)
  maxValue                  Decimal?                  @db.Decimal(12, 4)
  requiredForPublish        Boolean                   @default(false)
  requiredForRecommendation Boolean                   @default(false)
  semanticKey               String?
  isProtected               Boolean                   @default(false)
  status                    CatalogRecordStatus       @default(ACTIVE)
  sortOrder                 Int                       @default(0)
  createdAt                 DateTime                  @default(now())
  updatedAt                 DateTime                  @updatedAt
  category                  ProductCategory           @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@unique([categoryId, key])
  @@unique([categoryId, semanticKey])
  @@index([categoryId, status, sortOrder])
  @@map("content_specification_fields")
}

model ProductVariant {
  id                    String   @id @default(cuid())
  productId             String
  sku                   String   @unique
  factoryModel          String?
  label                 String?
  colorName             String?
  colorHex              String?
  priceOverride         Decimal? @db.Decimal(10, 2)
  originalPriceOverride Decimal? @db.Decimal(10, 2)
  purchaseLinkOverride  String?
  specifications        Json     @default("{}")
  isActive              Boolean  @default(true)
  sortOrder             Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  product               Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, isActive, sortOrder])
  @@map("content_product_variants")
}

model ProductInBoxItem {
  id        String  @id @default(cuid())
  productId String
  name      String
  quantity  Int     @default(1)
  note      String?
  sortOrder Int     @default(0)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, sortOrder])
  @@map("content_product_in_box_items")
}

model ProductAccessory {
  productId          String
  accessoryProductId String
  sortOrder          Int     @default(0)
  product             Product @relation("ProductCompatibleAccessories", fields: [productId], references: [id], onDelete: Cascade)
  accessoryProduct    Product @relation("AccessoryForProducts", fields: [accessoryProductId], references: [id], onDelete: Cascade)

  @@id([productId, accessoryProductId])
  @@index([accessoryProductId])
  @@map("content_product_accessories")
}
```

给 `Product` 增加 `categoryId String?`、`specifications Json @default("{}")`、`categoryTemplateVersion Int @default(1)` 以及上述关系字段。迁移 SQL 先创建表和内置品类，按旧 `category` 把产品回填到 `powered-wheelchairs` 或 `mobility-scooters`，但暂不把 `categoryId` 设为 NOT NULL，以便冲突数据进入人工复核。

- [x] **Step 4: 定义内置模板**

`builtin-templates.ts` 使用 Task 1 的语义注册表生成模板，明确每个字段的 `scope`。共同人体适配字段和 SKU 性能字段采用 `VARIANT`；仅产品文案不进入规格 JSON。淋浴椅字段包括承重、座面宽深、整体尺寸、可调高度、材料、防滑脚、扶手、靠背和便桶兼容性。Accessories 默认不强制规格字段。

- [x] **Step 5: 实现幂等种子**

`seed-product-categories.ts` 使用 slug 和 `[categoryId,key]` upsert；只更新内置受保护字段，不覆盖管理员对普通自定义字段的修改。导出：

```ts
export async function seedProductCategories(client = prisma) {
  return client.$transaction(async (tx) => {
    // Upsert categories, then protected fields by stable key.
    return { categories: BUILTIN_CATEGORIES.length, fields: fieldCount };
  });
}
```

在 `package.json` 增加 `seed:catalog`。CLI 错误时设置非零退出码，成功打印品类和字段数量。

- [x] **Step 6: 验证 schema、迁移和 seed 测试**

```powershell
npx.cmd prisma format
npx.cmd prisma validate
npm.cmd test -- src/lib/catalog/builtin-templates.test.ts src/seed-product-categories.test.ts
npx.cmd tsc --noEmit
```

预期：schema valid、测试 PASS、类型检查通过。

- [x] **Step 7: 提交数据模型**

```powershell
git add prisma src/lib/catalog/builtin-templates* scripts/seed-product-categories.ts src/seed-product-categories.test.ts package.json
git commit -m "feat: add dynamic product catalog schema"
```

---

### Task 3: 实现品类和规格模板服务及 Admin API

**Files:**

- Create: `src/lib/catalog/category-service.ts`
- Create: `src/lib/catalog/category-service.test.ts`
- Create: `src/lib/catalog/category-validation.ts`
- Create: `src/app/api/admin/product-categories/route.ts`
- Create: `src/app/api/admin/product-categories/[id]/route.ts`
- Create: `src/app/api/admin/product-categories/route.test.ts`

- [ ] **Step 1: 写品类生命周期失败测试**

覆盖：普通用户 403；slug 规范化和唯一性；新自定义品类默认 `NONE`；推荐配置自动带入受保护字段；拒绝删除或改变受保护字段类型/单位族；已有产品时拒绝硬删除；归档成功；模板变更增加版本号；所有已发布产品未补齐前拒绝把字段设为必填。

```ts
it("rejects changing a protected semantic field", async () => {
  await expect(updateCategoryTemplate("cat-1", {
    fields: [{ id: "f1", dataType: "TEXT", semanticKey: "maxUserWeight" }],
  })).rejects.toMatchObject({ code: "PROTECTED_FIELD" });
});
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/catalog/category-service.test.ts src/app/api/admin/product-categories/route.test.ts`。

预期：FAIL，因为服务和路由不存在。

- [ ] **Step 3: 实现 category Zod schema 和服务**

`category-validation.ts` 校验名称、slug、role、推荐配置及字段数组。自定义请求不能传 `isProtected: true` 或自选 `semanticKey`；`ACCESSORY` 只能使用 `NONE`；字段 key 使用小驼峰字母数字且品类内唯一。

`category-service.ts` 导出：

```ts
export async function listAdminCategories(): Promise<AdminCategorySummary[]>;
export async function createCategory(input: CategoryInput): Promise<AdminCategory>;
export async function updateCategory(id: string, input: CategoryInput, updatedAt: string): Promise<AdminCategory>;
export async function archiveCategory(id: string, updatedAt: string): Promise<AdminCategory>;
```

更新操作在一个 Prisma transaction 中比较 `updatedAt`、验证保护字段、更新普通字段并把 `templateVersion` 加一。新增必填字段前，查询所有 `PUBLISHED` 产品及活动 SKU，并用 `validateSpecificationMap` 确认都有值。

- [ ] **Step 4: 实现受管理员保护的路由**

GET 返回品类、字段和产品计数；POST 创建品类；PATCH 支持 `save` 和 `archive`。每个 handler 第一条业务调用必须是 `requireAdmin()`。错误统一返回：

```json
{ "error": "Protected recommendation fields cannot be removed", "code": "PROTECTED_FIELD", "fields": [] }
```

并发版本不匹配返回 409；slug 重复返回 409；校验问题返回 400。

- [ ] **Step 5: 验证并提交**

```powershell
npm.cmd test -- src/lib/catalog/category-service.test.ts src/app/api/admin/product-categories/route.test.ts
npx.cmd tsc --noEmit
git add src/lib/catalog/category-* src/app/api/admin/product-categories
git commit -m "feat: add product category template API"
```

预期：测试 PASS，TypeScript 通过，提交只包含本任务文件。

---

### Task 4: 建立 Product Categories 管理界面

**Files:**

- Modify: `src/components/admin/AdminNav.tsx`
- Create: `src/components/admin/CategoryForm.tsx`
- Create: `src/components/admin/SpecificationTemplateEditor.tsx`
- Create: `src/components/admin/CategoryForm.test.tsx`
- Create: `src/app/admin/product-categories/page.tsx`
- Create: `src/app/admin/product-categories/new/page.tsx`
- Create: `src/app/admin/product-categories/[id]/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/admin-list-pages.test.tsx`

- [ ] **Step 1: 写管理界面失败测试**

测试管理员导航包含 `Product Categories`；列表显示角色、推荐配置、状态和产品数；新建表单添加普通字段；推荐配置切换后显示受保护字段；受保护字段没有删除按钮；归档要求确认。

```tsx
expect(screen.getByRole("link", { name: "Product Categories" }))
  .toHaveAttribute("href", "/admin/product-categories");
expect(screen.queryByRole("button", { name: /remove weight capacity/i }))
  .not.toBeInTheDocument();
```

- [ ] **Step 2: 运行测试并确认失败**

运行：`npm.cmd test -- src/components/admin/CategoryForm.test.tsx src/app/admin/admin-list-pages.test.tsx`。

预期：FAIL，因为品类页面和组件不存在。

- [ ] **Step 3: 实现列表和表单**

CategoryForm 包含 Overview 和 Specification Template 两个无嵌套卡片的页面区段。模板编辑器按 group 分组，使用 select 设置类型和单位族、checkbox 设置必填、上下箭头调整顺序、trash 图标归档普通字段。所有不熟悉的图标使用 `title` 和可访问名称。

表单只提交 DTO，不自行决定 protected 字段：

```ts
const response = await fetch(
  initialData
    ? `/api/admin/product-categories/${initialData.id}`
    : "/api/admin/product-categories",
  {
    method: initialData ? "PATCH" : "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...form, updatedAt: initialData?.updatedAt }),
  },
);
```

服务端页面直接用 category service 加载数据；普通用户仍由 `/admin` layout 拦截。

- [ ] **Step 4: 验证并提交**

```powershell
npm.cmd test -- src/components/admin/CategoryForm.test.tsx src/app/admin/admin-list-pages.test.tsx
npx.cmd tsc --noEmit
git add src/components/admin/CategoryForm* src/components/admin/SpecificationTemplateEditor.tsx src/components/admin/AdminNav.tsx src/app/admin/product-categories src/app/admin/page.tsx src/app/admin/admin-list-pages.test.tsx
git commit -m "feat: add product category management UI"
```

---

### Task 5: 实现产品聚合校验和事务写入

**Files:**

- Create: `src/lib/catalog/product-validation.ts`
- Create: `src/lib/catalog/publish-validation.ts`
- Create: `src/lib/catalog/publish-validation.test.ts`
- Create: `src/lib/catalog/product-service.ts`
- Create: `src/lib/catalog/product-service.test.ts`

- [ ] **Step 1: 写产品聚合失败测试**

覆盖：草稿允许不完整；发布至少一个活动 SKU；SKU 全局唯一；产品默认价格/链接由 SKU 继承；SKU 覆盖价格有效；产品规格和 SKU 规格按 scope 分开；轮椅缺承重或有效座宽时返回定位错误；兼容配件必须是 `ACCESSORY + PUBLISHED`；拒绝自关联和重复关联；所有聚合写入共用一个 transaction。

```ts
expect(validateForPublish(poweredProductMissingWidth, poweredTemplate))
  .toContainEqual({
    tab: "variants",
    variantId: "variant-1",
    fieldKey: "effectiveSeatWidth",
    message: "Effective seat width is required for wheelchair recommendations",
  });
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/catalog/publish-validation.test.ts src/lib/catalog/product-service.test.ts`。

预期：FAIL，因为聚合服务尚不存在。

- [ ] **Step 3: 定义产品输入 schema**

`product-validation.ts` 定义 `productAggregateInputSchema`，在现有产品基础字段上新增：

```ts
categoryId: z.string().min(1),
categoryTemplateVersion: z.number().int().positive(),
specifications: z.record(specificationInputSchema).default({}),
variants: z.array(variantInputSchema).min(1),
inBoxItems: z.array(z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(99),
  note: z.string().trim().max(500).nullable(),
})).max(50),
accessoryProductIds: z.array(z.string()).max(50)
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate accessory"),
```

价格非负；Amazon/购买链接必须是 HTTPS URL；颜色十六进制格式严格校验；活动 SKU 至少一个仅在发布阶段要求。发布时每个活动 SKU 必须存在自身购买链接或可继承的产品默认购买链接；旧数据在迁移复核期间缺少链接时可继续展示，但不能再次发布，直到补齐链接。

- [ ] **Step 4: 实现发布校验**

`validateForPublish()` 返回 `FieldError[]`，不在第一个错误后提前结束。它依次检查通用商品资料、模板版本、模板必填字段、轮椅推荐字段、SKU、图片和配件。`NOT_PROVIDED` 对 `requiredForPublish` 和 `requiredForRecommendation` 都视为缺失；航空相关字段缺失只产生 warning，不阻止一般发布。

- [ ] **Step 5: 实现事务产品服务**

`product-service.ts` 导出：

```ts
export async function createProductDraft(input: ProductAggregateInput): Promise<ProductAggregate>;
export async function saveProductDraft(id: string, input: ProductAggregateInput, expectedUpdatedAt: string): Promise<ProductAggregate>;
export async function publishProduct(id: string, expectedUpdatedAt: string): Promise<ProductAggregate>;
export async function unpublishProduct(id: string, expectedUpdatedAt: string): Promise<ProductAggregate>;
```

save 在 transaction 内加载品类和活动字段、规范化产品/SKU 规格、更新 Product、按 id upsert SKU 和 in-box rows、删除本次 payload 中不存在的旧行并重建有向 accessory 关系。ProductImage 不在该事务中删除。publish 加载完整聚合并运行 `validateForPublish`，无错误才更新 `status`。

- [ ] **Step 6: 验证并提交**

```powershell
npm.cmd test -- src/lib/catalog/publish-validation.test.ts src/lib/catalog/product-service.test.ts
npx.cmd tsc --noEmit
git add src/lib/catalog/product-*.ts src/lib/catalog/product-*.test.ts src/lib/catalog/publish-validation*
git commit -m "feat: add transactional product aggregate service"
```

---

### Task 6: 扩展 Products Admin API

**Files:**

- Modify: `src/app/api/admin/products/route.ts`
- Modify: `src/app/api/admin/products/[id]/route.ts`
- Modify: `src/app/api/admin/products/route.test.ts`
- Modify: `src/lib/content/validation.ts`

- [ ] **Step 1: 扩展 Route Handler 失败测试**

在现有图片测试基础上加入：POST/PATCH 传递 category、规格、SKU、内含物和配件；保存草稿调用产品服务；发布返回全部字段错误；图片上传失败不留下产品；错误配件关系返回 400；并发冲突返回 409。

```ts
expect(await response.json()).toMatchObject({
  error: "Publish validation failed",
  fields: [{ tab: "variants", variantId: "v1", fieldKey: "maxUserWeight" }],
});
```

- [ ] **Step 2: 运行测试并确认失败**

运行：`npm.cmd test -- src/app/api/admin/products/route.test.ts`。

- [ ] **Step 3: 路由改用 product service**

POST 仍先创建记录再上传图片，但所有非图片聚合写入通过 `createProductDraft`。PATCH 的 `save-draft/publish/unpublish` 调用对应服务；只有图片排序、添加和删除仍在 route 处理。发布时 service 检查至少一张图片。

publish/unpublish 成功后调用 `revalidatePath("/products")`、`revalidatePath("/")` 和 `revalidatePath("/wheelchair-finder")`；保存草稿不刷新公开路径。品类 API 保存或归档后刷新 `/products`，避免前台继续使用旧品类和旧商品缓存。

将旧 `productInputSchema` 保留为兼容导出，新增表单统一使用 `productAggregateInputSchema`。客户端无法通过 payload 直接设置 `status`、`isProtected` 或 `semanticKey`。

- [ ] **Step 4: 确保图片失败补偿与数据库事务兼容**

上传失败时删除本次新 Blob；新建产品失败时删除新产品；编辑产品失败不得删除原有图片或改变线上状态。Blob 删除失败返回 502，并保留数据库图片引用，延续现有安全规则。

- [ ] **Step 5: 验证并提交**

```powershell
npm.cmd test -- src/app/api/admin/products/route.test.ts
npx.cmd tsc --noEmit
git add src/app/api/admin/products src/lib/content/validation.ts
git commit -m "feat: extend admin product API for variants and accessories"
```

---

### Task 7: 重构产品编辑器为五个可定位页签

**Files:**

- Modify: `src/components/admin/ProductForm.tsx`
- Modify: `src/components/admin/ProductForm.test.tsx`
- Create: `src/components/admin/ProductOverviewFields.tsx`
- Create: `src/components/admin/ProductSpecificationEditor.tsx`
- Create: `src/components/admin/ProductVariantEditor.tsx`
- Create: `src/components/admin/ProductAccessoriesEditor.tsx`
- Create: `src/components/admin/ProductEditors.test.tsx`
- Modify: `src/app/admin/products/new/page.tsx`
- Modify: `src/app/admin/products/[id]/page.tsx`
- Modify: `src/app/admin/admin-content-pages.test.tsx`

- [ ] **Step 1: 写编辑器交互失败测试**

覆盖：选择品类加载模板；按组编辑产品规格；添加/删除/排序 SKU；SKU 可继承或覆盖价格和购买链接；`In the Box` 可增加数量；兼容配件只能从已发布配件商品勾选；服务端字段错误自动打开对应页签并聚焦字段。

```tsx
fireEvent.click(screen.getByRole("tab", { name: "SKUs (1)" }));
fireEvent.click(screen.getByRole("button", { name: "Add SKU" }));
expect(screen.getAllByLabelText("SKU")).toHaveLength(2);

server.rejectWith({
  fields: [{ tab: "variants", variantId: "v2", fieldKey: "effectiveSeatWidth", message: "Required" }],
});
expect(await screen.findByRole("tab", { name: /SKUs/ }))
  .toHaveAttribute("aria-selected", "true");
expect(screen.getByText("Required")).toBeInTheDocument();
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/components/admin/ProductForm.test.tsx src/components/admin/ProductEditors.test.tsx src/app/admin/admin-content-pages.test.tsx`。

- [ ] **Step 3: 拆分表单职责**

`ProductForm` 只管理顶层 state、tab、FormData、提交状态和服务端错误。Overview、Specifications、SKUs、Accessories 和现有 MediaUploader 分别成为同级页签；使用 `role="tablist"`、`role="tab"` 和 `role="tabpanel"`。不把 section 再包装成嵌套卡片。

`ProductSpecificationEditor` 根据 `dataType` 渲染 text、number、checkbox、select 或 dimensions；数字输入使用 `type="text" inputMode="decimal"`，允许直接输入，不使用只能逐次点击的 number spinner。单位使用相邻 select。

- [ ] **Step 4: 实现 SKU 和配件编辑器**

SKU 编辑器每个 SKU 具有稳定本地 key；新建时生成 client id，服务端忽略临时前缀并创建 cuid。Price 和 purchase link 默认显示 `Use product default`，只有启用 override 后才要求值。

Accessories 页签包含两个独立区段：

```ts
type InBoxDraft = { id?: string; name: string; quantity: string; note: string };
type AccessoriesDraft = { inBoxItems: InBoxDraft[]; accessoryProductIds: string[] };
```

配件选择器显示图片、名称、价格和发布状态，只允许选择 `PUBLISHED` 配件类产品。

- [ ] **Step 5: 服务端页面加载完整编辑数据**

new 页面加载活动品类及字段；edit 页面加载产品、字段、SKU、内含物、兼容配件和图片。把 Prisma Decimal/Date 转为 number/ISO string 后传入客户端，禁止直接把 Prisma 对象传入 Client Component。

- [ ] **Step 6: 验证并提交**

```powershell
npm.cmd test -- src/components/admin/ProductForm.test.tsx src/components/admin/ProductEditors.test.tsx src/app/admin/admin-content-pages.test.tsx
npx.cmd tsc --noEmit
git add src/components/admin/Product* src/app/admin/products src/app/admin/admin-content-pages.test.tsx
git commit -m "feat: add tabbed product variant editor"
```

---

### Task 8: 建立动态公开商品 DTO 和品类商品目录

**Files:**

- Create: `src/lib/catalog/public-catalog.ts`
- Create: `src/lib/catalog/public-catalog.test.ts`
- Modify: `src/lib/content/repository.ts`
- Modify: `src/lib/content/repository.test.ts`
- Create: `src/components/products/ProductCategoryNav.tsx`
- Create: `src/components/products/ProductVariantSelector.tsx`
- Create: `src/components/products/ProductSpecifications.tsx`
- Create: `src/components/products/ProductAccessories.tsx`
- Modify: `src/components/products/ProductsCatalog.tsx`
- Create: `src/components/products/ProductsCatalog.test.tsx`
- Modify: `src/components/HomePageClient.tsx`

- [ ] **Step 1: 写公开 DTO 与目录失败测试**

覆盖：只返回 `PUBLISHED` 产品、活动品类和活动 SKU；SKU 价格/链接覆盖继承；归档或未发布配件不显示；动态品类导航不写死 wheelchair/scooter；选择 SKU 更新价格、购买链接和规格；美国前台显示英制；Accessories 与 Products 分区。

```ts
expect(toPublicVariant(row, product)).toMatchObject({
  sku: "PA26A000",
  price: 699,
  purchaseLink: "https://www.amazon.com/dp/example",
});
expect(screen.getByRole("link", { name: /Buy on Amazon/i }))
  .toHaveAttribute("href", "https://www.amazon.com/dp/example");
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/catalog/public-catalog.test.ts src/lib/content/repository.test.ts src/components/products/ProductsCatalog.test.tsx`。

- [ ] **Step 3: 实现公开 DTO 映射**

`types.ts` 中的 `PublicProduct` 必须包含：

```ts
export type PublicProduct = {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    role: "PRODUCT" | "ACCESSORY";
  };
  images: readonly { url: string; alt: string }[];
  features: readonly string[];
  variants: readonly PublicProductVariant[];
  specifications: readonly PublicSpecificationGroup[];
  inBoxItems: readonly { name: string; quantity: number; note?: string }[];
  compatibleAccessories: readonly PublicAccessorySummary[];
  isFeatured: boolean;
};
```

`toPublicProduct()` 按字段 sortOrder 分组并格式化英制值；保留规范数值供筛选，不让前台从显示字符串反向解析。活动促销先覆盖产品默认价格，再由 SKU 显式价格覆盖；该优先级写入测试。

- [ ] **Step 4: 更新 repository 查询**

`listPublishedProducts()` 和 `listFeaturedProducts()` include category、fields、variants、inBoxItems、accessories 和 images。数据库失败在迁移阶段回退静态产品；当数据库查询成功但返回空数组时保持空数组。新增 `listPublicCategories()`。

- [ ] **Step 5: 重构目录组件**

把硬编码两类菜单改成动态 category props；点击商品打开包含 SKU selector、分组规格、In the Box、Compatible Accessories 的详情区域。所有购买 CTA 使用选中 SKU 的 Amazon 链接；只有迁移复核期间遗留的已发布商品缺少链接时显示 `Contact us`，新商品会在发布校验阶段因缺少链接被阻止，且始终不创建站内 checkout。

- [ ] **Step 6: 更新首页兼容 DTO**

HomePageClient 只读取 `PublicProduct` 的首个活动 SKU 作为首页价格摘要；点击仍进入产品目录或 Amazon 链接。删除对旧 `category: "wheelchair" | "scooter"` 联合类型的依赖。

- [ ] **Step 7: 验证并提交**

```powershell
npm.cmd test -- src/lib/catalog/public-catalog.test.ts src/lib/content/repository.test.ts src/components/products/ProductsCatalog.test.tsx src/app/page.test.tsx
npx.cmd tsc --noEmit
git add src/lib/catalog/public-catalog* src/lib/content/repository* src/components/products src/components/HomePageClient.tsx
git commit -m "feat: render dynamic product categories and variants"
```

---

### Task 9: 把推荐器改为接收动态候选目录

**Files:**

- Modify: `src/lib/wheelchair/types.ts`
- Create: `src/lib/wheelchair/catalog.ts`
- Create: `src/lib/wheelchair/catalog.test.ts`
- Modify: `src/lib/wheelchair/recommend.ts`
- Modify: `src/lib/wheelchair/recommend-hard-filters.test.ts`
- Modify: `src/lib/wheelchair/recommend-ranking.test.ts`

- [ ] **Step 1: 写动态候选和失败关闭测试**

构造来自数据库 DTO 的电动、手动、代步车和缺关键字段产品。验证推荐器只接收选择类型候选；承重和有效座宽仍先硬排除；缺规范值不被当成零；目录为空返回显式 unavailable，不回退静态推荐。

```ts
const result = recommendWheelchairs(assessment, candidates);
expect(result.recommendations.every((item) =>
  item.mobilityType === assessment.mobilityType,
)).toBe(true);
expect(result.evaluations.find((item) => item.variantId === "missing-width")?.exclusions)
  .toContain("critical-data-missing");
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/wheelchair/catalog.test.ts src/lib/wheelchair/recommend-hard-filters.test.ts src/lib/wheelchair/recommend-ranking.test.ts`。

- [ ] **Step 3: 定义统一候选类型**

把推荐算法需要的字段定义为 `WheelchairCandidate`，其中 powered/manual 差异通过判别联合表达：

```ts
type CommonCandidate = {
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  maxUserWeightKg: number;
  effectiveSeatWidthMm: number;
  seatDepthMm: number;
  seatHeightMm: number;
  seatToFootrestMm: number;
  overallMm: DimensionsMm;
  foldedMm: DimensionsMm;
  productUrl: string;
  imageUrl: string;
  dataWarnings: string[];
};

export type WheelchairCandidate =
  | (CommonCandidate & {
      mobilityType: "powered";
      rangeKm: number;
      netWeightWithoutBatteryKg: number;
      turningRadiusMm: number;
      obstacleHeightMm: number;
      rearWheelMm: number;
      tireClass: TireClass;
      battery: BatteryFacts;
    })
  | (CommonCandidate & {
      mobilityType: "manual";
      productWeightKg: number;
      propulsionType: "self-propel" | "transport";
      frontWheelMm: number;
      rearWheelMm: number;
      tireClass: TireClass;
    });
```

- [ ] **Step 4: 实现数据库规格到候选的严格映射**

`catalog.ts` 只读取 semanticKey 对应的 `normalizedValue`。必需字段缺失时返回 `{ candidate: null, errors }`，不猜测、不读取展示字符串。映射器过滤非轮椅推荐配置、未发布产品和停用 SKU。

- [ ] **Step 5: 注入候选而非导入静态常量**

把 `recommendWheelchairs(assessment)` 改为 `recommendWheelchairs(assessment, candidates)`，删除 `recommend.ts` 对 `OFFICIAL_WHEELCHAIR_SPECS` 的直接导入。保留现有纯函数并把评分分成 `scoreCommonFit`、`scorePoweredUse` 和 `scoreManualUse`。最大承重与有效座宽继续位于 `evaluateHardConstraints` 最前面。

电动评分继续使用范围、转弯半径、越障、后轮和轮胎；手动评分使用产品重量、折叠体积、推进类型、轮径和轮胎，不伪造续航或电池分数。

- [ ] **Step 6: 验证并提交**

```powershell
npm.cmd test -- src/lib/wheelchair/catalog.test.ts src/lib/wheelchair/recommend-hard-filters.test.ts src/lib/wheelchair/recommend-ranking.test.ts
npx.cmd tsc --noEmit
git add src/lib/wheelchair
git commit -m "feat: drive wheelchair recommendations from catalog data"
```

---

### Task 10: 增加电动/手动选择并从服务器加载推荐目录

**Files:**

- Modify: `src/lib/wheelchair/assessment-schema.ts`
- Modify: `src/lib/wheelchair/assessment-schema.test.ts`
- Modify: `src/hooks/useWheelchairAssessment.ts`
- Modify: `src/hooks/useWheelchairAssessment.test.tsx`
- Create: `src/components/wheelchair/WheelchairFinderClient.tsx`
- Modify: `src/components/wheelchair/FinderResults.tsx`
- Modify: `src/app/wheelchair-finder/page.tsx`
- Modify: `src/app/wheelchair-finder/page.test.ts`

- [ ] **Step 1: 写问卷类型选择和服务端目录失败测试**

验证第一页可选 Powered/Manual；选择持久化为非敏感字段；结果只使用传入 candidates；手动模式不显示电池/续航描述；服务器查询失败显示暂时不可用；无候选不显示静态旧推荐。

```tsx
fireEvent.click(screen.getByRole("radio", { name: "Manual wheelchair" }));
expect(result.current.assessment.mobilityType).toBe("manual");
expect(screen.queryByText(/battery range/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/lib/wheelchair/assessment-schema.test.ts src/hooks/useWheelchairAssessment.test.tsx src/app/wheelchair-finder/page.test.ts`。

- [ ] **Step 3: 扩展 assessment schema 和持久化**

增加 `mobilityType: z.enum(["powered", "manual"])`，默认 powered。`sanitizeForLocalStorage` 可保存该偏好，但仍不得保存 safety 答案。旧 localStorage 记录缺少 mobilityType 时迁移为 powered，不把它当作损坏记录。

- [ ] **Step 4: 建立 Server Page 与 Client 边界**

`page.tsx` 作为 Server Component 调用 `listFinderCandidates()`，成功后把纯 JSON candidates 传给 `WheelchairFinderClient`；失败时传 `catalogError: true`。Client 组件调用 `useWheelchairAssessment(candidates)`，不得在浏览器直接访问数据库 API。

- [ ] **Step 5: 更新问题和结果展示**

第一页增加动力类型 segmented radio。共用人体尺寸和安全题。Powered 模式保留 daily range、航空和动力相关优先项；Manual 模式把 range 优先项替换为轻便性/自推方式，并在结果详情显示手动轮椅适用字段。购买按钮继续使用 candidate 的 Amazon URL。

- [ ] **Step 6: 验证并提交**

```powershell
npm.cmd test -- src/lib/wheelchair/assessment-schema.test.ts src/hooks/useWheelchairAssessment.test.tsx src/app/wheelchair-finder/page.test.ts src/lib/wheelchair/recommend-hard-filters.test.ts src/lib/wheelchair/recommend-ranking.test.ts
npx.cmd tsc --noEmit
git add src/lib/wheelchair src/hooks/useWheelchairAssessment* src/components/wheelchair src/app/wheelchair-finder
git commit -m "feat: add powered and manual wheelchair finder modes"
```

---

### Task 11: 迁移现有产品和官方 SKU 规格

**Files:**

- Create: `scripts/migrate-product-catalog.ts`
- Create: `src/migrate-product-catalog.test.ts`
- Modify: `scripts/seed-content.ts`
- Modify: `src/seed-content.test.ts`
- Modify: `package.json`
- Modify: `docs/product-data/wheelchair-spec-quality.md`

- [ ] **Step 1: 写迁移映射失败测试**

对 `OFFICIAL_WHEELCHAIR_SPECS` 的 7 个产品和全部 variant 做快照断言：每个产品映射 powered category；每个 variant 生成唯一 SKU；承重、有效座宽、座深、座高、座面到脚踏距离等使用规范值；missing/conflicting 状态和 notes 被保留；代步车生成至少一个默认 SKU，但不伪造官方承重。

```ts
expect(migrated.variants.find((item) => item.sku === "PA13A100")?.specifications)
  .toMatchObject({
    seatToFootrest: { normalizedValue: 380, normalizedUnit: "mm" },
    batteryWeight: { status: "NOT_PROVIDED", value: null },
  });
```

- [ ] **Step 2: 运行失败测试**

运行：`npm.cmd test -- src/migrate-product-catalog.test.ts src/seed-content.test.ts`。

预期：FAIL，因为迁移脚本尚不存在，旧 seed 也没有 SKU。

- [ ] **Step 3: 实现幂等迁移脚本**

脚本先调用 `seedProductCategories`，再按稳定 product id 匹配官方 wheelchairs。每个产品在一个 transaction 中 upsert categoryId、templateVersion、ProductVariant 和规格 JSON。对没有官方 variant 数据的 scooter/附件创建 `legacy-<product-id>` 默认 SKU，并只迁移可以从现有字段明确得出的值。

支持 `--dry-run`：输出将新增、更新和需复核数量但不写数据库。正式运行返回：

```ts
type MigrationSummary = {
  productsUpdated: number;
  variantsUpserted: number;
  productsNeedingReview: Array<{
    productId: string;
    reasons: string[];
  }>;
};
```

重复运行不生成重复 SKU、内含物或字段。

- [ ] **Step 4: 更新静态 seed 兼容新结构**

`seed-content.ts` 在 seed 产品前确保内置品类存在；新产品同时写 categoryId 和默认 variant。继续保留现有图片注册，不重新上传静态文件。静态 `weight` 只代表运输重量，不得写进最大承重语义。

- [ ] **Step 5: 记录数据来源和迁移结果约束**

在 `wheelchair-spec-quality.md` 增加说明：数据库 SKU 是官方规格的运行时副本；原 Excel 和现有规范化静态文件仍用于审计；管理员后续修改必须保留 sourceNote/status；脚本不解决已有冲突。

- [ ] **Step 6: 验证并提交**

```powershell
npm.cmd test -- src/migrate-product-catalog.test.ts src/seed-content.test.ts src/data/wheelchair-specs.test.ts
npx.cmd tsc --noEmit
git add scripts/migrate-product-catalog.ts scripts/seed-content.ts src/migrate-product-catalog.test.ts src/seed-content.test.ts package.json docs/product-data/wheelchair-spec-quality.md
git commit -m "feat: migrate official products into dynamic catalog"
```

---

### Task 12: 完整回归、浏览器验收、文档和部署准备

**Files:**

- Create: `e2e/admin-product-catalog.spec.ts`
- Create: `e2e/dynamic-wheelchair-finder.spec.ts`
- Create: `src/app/cart/amazon-checkout.test.ts`
- Modify: `src/app/cart/page.tsx` only if the Amazon regression test exposes a broken link
- Modify: `README.md`
- Modify: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: 写端到端与 Amazon 回归测试**

Admin E2E 覆盖创建自定义品类、两个 SKU、包装内含物、关联配件、缺有效座宽阻止发布、补齐后发布。Finder E2E 覆盖 powered/manual 分流和承重/有效座宽硬筛选。Amazon 测试确保没有 Stripe：

```ts
it("keeps checkout on Amazon until direct payments are funded", () => {
  expect(cartSource).toMatch(/amazon\.com/);
  expect(cartSource).not.toMatch(/stripe|payment_intent|checkout\.sessions/i);
});
```

- [ ] **Step 2: 运行完整测试基线**

```powershell
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd run build
```

预期：所有单元和组件测试 PASS、TypeScript 无错误、Next.js production build 成功。若失败，只修复本功能引入的回归，不顺带升级依赖。

- [ ] **Step 3: 在非生产数据库做 dry-run 和正式迁移验证**

```powershell
npx.cmd prisma migrate deploy
npm.cmd run seed:catalog
npx.cmd tsx scripts/migrate-product-catalog.ts --dry-run
npx.cmd tsx scripts/migrate-product-catalog.ts
npx.cmd tsx scripts/migrate-product-catalog.ts
```

预期：第二次正式迁移不增加记录；`productsNeedingReview` 只包含真实缺失或冲突项；原产品、图片、Stories 和 Promotions 数量不减少。

- [ ] **Step 4: 启动开发服务器并运行浏览器验收**

```powershell
npm.cmd run dev -- --port 3002
npx.cmd playwright test e2e/admin-product-catalog.spec.ts e2e/dynamic-wheelchair-finder.spec.ts
```

同时在 desktop 1440×900 和 mobile 390×844 检查：页签不重叠、最长字段标签不溢出、数字可直接键盘输入、SKU 切换不造成布局跳动、Amazon 链接打开正确商品。

- [ ] **Step 5: 更新运行和回滚说明**

README 记录迁移命令、幂等脚本、受保护字段、品类归档、产品发布阻断以及 Amazon 购买保持不变。`.env.example` 不增加支付密钥。`.gitignore` 加入 `/.superpowers/`，避免讨论草图被提交。

生产部署顺序固定为：数据库快照 → `prisma migrate deploy` → `seed:catalog` → `migrate-product-catalog --dry-run` → 审查 → 正式迁移 → 部署应用 → 管理员/普通用户验收。任一步失败停止，不运行 `migrate reset` 或 `db push`。

- [ ] **Step 6: 最终验证并提交**

```powershell
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd run build
git diff --check
git add e2e src/app/cart/amazon-checkout.test.ts README.md .env.example .gitignore
git commit -m "test: verify dynamic product publishing workflows"
```

预期：测试、类型检查、构建和 diff 检查全部通过，工作树仅保留用户原有的无关修改。

---

## 实施完成定义

- 管理员可在 `/admin/product-categories` 新增和归档品类、维护普通规格字段。
- 电动/手动轮椅受保护字段无法被破坏。
- 产品可保存多个 SKU、产品/SKU 规格、包装内含物和产品级兼容配件。
- 草稿可不完整；发布错误准确定位到页签、SKU 和字段。
- 商品目录动态显示品类、SKU、规格、内含物和兼容配件。
- Powered/Manual Finder 使用数据库已发布 SKU；承重和有效座宽优先硬筛选。
- 数据不足或数据库错误时不产生猜测推荐。
- 所有购买动作继续使用产品或 SKU 的 Amazon URL。
- 现有图片、价格、促销、Stories、产品 URL 和管理员权限没有回归。
- 完整测试、类型检查、生产构建和桌面/移动浏览器验收通过。
