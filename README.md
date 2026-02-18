# Arshdelightblog

这是一个基于 React + Vite 构建的个人博客项目，使用 Supabase 作为后端服务。

## 项目简介

Arshdelightblog 是一个现代化的个人博客系统，支持用户注册登录、创建编辑文章、管理文章发布状态等功能。

注：其实也没有多现代化，我会慢慢更新

## 技术栈

- React 18
- Vite
- Supabase (后端数据库和认证)
- React Router
- React Markdown Editor

## 环境设置

### 1. 创建 .env 文件

在项目根目录创建一个 `.env` 文件，并添加您的 Supabase 项目凭证：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

您可以在 Supabase 项目仪表板的 **Settings > API** 部分找到这些值。

### 2. 安装依赖

```bash
npm install
```

### 3. 运行开发服务器

```bash
npm run dev
```

## 数据库设置

### Supabase 数据库结构

Supabase 数据库 SQL 结构尚未包含在本仓库中，将在后续添加。

#### 所需表结构：

- `posts` - 用于存储博客文章
- `profiles` - 用于存储用户资料

#### 所需行级安全 (RLS) 策略：

- 用户创建、读取、更新和删除自己文章的策略
- 用户访问自己资料信息的策略

敬请期待完整的数据库设置说明！
