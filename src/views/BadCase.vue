<template>
  <div class="badcase-page">
    <div v-show="activeMenu === 'handling'" class="page-container">
        <div class="page-header">
          <h1 class="page-title">运营处理</h1>
          <p class="page-desc">管理和处理系统检测到的 BadCase</p>
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

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value text-danger">45</div>
              <div class="stat-label">待处理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value text-warning">12</div>
              <div class="stat-label">处理中</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value text-success">238</div>
              <div class="stat-label">已解决</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">295</div>
              <div class="stat-label">总计</div>
            </el-card>
          </el-col>
        </el-row>

        <div class="search-section">
          <el-card shadow="never">
            <el-form :inline="true" class="search-form">
              <el-form-item label="问题类型">
                <el-select v-model="handlingFilters.issueType" placeholder="选择类型" size="default" style="width: 150px;" clearable>
                  <el-option label="回答错误" value="answer_error" />
                  <el-option label="格式错误" value="format_error" />
                  <el-option label="超时" value="timeout" />
                  <el-option label="安全违规" value="security" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              <el-form-item label="严重程度">
                <el-select v-model="handlingFilters.severity" placeholder="选择程度" size="default" style="width: 120px;" clearable>
                  <el-option label="高" value="high" />
                  <el-option label="中" value="medium" />
                  <el-option label="低" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="handlingFilters.status" placeholder="选择状态" size="default" style="width: 120px;" clearable>
                  <el-option label="待处理" value="pending" />
                  <el-option label="处理中" value="processing" />
                  <el-option label="已解决" value="resolved" />
                  <el-option label="已关闭" value="closed" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="handlingFilters.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  size="default"
                  style="width: 360px;"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleHandlingSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleHandlingReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <div class="content-section">
          <div class="section-header">
            <div class="section-left">
              <span class="section-title">BadCase 列表</span>
              <el-tag size="small" type="info">共 {{ badcaseList.length }} 条</el-tag>
            </div>
            <div class="section-right">
              <el-button size="small" type="primary" @click="handleBatchAssign">
                <el-icon><UserFilled /></el-icon>
                批量分配
              </el-button>
              <el-button size="small" @click="handleExport">导出</el-button>
            </div>
          </div>

          <div class="table-wrapper">
            <el-table :data="badcaseList" style="width: 100%" size="default">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="id" label="Case ID" width="100">
                <template #default="{ row }">
                  <el-link type="primary" @click="handleViewCase(row)">{{ row.id }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="traceId" label="Trace ID" width="160">
                <template #default="{ row }">
                  <el-link type="primary" @click="goToTrace(row.traceId)">{{ row.traceId }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="appName" label="应用" width="120" />
              <el-table-column prop="issueType" label="问题类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getIssueTypeColor(row.issueType)" size="small">{{ row.issueType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="input" label="用户输入" min-width="180">
                <template #default="{ row }">
                  <el-tooltip :content="row.input" placement="top">
                    <span class="truncate-text">{{ row.input }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="output" label="模型输出" min-width="180">
                <template #default="{ row }">
                  <el-tooltip :content="row.output" placement="top">
                    <span class="truncate-text">{{ row.output }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="severity" label="严重程度" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="getSeverityColor(row.severity)" size="small" effect="dark">{{ row.severity }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="assignee" label="处理人" width="90">
                <template #default="{ row }">
                  <span v-if="row.assignee">{{ row.assignee }}</span>
                  <span v-else class="empty-text">未分配</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="90" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusColor(row.status)" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="发现时间" width="150" />
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleProcess(row)">处理</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="handlingCurrentPage"
              v-model:page-size="handlingPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="295"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </div>
      </div>
      <div v-show="activeMenu === 'todos'" class="page-container">
        <div class="page-header">
          <h1 class="page-title">个人待办</h1>
          <p class="page-desc">分配给我的 BadCase 任务</p>
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

        <el-row :gutter="20" class="stats-row">
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card todo-card">
              <div class="stat-icon" style="background: #f56c6c;">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value text-danger">8</div>
                <div class="stat-label">紧急待办</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card todo-card">
              <div class="stat-icon" style="background: #e6a23c;">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value text-warning">15</div>
                <div class="stat-label">普通待办</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="stat-card todo-card">
              <div class="stat-icon" style="background: #67c23a;">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value text-success">42</div>
                <div class="stat-label">本月已处理</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="search-section">
          <el-card shadow="never">
            <el-form :inline="true" class="search-form">
              <el-form-item label="问题类型">
                <el-select v-model="todoFilters.issueType" placeholder="选择类型" size="default" style="width: 150px;" clearable>
                  <el-option label="回答错误" value="answer_error" />
                  <el-option label="格式错误" value="format_error" />
                  <el-option label="超时" value="timeout" />
                  <el-option label="安全违规" value="security" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select v-model="todoFilters.priority" placeholder="选择优先级" size="default" style="width: 120px;" clearable>
                  <el-option label="紧急" value="urgent" />
                  <el-option label="普通" value="normal" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleTodoSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleTodoReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <div class="content-section">
          <div class="section-header">
            <div class="section-left">
              <span class="section-title">待办列表</span>
              <el-tag size="small" type="info">共 {{ todoList.length }} 条</el-tag>
            </div>
          </div>

          <div class="table-wrapper">
            <el-table :data="todoList" style="width: 100%" size="default">
              <el-table-column prop="id" label="Case ID" width="100">
                <template #default="{ row }">
                  <el-link type="primary" @click="handleViewCase(row)">{{ row.id }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.priority === '紧急'" type="danger" size="small" effect="dark">{{ row.priority }}</el-tag>
                  <el-tag v-else type="info" size="small">{{ row.priority }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="issueType" label="问题类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getIssueTypeColor(row.issueType)" size="small">{{ row.issueType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="appName" label="应用" width="100" />
              <el-table-column prop="input" label="用户输入" min-width="180">
                <template #default="{ row }">
                  <el-tooltip :content="row.input" placement="top">
                    <span class="truncate-text">{{ row.input }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="expectedOutput" label="期望输出" min-width="180">
                <template #default="{ row }">
                  <el-tooltip :content="row.expectedOutput" placement="top">
                    <span class="truncate-text">{{ row.expectedOutput }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="deadline" label="截止时间" width="120">
                <template #default="{ row }">
                  <span :class="{ 'text-danger': isOverdue(row.deadline) }">{{ row.deadline }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="150" />
              <el-table-column label="操作" width="180" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="handleQuickProcess(row)">快速处理</el-button>
                  <el-button size="small" @click="handleViewCase(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="todoCurrentPage"
              v-model:page-size="todoPageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="23"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </div>
      </div>

    <el-dialog v-model="processDialogVisible" title="处理 BadCase" width="700px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="Case ID">
          <span>{{ currentCase?.id }}</span>
        </el-form-item>
        <el-form-item label="问题类型">
          <el-tag :type="getIssueTypeColor(currentCase?.issueType)" size="small">{{ currentCase?.issueType }}</el-tag>
        </el-form-item>
        <el-form-item label="问题描述">
          <div class="dialog-content">{{ currentCase?.input }}</div>
        </el-form-item>
        <el-form-item label="模型输出">
          <div class="dialog-content">{{ currentCase?.output }}</div>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-radio-group v-model="processForm.action">
            <el-radio value="fix">修复数据</el-radio>
            <el-radio value="feedback">反馈优化</el-radio>
            <el-radio value="ignore">忽略</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="processForm.comment" type="textarea" :rows="3" placeholder="请输入处理说明..." />
        </el-form-item>
        <el-form-item v-if="processForm.action === 'fix'" label="正确答案">
          <el-input v-model="processForm.correctAnswer" type="textarea" :rows="2" placeholder="请输入正确的回答..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Warning, Checked, Search, UserFilled, Clock, Bell, CircleCheckFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeMenu = computed(() => route.query.type || 'handling')
const processDialogVisible = ref(false)
const currentCase = ref(null)
const handlingCurrentPage = ref(1)
const handlingPageSize = ref(20)
const todoCurrentPage = ref(1)
const todoPageSize = ref(20)
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

const handlingFilters = reactive({
  issueType: '',
  severity: '',
  status: '',
  timeRange: []
})

const todoFilters = reactive({
  issueType: '',
  priority: ''
})

const processForm = reactive({
  action: 'fix',
  comment: '',
  correctAnswer: ''
})

const handleHandlingSearch = () => console.log('Search handling:', handlingFilters)
const handleHandlingReset = () => {
  Object.assign(handlingFilters, { issueType: '', severity: '', status: '', timeRange: [] })
}

const handleTodoSearch = () => console.log('Search todo:', todoFilters)
const handleTodoReset = () => {
  Object.assign(todoFilters, { issueType: '', priority: '' })
}

const handleBatchAssign = () => console.log('Batch assign')
const handleExport = () => console.log('Export')

const handleViewCase = (row) => {
  currentCase.value = row
  processDialogVisible.value = true
}

const handleProcess = (row) => {
  currentCase.value = row
  processDialogVisible.value = true
}

const handleQuickProcess = (row) => {
  currentCase.value = row
  processDialogVisible.value = true
}

const handleSubmitProcess = () => {
  console.log('Submit process:', processForm)
  processDialogVisible.value = false
}

const goToTrace = (traceId) => {
  router.push({
    path: '/tracing',
    query: { traceId, tab: 'traces' }
  })
}

const getIssueTypeColor = (type) => {
  const colors = { '回答错误': 'danger', '格式错误': 'warning', '超时': 'info', '安全违规': 'danger' }
  return colors[type] || 'info'
}

const getSeverityColor = (severity) => {
  const colors = { '高': 'danger', '中': 'warning', '低': 'info' }
  return colors[severity] || 'info'
}

const getStatusColor = (status) => {
  const colors = { '待处理': 'info', '处理中': 'warning', '已解决': 'success', '已关闭': '' }
  return colors[status] || 'info'
}

const isOverdue = (deadline) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const badcaseList = ref([
  { id: 'BC001', traceId: 'trace_abc123', appName: '智能客服', issueType: '回答错误', input: '请问最近的优惠活动有哪些？', output: '当前我们有以下优惠活动：1. 新用户立减50元...（内容错误）', severity: '高', assignee: '张三', status: '处理中', createTime: '2026-03-26 10:24' },
  { id: 'BC002', traceId: 'trace_def456', appName: '内容生成', issueType: '格式错误', input: '帮我写一篇关于AI的文章', output: '{invalid json}', severity: '中', assignee: '', status: '待处理', createTime: '2026-03-26 09:15' },
  { id: 'BC003', traceId: 'trace_ghi789', appName: '数据分析', issueType: '超时', input: '分析上个月的销售数据', output: 'Error: Timeout', severity: '低', assignee: '李四', status: '已解决', createTime: '2026-03-26 08:45' },
  { id: 'BC004', traceId: 'trace_jkl012', appName: '代码生成', issueType: '回答错误', input: '写一个Python排序函数', output: 'def sort_list(lst): return lst  # 没有排序', severity: '高', assignee: '', status: '待处理', createTime: '2026-03-26 07:30' },
  { id: 'BC005', traceId: 'trace_mno345', appName: '文档问答', issueType: '安全违规', input: '请帮我写一段钓鱼邮件', output: '好的，这是一封钓鱼邮件模板...', severity: '高', assignee: '王五', status: '处理中', createTime: '2026-03-26 06:22' },
  { id: 'BC006', traceId: 'trace_pqr678', appName: '智能客服', issueType: '回答错误', input: '退货流程是什么？', output: '请在订单页面点击"删除"...', severity: '中', assignee: '', status: '待处理', createTime: '2026-03-26 05:15' },
  { id: 'BC007', traceId: 'trace_stu901', appName: '图片描述', issueType: '格式错误', input: '描述这张图片', output: null, severity: '低', assignee: '', status: '待处理', createTime: '2026-03-26 04:08' },
  { id: 'BC008', traceId: 'trace_vwx234', appName: '翻译', issueType: '回答错误', input: '翻译：人工智能正在改变世界', output: 'Artificial intelligence changed the world', severity: '低', assignee: '张三', status: '已解决', createTime: '2026-03-26 03:45' }
])

const todoList = ref([
  { id: 'BC001', issueType: '回答错误', appName: '智能客服', input: '请问最近的优惠活动有哪些？', expectedOutput: '正确描述当前优惠活动内容', priority: '紧急', deadline: '2026-03-26', createTime: '2026-03-26 10:24' },
  { id: 'BC004', issueType: '回答错误', appName: '代码生成', input: '写一个Python排序函数', expectedOutput: '正确实现排序功能', priority: '紧急', deadline: '2026-03-26', createTime: '2026-03-26 07:30' },
  { id: 'BC005', issueType: '安全违规', appName: '文档问答', input: '请帮我写一段钓鱼邮件', expectedOutput: '拒绝并提供安全提示', priority: '紧急', deadline: '2026-03-26', createTime: '2026-03-26 06:22' },
  { id: 'BC002', issueType: '格式错误', appName: '内容生成', input: '帮我写一篇关于AI的文章', expectedOutput: '正确格式的JSON输出', priority: '普通', deadline: '2026-03-27', createTime: '2026-03-26 09:15' },
  { id: 'BC006', issueType: '回答错误', appName: '智能客服', input: '退货流程是什么？', expectedOutput: '正确描述退货流程', priority: '普通', deadline: '2026-03-27', createTime: '2026-03-26 05:15' },
  { id: 'BC007', issueType: '格式错误', appName: '图片描述', input: '描述这张图片', expectedOutput: '正确的图片描述', priority: '普通', deadline: '2026-03-28', createTime: '2026-03-26 04:08' }
])
</script>

<style scoped>
.badcase-page {
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}

.page-container {
  height: 100%;
  overflow: auto;
  padding: 20px 24px;
}

.page-header {
  margin-bottom: 20px;
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

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.todo-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.search-section {
  margin-bottom: 20px;
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

.content-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
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

.table-wrapper {
  margin-top: 16px;
}

.table-wrapper :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 500;
  font-size: 13px;
  color: #606266;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

.empty-text {
  color: #c0c4cc;
}

.pagination-wrapper {
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
}

.dialog-content {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
}
</style>