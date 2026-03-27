<template>
  <div class="evaluation-page">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">评估中心</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="online">
          <el-icon><Connection /></el-icon>
          <span>在线评估</span>
        </el-menu-item>
        <el-menu-item index="offline">
          <el-icon><FolderOpened /></el-icon>
          <span>离线评估</span>
        </el-menu-item>
        <el-menu-item index="annotation">
          <el-icon><EditPen /></el-icon>
          <span>人工标注</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="main-content">
      <template v-if="activeMenu === 'online'">
        <div class="page-header">
          <h1 class="page-title">在线评估</h1>
          <p class="page-desc">实时采集应用数据，使用评估器或人工进行评估</p>
        </div>

        <div class="search-section">
          <el-card shadow="never">
            <el-form :inline="true" class="search-form">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="onlineFilters.timeRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  size="default"
                  style="width: 360px;"
                />
              </el-form-item>
              <el-form-item label="评估状态">
                <el-select v-model="onlineFilters.status" placeholder="选择状态" size="default" style="width: 150px;" clearable>
                  <el-option label="待评估" value="pending" />
                  <el-option label="评估中" value="evaluating" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="失败" value="failed" />
                </el-select>
              </el-form-item>
              <el-form-item label="评估类型">
                <el-select v-model="onlineFilters.evalType" placeholder="选择类型" size="default" style="width: 150px;" clearable>
                  <el-option label="自动评估" value="auto" />
                  <el-option label="人工评估" value="manual" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleOnlineSearch">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="handleOnlineReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <div class="content-section">
          <div class="section-header">
            <div class="section-left">
              <span class="section-title">待评估数据</span>
              <el-tag size="small" type="info">共 {{ onlineData.length }} 条</el-tag>
            </div>
            <div class="section-right">
              <el-button size="small" type="primary" @click="handleBatchEval">
                <el-icon><VideoPlay /></el-icon>
                批量评估
              </el-button>
              <el-button size="small" @click="handleRefresh">刷新</el-button>
            </div>
          </div>

          <div class="table-wrapper">
            <el-table :data="onlineData" style="width: 100%" size="default">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="traceId" label="Trace ID" width="180">
                <template #default="{ row }">
                  <el-link type="primary">{{ row.traceId }}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="appName" label="应用名称" width="150" />
              <el-table-column prop="input" label="输入" min-width="200">
                <template #default="{ row }">
                  <el-tooltip :content="row.input" placement="top">
                    <span class="truncate-text">{{ row.input }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="output" label="输出" min-width="200">
                <template #default="{ row }">
                  <el-tooltip :content="row.output" placement="top">
                    <span class="truncate-text">{{ row.output }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="timestamp" label="采集时间" width="160" />
              <el-table-column prop="evaluator" label="评估器" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.evaluator" size="small">{{ row.evaluator }}</el-tag>
                  <span v-else class="empty-text">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="评分" width="80" align="center">
                <template #default="{ row }">
                  <span v-if="row.score" :class="getScoreClass(row.score)">{{ row.score }}</span>
                  <span v-else class="empty-text">-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEval(row)">评估</el-button>
                  <el-button type="primary" link size="small" @click="handleViewDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="onlineCurrentPage"
              v-model:page-size="onlinePageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="200"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </div>
      </template>

      <template v-if="activeMenu === 'offline'">
        <div class="page-header">
          <h1 class="page-title">离线评估</h1>
          <p class="page-desc">使用数据集和评估器进行离线批量评估</p>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">12</div>
              <div class="stat-label">数据集</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">8</div>
              <div class="stat-label">评估器</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">25</div>
              <div class="stat-label">评估任务</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-value">1,250</div>
              <div class="stat-label">评估记录</div>
            </el-card>
          </el-col>
        </el-row>

        <div class="tabs-section">
          <el-tabs v-model="offlineTab">
            <el-tab-pane label="评估任务" name="tasks">
              <div class="section-header">
                <div class="section-left">
                  <span class="section-title">评估任务列表</span>
                </div>
                <div class="section-right">
                  <el-button type="primary" size="small" @click="handleCreateTask">
                    <el-icon><Plus /></el-icon>
                    新建任务
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper">
                <el-table :data="evalTasks" style="width: 100%" size="default">
                  <el-table-column prop="name" label="任务名称" min-width="180" />
                  <el-table-column prop="dataset" label="数据集" width="150" />
                  <el-table-column prop="evaluator" label="评估器" width="150" />
                  <el-table-column prop="totalCount" label="总数据量" width="100" align="right" />
                  <el-table-column prop="completedCount" label="已完成" width="100" align="right" />
                  <el-table-column prop="progress" label="进度" width="150">
                    <template #default="{ row }">
                      <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : ''" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getTaskStatusType(row.status)" size="small">{{ row.status }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" width="160" />
                  <el-table-column label="操作" width="150" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleViewTask(row)">查看</el-button>
                      <el-button type="primary" link size="small" @click="handleRunTask(row)">运行</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="数据集" name="datasets">
              <div class="section-header">
                <div class="section-left">
                  <span class="section-title">数据集管理</span>
                </div>
                <div class="section-right">
                  <el-button type="primary" size="small" @click="handleCreateDataset">
                    <el-icon><Plus /></el-icon>
                    新建数据集
                  </el-button>
                  <el-button size="small" @click="handleImportDataset">
                    <el-icon><Upload /></el-icon>
                    导入
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper">
                <el-table :data="datasets" style="width: 100%" size="default">
                  <el-table-column prop="name" label="数据集名称" min-width="180" />
                  <el-table-column prop="type" label="类型" width="120">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.type }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="count" label="数据量" width="100" align="right" />
                  <el-table-column prop="description" label="描述" min-width="200">
                    <template #default="{ row }">
                      <span class="truncate-text">{{ row.description }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" width="160" />
                  <el-table-column label="操作" width="200" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleViewDataset(row)">查看</el-button>
                      <el-button type="primary" link size="small" @click="handleEditDataset(row)">编辑</el-button>
                      <el-button type="danger" link size="small" @click="handleDeleteDataset(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="评估器" name="evaluators">
              <div class="section-header">
                <div class="section-left">
                  <span class="section-title">评估器管理</span>
                </div>
                <div class="section-right">
                  <el-button type="primary" size="small" @click="handleCreateEvaluator">
                    <el-icon><Plus /></el-icon>
                    新建评估器
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper">
                <el-table :data="evaluators" style="width: 100%" size="default">
                  <el-table-column prop="name" label="评估器名称" min-width="180" />
                  <el-table-column prop="type" label="类型" width="120">
                    <template #default="{ row }">
                      <el-tag :type="row.type === 'LLM' ? 'primary' : 'success'" size="small">{{ row.type }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="model" label="模型" width="150" />
                  <el-table-column prop="metrics" label="评估指标" min-width="200">
                    <template #default="{ row }">
                      <el-tag v-for="m in row.metrics" :key="m" size="small" style="margin-right: 4px;">{{ m }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" width="160" />
                  <el-table-column label="操作" width="150" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleEditEvaluator(row)">编辑</el-button>
                      <el-button type="primary" link size="small" @click="handleTestEvaluator(row)">测试</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>

      <template v-if="activeMenu === 'annotation'">
        <div class="page-header">
          <h1 class="page-title">人工标注</h1>
          <p class="page-desc">对采集的数据进行人工标注，用于评估和模型优化</p>
        </div>

        <div class="annotation-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-icon" style="background: #409eff;">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">2,450</div>
                  <div class="stat-label">待标注</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-icon" style="background: #e6a23c;">
                  <el-icon><Edit /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">380</div>
                  <div class="stat-label">标注中</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-icon" style="background: #67c23a;">
                  <el-icon><CircleCheckFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">1,890</div>
                  <div class="stat-label">已完成</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-icon" style="background: #909399;">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">15</div>
                  <div class="stat-label">标注人员</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="tabs-section">
          <el-tabs v-model="annotationTab">
            <el-tab-pane label="标注任务" name="tasks">
              <div class="section-header">
                <div class="section-left">
                  <span class="section-title">标注任务</span>
                </div>
                <div class="section-right">
                  <el-button type="primary" size="small" @click="handleCreateAnnotationTask">
                    <el-icon><Plus /></el-icon>
                    创建任务
                  </el-button>
                </div>
              </div>
              <div class="table-wrapper">
                <el-table :data="annotationTasks" style="width: 100%" size="default">
                  <el-table-column prop="name" label="任务名称" min-width="180" />
                  <el-table-column prop="type" label="标注类型" width="120">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.type }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="totalCount" label="总数" width="80" align="right" />
                  <el-table-column prop="completedCount" label="已完成" width="80" align="right" />
                  <el-table-column prop="progress" label="进度" width="150">
                    <template #default="{ row }">
                      <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : ''" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="assignee" label="负责人" width="100" />
                  <el-table-column prop="deadline" label="截止时间" width="120" />
                  <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag :type="getAnnotationStatusType(row.status)" size="small">{{ row.status }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleAnnotate(row)">标注</el-button>
                      <el-button type="primary" link size="small" @click="handleViewAnnotation(row)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="标注数据" name="data">
              <div class="annotation-workspace">
                <div class="workspace-header">
                  <el-steps :active="1" simple>
                    <el-step title="选择数据" />
                    <el-step title="进行标注" />
                    <el-step title="提交审核" />
                  </el-steps>
                </div>
                <div class="workspace-content">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-card shadow="never" class="data-card">
                        <template #header>
                          <span>待标注数据</span>
                          <el-tag size="small" style="float: right;">1/100</el-tag>
                        </template>
                        <div class="data-item">
                          <div class="data-label">输入：</div>
                          <div class="data-value">请介绍一下人工智能的发展历史</div>
                        </div>
                        <div class="data-item">
                          <div class="data-label">模型输出：</div>
                          <div class="data-value">人工智能的发展可以追溯到20世纪50年代，当时图灵提出了著名的"图灵测试"...</div>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="12">
                      <el-card shadow="never" class="annotation-card">
                        <template #header>
                          <span>标注区域</span>
                        </template>
                        <el-form label-position="top">
                          <el-form-item label="回复质量评分">
                            <el-rate v-model="annotationForm.rating" :texts="['极差', '较差', '一般', '良好', '优秀']" show-text />
                          </el-form-item>
                          <el-form-item label="回复准确性">
                            <el-radio-group v-model="annotationForm.accuracy">
                              <el-radio value="accurate">准确</el-radio>
                              <el-radio value="partial">部分准确</el-radio>
                              <el-radio value="inaccurate">不准确</el-radio>
                            </el-radio-group>
                          </el-form-item>
                          <el-form-item label="问题分类">
                            <el-select v-model="annotationForm.category" placeholder="选择分类" style="width: 100%;">
                              <el-option label="知识问答" value="qa" />
                              <el-option label="对话交互" value="chat" />
                              <el-option label="任务执行" value="task" />
                              <el-option label="创意生成" value="creative" />
                            </el-select>
                          </el-form-item>
                          <el-form-item label="标注说明">
                            <el-input v-model="annotationForm.comment" type="textarea" :rows="3" placeholder="请输入标注说明..." />
                          </el-form-item>
                        </el-form>
                        <div class="annotation-actions">
                          <el-button @click="handleSkipData">跳过</el-button>
                          <el-button type="primary" @click="handleSubmitAnnotation">提交标注</el-button>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="标注指南" name="guidelines">
              <el-card shadow="never">
                <template #header>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>标注指南</span>
                    <el-button type="primary" size="small">编辑指南</el-button>
                  </div>
                </template>
                <div class="guidelines-content">
                  <h3>回复质量评分标准</h3>
                  <ul>
                    <li><strong>优秀 (5分)</strong>：回复完全准确、内容丰富、逻辑清晰、有帮助</li>
                    <li><strong>良好 (4分)</strong>：回复准确、内容较完整、基本有帮助</li>
                    <li><strong>一般 (3分)</strong>：回复基本准确、内容一般、部分有帮助</li>
                    <li><strong>较差 (2分)</strong>：回复存在错误或遗漏、帮助有限</li>
                    <li><strong>极差 (1分)</strong>：回复完全错误、毫无帮助</li>
                  </ul>
                  <h3>准确性判断标准</h3>
                  <ul>
                    <li><strong>准确</strong>：信息完全正确，无明显错误</li>
                    <li><strong>部分准确</strong>：大部分信息正确，存在少量错误或遗漏</li>
                    <li><strong>不准确</strong>：存在明显错误，信息不可靠</li>
                  </ul>
                </div>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  Connection, FolderOpened, EditPen, Search, VideoPlay, Plus, Upload,
  Document, Edit, CircleCheckFilled, User
} from '@element-plus/icons-vue'

const activeMenu = ref('online')
const offlineTab = ref('tasks')
const annotationTab = ref('tasks')

const onlineFilters = reactive({
  timeRange: [],
  status: '',
  evalType: ''
})

const onlineCurrentPage = ref(1)
const onlinePageSize = ref(20)

const annotationForm = reactive({
  rating: 0,
  accuracy: '',
  category: '',
  comment: ''
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
}

const handleOnlineSearch = () => {
  console.log('Search online:', onlineFilters)
}

const handleOnlineReset = () => {
  Object.assign(onlineFilters, { timeRange: [], status: '', evalType: '' })
}

const handleRefresh = () => {
  console.log('Refresh')
}

const handleBatchEval = () => {
  console.log('Batch evaluate')
}

const handleEval = (row) => {
  console.log('Evaluate:', row)
}

const handleViewDetail = (row) => {
  console.log('View detail:', row)
}

const getStatusType = (status) => {
  const types = { pending: 'info', evaluating: 'warning', completed: 'success', failed: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { pending: '待评估', evaluating: '评估中', completed: '已完成', failed: '失败' }
  return texts[status] || status
}

const getScoreClass = (score) => {
  if (score >= 4) return 'score-high'
  if (score >= 3) return 'score-medium'
  return 'score-low'
}

const handleCreateTask = () => console.log('Create task')
const handleViewTask = (row) => console.log('View task:', row)
const handleRunTask = (row) => console.log('Run task:', row)

const getTaskStatusType = (status) => {
  const types = { 待运行: 'info', 运行中: 'warning', 已完成: 'success', 失败: 'danger' }
  return types[status] || 'info'
}

const handleCreateDataset = () => console.log('Create dataset')
const handleImportDataset = () => console.log('Import dataset')
const handleViewDataset = (row) => console.log('View dataset:', row)
const handleEditDataset = (row) => console.log('Edit dataset:', row)
const handleDeleteDataset = (row) => console.log('Delete dataset:', row)

const handleCreateEvaluator = () => console.log('Create evaluator')
const handleEditEvaluator = (row) => console.log('Edit evaluator:', row)
const handleTestEvaluator = (row) => console.log('Test evaluator:', row)

const handleCreateAnnotationTask = () => console.log('Create annotation task')
const handleAnnotate = (row) => console.log('Annotate:', row)
const handleViewAnnotation = (row) => console.log('View annotation:', row)

const getAnnotationStatusType = (status) => {
  const types = { 进行中: 'warning', 已完成: 'success', 已暂停: 'info' }
  return types[status] || 'info'
}

const handleSkipData = () => console.log('Skip data')
const handleSubmitAnnotation = () => console.log('Submit annotation:', annotationForm)

const onlineData = ref([
  { traceId: 'trace_abc123', appName: '智能客服', input: '请问最近的优惠活动有哪些？', output: '当前我们有以下优惠活动：1. 新用户立减50元...', timestamp: '2026-03-26 10:24:38', evaluator: 'QA评估器', status: 'pending', score: null },
  { traceId: 'trace_def456', appName: '内容生成', input: '帮我写一篇关于AI的文章', output: '人工智能（AI）是计算机科学的一个分支...', timestamp: '2026-03-26 09:15:22', evaluator: '质量评估器', status: 'completed', score: 4.5 },
  { traceId: 'trace_ghi789', appName: '数据分析', input: '分析上个月的销售数据', output: '上月销售额总计125万元...', timestamp: '2026-03-26 08:45:10', evaluator: null, status: 'pending', score: null },
  { traceId: 'trace_jkl012', appName: '代码生成', input: '写一个Python排序函数', output: 'def sort_list(lst): return sorted(lst)', timestamp: '2026-03-26 07:30:45', evaluator: '代码评估器', status: 'evaluating', score: null },
  { traceId: 'trace_mno345', appName: '文档问答', input: '这份PDF的主要内容是什么？', output: '这份PDF主要讲述了机器学习的基础...', timestamp: '2026-03-26 06:22:18', evaluator: 'QA评估器', status: 'completed', score: 3.8 }
])

const evalTasks = ref([
  { name: '客服数据质量评估', dataset: '客服对话集_v2', evaluator: 'QA评估器', totalCount: 500, completedCount: 350, progress: 70, status: '运行中', createTime: '2026-03-26 10:00' },
  { name: '代码生成准确性评估', dataset: '代码生成样本', evaluator: '代码评估器', totalCount: 200, completedCount: 200, progress: 100, status: '已完成', createTime: '2026-03-25 14:30' },
  { name: '多轮对话连贯性评估', dataset: '对话数据集', evaluator: '对话评估器', totalCount: 300, completedCount: 0, progress: 0, status: '待运行', createTime: '2026-03-25 09:00' }
])

const datasets = ref([
  { name: '客服对话集_v2', type: '对话数据', count: 2500, description: '智能客服场景的对话数据，包含用户提问和系统回答', createTime: '2026-03-20' },
  { name: '代码生成样本', type: '代码数据', count: 500, description: '代码生成任务的输入输出样本', createTime: '2026-03-18' },
  { name: '文档问答数据', type: '问答数据', count: 1200, description: '基于文档的问答对数据', createTime: '2026-03-15' }
])

const evaluators = ref([
  { name: 'QA评估器', type: 'LLM', model: 'gpt-4', metrics: ['准确性', '相关性', '流畅度'], createTime: '2026-03-10' },
  { name: '代码评估器', type: 'LLM', model: 'gpt-4', metrics: ['正确性', '可读性', '效率'], createTime: '2026-03-08' },
  { name: '对话评估器', type: 'LLM', model: 'claude-3', metrics: ['连贯性', '相关性', '用户体验'], createTime: '2026-03-05' },
  { name: '规则评估器', type: '规则', model: '-', metrics: ['格式检查', '长度检查', '关键词检查'], createTime: '2026-03-01' }
])

const annotationTasks = ref([
  { name: '客服回复质量标注', type: '质量评估', totalCount: 500, completedCount: 320, progress: 64, assignee: '张三', deadline: '2026-03-30', status: '进行中' },
  { name: '对话意图分类', type: '意图分类', totalCount: 300, completedCount: 300, progress: 100, assignee: '李四', deadline: '2026-03-25', status: '已完成' },
  { name: '敏感内容审核', type: '内容审核', totalCount: 200, completedCount: 80, progress: 40, assignee: '王五', deadline: '2026-04-01', status: '进行中' }
])
</script>

<style scoped>
.evaluation-page {
  height: 100%;
  display: flex;
  background-color: #f5f7fa;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
}

.main-content {
  flex: 1;
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
  margin: 0;
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

.content-section,
.tabs-section {
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

.score-high {
  color: #67c23a;
  font-weight: 600;
}

.score-medium {
  color: #e6a23c;
  font-weight: 600;
}

.score-low {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrapper {
  padding: 16px 0;
  display: flex;
  justify-content: flex-end;
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

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  margin-bottom: 12px;
}

.stat-info {
  text-align: left;
}

.annotation-stats {
  margin-bottom: 20px;
}

.annotation-workspace {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.workspace-header {
  margin-bottom: 20px;
}

.data-card,
.annotation-card {
  height: 100%;
}

.data-item {
  margin-bottom: 16px;
}

.data-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.data-value {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.annotation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.guidelines-content {
  line-height: 1.8;
}

.guidelines-content h3 {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin: 16px 0 8px 0;
}

.guidelines-content h3:first-child {
  margin-top: 0;
}

.guidelines-content ul {
  padding-left: 20px;
  margin: 0;
}

.guidelines-content li {
  margin-bottom: 8px;
  color: #606266;
}
</style>