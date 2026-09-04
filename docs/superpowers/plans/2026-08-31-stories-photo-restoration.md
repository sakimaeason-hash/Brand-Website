# Stories 真实评论图片恢复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $subagent-driven-development (recommended) or $executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Stories 页面仅为四位姓名可核验的客户评论显示本地真实照片，并在缺图或加载失败时安全回退到该作者的首字母头像。

**Architecture:** 把 Stories 记录定义为带可选 `image` 的 `Story` 数据，并提取页面内的 `StoryCard` 和 `FeaturedStory` 组件，使照片映射、加载失败状态和无图布局能够独立渲染测试。只接受 `/stories/` 的已确认静态路径；没有路径或图片错误均不显示媒体区，也不会以其他客户照片代替。

**Tech Stack:** Next.js App Router、React 18、TypeScript、Tailwind CSS、Vitest、React Testing Library。

---

## 文件结构

- 修改：`C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.tsx`：增加 `Story.image?`、4 条经确认的映射、带错误回退的 `StoryCard`、无伪图片的 `FeaturedStory`。
- 新建：`C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.test.tsx`：验证精确映射、无图卡、错误回退、精选故事。
- 不修改：`C:\\tmp\\website-wheelchair-fit-execution\\public\\stories\\`、指南、推荐器、认证、Vercel 或部署配置。

### Task 1: 为真实客户照片卡建立失败测试

**Files:**
- Create: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.test.tsx`
- Modify: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.tsx`

- [ ] **Step 1: 写入失败测试**

新建 `src/app/stories/page.test.tsx`：

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STORIES, StoryCard } from "./page";

const verifiedPhotos = [
  ["Hadji Reyes", "/stories/Hadji Reyes.jpg"],
  ["Eddy Simon", "/stories/Eddy Simon.jpg"],
  ["Michele Guess", "/stories/Michele Guess.jpg"],
  ["SmashOhh", "/stories/SmashOhh.jpg"],
] as const;

function storyFor(name: string) {
  const story = STORIES.find((candidate) => candidate.name === name);
  if (!story) throw new Error(`Expected a story for ${name}`);
  return story;
}

