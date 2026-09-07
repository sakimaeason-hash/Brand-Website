# GoldSeason 网站修改说明

## 修改日期
2025-04-30

## 主要修改内容

### 1. Hero 板块（首页第一板块）重构

#### 视觉设计变更
- **布局方式**：从双栏布局（左文字+右产品图）改为全屏背景图+左侧文字覆盖
- **背景图片**：使用带人物的场景图作为全屏背景 (`public/hero-scene.jpg`)
- **遮罩效果**：左侧添加渐变遮罩保证文字可读性
  - 0-40%：100%不透明 (#FAF8F5)
  - 40%位置：80%透明度
  - 60%位置：完全透明

#### 按钮样式
- **Explore Products**：橙色圆角按钮带箭头图标
- **Watch a Demo**：白色半透明按钮带播放图标

#### 统计栏位置
- 从底部全宽栏改为集成在左侧文字区域内
- 显示：33 lbs / 15 mi / 3 sec
- 带动画计数器效果

#### 删除的特性
- ~~右侧产品图片展示~~
- ~~右侧悬浮特性卡片（33 lbs / 3 sec / Airline Approved）~~
- ~~底部全宽统计栏~~

---

## 文件结构

```
C:\Brand WEB\
├── website\
│   ├── src\
│   │   └── app\
│   │       └── page.tsx          # 首页Hero板块修改
│   └── public\
│       ├── hero-scene.jpg        # Hero背景图（需自行替换）
│       ├── logo.png
│       └── logo-white.png
├── design\                       # VI设计文档
├── logo\                         # Logo文件
└── 修改\                         # 参考设计图
    └── 主页第一板块.png
```

---

## 使用说明

### 开发环境启动

```bash
# 进入网站目录
cd "C:\Brand WEB\website"

# 安装依赖（如未安装）
npm install

# 启动开发服务器
npm run dev
# 或指定端口
npx next dev -p 3000
```

### 访问地址
- 本地开发：http://localhost:3000

### 背景图片更换

如需更换Hero背景图：
1. 准备新的场景图（建议尺寸：1920x1080或更大）
2. 替换文件：`C:\Brand WEB\website\public\hero-scene.jpg`
3. 刷新浏览器查看效果

### 遮罩透明度调整

如需调整左侧文字遮罩：
编辑 `src/app/page.tsx` 第28行：
```tsx
<div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/80 via-40% to-transparent to-60%" />
```

参数说明：
- `via-[#FAF8F5]/80`：40%位置的透明度（80 = 80%不透明）
- `via-40%`：中间过渡位置
- `to-60%`：完全透明位置

---

## 品牌色彩

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| Sunrise Gold | #F5A623 | 按钮、强调色 |
| Ocean Teal | #2AAAA0 | 标题、链接 |
| Dark Gray | #2D2D2D | 正文文字 |
| Light Beige | #FAF8F5 | 背景色 |

---

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (动画)
- shadcn/ui (组件库)

---

## 注意事项

1. **ESLint警告**：项目中存在未使用的import和未转义的引号，不影响运行
2. **图片优化**：建议使用 Next.js 的 `<Image>` 组件替换 `<img>` 以获得更好性能
3. **响应式**：Hero板块已适配移动端，左侧内容在桌面端占50%宽度

---

## Git提交建议

```bash
cd "C:\Brand WEB\website"
git add src/app/page.tsx public/hero-scene.jpg
git commit -m "refactor: 重构Hero板块，使用全屏背景图设计

- 移除产品图片展示
- 添加人物场景背景图
- 优化左侧文字区域遮罩
- 更新按钮样式
- 调整统计栏位置"
```
