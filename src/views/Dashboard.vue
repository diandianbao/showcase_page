<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px;"
        />
      </div>
    </div>

    <!-- 第一行：核心指标 -->
    <div class="dashboard-content">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #409eff, #66b1ff);">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">2,345</div>
              <div class="stat-label">Total Traces</div>
              <div class="stat-trend up">↑ 12.5% 较上周</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #67c23a, #85ce61);">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">98.5%</div>
              <div class="stat-label">Success Rate</div>
              <div class="stat-trend up">↑ 0.3% 较上周</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e6a23c, #ebb563);">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">342ms</div>
              <div class="stat-label">Avg Latency</div>
              <div class="stat-trend down">↓ 18ms 较上周</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f56c6c, #f89898);">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">23</div>
              <div class="stat-label">BadCases</div>
              <div class="stat-trend down">↓ 5 较上周</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第二行：Token 消耗和用户反馈 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #9b59b6, #8e44ad);">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">Token 消耗</div>
              <div class="stat-value">1,234,567</div>
              <div class="token-detail">
                <span class="token-item">Input: 856,234</span>
                <span class="token-item">Output: 378,333</span>
              </div>
              <div class="stat-trend up">↑ 23.4% 较上周</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #27ae60, #2ecc71);">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户点赞</div>
              <div class="stat-value">1,892</div>
              <div class="stat-trend up">↑ 15.2% 较上周</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">用户点踩</div>
              <div class="stat-value">47</div>
              <div class="stat-trend down">↓ 12 较上周</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第三行：业务流耗时 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="workflow-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">业务流耗时查询</span>
                <el-dropdown size="small">
                  <el-button text>
                    选择业务
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>全部业务</el-dropdown-item>
                      <el-dropdown-item>智能客服</el-dropdown-item>
                      <el-dropdown-item>内容生成</el-dropdown-item>
                      <el-dropdown-item>数据分析</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
            <div class="workflow-content">
              <!-- 业务流层次结构 -->
              <div class="workflow-tree">
                <!-- 智能客服 -->
                <div class="workflow-group">
                  <div class="workflow-group-header">
                    <el-icon class="expand-icon"><ArrowRight /></el-icon>
                    <el-icon class="workflow-icon"><Service /></el-icon>
                    <span class="workflow-name">智能客服</span>
                    <span class="workflow-avg-time">平均耗时：285ms</span>
                  </div>
                  <div class="workflow-details">
                    <div class="workflow-item">
                      <span class="item-name">意图识别</span>
                      <el-progress :percentage="35" :format="() => '85ms'" status="success" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">知识检索</span>
                      <el-progress :percentage="60" :format="() => '142ms'" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">答案生成</span>
                      <el-progress :percentage="45" :format="() => '98ms'" status="success" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">结果返回</span>
                      <el-progress :percentage="15" :format="() => '32ms'" status="success" />
                    </div>
                  </div>
                </div>

                <!-- 内容生成 -->
                <div class="workflow-group">
                  <div class="workflow-group-header">
                    <el-icon class="expand-icon"><ArrowRight /></el-icon>
                    <el-icon class="workflow-icon"><Document /></el-icon>
                    <span class="workflow-name">内容生成</span>
                    <span class="workflow-avg-time">平均耗时：512ms</span>
                  </div>
                  <div class="workflow-details">
                    <div class="workflow-item">
                      <span class="item-name">提示词处理</span>
                      <el-progress :percentage="20" :format="() => '45ms'" status="success" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">内容创作</span>
                      <el-progress :percentage="85" :format="() => '389ms'" color="#e6a23c" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">质量检查</span>
                      <el-progress :percentage="40" :format="() => '78ms'" status="success" />
                    </div>
                  </div>
                </div>

                <!-- 数据分析 -->
                <div class="workflow-group">
                  <div class="workflow-group-header">
                    <el-icon class="expand-icon"><ArrowRight /></el-icon>
                    <el-icon class="workflow-icon"><DataAnalysis /></el-icon>
                    <span class="workflow-name">数据分析</span>
                    <span class="workflow-avg-time">平均耗时：1,245ms</span>
                  </div>
                  <div class="workflow-details">
                    <div class="workflow-item">
                      <span class="item-name">数据加载</span>
                      <el-progress :percentage="30" :format="() => '156ms'" status="success" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">数据清洗</span>
                      <el-progress :percentage="55" :format="() => '423ms'" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">模型推理</span>
                      <el-progress :percentage="75" :format="() => '534ms'" color="#f56c6c" />
                    </div>
                    <div class="workflow-item">
                      <span class="item-name">结果可视化</span>
                      <el-progress :percentage="25" :format="() => '132ms'" status="success" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第四行：其他指标 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="8">
          <el-card>
            <template #header>
              <span class="card-title">成本统计</span>
            </template>
            <div class="cost-detail">
              <div class="cost-item">
                <span class="cost-label">Input Cost:</span>
                <span class="cost-value">$12.45</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">Output Cost:</span>
                <span class="cost-value">$38.67</span>
              </div>
              <div class="cost-item total">
                <span class="cost-label">Total:</span>
                <span class="cost-value">$51.12</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span class="card-title">活跃用户</span>
            </template>
            <div class="user-stat">
              <div class="user-count">
                <span class="count-number">328</span>
                <span class="count-label">今日活跃用户</span>
              </div>
              <div class="user-list">
                <el-avatar v-for="i in 8" :key="i" :size="32" class="user-avatar"
                  :src="'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header>
              <span class="card-title">模型分布</span>
            </template>
            <div class="model-distribution">
              <div class="model-item">
                <span class="model-name">GPT-4</span>
                <el-progress :percentage="45" :format="() => '45%'" />
              </div>
              <div class="model-item">
                <span class="model-name">Claude-3</span>
                <el-progress :percentage="30" :format="() => '30%'" />
              </div>
              <div class="model-item">
                <span class="model-name">其他</span>
                <el-progress :percentage="25" :format="() => '25%'" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 第五行：趋势图表 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span class="card-title">Trace Trends (7 天)</span>
            </template>
            <div class="chart-placeholder">
              <el-icon><TrendCharts /></el-icon>
              <span>折线图 - 每日 Trace 数量趋势</span>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span class="card-title">Top Models</span>
            </template>
            <div class="chart-placeholder">
              <el-icon><PieChart /></el-icon>
              <span>饼图 - 模型使用分布</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Document, SuccessFilled, Timer, Warning, TrendCharts, DataLine,
  CircleCheckFilled, CircleCloseFilled, ArrowDown, ArrowRight, Service, DataAnalysis, PieChart
} from '@element-plus/icons-vue'

