<template>
  <div class="sessions-page">
    <div class="page-header">
      <h1 class="page-title">会话</h1>
      <p class="page-desc">会话管理，每个 Session 包含一次完整对话中的多个 Trace</p>
      <div class="app-selector-section">
        <div class="selector-title">选择应用 / Agent</div>
        <el-tree-select
          v-model="selectedApp"
          placeholder="请选择应用或 Agent"
          :data="appTreeData"
          :default-expand-all="true"
          style="width: 280px;"
          clearable
          check-strictly
          @change="handleAppChange"
        />
      </div>
    </div>

    <div class="search-section">
      <el-card shadow="never">
        <el-form :inline="true" class="search-form">
          <el-form-item label="Session ID">
            <el-input v-model="filters.sessionId" placeholder="输入 Session ID" size="default" style="width: 200px;" clearable />
          </el-form-item>
          <el-form-item label="用户 ID">
            <el-input v-model="filters.userId" placeholder="输入用户 ID" size="default" style="width: 200px;" clearable />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filters.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              size="default"
              style="width: 360px;"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="选择状态" size="default" style="width: 120px;" clearable>
              <el-option label="正常" value="normal" />
              <el-option label="异常" value="error" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="sessions-section">
      <div class="section-header">
        <div class="section-left">
          <span class="section-title">Session 列表</span>
          <el-tag size="small" type="info">共 {{ sessions.length }} 条</el-tag>
        </div>
        <div class="section-right">
          <el-button size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </div>
      </div>

      <div class="session-table-wrapper">
        <el-table 
          :data="sessions" 
          style="width: 100%" 
          size="default" 
          class="session-table"
          row-key="id"
          :tree-props="{ children: 'traces', hasChildren: 'hasTraces' }"
        >
          <el-table-column prop="name" label="名称" min-width="180">
            <template #default="{ row }">
              <div v-if="row.isTrace" class="trace-row">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small" effect="plain">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
                <el-link type="primary" @click="goToTrace(row.id)" class="trace-link">{{ row.name }}</el-link>
              </div>
              <div v-else class="session-name-cell">
                <el-icon class="session-icon"><ChatLineRound /></el-icon>
                <span class="session-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" width="180">
            <template #default="{ row }">
              <span class="id-text" :class="{ 'trace-id': row.isTrace }">{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="用户" width="120">
            <template #default="{ row }">
              <span v-if="!row.isTrace">{{ row.userName }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="160">
            <template #default="{ row }">
              <span class="time-text">{{ row.startTime }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="时长" width="100" align="right">
            <template #default="{ row }">
              <span v-if="!row.isTrace" class="duration-text">{{ row.duration }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="traceCount" label="追踪数" width="90" align="right">
            <template #default="{ row }">
              <span v-if="!row.isTrace" class="count-text">{{ row.traceCount }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalTokens" label="Tokens" width="100" align="right">
            <template #default="{ row }">
              <span class="tokens-text">{{ row.totalTokens || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalLatency" label="总耗时" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row.totalLatency" class="latency-text" :class="getLatencyClass(row.latencyMs)">{{ row.totalLatency }}</span>
              <span v-else class="empty-text">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.status === 'success'" class="status-icon success"><CircleCheckFilled /></el-icon>
              <el-icon v-else-if="row.status === 'error'" class="status-icon error"><CircleCloseFilled /></el-icon>
              <el-tag v-else-if="!row.isTrace" :type="row.hasError ? 'danger' : 'success'" size="small" effect="plain">
                {{ row.hasError ? '异常' : '正常' }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="50"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search, Refresh, ChatLineRound, CircleCheckFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const currentPage = ref(1)
const pageSize = ref(20)
const selectedApp = ref('')

const appTreeData = ref([
  {
    value: 'smart_cs',
    label: '智能客服',
    children: [
      { value: 'smart_cs_ai_agent', label: 'AI 助手' },
      { value: 'smart_cs_qa_agent', label: '问答机器人' }
    ]
  },
  {
    value: 'content_gen',
    label: '内容生成',
    children: [
      { value: 'content_gen_article_agent', label: '文章助手' },
      { value: 'content_gen_copy_agent', label: '文案生成' }
    ]
  },
  {
    value: 'data_analysis',
    label: '数据分析',
    children: [
      { value: 'data_analysis_sales_agent', label: '销售分析' },
      { value: 'data_analysis_user_agent', label: '用户分析' }
    ]
  }
])

const handleAppChange = (app) => {
  console.log('App changed:', app)
}

const filters = reactive({
  sessionId: '',
  userId: '',
  timeRange: [],
  status: ''
})

const handleSearch = () => {
  console.log('Search sessions:', filters)
}

const handleReset = () => {
  Object.assign(filters, {
    sessionId: '',
    userId: '',
    timeRange: [],
    status: ''
  })
}

const handleRefresh = () => {
  console.log('Refresh sessions')
}

const goToTrace = (traceId) => {
  router.push({
    path: '/tracing',
    query: { traceId, tab: 'traces' }
  })
}

const getLatencyClass = (latencyMs) => {
  if (!latencyMs) return ''
  if (latencyMs > 3000) return 'slow'
  if (latencyMs > 1500) return 'medium'
  return 'fast'
}

const sessions = ref([
  {
    id: 'sess_001',
    name: '客服咨询会话',
    userName: '张三',
    startTime: '2026-03-26 10:20:00',
    duration: '12分钟',
    traceCount: 3,
    totalTokens: 3340,
    totalLatency: '2.2s',
    latencyMs: 2200,
    hasError: false,
    traces: [
      { id: 'trace_abc123', isTrace: true, name: '智能客服对话', status: 'success', startTime: '2026-03-26 10:24:38', totalTokens: 2450, totalLatency: '1.2s', latencyMs: 1200 },
      { id: 'trace_pqr678', isTrace: true, name: '多轮对话', status: 'success', startTime: '2026-03-26 05:15:33', totalTokens: 890, totalLatency: '980ms', latencyMs: 980 }
    ]
  },
  {
    id: 'sess_002',
    name: '内容创作会话',
    userName: '李四',
    startTime: '2026-03-26 09:10:00',
    duration: '25分钟',
    traceCount: 4,
    totalTokens: 7470,
    totalLatency: '5.4s',
    latencyMs: 5400,
    hasError: false,
    traces: [
      { id: 'trace_def456', isTrace: true, name: '内容生成任务', status: 'success', startTime: '2026-03-26 09:15:22', totalTokens: 3890, totalLatency: '2.8s', latencyMs: 2800 },
      { id: 'trace_jkl012', isTrace: true, name: '代码生成任务', status: 'success', startTime: '2026-03-26 07:30:45', totalTokens: 1560, totalLatency: '1.8s', latencyMs: 1800 },
      { id: 'trace_vwx234', isTrace: true, name: '翻译任务', status: 'success', startTime: '2026-03-26 03:45:12', totalTokens: 320, totalLatency: '650ms', latencyMs: 650 }
    ]
  },
  {
    id: 'sess_003',
    name: '数据分析会话',
    userName: '王五',
    startTime: '2026-03-26 08:40:00',
    duration: '18分钟',
    traceCount: 3,
    totalTokens: 2700,
    totalLatency: '8.4s',
    latencyMs: 8400,
    hasError: true,
    traces: [
      { id: 'trace_ghi789', isTrace: true, name: '数据分析任务', status: 'error', startTime: '2026-03-26 08:45:10', totalTokens: 1200, totalLatency: '5.2s', latencyMs: 5200 },
      { id: 'trace_yza567', isTrace: true, name: 'SQL生成任务', status: 'error', startTime: '2026-03-26 02:30:48', totalTokens: 1500, totalLatency: '3.2s', latencyMs: 3200 }
    ]
  },
  {
    id: 'sess_004',
    name: '文档处理会话',
    userName: '赵六',
    startTime: '2026-03-26 06:15:00',
    duration: '35分钟',
    traceCount: 3,
    totalTokens: 5080,
    totalLatency: '3.9s',
    latencyMs: 3900,
    hasError: false,
    traces: [
      { id: 'trace_mno345', isTrace: true, name: '文档问答', status: 'success', startTime: '2026-03-26 06:22:18', totalTokens: 4200, totalLatency: '3.5s', latencyMs: 3500 },
      { id: 'trace_bcd890', isTrace: true, name: '情感分析', status: 'success', startTime: '2026-03-26 01:18:25', totalTokens: 180, totalLatency: '420ms', latencyMs: 420 }
    ]
  },
  {
    id: 'sess_005',
    name: '多媒体处理会话',
    userName: '钱七',
    startTime: '2026-03-26 04:00:00',
    duration: '20分钟',
    traceCount: 3,
    totalTokens: 3950,
    totalLatency: '3.6s',
    latencyMs: 3600,
    hasError: false,
    traces: [
      { id: 'trace_stu901', isTrace: true, name: '图片描述生成', status: 'success', startTime: '2026-03-26 04:08:55', totalTokens: 1850, totalLatency: '2.1s', latencyMs: 2100 },
      { id: 'trace_efg123', isTrace: true, name: '知识图谱查询', status: 'success', startTime: '2026-03-26 00:05:33', totalTokens: 2100, totalLatency: '1.5s', latencyMs: 1500 }
    ]
  },
  {
    id: 'sess_006',
    name: '自动化任务会话',
    userName: '孙八',
    startTime: '2026-03-25 21:15:00',
    duration: '45分钟',
    traceCount: 3,
    totalTokens: 3760,
    totalLatency: '10.0s',
    latencyMs: 10000,
    hasError: false,
    traces: [
      { id: 'trace_hij456', isTrace: true, name: '数据清洗任务', status: 'success', startTime: '2026-03-25 23:50:18', totalTokens: 560, totalLatency: '4.2s', latencyMs: 4200 },
      { id: 'trace_nop012', isTrace: true, name: '自动化报告生成', status: 'success', startTime: '2026-03-25 21:20:15', totalTokens: 3200, totalLatency: '5.8s', latencyMs: 5800 }
    ]
  },
  {
    id: 'sess_007',
    name: 'API测试会话',
    userName: '周九',
    startTime: '2026-03-25 22:30:00',
    duration: '8分钟',
    traceCount: 2,
    totalTokens: 450,
    totalLatency: '780ms',
    latencyMs: 780,
    hasError: false,
    traces: [
      { id: 'trace_klm789', isTrace: true, name: 'API调用测试', status: 'success', startTime: '2026-03-25 22:35:42', totalTokens: 450, totalLatency: '780ms', latencyMs: 780 }
    ]
  },
  {
    id: 'sess_008',
    name: '语音交互会话',
    userName: '吴十',
    startTime: '2026-03-25 20:00:00',
    duration: '15分钟',
    traceCount: 2,
    totalTokens: 280,
    totalLatency: '2.3s',
    latencyMs: 2300,
    hasError: false,
    traces: [
      { id: 'trace_qrs345', isTrace: true, name: '语音识别任务', status: 'success', startTime: '2026-03-25 20:08:37', totalTokens: 280, totalLatency: '2.3s', latencyMs: 2300 }
    ]
  },
  {
    id: 'sess_009',
    name: '混合任务会话',
    userName: '郑十一',
    startTime: '2026-03-25 19:00:00',
    duration: '30分钟',
    traceCount: 4,
    totalTokens: 5680,
    totalLatency: '6.8s',
    latencyMs: 6800,
    hasError: true,
    traces: [
      { id: 'trace_xxx001', isTrace: true, name: '图像识别', status: 'success', startTime: '2026-03-25 19:10:00', totalTokens: 1200, totalLatency: '1.5s', latencyMs: 1500 },
      { id: 'trace_xxx002', isTrace: true, name: '文本摘要', status: 'success', startTime: '2026-03-25 19:15:00', totalTokens: 800, totalLatency: '800ms', latencyMs: 800 },
      { id: 'trace_xxx003', isTrace: true, name: '数据库查询', status: 'error', startTime: '2026-03-25 19:20:00', totalTokens: 500, totalLatency: '3.5s', latencyMs: 3500 },
      { id: 'trace_xxx004', isTrace: true, name: '结果整合', status: 'success', startTime: '2026-03-25 19:25:00', totalTokens: 3180, totalLatency: '1.0s', latencyMs: 1000 }
    ]
  },
  {
    id: 'sess_010',
    name: '客服投诉处理',
    userName: '王十二',
    startTime: '2026-03-25 18:00:00',
    duration: '22分钟',
    traceCount: 5,
    totalTokens: 6200,
    totalLatency: '4.5s',
    latencyMs: 4500,
    hasError: false,
    traces: [
      { id: 'trace_yyy001', isTrace: true, name: '问题分类', status: 'success', startTime: '2026-03-25 18:05:00', totalTokens: 500, totalLatency: '300ms', latencyMs: 300 },
      { id: 'trace_yyy002', isTrace: true, name: '历史查询', status: 'success', startTime: '2026-03-25 18:06:00', totalTokens: 800, totalLatency: '500ms', latencyMs: 500 },
      { id: 'trace_yyy003', isTrace: true, name: '知识检索', status: 'success', startTime: '2026-03-25 18:08:00', totalTokens: 1500, totalLatency: '800ms', latencyMs: 800 },
      { id: 'trace_yyy004', isTrace: true, name: '方案生成', status: 'success', startTime: '2026-03-25 18:10:00', totalTokens: 2400, totalLatency: '1.8s', latencyMs: 1800 },
      { id: 'trace_yyy005', isTrace: true, name: '回复确认', status: 'success', startTime: '2026-03-25 18:15:00', totalTokens: 1000, totalLatency: '1.1s', latencyMs: 1100 }
    ]
  }
])
</script>

<style scoped>
.sessions-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.page-header {
  padding: 20px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 12px 0;
}

.app-selector-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 8px;
}

.selector-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.search-section {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.search-section :deep(.el-card__body) {
  padding: 16px 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
}

.sessions-section {
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.section-right {
  display: flex;
  gap: 8px;
}

.session-table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.session-table {
  --el-table-border-color: #f0f0f0;
}

.session-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 500;
  font-size: 13px;
  color: #606266;
}

.session-table :deep(.el-table__row) {
  font-size: 13px;
}

.session-table :deep(.el-table__row--level-1) {
  background-color: #fafafa;
}

.session-table :deep(.el-table__row--level-1:hover) {
  background-color: #f5f7fa;
}

.session-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.session-icon {
  color: #409eff;
  font-size: 18px;
}

.session-name {
  font-weight: 500;
  color: #303133;
}

.trace-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
}

.trace-link {
  font-size: 13px;
}

.id-text {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.trace-id {
  color: #c0c4cc;
  font-size: 11px;
}

.time-text {
  font-family: monospace;
  font-size: 12px;
  color: #606266;
}

.duration-text {
  color: #606266;
  font-weight: 500;
}

.count-text {
  color: #409eff;
  font-weight: 500;
}

.tokens-text {
  color: #606266;
  font-family: monospace;
}

.latency-text {
  font-family: monospace;
  font-weight: 500;
}

.latency-text.fast {
  color: #67c23a;
}

.latency-text.medium {
  color: #e6a23c;
}

.latency-text.slow {
  color: #f56c6c;
}

.empty-text {
  color: #c0c4cc;
}

.status-icon {
  font-size: 18px;
}

.status-icon.success {
  color: #67c23a;
}

.status-icon.error {
  color: #f56c6c;
}

.pagination-wrapper {
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 8px 8px;
  display: flex;
  justify-content: flex-end;
}
</style>