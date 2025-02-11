# Todo List 应用

一个功能完整的待办事项管理应用，支持任务状态管理、日期筛选和分页显示等特性。

## 功能特性

### 任务管理
- 添加新任务
- 删除已有任务
- 任务状态切换（待开始 → 进行中 → 已完成）
- 任务持续时间自动计算（从创建到完成）

### 状态管理
- 三种任务状态：待开始、进行中、已完成
- 通过状态筛选任务列表
- 状态切换按钮颜色区分不同状态

### 日期筛选
- 支持按日期范围筛选任务
- 可筛选创建时间和完成时间
- 日期选择器支持精确到分钟

### 分页功能
- 支持自定义每页显示数量（5/10/20/50条）
- 分页导航（上一页/下一页）
- 显示当前页码和总页数

## 技术实现

### 前端技术栈
- React
- TypeScript
- Vite

### 数据存储
- IndexedDB
- 单例模式数据库连接
- 异步数据操作

### 状态管理
- React Hooks (useState, useEffect)
- 组件内状态管理

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── App.tsx      # 主应用组件
├── App.css      # 样式文件
├── db.ts        # IndexedDB 数据库操作
├── main.tsx     # 应用入口
└── index.css    # 全局样式
```

## 使用说明

1. 添加任务
   - 在输入框中输入任务内容
   - 点击"添加"按钮或按回车键

2. 管理任务状态
   - 点击任务状态按钮切换状态
   - 状态流转：待开始 → 进行中 → 已完成 → 待开始

3. 筛选任务
   - 使用状态下拉框筛选不同状态的任务
   - 使用日期选择器按时间范围筛选

4. 删除任务
   - 点击任务右侧的"删除"按钮

5. 分页浏览
   - 使用页面底部的分页控件浏览任务列表
   - 可调整每页显示的任务数量
