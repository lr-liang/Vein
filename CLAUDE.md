# Vein 项目指南

## 🛠 项目命令 (Commands)
- **开发服务器**: `pnpm dev`
- **生产构建**: `pnpm build`
- **代码校验**: `pnpm lint`
- **依赖安装**: `pnpm install`

## 🏗 技术栈 (Tech Stack)
- **核心框架**: Vue 3 (Composition API, `<script setup>`) + Vite
- **包管理器**: pnpm (严格禁止使用 npm/yarn)
- **样式方案**: Tailwind CSS + PostCSS (开启 class 模式深色模式)
- **工具库**: `@vueuse/core` (处理剪切板与状态), `js-yaml` (解析配置), `lucide-vue-next` (图标)

## 🎯 核心业务逻辑 (Business Logic)
1. **数据驱动 (YAML Only)**: 
    - 必须从 `public/menu.yaml` 加载导航数据。
    - 必须从 `public/settings.yaml` 加载全局配置。
2. **三级分类结构**: 
    - `Categories` (一级大类 Tab) -> `Groups` (二级分组) -> `Links` (三级具体链接)。
3. **三布局模式**: 
    - **iOS 模式**（原Lite模式）：
        - **视觉**: 类似 iOS 桌面，大尺寸图标网格排列。
        - **卡片**: 仅展示”大图标 + 标题”。
        - **交互**: 悬停时图标平滑放大，并伴随 `translate-y(-8px)` 上浮动效。
        - **描述**: 悬停时显示链接的 `description` (描述)。
    - **列表模式**（原Lite模式重命名）：
        - **布局**: 左侧毛玻璃侧边栏 + 右侧列表区域。
        - **侧边栏**: 分类菜单一行显示3个。
        - **内容区**: 展示分组与紧凑链接列表。
    - **网格模式**（原Grid模式）：
        - **布局**: 大图标网格布局。
        - **交互**: 支持上浮动效、阴影及图标放大。
        - **iOS 风格**: 图标采用无背景纯净显示，仅保留图标本身，移除外层毛玻璃效果和背景色。
4. **无 Banner 原则**: 
    - **绝对禁止**创建任何 Banner、Hero 区域或欢迎标题。
    - 页面顶部必须直接展示搜索框。

## 🎨 UI/UX 规范 (Design Standards)
- **毛玻璃效果**: 使用 `backdrop-blur-md` 或 `backdrop-blur-xl`。
- **精致感**: 容器需配合 `bg-white/10` 或 `bg-black/20` 以及 `border border-white/20`。
- **Logo 处理**: 使用 Google Favicon API。若加载失败，必须降级显示分类首字母的占位圆圈。
- **交互细节**: 链接卡片悬停时必须在右上角显示”复制”图标 (使用 `useClipboard`)。
- **动效**: 所有的布局切换和悬停交互必须带有 `transition-all duration-300`。
- **全屏布局**: 使用弹性布局确保内容区域占据全部可用高度。
- **隐藏滚动条**: 全局隐藏滚动条但保留滚动功能，使用 `scrollbar-hide` 类。