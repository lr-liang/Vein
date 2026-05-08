# Vein - 个人导航系统

Vein (脉络) 是一个现代化的个人导航系统，采用 Vue 3 + Vite 构建，支持双布局模式和毛玻璃 UI 设计。


## ✨ 核心特性

- **🎨 毛玻璃设计**：精致的毛玻璃效果和渐变背景
- **📱 三布局模式**：支持iOS模式、列表模式和网格模式
- **🔍 智能搜索**：实时搜索链接标题、描述和URL
- **📋 一键复制**：悬停时显示复制按钮，快速复制链接
- **🌙 主题支持**：深色/浅色/自动主题切换
- **⚙️ 设置面板**：右上角设置图标，可调整布局和主题
- **📱 全屏优化**：全屏铺满布局，隐藏滚动条但保留滚动功能
- **📊 数据驱动**：通过 YAML 配置文件管理导航数据
- **⚡ 响应式设计**：完美适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

启动后访问 http://localhost:5173

### 生产构建

```bash
pnpm build
```

构建完成后，将 `dist` 目录部署到静态服务器

### 代码校验

```bash
pnpm lint
```

## 📖 使用指南

### 1. 配置菜单数据

编辑 `public/menu.yaml` 文件来自定义导航菜单：

```yaml
categories:
  - name: "开发工具"
    id: "dev"
    groups:
      - name: "前端开发"
        links:
          - title: "Vue.js"
            url: "https://vuejs.org"
            description: "渐进式 JavaScript 框架"
          - title: "Vite"
            url: "https://vitejs.dev"
            description: "下一代前端工具链"
      - name: "后端开发"
        links:
          - title: "Node.js"
            url: "https://nodejs.org"
            description: "JavaScript 运行时环境"

  - name: "设计资源"
    id: "design"
    groups:
      - name: "UI 设计"
        links:
          - title: "Figma"
            url: "https://figma.com"
            description: "协作式界面设计工具"
```

### 2. 配置系统设置

编辑 `public/settings.yaml` 文件来调整系统设置：

```yaml
layout:
  default: "ios"  # ios | list | grid
theme:
  default: "auto"  # auto | light | dark
search:
  enabled: true
  placeholder: "搜索链接..."
```

### 3. 导入本地文件

您可以将现有的书签或导航数据转换为 YAML 格式导入：

- 手动创建：按照上面的 YAML 格式编写菜单数据
- 格式要求：
  - `categories`: 一级分类列表
  - `groups`: 二级分组列表
  - `links`: 具体链接列表
  - 每个链接支持 `title`、`url`、`description` 字段

### 4. 布局模式使用

- **iOS 模式**：适合大量链接，大图标展示
- **列表模式**：适合分类清晰的链接，紧凑型展示
- **网格模式**：卡片式展示，视觉效果好

通过右上角的布局切换器可以实时切换布局模式。

## 📁 项目结构

```
vein/
├── public/                 # 静态资源
│   ├── menu.yaml          # 导航菜单数据
│   └── settings.yaml      # 系统配置
├── src/
│   ├── components/        # Vue 组件
│   │   ├── SearchBar.vue     # 搜索栏组件
│   │   ├── LayoutSwitcher.vue # 布局切换器
│   │   ├── CategoryTabs.vue  # 分类标签
│   │   ├── LinkCard.vue      # 链接卡片
│   │   ├── ListLayout.vue    # 列表布局（侧边栏模式）
│   │   ├── IosLayout.vue     # iOS布局（大图标模式）
│   │   └── GridLayout.vue    # 网格布局
│   ├── composables/       # 组合式函数
│   ├── utils/            # 工具函数
│   ├── App.vue           # 主应用组件
│   ├── main.js           # 应用入口
│   └── style.css         # 全局样式
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── postcss.config.js     # PostCSS 配置
```

## ⚙️ 配置说明

### 菜单配置 (public/menu.yaml)

```yaml
categories:
  - name: "分类名称"
    id: "category-id"
    groups:
      - name: "分组名称"
        links:
          - title: "链接标题"
            url: "https://example.com"
            description: "链接描述"
```

### 系统配置 (public/settings.yaml)

```yaml
layout:
  default: "ios"  # ios | list | grid
theme:
  default: "auto"  # auto | light | dark
search:
  enabled: true
  placeholder: "搜索链接..."
```

### 布局模式说明

- **iOS模式** (`ios`): 类似iOS桌面的大图标网格布局，悬停时图标放大上浮
- **列表模式** (`list`): 左侧毛玻璃侧边栏+右侧列表区域的紧凑布局
- **网格模式** (`grid`): 卡片式网格布局，支持悬停效果

## 🎨 设计规范

- **无 Banner 原则**：页面顶部直接展示搜索框和导航
- **毛玻璃效果**：使用 `backdrop-blur-md` 和透明度效果
- **精致过渡**：所有交互都有平滑的过渡动画
- **图标处理**：自动获取网站 Favicon，失败时显示首字母
- **全屏布局**：使用弹性布局确保内容区域占据全部可用高度
- **隐藏滚动条**：全局隐藏滚动条但保留滚动功能

## 🛠 技术栈

- **核心框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + PostCSS
- **图标库**: Lucide Vue Next
- **工具库**: @vueuse/core, js-yaml
- **包管理器**: pnpm

## 📝 开发规范

1. **组件开发**：使用 `<script setup>` 语法糖
2. **样式编写**：优先使用 Tailwind CSS 工具类
3. **状态管理**：使用组合式函数管理状态
4. **数据处理**：通过 YAML 配置文件驱动
5. **交互设计**：保持简洁，避免过度设计

## 🚀 部署

1. 构建生产版本：
   ```bash
   pnpm build
   ```

2. 部署 `dist` 目录到静态网站托管服务

## 📄 许可证

MIT License

---

**Vein** - 让您的导航体验更加优雅和高效 🎯
