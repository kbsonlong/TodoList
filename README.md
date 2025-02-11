# Todo List 应用

一个功能完整的待办事项管理应用，支持任务状态管理、日期筛选和分页显示等特性。

## 技术实现

### 前端技术栈

- React
- TypeScript
- Vite
- IndexedDB (本地数据存储)

### 后端技术栈

- Go
- Gin (Web框架)
- SQLite (数据库)

## 功能特性

1. 任务管理
   - 添加新任务
   - 删除任务
   - 任务状态流转（待开始 → 进行中 → 已完成）

2. 任务状态追踪
   - 显示任务创建时间
   - 显示任务完成时间
   - 计算任务持续时间

3. 筛选和排序
   - 按状态筛选（全部/待开始/进行中/已完成）
   - 按日期范围筛选
   - 支持创建时间和完成时间筛选

4. 分页功能
   - 支持自定义每页显示数量（5/10/20/50条）
   - 页面导航控件
   - 显示当前页码和总页数

## API接口文档

### 获取所有任务

```
GET /api/todos

响应格式：
{
    "todos": [
        {
            "id": 1,
            "text": "任务内容",
            "status": "todo",
            "createTime": "2023-12-01T10:00:00",
            "completedTime": null
        }
    ]
}
```

### 添加任务

```
POST /api/todos

请求体：
{
    "text": "任务内容"
}

响应格式：
{
    "id": 1,
    "text": "任务内容",
    "status": "todo",
    "createTime": "2023-12-01T10:00:00",
    "completedTime": null
}
```

### 更新任务状态

```
PUT /api/todos/:id/status

请求体：
{
    "status": "completed"
}

响应格式：
{
    "id": 1,
    "status": "completed",
    "completedTime": "2023-12-01T11:00:00"
}
```

### 删除任务

```
DELETE /api/todos/:id

响应状态码：204
```

## 部署指南

### 环境要求

- Node.js 16+
- Go 1.16+
- SQLite 3

### 前端部署

1. 安装依赖
```bash
npm install
```

2. 构建项目
```bash
npm run build
```

3. 启动开发服务器
```bash
npm run dev
```

### 后端部署

1. 进入后端目录
```bash
cd server
```

2. 安装依赖
```bash
go mod download
go mod tidy
```

3. 启动服务器
```bash
go run main.go
```

## 项目结构

```
src/
├── App.tsx      # 主应用组件
├── App.css      # 样式文件
├── db.ts        # IndexedDB 数据库操作
├── main.tsx     # 应用入口
└── index.css    # 全局样式

server/
├── main.go      # 服务器入口
├── handlers.go  # API处理函数
└── db.go        # 数据库操作
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

## 功能展示

![全部状态](https://raw.githubusercontent.com/kbsonlong/notes_statics/master/images/202502111523863.png)

![待开始](https://raw.githubusercontent.com/kbsonlong/notes_statics/master/images/202502111523878.png)

![进行中](https://raw.githubusercontent.com/kbsonlong/notes_statics/master/images/202502111524860.png)

![已完成](https://raw.githubusercontent.com/kbsonlong/notes_statics/master/images/202502111524369.png)

![翻页](https://raw.githubusercontent.com/kbsonlong/notes_statics/master/images/202502111525142.png)