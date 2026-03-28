<template>
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <span class="logo-text">AI 运营平台</span>
        <span class="version">v1.0.0</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <!-- 工作台菜单组 -->
        <div class="nav-group">
          <div class="nav-group-title">工作台</div>
          <ul class="nav-list">
            <li
              class="nav-item"
              :class="{ active: $route.name === 'MyTodos' }"
              @click="$router.push('/my-todos')"
            >
              <el-icon><Document /></el-icon>
              <span>我的待办</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Dashboard' }"
              @click="$router.push('/dashboard')"
            >
              <el-icon><DataAnalysis /></el-icon>
              <span>看板</span>
            </li>
          </ul>
        </div>

        <!-- 可观测菜单组 -->
        <div class="nav-group">
          <div class="nav-group-title">可观测</div>
          <ul class="nav-list">
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Tracing' }"
              @click="$router.push('/tracing')"
            >
              <el-icon><Connection /></el-icon>
              <span>追踪</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Sessions' }"
              @click="$router.push('/sessions')"
            >
              <el-icon><ChatDotRound /></el-icon>
              <span>会话</span>
            </li>
          </ul>
        </div>

        <!-- 评估菜单组 -->
        <div class="nav-group">
          <div class="nav-group-title">评估</div>
          <ul class="nav-list">
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Evaluation' && $route.query.type === 'online' }"
              @click="$router.push('/evaluation?type=online')"
            >
              <el-icon><Connection /></el-icon>
              <span>在线评估</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Evaluation' && $route.query.type === 'offline' }"
              @click="$router.push('/evaluation?type=offline')"
            >
              <el-icon><FolderOpened /></el-icon>
              <span>离线评估</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Evaluation' && $route.query.type === 'annotation' }"
              @click="$router.push('/evaluation?type=annotation')"
            >
              <el-icon><EditPen /></el-icon>
              <span>人工标注</span>
            </li>
          </ul>
        </div>

        <!-- BadCase 菜单组 -->
        <div class="nav-group">
          <div class="nav-group-title">BadCase</div>
          <ul class="nav-list">
            <li
              class="nav-item"
              :class="{ active: $route.name === 'BadCase' && $route.query.type === 'handling' }"
              @click="$router.push('/badcase?type=handling')"
            >
              <el-icon><Warning /></el-icon>
              <span>运营处理</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'BadCase' && $route.query.type === 'todos' }"
              @click="$router.push('/badcase?type=todos')"
            >
              <el-icon><Checked /></el-icon>
              <span>个人待办</span>
            </li>
          </ul>
        </div>

        <!-- 配置菜单组 -->
        <div class="nav-group">
          <div class="nav-group-title">配置</div>
          <ul class="nav-list">
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Prompt' }"
              @click="$router.push('/prompt')"
            >
              <el-icon><EditPen /></el-icon>
              <span>提示词</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Intent' }"
              @click="$router.push('/intent')"
            >
              <el-icon><Aim /></el-icon>
              <span>意图</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Knowledge' }"
              @click="$router.push('/knowledge')"
            >
              <el-icon><Document /></el-icon>
              <span>知识库</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Memory' }"
              @click="$router.push('/memory')"
            >
              <el-icon><Collection /></el-icon>
              <span>记忆</span>
            </li>
            <li
              class="nav-item"
              :class="{ active: $route.name === 'Vocabulary' }"
              @click="$router.push('/vocabulary')"
            >
              <el-icon><Notebook /></el-icon>
              <span>词汇表</span>
            </li>
          </ul>
        </div>
      </nav>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-info">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="user-name">joe liu</span>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { Monitor, Document, DataAnalysis, Connection, ChatDotRound, FolderOpened, EditPen, Aim, Collection, Notebook, Warning, Checked } from '@element-plus/icons-vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
}

/* 左侧导航栏 */
.sidebar {
  width: 260px;
  min-width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.version {
  font-size: 11px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-group-title {
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
  font-size: 14px;
  gap: 10px;
}

.nav-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.nav-item .el-icon {
  font-size: 18px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 底部用户信息 */
.sidebar-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  color: #606266;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: auto;
  background-color: #f5f7fa;
}
</style>
