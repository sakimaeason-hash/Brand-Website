# Admin 内容管理后台设计

日期：2026-09-02  
状态：待用户复核

## 1. 目标与范围

为 GoldSeason 网站增加一个只对管理员开放的内容管理后台，使管理员可以在不修改代码、不重新部署 Vercel 的情况下，上传和维护产品资料、产品图片、Customer Stories 评论及真实评论图片，并安排按美国东部时间（ET）自动生效的大促活动。

第一版包含三个内容域：

1. Products：产品基本资料、规格、价格、购买链接和多张产品图片。
2. Customer Stories：评论者信息、评论文字、关联产品、标签和多张真实评论图片。
3. Promotions：活动名称、关联产品、促销价格或折扣、活动图片及 ET 开始/结束时间。

第一版不包含多人权限管理、Excel 批量导入、在线支付和用户自助投稿。后台仅开放给拥有 `ADMIN` 角色的账号；指定管理员邮箱为 `goldseasonofficial001@gmail.com`。

## 2. 设计决策

### 2.1 方案

采用网站内置 Admin 后台、现有 NextAuth 登录、Prisma/PostgreSQL 业务数据和 Supabase Storage 图片存储的组合。前台只读取状态为 `PUBLISHED` 的记录；管理员操作不需要触发重新部署。

选择该方案的原因：

- 复用现有账号、`User.role` 和 PostgreSQL 数据库，减少新系统数量。
- Supabase Storage 适合保存产品图和评论图，并可返回稳定的公开图片 URL。
- 后台、API 和前台由同一项目维护，数据格式不会与现有页面脱节。

### 2.2 权限

- `User.role` 继续使用现有 `USER`/`ADMIN` 枚举。
- `goldseasonofficial001@gmail.com` 的账号设置为 `ADMIN`。
- 根布局和导航只为已登录且角色为 `ADMIN` 的用户渲染 Admin 入口。
- `/admin` 页面、所有 `/api/admin/*` 路由都在服务端检查会话和角色；缺少会话跳转到登录页，角色不足返回 403。
- 不把管理员邮箱、角色判断或数据库密钥暴露在客户端代码中。

## 3. 后台信息架构与操作流程

### 3.1 页面结构

后台路径固定为 `/admin`，包含：

- `/admin`：概览，显示草稿、已发布内容和当前/即将开始的促销数量。
- `/admin/products`：产品列表、搜索、筛选、创建和编辑。
- `/admin/stories`：评论列表、搜索、筛选、创建和编辑。
- `/admin/promotions`：促销列表、时间状态、创建和编辑。

### 3.2 统一内容状态

所有可管理内容使用以下状态：

- `DRAFT`：仅管理员可见，可编辑和预览。
- `PUBLISHED`：前台可见，按产品或评论的发布时间显示。
- `UNPUBLISHED`：保留记录但从前台隐藏。

删除操作要求管理员二次确认；默认采用软删除或先转为 `UNPUBLISHED`，避免误删图片和历史内容。

### 3.3 编辑流程

1. 管理员登录并进入对应栏目。
2. 新建或编辑记录，填写字段并拖拽/选择多张图片。
3. 点击“保存草稿”，服务端校验字段并上传图片。
4. 点击“预览”，以接近前台的卡片或详情布局查看内容。
5. 点击“发布”后，服务端再次校验必填字段并将状态设为 `PUBLISHED`。
6. 管理员可随时下线、重新编辑或再次发布。

### 3.4 图片上传

- 支持一次选择或拖拽多张图片。
- 接受 JPG、JPEG、PNG、WebP；单张图片限制 10 MB，单条记录最多 12 张。
- 服务端校验 MIME 类型、扩展名和文件大小，拒绝可疑或不支持的文件。
- 上传到按内容域和记录 ID 分层的 Storage 路径，例如 `products/<id>/...`、`stories/<id>/...`。
- 保存原始文件名、展示顺序、替代文本、来源备注和公开 URL。
- 前台使用公开 URL；删除或替换图片时同步删除旧文件，失败时保留数据库记录并显示可重试错误。
- 不强制要求授权勾选；“图片来源”和“管理员备注”是可选字段。

## 4. 数据模型

在现有 Prisma schema 中增加以下实体（字段名称为实现约定）：

### 4.1 Product

- `id`、`name`、`model`、`category`、`tagline`、`description`
- `price`、`originalPrice`、`amazonLink`
- `weightCapacity`、`seatWidth`、`range`、`maxSpeed`、`productWeight`
- `features`（字符串数组或 JSON）
- `status`、`isFeatured`、`sortOrder`
- `createdAt`、`updatedAt`

