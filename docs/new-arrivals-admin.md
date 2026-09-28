# 新品与优惠管理

## 管理入口

管理员登录后，在后台侧栏或 Overview 打开 **New Arrivals & Offers**（`/admin/new-arrivals`）。普通账户不会获得此后台权限；服务器会再次校验管理员身份。

## 添加、移除新品

1. 商品尚不存在时，先在 Products 创建商品、填写 SKU 和图片，并完成发布。
2. 在 New Arrivals & Offers 找到商品，点击 **Add**，将它选入新品板块。
3. 点击 **Remove**，只取消新品展示，不删除商品、SKU 或图片，不改变商品发布状态。
4. 可在产品编辑页 Overview 勾选 **Show in New Arrivals**。此编辑页保存的是草稿，需通过原有发布校验并点击 Publish 才能重新公开。

新品标记与 **Feature on homepage** 独立。选中的商品仍需满足已发布、类别有效、至少一个有效 SKU，才能前台显示。管理表会标明 Visible、Awaiting publication、Inactive or missing category、No active SKU 等状态。

若显示版本冲突，页面会刷新最新记录；检查内容后再次操作，避免旧页面覆盖他人的修改。失败操作不会假装已经保存成功。

## 优惠活动

点击 **Manage special offers** 进入现有 Promotions。使用 **New promotion** 创建活动，选关联产品，填写活动名称、价格或折扣、开始和结束时间，保存后发布。

- 时间输入沿用 **America/New_York（ET）**，数据库存 UTC。
- 只有已发布、自动排期已启用、处于有效时间窗口，且关联商品可公开的活动显示。
- **Unpublish** 下架活动；**Delete** 永久删除活动，仍保留现有二次确认。
- 商品有独立 SKU 价格时保留其独立定价。页面说明优惠适用基础价格，购买前以所选 SKU 和 Amazon 最终价格为准。
- 本次没有新增优惠码、支付、套餐或邮件订阅系统。

## 前台行为

`/new-arrivals` 每次服务端请求读取真实商品和活动。没有新品或活动时分别显示空状态；数据库异常显示加载失败及重试入口，不恢复原先写死的示例商品。到期活动在下一次请求时不再展示；已打开的页面需刷新才能看到后台新变化。

## 上线依赖与操作顺序

本次新增 `Product.isNewArrival`，物理表为 `content_products`，默认 `false`。迁移只加字段，不删除或重写既有数据。旧商品不会自动被认定为新品。

1. 在独立测试数据库验证迁移，再在目标部署环境执行 `npx prisma migrate deploy`，确保数据库已有新字段。
2. 构建/部署包含本次修复的应用（`npm run build` 会生成 Prisma Client）。不能先上线依赖新列的代码再迁移。
3. 登录管理员，选一个真实已发布商品 Add，检查 `/new-arrivals`；Remove 后刷新确认消失且 Products 中仍存在。
4. 验证真实促销的发布、下架、日期窗口，检查普通用户和未登录用户无法写接口。

目标生产项目是 `ethan-sakima-project/brand-website`，域名 `goldseason.vip`。2026-09-28 用户已同意提交与上线；已核实项目 ID、域名和线上基线 `b04f48e`。本节下方记录实际发布结果，在验证前不视为已上线。

生产敏感环境变量无法从 Vercel 拉取，部署不依赖本地复制这些密钥。首次发布使用 Vercel 的生产环境，在切换域名前运行 `scripts/deploy-new-arrivals.mjs`：核对完整迁移历史和校验和，只允许新增新品字段这一项待执行迁移；异常时停止，不能自动重置或重新基线化数据库。历史记录的 LF/CRLF 校验和均明确验证。脚本执行后再次确认字段类型、非空约束及默认值。该一次性部署命令不会改变日常 `npm run build`。

新增上线检查：`node --test scripts/deploy-new-arrivals.test.mjs`，9 项通过。隔离 PGlite PostgreSQL 实例加载原有两项迁移后，验证新字段迁移、默认 false、非空约束、Add/Remove，以及原商品/SKU/图片保留；负对照在省略迁移时按预期失败。此验证不连接生产，也不代替真实登录后的端到端验收。

## 本地验证

分支 `codex/new-arrivals-admin` 基于已有后台管理版本 `b04f48e`，不包含另一个欧洲支付工作树未提交的改动。

运行 `npm test`、`npm run lint`、`npx tsc --noEmit`、`npm run build`。构建和浏览器错误状态检查仅使用指向 `127.0.0.1:1` 的虚拟 PostgreSQL URL；不用线上数据库。

浏览器布局检查脚本 `scripts/check-new-arrivals-ui.tsx` 使用明确标注的本地测试数据渲染真实组件，不创建产品/活动。检查图片加载、移动端和桌面、200%文字缩放、WCAG 自动扫描，结果保存 `test-results/new-arrivals-ui/`。这些组件检查不等价于真实数据库 E2E；发布前仍需在独立测试数据库进行保存、刷新与迁移验证。

2026-09-28 最终验证结果：

- 全量 Vitest：66 个文件、473 项测试通过。
- TypeScript：`npx tsc --noEmit --incremental false` 通过。
- Lint：0 错误，保留既有文件的 `<img>` 优化警告。
- 生产构建：`npm run build` 通过。使用不可连接的本机虚拟数据库地址，构建中既有静态页面打印的数据库连接失败不代表访问过生产。
- 浏览器：最终离线组件检查 8 项通过，覆盖内容、空状态、错误、后台管理表的桌面/手机布局及200%文字；WCAG自动扫描无违规。更早还检查了本地开发服务的数据库错误页面。
- 独立需求和质量审查均通过；发现并修复了图片单独编辑的缓存失效遗漏、嵌套 main 语义问题。
- 自动审批策略拒绝了启动本地生产预览服务的命令，未给出具体原因。没有重试绕过，改用纯本地静态组件检查；最终构建的真实 HTTP 登录跳转未运行，相关权限/跳转逻辑由自动化测试覆盖。

纯离线布局检查方式（不启动服务器，不访问数据库）：

```powershell
npx tailwindcss -i src/app/globals.css -o test-results/new-arrivals-ui/preview.css --minify
npx esbuild scripts/check-new-arrivals-ui.tsx --bundle --platform=node --packages=external --jsx=automatic --outfile=test-results/new-arrivals-ui/check.cjs
node test-results/new-arrivals-ui/check.cjs --offline
```