describe("Stories customer photos", () => {
  it("maps every verified photo to its matching reviewer", () => {
    expect(
      STORIES.filter((story) => story.image).map(({ name, image }) => [name, image]),
    ).toEqual(verifiedPhotos);

    for (const [name, src] of verifiedPhotos) {
      const { unmount } = render(<StoryCard story={storyFor(name)} />);
      expect(
        screen.getByRole("img", { name: `${name} using a GoldSeason wheelchair` }),
      ).toHaveAttribute("src", src);
      expect(screen.getByTestId(`story-media-${storyFor(name).id}`)).toHaveClass(
        "aspect-[4/3]",
      );
      expect(screen.getByAltText("")).toHaveAttribute("src", src);
      unmount();
    }
  });

  it("renders an unmatched reviewer with an initial and no media space", () => {
    const story = storyFor("Stephanie Freeman");
    render(<StoryCard story={story} />);
    expect(screen.queryByTestId(`story-media-${story.id}`)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Stephanie Freeman initial")).toHaveTextContent("S");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to the same author's initial after an image error", () => {
    const story = storyFor("Hadji Reyes");
    render(<StoryCard story={story} />);
    fireEvent.error(
      screen.getByRole("img", { name: "Hadji Reyes using a GoldSeason wheelchair" }),
    );
    expect(screen.queryByTestId(`story-media-${story.id}`)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Hadji Reyes initial")).toHaveTextContent("H");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 确认测试先失败**

Run: `npm.cmd test -- src/app/stories/page.test.tsx`

Expected: FAIL，因页面尚未导出 `STORIES` 和 `StoryCard`。

- [ ] **Step 3: 定义数据契约和最小图片卡实现**

将 `page.tsx` 原有 `const stories` 改为：

```tsx
export type Story = {
  id: number;
  name: string;
  location: string;
  quote: string;
  product: string;
  tags: string[];
  image?: string;
};

export const STORIES: readonly Story[] = [
  // 保留当前 8 条评论的 id、name、location、quote、product、tags。
  // 仅为以下 id 添加 image，且不为其他记录添加 image：
  // { id: 1, image: "/stories/Hadji Reyes.jpg" }
  // { id: 5, image: "/stories/Eddy Simon.jpg" }
  // { id: 7, image: "/stories/Michele Guess.jpg" }
  // { id: 8, image: "/stories/SmashOhh.jpg" }
];
```

在 `filters` 常量之后加入如下 `StoryCard`。这里的 `imageSrc` 是媒体区及缩略头像的唯一判断条件，所以任一图像触发 `onError` 都会同时清除两者：

```tsx
export function StoryCard({ story }: { story: Story }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? undefined : story.image;

  return (
    <div className="editorial-card h-full overflow-hidden flex flex-col">
      {imageSrc ? (
        <div
          className="aspect-[4/3] overflow-hidden bg-[#E8D5C4]/20"
          data-testid={`story-media-${story.id}`}
        >
          <img
            src={imageSrc}
            alt={`${story.name} using a GoldSeason wheelchair`}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : null}
      <div className="p-6 h-full flex flex-col">
        <blockquote className="text-warm leading-relaxed mb-6 flex-grow">
          "{story.quote.length > 200 ? story.quote.substring(0, 200) + "..." : story.quote}"
        </blockquote>
        <div className="flex flex-wrap gap-2 mb-4">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-[#C8956C] bg-[#C8956C]/10 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-stone">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              aria-label={`${story.name} initial`}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white text-sm font-bold"
            >
              {story.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-deep-espresso text-sm">{story.name}</p>
            <p className="text-xs text-muted">{story.product}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

将过滤来源替换为 `STORIES`，并在故事网格中把原有每张 `editorial-card` JSX 替换为：

```tsx
<StoryCard story={story} />
```

- [ ] **Step 4: 确认评价卡测试通过**

Run: `npm.cmd test -- src/app/stories/page.test.tsx`

Expected: PASS，3 个 `Stories customer photos` 测试均通过。

- [ ] **Step 5: 提交评价卡功能**

```bash
git add src/app/stories/page.tsx src/app/stories/page.test.tsx
git commit -m "feat: restore verified customer story photos"
```

只暂存这两个文件，不混入工作树中已有的指南、推荐器、分析或部署改动。

### Task 2: 删除 Eleanor 的伪人物图片占位

**Files:**
- Modify: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.tsx`
- Modify: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.test.tsx`

- [ ] **Step 1: 加入精选故事失败测试**

将 `FeaturedStory` 加入测试文件的导入，并追加：

```tsx
describe("Stories featured quote", () => {
  it("uses a text-led Eleanor story without invented photo labels", () => {
    render(<FeaturedStory />);
    expect(
      screen.getByRole("heading", { name: "I Regained My Independence at 75" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Eleanor Watson")).toBeInTheDocument();
    expect(screen.queryByText("Eleanor 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Eleanor 2")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 确认测试先失败**

Run: `npm.cmd test -- src/app/stories/page.test.tsx`

Expected: FAIL，因 `FeaturedStory` 尚未导出。

- [ ] **Step 3: 实现文本主导的精选故事组件**

在 `featuredStory` 和 `filters` 常量之后加入：

```tsx
export function FeaturedStory() {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <span className="editorial-label text-[#C8956C]">Featured Story</span>
      <h2 className="editorial-tertiary text-deep-espresso mt-3 mb-6">
        "I Regained My Independence at 75"
      </h2>
      <blockquote className="text-[1.25rem] text-warm italic mb-8 leading-relaxed border-l-4 border-[#C8956C] pl-6 text-left">
        "{featuredStory.quote}"
      </blockquote>
      <div className="inline-flex items-center gap-4 text-left">
        <div
          aria-label={`${featuredStory.name} initial`}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white text-xl font-bold"
        >
          {featuredStory.avatar}
        </div>
        <div>
          <p className="font-semibold text-deep-espresso text-lg">{featuredStory.name}</p>
          <p className="text-sm text-muted">
            {featuredStory.location} · {featuredStory.product}
          </p>
        </div>
      </div>
    </div>
  );
}
```

在精选故事 section 内，保留背景、内边距和装饰元素，将原 `grid lg:grid-cols-12` 子树（含两个 Eleanor 占位块）替换为：

```tsx
<FeaturedStory />
```

- [ ] **Step 4: 确认精选故事测试通过**

Run: `npm.cmd test -- src/app/stories/page.test.tsx`

Expected: PASS，4 个 Stories 测试均通过。

- [ ] **Step 5: 提交精选故事修正**

```bash
git add src/app/stories/page.tsx src/app/stories/page.test.tsx
git commit -m "fix: remove unverified featured story photo placeholders"
```

### Task 3: 完整验证及视觉验收

**Files:**
- Verify: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.tsx`
- Verify: `C:\\tmp\\website-wheelchair-fit-execution\\src\\app\\stories\\page.test.tsx`

- [ ] **Step 1: 运行全量 Vitest**

Run: `npm.cmd test`

Expected: PASS，所有现有测试和 Stories 测试通过。

- [ ] **Step 2: 运行 TypeScript 检查**

Run: `npx.cmd tsc --noEmit`

Expected: PASS，没有 `Story`、`image`、JSX 或导出错误。

- [ ] **Step 3: 运行生产构建**

Run: `npm.cmd run build`

Expected: PASS，Prisma 生成和 Next.js 构建都成功。

- [ ] **Step 4: 本地浏览器验收**

打开 `http://localhost:3001/stories`：

1. 在 1440px 宽度确认 4 张已确认客户照均为 `aspect-[4/3]` 和 `object-cover`，其他 4 条没有空白媒体区，Eleanor 区域没有伪照片。
2. 在 390px 宽度确认照片不拉伸，长评论、作者行与筛选标签不溢出。
3. 在开发者工具中临时阻止任意一张 `/stories/*.jpg` 后刷新，确认对应卡只显示该作者的首字母，没有破图、空白区或其他客户照片。

- [ ] **Step 5: 审核提交边界**

Run: `git status --short`

Expected: 本功能有两个独立提交；进入本任务前已有的未提交文件仍保持原样，既不暂存、还原，也不提交。未获得用户后续明确授权前，不推送 GitHub、部署 Vercel 或改动生产站点。

## 自检结果

- 规格覆盖：Task 1 实现并测试四条精确映射、4:3 裁切、无图卡和加载错误回退；Task 2 删除 Eleanor 伪图片；Task 3 覆盖单测、类型、构建和桌面/移动端验收。
- 占位符扫描：没有未定义的后续工作、没有空泛的“补充测试”步骤；所有代码步骤均给出组件、属性、路径和命令。
- 类型一致性：所有任务和测试统一使用 `Story.image?: string`、`STORIES`、`StoryCard` 与 `FeaturedStory`。

