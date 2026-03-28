# AI 应用运营作业平台 - UI 演示项目

本项目是一个用于演示 AI 应用运营作业平台的 UI 界面项目，采用 Vue 3 + Element Plus 技术栈。

## 功能模块

- **看板** - 数据概览页面
- **运营数据可观测** - 会话 (Sessions)、追踪 (Tracing) 等页面
- **运营数据评估** - 评估页面
- **BadCase 分析** - BadCase 分析页面
- **意图管理** - 意图识别配置与管理
- **记忆管理** - AI 记忆配置与管理
- **词汇表管理** - 词根、近义词管理，支持大模型生成近义词

## 环境要求

- Node.js >= 18.x
- npm >= 9.x

## 安装步骤

### 1. 克隆项目

```bash
git clone <项目地址>
cd showcase_page
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动成功后，访问 http://localhost:5173 即可查看。

### 4. 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 5. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
showcase_page/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Dashboard.vue
│   │   ├── Sessions.vue
│   │   ├── Tracing.vue
│   │   ├── Evaluation.vue
│   │   ├── BadCase.vue
│   │   ├── Intent.vue      # 意图管理
│   │   ├── Memory.vue      # 记忆管理
│   │   ├── Vocabulary.vue  # 词汇表管理
│   │   └── ...
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html          # HTML 模板
├── package.json        # 项目依赖
└── vite.config.js      # Vite 配置（如有）
```

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router 4** - 官方路由
- **Element Plus** - Vue 3 组件库
- **Vite** - 下一代前端构建工具

## 主要功能说明

### 词汇表管理

词汇表按服务组织，每个服务拥有独立的词根和近义词数据：

- **词根管理**：管理专业术语的词根，包含定义、示例、分类、近义词等
- **近义词管理**：管理近义词组，支持主词切换、近义词添加/删除
- **提示词配置**：配置大模型生成近义词的提示词
- **AI 生成**：调用大模型 API 生成近义词（当前为模拟实现）
- **导出/导入**：支持 JSON/CSV 格式的词汇表导出和导入

### 意图管理

- 按服务组织意图组和意图
- 支持意图的增删改查
- 支持槽位管理和训练样本管理
- 提供意图调试功能

### 记忆管理

- 基本配置：记忆提取周期、保存策略、检索配置
- 提示词配置：记忆提取和压缩的提示词
- 分类管理：记忆分类和优先级
- 过期策略：记忆过期清理规则

## 开发说明

### 添加新页面

1. 在 `src/views/` 目录下创建新的 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在 `MainLayout.vue` 中添加导航菜单项

### 组件开发规范

- 使用 `<script setup>` 语法
- 使用 Composition API
- 使用 Element Plus 组件库

## 常见问题

### 依赖安装失败

尝试使用淘宝镜像：

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 端口被占用

Vite 会自动寻找可用端口，或在 `package.json` 中指定：

```json
{
  "scripts": {
    "dev": "vite --port 3000"
  }
}
```

## License

MIT