### 4.2 ProductImage

- `id`、`productId`、`storagePath`、`publicUrl`
- `altText`、`sourceNote`、`sortOrder`
- `createdAt`

### 4.3 CustomerStory

- `id`、`displayName`、`location`、`quote`、`productId`
- `source`、`tags`、`status`、`isFeatured`、`sortOrder`
- `createdAt`、`updatedAt`

### 4.4 StoryImage

- `id`、`storyId`、`storagePath`、`publicUrl`
- `altText`、`sourceNote`、`sortOrder`
- `createdAt`

### 4.5 Promotion

- `id`、`name`、`productId`
- `startAt`、`endAt`（以 UTC 存储，后台输入和前台展示转换为 `America/New_York`）
- `salePrice`、`discountPercent`（二者至少一个，不能同时生效）
- `label`、`bannerImageUrl`
- `status`、`isAutoScheduleEnabled`
- `createdAt`、`updatedAt`

促销状态由时间和手动状态共同决定：只有 `PUBLISHED`、自动排期已开启且当前 ET 时间位于 `[startAt, endAt)` 时，前台才显示促销。活动开始前不显示，结束后自动恢复产品正常价格；管理员可手动暂停或结束。

## 5. 前台数据流

前台 Products、首页推荐区和 Stories 页面读取服务端数据层的 `PUBLISHED` 记录，并按 `sortOrder` 和 `createdAt` 排序。促销价格由服务端根据当前时间计算后返回，前台不自行信任客户端时间。

为降低上线风险，第一阶段保留现有静态内容作为迁移前的默认数据；完成数据迁移并验证后台内容后，再切换为数据库优先。数据库不可用时，页面显示可读错误或回退到已发布的静态快照，不显示半条记录。

## 6. API 与错误处理

后台 API 统一位于 `/api/admin/*`，每个 handler 都执行：

1. 获取 NextAuth 服务端会话。
2. 验证用户角色为 `ADMIN`。
3. 校验请求体、日期、金额、图片元数据和关联产品。
4. 执行数据库/Storage 操作并返回结构化结果。

错误场景和处理：

- 未登录：返回 401 或跳转登录页。
- 非管理员：返回 403，不泄露记录是否存在。
- 必填字段缺失或时间范围无效：返回 400，并在表单对应字段显示原因。
- 图片格式或大小不符合要求：拒绝该文件，其他已选文件继续保留上传结果。
- 上传成功但数据库写入失败：记录可重试，避免产生无法引用的公开内容。
- 删除失败：不删除数据库引用，显示失败原因，允许再次尝试。
- 并发编辑：提交时检查 `updatedAt`，发现版本变化时提示管理员重新加载，避免覆盖他人修改。

## 7. 验证与验收标准

实现阶段至少覆盖以下自动化检查：

- 角色测试：普通用户看不到 Admin 入口，直接访问 `/admin` 和 `/api/admin/*` 均被拒绝；管理员账号可以访问。
- CRUD 测试：产品、Stories、促销的创建、编辑、草稿、发布、下线流程可用。
- 图片测试：多图上传、格式/大小校验、排序、替换和删除路径正确。
- 促销时间测试：以 ET 输入的开始/结束时间在夏令时切换前后仍按 `America/New_York` 正确生效。
- 前台测试：仅 `PUBLISHED` 内容出现在首页、Products 和 Stories；促销进行中显示促销价，结束后恢复正常价格。
- 构建测试：`prisma generate && next build` 成功，避免 Vercel 因 Prisma Client 缓存失败。
- 浏览器验收：管理员完成一次真实上传、预览和发布；普通用户账号确认看不到后台入口。

## 8. 分阶段实施

1. 数据模型和管理员角色：扩展 Prisma schema、迁移数据库、补充 NextAuth session 中的角色信息。
2. Storage 与后台骨架：配置 Supabase Storage、实现 `/admin` 权限保护和统一上传组件。
3. Products 管理：完成产品字段、图片、草稿/预览/发布及前台读取。
4. Customer Stories 管理：完成评论字段、图片和前台读取，替换现有静态 Stories 数据。
5. Promotions 管理：完成 ET 排期、促销价计算和前台展示。
6. 测试、数据迁移、部署和正式域名验收。

## 9. 非目标与后续扩展

第一版不做：Excel 批量导入、多人角色、支付渠道、用户公开投稿、复杂库存管理和营销数据报表。后续可以在不改变图片和内容接口的前提下增加这些功能。

## 关联文档

- `docs/superpowers/specs/2026-08-05-wheelchair-fit-recommender-design.md`
- `docs/superpowers/specs/2026-08-31-stories-photo-restoration-design.md`