const dateRange = ref([])
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  margin-top: 6px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.token-detail {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.token-item {
  font-size: 12px;
  color: #606266;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 8px;
}

.chart-placeholder .el-icon {
  font-size: 48px;
}

/* 业务流样式 */
.workflow-card {
  padding: 8px;
}

.workflow-tree {
  padding: 8px 0;
}

.workflow-group {
  margin-bottom: 20px;
}

.workflow-group:last-child {
  margin-bottom: 0;
}

.workflow-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
}

.workflow-group-header:hover {
  background-color: #ecf5ff;
}

.expand-icon {
  font-size: 14px;
  color: #909399;
  transform: rotate(90deg);
  transition: transform 0.2s;
}

.workflow-icon {
  font-size: 18px;
  color: #409eff;
}

.workflow-name {
  font-weight: 500;
  color: #303133;
  flex: 1;
}

.workflow-avg-time {
  font-size: 13px;
  color: #606266;
}

.workflow-details {
  padding-left: 38px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workflow-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-name {
  width: 120px;
  font-size: 13px;
  color: #606266;
}

.workflow-item :deep(.el-progress) {
  flex: 1;
}

.workflow-item :deep(.el-progress__text) {
  font-size: 12px !important;
}

/* 成本统计 */
.cost-detail {
  padding: 8px 0;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-label {
  color: #606266;
  font-size: 13px;
}

.cost-value {
  color: #303133;
  font-weight: 500;
}

.cost-item.total .cost-value {
  color: #409eff;
  font-size: 16px;
}

/* 用户统计 */
.user-stat {
  padding: 8px 0;
}

.user-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.count-number {
  font-size: 32px;
  font-weight: 600;
  color: #409eff;
}

.count-label {
  font-size: 13px;
  color: #909399;
}

.user-list {
  display: flex;
  gap: -8px;
}

.user-avatar {
  margin-right: -8px;
  border: 2px solid #fff;
}

/* 模型分布 */
.model-distribution {
  padding: 8px 0;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.model-item:last-child {
  margin-bottom: 0;
}

.model-name {
  width: 80px;
  font-size: 13px;
  color: #606266;
}

.model-item :deep(.el-progress) {
  flex: 1;
}
</style>
