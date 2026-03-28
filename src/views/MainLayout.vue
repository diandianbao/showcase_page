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
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部用户信息栏 -->
      <header class="top-header">
        <div class="header-left">
          <slot name="header-left"></slot>
        </div>
        <div class="header-right">
          <!-- 角色选择 -->
          <div class="role-selector-wrapper">
            <el-select
              v-model="selectedRole"
              placeholder="选择角色"
              size="small"
              style="width: 160px;"
              @change="handleRoleChange"
            >
              <el-option
                v-for="role in roleList"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              >
                <span style="float: left">{{ role.label }}</span>
                <el-tag
                  size="small"
                  :type="role.tagType"
                  style="float: right; margin-left: 8px;"
                >
                  {{ role.tag }}
                </el-tag>
              </el-option>
            </el-select>
          </div>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-avatar-wrapper">
              <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div class="user-name-section">
                <span class="user-name">joe liu</span>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </div>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <div class="dropdown-user-info">
                    <el-avatar :size="48" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" style="margin-right: 12px;" />
                    <div class="dropdown-user-detail">
                      <div class="dropdown-user-name">joe liu</div>
                      <div class="dropdown-user-email">joe.liu@example.com</div>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  用户配置
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Monitor, Document, DataAnalysis, Connection, ChatDotRound, FolderOpened, EditPen, Aim, Collection, Notebook, Warning, Checked, User, Setting, ArrowDown } from '@element-plus/icons-vue'

const selectedRole = ref('operator')

const roleList = ref([
  { value: 'operator', label: '运营人员', tag: '运营', tagType: 'primary' },
  { value: 'business', label: '业务人员', tag: '业务', tagType: 'success' },
  { value: 'algorithm', label: 'IT 算法工程师', tag: '算法', tagType: 'warning' }
])

const handleRoleChange = (role) => {
  console.log('Role changed:', role)
  //  TODO: 根据角色切换页面权限或视图
}

const handleUserCommand = (command) => {
  console.log('User command:', command)
  if (command === 'profile') {
    console.log('View profile')
  } else if (command === 'settings') {
    console.log('Open settings')
  }
}
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

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow: auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 顶部用户信息栏 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.role-selector-wrapper {
  padding: 4px 0;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-avatar-wrapper:hover {
  background-color: #f5f7fa;
}

.user-name-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.arrow-icon {
  font-size: 14px;
  color: #909399;
}

/* 下拉菜单用户信息 */
.dropdown-user-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.dropdown-user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.dropdown-user-email {
  font-size: 12px;
  color: #909399;
}
</style>
