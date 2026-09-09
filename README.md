# GoldSeason Website

GoldSeason 的 Next.js 14 网站，包含产品目录、Customer Stories、促销活动和仅管理员可用的内容管理后台。

## 本地开发

项目要求 Node.js `22.13.0` 或更高版本，以及可连接的 PostgreSQL 数据库（Supabase PostgreSQL 也可以）。

```bash
npm install
npx prisma generate
npm run dev
```

打开 <http://localhost:3000>。复制 `.env.example` 为 `.env.local`，再填入本地或预览环境的值。不要提交 `.env.local`，也不要把服务密钥放在 `NEXT_PUBLIC_*` 变量中。

## 环境变量与 Vercel Blob Storage

必须配置：

```dotenv
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-secret
ADMIN_EMAIL=goldseasonofficial001@gmail.com
BLOB_READ_WRITE_TOKEN=由 Vercel Blob 存储自动注入
```

在 Vercel 项目中创建并连接一个公开 Blob store。`BLOB_READ_WRITE_TOKEN` 由 Vercel 自动注入，只有服务器端 Route Handler 可以使用；浏览器端不会读取写入令牌。当前生产项目使用名为 `content-media` 的 Blob store。

`NEXTAUTH_URL` 必须按环境配置：本地使用 `http://localhost:3000`，Preview 使用本次 Vercel Preview 的 HTTPS URL，Production 使用 `https://goldseason.vip`。不要把本地 URL 配入 Vercel 的 Preview 或 Production 作用域。

## 数据库迁移和管理员

部署前先生成 Prisma Client，再在目标数据库执行已提交的增量迁移：

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed:catalog
```

迁移新增内容管理和动态产品目录表及相关枚举，并回填唯一管理员角色；不会重建订单、评论或促销码表。`seed:catalog` 会写入五个内置品类和受保护规格模板，必须在 `seed:content` 前运行。不要在预览或生产环境使用 `prisma db push`、`prisma migrate reset`，也不要删除已有迁移。迁移完成后，先注册使用 `ADMIN_EMAIL` 的账号，再由服务器端脚本提升其角色：

```bash
npm run promote-admin
```

公开注册始终创建 `USER`，即使提交的邮箱等于 `ADMIN_EMAIL` 或请求体伪造了 `role` 也不会获得后台权限。`promote-admin` 从 `ADMIN_EMAIL` 读取规范化邮箱，在一个事务中将其他 `ADMIN` 降为 `USER`，再提升指定账号；账号不存在或数据库不可用时以非零状态退出。页面中是否显示 Admin 入口、中间件放行和 API 数据库鉴权都会同时校验 `ADMIN` 角色与 `ADMIN_EMAIL`，因此误设出的第二个 `ADMIN` 账号也无法进入后台。

## 导入静态内容

运行 seed 前确保目标数据库已经完成迁移：

```bash
npx prisma generate
npm run seed:catalog
npm run seed:content
```

`seed:content` 将当前 `src/data/products.ts` 和 `src/data/stories.ts` 的静态快照导入为已发布内容。产品优先按静态记录 ID 查找，并兼容按 `name/model` 查找旧记录；故事按稳定的 `displayName` 查找。产品的 `model` 使用产品名称，记录 ID 仍沿用静态产品 ID，因此重复运行不会创建重复记录。静态目录中的 `weight` 是整车运输重量，只写入 `productWeight`；不能据此推断用户承重，`weightCapacity` 默认留空，等待官方承重规格补充。

脚本只登记仓库中已有的公开 URL `/products/...` 和 `/stories/...`，同时写入 `storagePath`、`publicUrl` 和文件元数据，不会把这些文件重新上传到 Blob Storage。任何 Prisma 连接、迁移或约束错误都会以清晰错误退出，不会静默跳过。

## 图片限制

后台上传只接受 JPEG、PNG、WebP。单张图片最大 `10 MB`，单条产品或故事最多 `12` 张。SVG、可执行文件和其他 MIME 类型会被拒绝。删除上传图片时先删除 Storage 对象，再删除数据库引用；Storage 删除失败会保留数据库引用并返回错误。`/products/...`、`/stories/...` 仓库静态图片只删除数据库引用，不会错误调用 Blob Storage。

## 草稿、预览和公开内容

- 管理员保存表单时默认是 `DRAFT`；`PUBLISHED` 和 `UNPUBLISHED` 只能由服务端动作设置。
- `/admin/preview/...` 需要管理员会话，显示草稿状态和“仅管理员可见”提示，并设置 `noindex,nofollow`。
- 公开 Products、Stories、首页精选和促销查询只读取 `PUBLISHED`。数据库查询成功但没有已发布记录时显示空结果，确保下线或删除不会让旧静态内容复活；仅在数据库不可用或迁移尚未建立内容表时回退到仓库静态快照。
- `UNPUBLISHED` 内容不会出现在公开页面；删除操作需要显式确认，并按“先清理图片、再删除记录”的顺序执行。

## ET 促销时间

促销表单输入和展示使用 `America/New_York`（Eastern Time），数据库统一保存 UTC。夏令时由时区库计算，不能用固定的 UTC-5 偏移；春季跳时中不存在的本地时间会被拒绝，秋季重复时间采用较早的 EDT 时刻。活动窗口采用半开区间 `[startAt, endAt)`：开始时刻生效，结束时刻立即失效。促销价优先于折扣百分比，价格四舍五入到两位小数。

## 预览部署与生产门禁

推荐按以下顺序操作：

1. 配置 Supabase bucket 和 Vercel 私有环境变量。
2. 在独立预览数据库执行 `npx prisma migrate deploy`。
3. 注册或提升管理员，执行 `npm run promote-admin`、`npm run seed:catalog` 和 `npm run seed:content`。
4. 部署 Preview，并在浏览器验收普通用户的 `/admin` 403、管理员的草稿/预览/发布、产品和故事多图顺序、促销 ET 边界及静态回退。
5. 将 Preview URL、迁移输出、测试结果、环境变量清单和已知限制交给项目负责人复核。
6. **在获得明确批准前，不执行生产迁移，不运行 `vercel deploy --prod`，也不切换 `goldseason.vip`。**
7. 获得批准后，在确认项目为 `brand-website`、团队为 `ethan-sakima-project` 的前提下执行生产迁移、管理员提升、幂等 seed 和带项目/团队参数的生产部署：

```bash
npx prisma migrate deploy
npm run promote-admin
npm run seed:catalog
npm run seed:content
npx vercel deploy --prod --yes --scope ethan-sakima-project --project brand-website
```

只有当部署状态为 `READY`，并且通过 `goldseason.vip/admin` 的 USER/ADMIN 权限检查及三类前台内容线上检查后，才能报告生产发布完成。

完整 E2E 门禁必须连接独立 Preview/测试数据库和测试 Storage bucket，并设置 `E2E_ADMIN_EMAIL`、`E2E_ADMIN_PASSWORD`、`E2E_USER_EMAIL`、`E2E_USER_PASSWORD`。创建并清理测试内容的用例还要求显式设置 `E2E_ALLOW_MUTATIONS=1`；缺少这些变量时 `npm run test:e2e` 会失败，不能以跳过核心用例的方式形成假通过。只检查未登录重定向时可运行 `npm run test:e2e:smoke`，但该结果不能替代完整门禁。

## 常用检查

```bash
npm test
npm run lint
npx tsc --noEmit
npx prisma validate
npm run build
npm run test:e2e
```

<!-- Default Next.js links omitted; see the project documentation above. -->

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
