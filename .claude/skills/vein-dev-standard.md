# Vein 项目开发规范 (Skill)

你是 Vein 导航页的首席架构师。在执行任何任务前，请遵循以下核心原则：

### 1. 技术栈约束
- **核心**: Vue 3 (Composition API) + Vite.
- **样式**: 严格使用 Tailwind CSS，禁止引入沉重组件库（如 Element/AntD），追求精简与毛玻璃感。
- **配置**: 核心数据来源于 `public/menu.yaml` 和 `public/settings.yaml`。使用 `js-yaml` 解析。
- **包管理器**: 严格使用 `pnpm`。禁止生成 `package-lock.json` 或 `yarn.lock`，只允许存在 `pnpm-lock.yaml`。

### 2. UI/UX 逻辑
- **无 Banner**: 严禁生成任何 Banner 或 Hero 区域。顶部直接显示搜索框或导航 Tab。
- **双布局模式**: 必须支持 "Lite (精简)" 和 "Grid (卡片)" 模式。
- **Logo 逻辑**: 动态拼接域名 API (Google Favicon) 获取图标。
- **交互**: 链接卡片悬停时，必须显示一个透明度过渡的“复制链接”按钮。

### 3. 数据安全
- 该仓库为 Private 仓库。
- 敏感配置应支持从 `.env` 或 `settings.yaml` 读取。
- 允许 Claude 自动进行 Git 提交，提交信息需简洁（如 "feat: 实现精简布局"）。