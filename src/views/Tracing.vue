<template>
  <div class="tracing-page">
    <div class="page-header">
      <div class="header-row">
        <h1 class="page-title">追踪</h1>
        <p class="page-desc">追踪 AI 应用调用的完整生命周期</p>
      </div>
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
      <div class="header-tabs">
        <div class="tab" :class="{ active: activeTab === 'traces' }" @click="activeTab = 'traces'">
          追踪
          <span class="tab-count">15</span>
        </div>
        <div class="tab" :class="{ active: activeTab === 'observations' }" @click="activeTab = 'observations'">
          观测
          <span class="tab-count">87</span>
        </div>
      </div>
    </div>

    <template v-if="activeTab === 'traces'">
      <div class="search-section">
        <el-card shadow="never">
          <el-form :inline="true" class="search-form">
            <el-form-item label="调用时间">
              <el-date-picker
                v-model="traceFilters.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="default"
                style="width: 360px;"
              />
            </el-form-item>
            <el-form-item label="耗时">
              <el-select v-model="traceFilters.latencyOp" placeholder="条件" size="default" style="width: 100px;">
                <el-option label=">" value="gt" />
                <el-option label="<" value="lt" />
                <el-option label="=" value="eq" />
                <el-option label="区间" value="range" />
              </el-select>
              <el-input v-model="traceFilters.latencyValue" placeholder="毫秒" size="default" style="width: 120px; margin-left: 8px;" />
              <el-input v-if="traceFilters.latencyOp === 'range'" v-model="traceFilters.latencyValue2" placeholder="至" size="default" style="width: 120px; margin-left: 8px;" />
            </el-form-item>
            <el-form-item label="Trace ID">
              <el-input v-model="traceFilters.traceId" placeholder="输入 Trace ID" size="default" style="width: 200px;" clearable />
            </el-form-item>
            <el-form-item label="内容关键字">
              <el-input v-model="traceFilters.keyword" placeholder="搜索关键字" size="default" style="width: 200px;" clearable>
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="search-form" style="margin-top: 12px;">
            <el-form-item label="字段名">
              <el-select v-model="traceFilters.fieldName" placeholder="选择字段" size="default" style="width: 150px;" clearable>
                <el-option label="input" value="input" />
                <el-option label="output" value="output" />
                <el-option label="metadata" value="metadata" />
                <el-option label="model" value="model" />
                <el-option label="user_id" value="user_id" />
                <el-option label="session_id" value="session_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="字段值">
              <el-input v-model="traceFilters.fieldValue" placeholder="输入字段值" size="default" style="width: 200px;" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="traceFilters.status" placeholder="选择状态" size="default" style="width: 120px;" clearable>
                <el-option label="成功" value="success" />
                <el-option label="失败" value="error" />
                <el-option label="超时" value="timeout" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTraceSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleTraceReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="traces-section">
        <div class="section-header">
          <div class="section-left">
            <span class="section-title">Trace 列表</span>
            <el-tag size="small" type="info">共 {{ traces.length }} 条</el-tag>
          </div>
          <div class="section-right">
            <el-button size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
            <el-dropdown size="small">
              <el-button size="small">
                导出 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>导出 CSV</el-dropdown-item>
                  <el-dropdown-item>导出 JSON</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="trace-table-wrapper">
          <el-table 
            :data="traces" 
            style="width: 100%" 
            size="default" 
            class="trace-table" 
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          >
            <el-table-column prop="name" label="名称" min-width="200">
              <template #default="{ row }">
                <div v-if="row.isObservation" class="obs-row">
                  <el-tag :type="getObsTagType(row.type)" size="small" effect="plain">
                    {{ getObsTypeName(row.type) }}
                  </el-tag>
                  <span class="obs-name">{{ row.name }}</span>
                </div>
                <div v-else class="trace-name-cell">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small" effect="plain">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                  <span class="trace-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="180">
              <template #default="{ row }">
                <span class="id-text" :class="{ 'obs-id': row.isObservation }">{{ row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="时间" width="160">
              <template #default="{ row }">
                <span class="time-text">{{ row.startTime }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="input" label="Input" min-width="180">
              <template #default="{ row }">
                <div v-if="row.input" class="io-cell">
                  <el-tooltip :content="row.input" placement="top" :show-after="500">
                    <span class="io-text">{{ truncateText(row.input, 40) }}</span>
                  </el-tooltip>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="output" label="Output" min-width="180">
              <template #default="{ row }">
                <div v-if="row.output" class="io-cell">
                  <el-tooltip :content="row.output" placement="top" :show-after="500">
                    <span class="io-text">{{ truncateText(row.output, 40) }}</span>
                  </el-tooltip>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="model" label="模型" width="130">
              <template #default="{ row }">
                <span v-if="row.model" class="model-text">{{ row.model }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="tokens" label="Tokens" width="90" align="right">
              <template #default="{ row }">
                <span v-if="row.tokens" class="tokens-text">{{ row.tokens }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="latency" label="耗时" width="90" align="right">
              <template #default="{ row }">
                <span v-if="row.latency" class="latency-text" :class="getLatencyClass(row.latencyMs)">{{ row.latency }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="70" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.status === 'success'" class="status-icon success"><CircleCheckFilled /></el-icon>
                <el-icon v-else-if="row.status === 'error'" class="status-icon error"><CircleCloseFilled /></el-icon>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="traceCurrentPage"
            v-model:page-size="tracePageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="150"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'observations'">
      <div class="search-section">
        <el-card shadow="never">
          <el-form :inline="true" class="search-form">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="obsFilters.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="default"
                style="width: 360px;"
              />
            </el-form-item>
            <el-form-item label="观测 ID">
              <el-input v-model="obsFilters.obsId" placeholder="输入观测 ID" size="default" style="width: 200px;" clearable />
            </el-form-item>
            <el-form-item label="Trace ID">
              <el-input v-model="obsFilters.traceId" placeholder="所属 Trace ID" size="default" style="width: 200px;" clearable />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="obsFilters.types" placeholder="选择类型" size="default" style="width: 180px;" multiple clearable collapse-tags>
                <el-option label="LLM 请求" value="llm_request" />
                <el-option label="LLM 响应" value="llm_response" />
                <el-option label="工具调用" value="tool_call" />
                <el-option label="Skill 选取" value="skill_select" />
                <el-option label="Skill 执行" value="skill_execute" />
                <el-option label="RAG 检索" value="rag_retrieve" />
                <el-option label="Reranker" value="reranker" />
              </el-select>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="search-form" style="margin-top: 12px;">
            <el-form-item label="耗时">
              <el-select v-model="obsFilters.latencyOp" placeholder="条件" size="default" style="width: 100px;">
                <el-option label=">" value="gt" />
                <el-option label="<" value="lt" />
                <el-option label="=" value="eq" />
                <el-option label="区间" value="range" />
              </el-select>
              <el-input v-model="obsFilters.latencyValue" placeholder="毫秒" size="default" style="width: 120px; margin-left: 8px;" />
              <el-input v-if="obsFilters.latencyOp === 'range'" v-model="obsFilters.latencyValue2" placeholder="至" size="default" style="width: 120px; margin-left: 8px;" />
            </el-form-item>
            <el-form-item label="模型">
              <el-select v-model="obsFilters.model" placeholder="选择模型" size="default" style="width: 160px;" clearable>
                <el-option label="GPT-4" value="gpt-4" />
                <el-option label="GPT-3.5-turbo" value="gpt-3.5-turbo" />
                <el-option label="Claude-3-opus" value="claude-3-opus" />
                <el-option label="Claude-3-sonnet" value="claude-3-sonnet" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="obsFilters.status" placeholder="选择状态" size="default" style="width: 120px;" clearable>
                <el-option label="成功" value="success" />
                <el-option label="失败" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item label="内容关键字">
              <el-input v-model="obsFilters.keyword" placeholder="搜索内容" size="default" style="width: 200px;" clearable>
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleObsSearch">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="handleObsReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="observations-section">
        <div class="section-header">
          <div class="section-left">
            <span class="section-title">观测列表</span>
            <el-tag size="small" type="info">共 {{ observations.length }} 条</el-tag>
          </div>
          <div class="section-right">
            <el-button size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
            <el-dropdown size="small">
              <el-button size="small">
                导出 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>导出 CSV</el-dropdown-item>
                  <el-dropdown-item>导出 JSON</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="obs-table-wrapper">
          <el-table :data="observations" style="width: 100%" size="default" class="obs-table" row-key="id">
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="obs-expand-content">
                  <div class="expand-section">
                    <div class="expand-label">所属 Trace</div>
                    <div class="expand-value">
                      <el-link type="primary" @click="goToTrace(row.traceId)">{{ row.traceId }}</el-link>
                      <span class="trace-name-inline"> - {{ row.traceName }}</span>
                    </div>
                  </div>
                  <div v-if="row.input" class="expand-section">
                    <div class="expand-label">Input</div>
                    <div class="expand-value code-block">{{ row.input }}</div>
                  </div>
                  <div v-if="row.output" class="expand-section">
                    <div class="expand-label">Output</div>
                    <div class="expand-value code-block">{{ row.output }}</div>
                  </div>
                  <div v-if="row.metadata" class="expand-section">
                    <div class="expand-label">Metadata</div>
                    <div class="expand-value">
                      <el-tag v-for="(value, key) in row.metadata" :key="key" size="small" style="margin-right: 8px; margin-bottom: 4px;">
                        {{ key }}: {{ value }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="时间" width="160" sortable>
              <template #default="{ row }">
                <span class="time-text">{{ row.startTime }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="观测 ID" width="180">
              <template #default="{ row }">
                <span class="obs-id-text">{{ row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getObsTagType(row.type)" size="small" effect="plain">
                  {{ getObsTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="120">
              <template #default="{ row }">
                <span class="obs-name-text">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="input" label="Input" min-width="200">
              <template #default="{ row }">
                <div v-if="row.input" class="io-preview">
                  <el-tooltip :content="row.input" placement="top" :show-after="500">
                    <span class="io-text">{{ truncateText(row.input, 50) }}</span>
                  </el-tooltip>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="output" label="Output" min-width="200">
              <template #default="{ row }">
                <div v-if="row.output" class="io-preview">
                  <el-tooltip :content="row.output" placement="top" :show-after="500">
                    <span class="io-text">{{ truncateText(row.output, 50) }}</span>
                  </el-tooltip>
                </div>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="model" label="模型" width="130">
              <template #default="{ row }">
                <span v-if="row.model" class="model-text">{{ row.model }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="tokens" label="Tokens" width="100" align="right">
              <template #default="{ row }">
                <span v-if="row.tokens" class="tokens-text">{{ row.tokens }}</span>
                <span v-else class="empty-text">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="latency" label="耗时" width="100" align="right" sortable>
              <template #default="{ row }">
                <span class="latency-text" :class="getLatencyClass(row.latencyMs)">{{ row.latency }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.status === 'success'" class="status-icon success"><CircleCheckFilled /></el-icon>
                <el-icon v-else class="status-icon error"><CircleCloseFilled /></el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="obsCurrentPage"
            v-model:page-size="obsPageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="100"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Search, Refresh, ArrowDown, CircleCheckFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const activeTab = ref('traces')
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
const obsCurrentPage = ref(1)
const obsPageSize = ref(20)
const traceCurrentPage = ref(1)
const tracePageSize = ref(20)

const handleRouteParams = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  if (route.query.traceId) {
    traceFilters.traceId = route.query.traceId
  }
}

onMounted(() => {
  handleRouteParams()
})

watch(() => route.query, () => {
  handleRouteParams()
}, { deep: true })

const traceFilters = reactive({
  timeRange: [],
  latencyOp: 'gt',
  latencyValue: '',
  latencyValue2: '',
  traceId: '',
  keyword: '',
  fieldName: '',
  fieldValue: '',
  status: ''
})

const obsFilters = reactive({
  timeRange: [],
  obsId: '',
  traceId: '',
  types: [],
  latencyOp: 'gt',
  latencyValue: '',
  latencyValue2: '',
  model: '',
  status: '',
  keyword: ''
})

const handleTraceSearch = () => {
  console.log('Search traces:', traceFilters)
}

const handleTraceReset = () => {
  Object.assign(traceFilters, {
    timeRange: [],
    latencyOp: 'gt',
    latencyValue: '',
    latencyValue2: '',
    traceId: '',
    keyword: '',
    fieldName: '',
    fieldValue: '',
    status: ''
  })
}

const handleObsSearch = () => {
  console.log('Search observations:', obsFilters)
}

const handleObsReset = () => {
  Object.assign(obsFilters, {
    timeRange: [],
    obsId: '',
    traceId: '',
    types: [],
    latencyOp: 'gt',
    latencyValue: '',
    latencyValue2: '',
    model: '',
    status: '',
    keyword: ''
  })
}

const handleRefresh = () => {
  console.log('Refresh')
}

const goToTrace = (traceId) => {
  activeTab.value = 'traces'
  traceFilters.traceId = traceId
}

const getObsTagType = (type) => {
  const typeMap = {
    llm_request: 'primary',
    llm_response: 'success',
    tool_call: 'warning',
    skill_select: 'info',
    skill_execute: 'info',
    rag_retrieve: '',
    reranker: ''
  }
  return typeMap[type] || ''
}

const getObsTypeName = (type) => {
  const nameMap = {
    llm_request: 'LLM 请求',
    llm_response: 'LLM 响应',
    tool_call: '工具调用',
    skill_select: 'Skill 选取',
    skill_execute: 'Skill 执行',
    rag_retrieve: 'RAG 检索',
    reranker: 'Reranker'
  }
  return nameMap[type] || type
}

const getLatencyClass = (latencyMs) => {
  if (!latencyMs) return ''
  if (latencyMs > 2000) return 'slow'
  if (latencyMs > 1000) return 'medium'
  return 'fast'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const traces = ref([
  {
    id: 'trace_abc123',
    name: '智能客服对话',
    status: 'success',
    startTime: '2026-03-26 10:24:38',
    input: '用户问：最近有什么优惠活动吗？',
    output: '当前我们有以下优惠活动：1. 新用户首单立减50元...',
    totalLatency: '1.2s',
    latencyMs: 1200,
    totalTokens: 2450,
    children: [
      { id: 'obs_001', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '10:24:38.100', latency: '15ms', latencyMs: 15, input: '用户问题', output: 'customer_service_skill' },
      { id: 'obs_002', isObservation: true, type: 'rag_retrieve', name: '知识库检索', status: 'success', startTime: '10:24:38.115', latency: '156ms', latencyMs: 156, input: '优惠活动', output: '检索到5个相关文档', children: [
        { id: 'obs_003', isObservation: true, type: 'reranker', name: '文档重排序', status: 'success', startTime: '10:24:38.271', latency: '45ms', latencyMs: 45, input: '5个候选文档', output: 'Top3: 促销活动文档(0.95)' }
      ]},
      { id: 'obs_004', isObservation: true, type: 'llm_request', name: 'GPT-4 请求', status: 'success', startTime: '10:24:38.316', latency: '856ms', latencyMs: 856, tokens: 2100, model: 'gpt-4', input: '你是一个客服助手...', output: '正在生成回答...', children: [
        { id: 'obs_005', isObservation: true, type: 'llm_response', name: 'GPT-4 响应', status: 'success', startTime: '10:24:39.172', latency: '-', latencyMs: 0, tokens: 350, model: 'gpt-4', input: '流式接收中...', output: '当前我们有以下优惠活动...' }
      ]},
      { id: 'obs_006', isObservation: true, type: 'tool_call', name: '获取用户信息', status: 'success', startTime: '10:24:39.180', latency: '89ms', latencyMs: 89, input: '{"user_id": "u_12345"}', output: '{"name": "张三"}' },
      { id: 'obs_007', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '10:24:39.270', latency: '12ms', latencyMs: 12 }
    ]
  },
  {
    id: 'trace_def456',
    name: '内容生成任务',
    status: 'success',
    startTime: '2026-03-26 09:15:22',
    input: '请帮我写一篇关于人工智能发展的文章',
    output: '人工智能的发展历程可以追溯到20世纪50年代...',
    totalLatency: '2.8s',
    latencyMs: 2800,
    totalTokens: 3890,
    children: [
      { id: 'obs_101', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '09:15:22.100', latency: '12ms', latencyMs: 12, input: '任务：撰写文章', output: 'content_generation_skill' },
      { id: 'obs_102', isObservation: true, type: 'rag_retrieve', name: '相关资料检索', status: 'success', startTime: '09:15:22.112', latency: '234ms', latencyMs: 234, input: '人工智能发展', output: '检索到8个相关文档' },
      { id: 'obs_103', isObservation: true, type: 'llm_request', name: 'Claude-3 请求', status: 'success', startTime: '09:15:22.346', latency: '2.3s', latencyMs: 2300, tokens: 3200, model: 'claude-3-opus', input: '请撰写关于人工智能发展的文章...', output: '正在生成文章...', children: [
        { id: 'obs_104', isObservation: true, type: 'llm_response', name: 'Claude-3 响应', status: 'success', startTime: '09:15:24.646', latency: '-', latencyMs: 0, tokens: 690, model: 'claude-3-opus', input: '流式接收中...', output: '人工智能的发展历程...' }
      ]},
      { id: 'obs_105', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '09:15:24.680', latency: '8ms', latencyMs: 8 }
    ]
  },
  {
    id: 'trace_ghi789',
    name: '数据分析任务',
    status: 'error',
    startTime: '2026-03-26 08:45:10',
    input: '分析上周销售数据并生成报告',
    output: '错误：数据源连接超时',
    totalLatency: '5.2s',
    latencyMs: 5200,
    totalTokens: 1200,
    children: [
      { id: 'obs_201', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '08:45:10.100', latency: '18ms', latencyMs: 18, input: '任务：数据分析', output: 'data_analysis_skill' },
      { id: 'obs_202', isObservation: true, type: 'tool_call', name: '连接数据源', status: 'error', startTime: '08:45:10.118', latency: '5.0s', latencyMs: 5000, input: '{"source": "sales_db"}', output: 'Error: Connection timeout' },
      { id: 'obs_203', isObservation: true, type: 'llm_request', name: '错误处理请求', status: 'success', startTime: '08:45:15.120', latency: '156ms', latencyMs: 156, tokens: 800, model: 'gpt-3.5-turbo', input: '数据源连接失败...', output: '正在生成错误提示...', children: [
        { id: 'obs_204', isObservation: true, type: 'llm_response', name: '错误处理响应', status: 'success', startTime: '08:45:15.276', latency: '-', latencyMs: 0, tokens: 400, model: 'gpt-3.5-turbo', input: '流式接收中...', output: '错误：数据源连接超时' }
      ]}
    ]
  },
  {
    id: 'trace_jkl012',
    name: '代码生成任务',
    status: 'success',
    startTime: '2026-03-26 07:30:45',
    input: '写一个Python函数，计算斐波那契数列',
    output: 'def fibonacci(n): ...',
    totalLatency: '1.8s',
    latencyMs: 1800,
    totalTokens: 1560,
    children: [
      { id: 'obs_301', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '07:30:45.100', latency: '10ms', latencyMs: 10, input: '任务：代码生成', output: 'code_generation_skill' },
      { id: 'obs_302', isObservation: true, type: 'llm_request', name: 'GPT-4 请求', status: 'success', startTime: '07:30:45.110', latency: '1.5s', latencyMs: 1500, tokens: 1200, model: 'gpt-4', input: '写一个Python函数...', output: '正在生成代码...', children: [
        { id: 'obs_303', isObservation: true, type: 'llm_response', name: 'GPT-4 响应', status: 'success', startTime: '07:30:46.610', latency: '-', latencyMs: 0, tokens: 360, model: 'gpt-4', input: '流式接收中...', output: 'def fibonacci(n): ...' }
      ]},
      { id: 'obs_304', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '07:30:46.780', latency: '15ms', latencyMs: 15 }
    ]
  },
  {
    id: 'trace_mno345',
    name: '文档问答',
    status: 'success',
    startTime: '2026-03-26 06:22:18',
    input: '这份PDF文档的主要内容是什么？',
    output: '这份PDF主要讲述了机器学习的基础知识...',
    totalLatency: '3.5s',
    latencyMs: 3500,
    totalTokens: 4200,
    children: [
      { id: 'obs_401', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '06:22:18.100', latency: '12ms', latencyMs: 12, input: '任务：文档问答', output: 'doc_qa_skill' },
      { id: 'obs_402', isObservation: true, type: 'tool_call', name: '解析PDF文档', status: 'success', startTime: '06:22:18.112', latency: '890ms', latencyMs: 890, input: 'document.pdf', output: '提取到125页内容' },
      { id: 'obs_403', isObservation: true, type: 'rag_retrieve', name: '文档内容检索', status: 'success', startTime: '06:22:19.002', latency: '456ms', latencyMs: 456, input: '主要内容', output: '检索到12个相关段落', children: [
        { id: 'obs_404', isObservation: true, type: 'reranker', name: '段落重排序', status: 'success', startTime: '06:22:19.458', latency: '78ms', latencyMs: 78, input: '12个候选段落', output: 'Top5段落' }
      ]},
      { id: 'obs_405', isObservation: true, type: 'llm_request', name: 'GPT-4 请求', status: 'success', startTime: '06:22:19.536', latency: '1.8s', latencyMs: 1800, tokens: 3500, model: 'gpt-4', input: '根据以下段落总结文档主要内容...', output: '正在生成总结...', children: [
        { id: 'obs_406', isObservation: true, type: 'llm_response', name: 'GPT-4 响应', status: 'success', startTime: '06:22:21.336', latency: '-', latencyMs: 0, tokens: 700, model: 'gpt-4', input: '流式接收中...', output: '这份PDF主要讲述了机器学习...' }
      ]},
      { id: 'obs_407', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '06:22:21.580', latency: '20ms', latencyMs: 20 }
    ]
  },
  {
    id: 'trace_pqr678',
    name: '多轮对话',
    status: 'success',
    startTime: '2026-03-26 05:15:33',
    input: '我想了解如何学习编程',
    output: '学习编程可以从以下几个步骤开始...',
    totalLatency: '980ms',
    latencyMs: 980,
    totalTokens: 890,
    children: [
      { id: 'obs_501', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '05:15:33.100', latency: '8ms', latencyMs: 8, input: '多轮对话', output: 'chat_skill' },
      { id: 'obs_502', isObservation: true, type: 'llm_request', name: 'GPT-3.5 请求', status: 'success', startTime: '05:15:33.108', latency: '856ms', latencyMs: 856, tokens: 600, model: 'gpt-3.5-turbo', input: '用户想了解如何学习编程...', output: '正在生成回复...', children: [
        { id: 'obs_503', isObservation: true, type: 'llm_response', name: 'GPT-3.5 响应', status: 'success', startTime: '05:15:33.964', latency: '-', latencyMs: 0, tokens: 290, model: 'gpt-3.5-turbo', input: '流式接收中...', output: '学习编程可以从以下几个步骤开始...' }
      ]},
      { id: 'obs_504', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '05:15:34.080', latency: '10ms', latencyMs: 10 }
    ]
  },
  {
    id: 'trace_stu901',
    name: '图片描述生成',
    status: 'success',
    startTime: '2026-03-26 04:08:55',
    input: '[图片URL] 请描述这张图片的内容',
    output: '这是一张展示山间日出的风景照片...',
    totalLatency: '2.1s',
    latencyMs: 2100,
    totalTokens: 1850,
    children: [
      { id: 'obs_601', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '04:08:55.100', latency: '15ms', latencyMs: 15, input: '图片描述任务', output: 'image_description_skill' },
      { id: 'obs_602', isObservation: true, type: 'tool_call', name: '下载图片', status: 'success', startTime: '04:08:55.115', latency: '234ms', latencyMs: 234, input: '图片URL', output: '图片下载成功' },
      { id: 'obs_603', isObservation: true, type: 'llm_request', name: 'GPT-4V 请求', status: 'success', startTime: '04:08:55.349', latency: '1.6s', latencyMs: 1600, tokens: 1400, model: 'gpt-4-vision', input: '请描述这张图片...', output: '正在生成描述...', children: [
        { id: 'obs_604', isObservation: true, type: 'llm_response', name: 'GPT-4V 响应', status: 'success', startTime: '04:08:56.949', latency: '-', latencyMs: 0, tokens: 450, model: 'gpt-4-vision', input: '流式接收中...', output: '这是一张展示山间日出的风景照片...' }
      ]},
      { id: 'obs_605', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '04:08:57.180', latency: '12ms', latencyMs: 12 }
    ]
  },
  {
    id: 'trace_vwx234',
    name: '翻译任务',
    status: 'success',
    startTime: '2026-03-26 03:45:12',
    input: '将以下中文翻译成英文：人工智能正在改变世界',
    output: 'Artificial intelligence is changing the world',
    totalLatency: '650ms',
    latencyMs: 650,
    totalTokens: 320,
    children: [
      { id: 'obs_701', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '03:45:12.100', latency: '10ms', latencyMs: 10, input: '翻译任务', output: 'translation_skill' },
      { id: 'obs_702', isObservation: true, type: 'llm_request', name: 'GPT-3.5 请求', status: 'success', startTime: '03:45:12.110', latency: '580ms', latencyMs: 580, tokens: 200, model: 'gpt-3.5-turbo', input: '将以下中文翻译成英文...', output: '正在翻译...', children: [
        { id: 'obs_703', isObservation: true, type: 'llm_response', name: 'GPT-3.5 响应', status: 'success', startTime: '03:45:12.690', latency: '-', latencyMs: 0, tokens: 120, model: 'gpt-3.5-turbo', input: '流式接收中...', output: 'Artificial intelligence is changing the world' }
      ]},
      { id: 'obs_704', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '03:45:12.750', latency: '8ms', latencyMs: 8 }
    ]
  },
  {
    id: 'trace_yza567',
    name: 'SQL生成任务',
    status: 'error',
    startTime: '2026-03-26 02:30:48',
    input: '查询上个月销售额最高的前10个产品',
    output: '错误：无法解析数据库结构',
    totalLatency: '3.2s',
    latencyMs: 3200,
    totalTokens: 1500,
    children: [
      { id: 'obs_801', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '02:30:48.100', latency: '12ms', latencyMs: 12, input: 'SQL生成任务', output: 'sql_generation_skill' },
      { id: 'obs_802', isObservation: true, type: 'tool_call', name: '获取数据库Schema', status: 'error', startTime: '02:30:48.112', latency: '3.0s', latencyMs: 3000, input: 'database_id: sales_db', output: 'Error: Schema not found' },
      { id: 'obs_803', isObservation: true, type: 'llm_request', name: '错误处理请求', status: 'success', startTime: '02:30:51.120', latency: '145ms', latencyMs: 145, tokens: 1000, model: 'gpt-3.5-turbo', input: '无法获取数据库结构...', output: '正在生成错误提示...', children: [
        { id: 'obs_804', isObservation: true, type: 'llm_response', name: '错误处理响应', status: 'success', startTime: '02:30:51.265', latency: '-', latencyMs: 0, tokens: 500, model: 'gpt-3.5-turbo', input: '流式接收中...', output: '错误：无法解析数据库结构' }
      ]}
    ]
  },
  {
    id: 'trace_bcd890',
    name: '情感分析',
    status: 'success',
    startTime: '2026-03-26 01:18:25',
    input: '分析这段评论的情感倾向：产品很好用，但是价格有点贵',
    output: '情感分析结果：正面情感（置信度：0.72）',
    totalLatency: '420ms',
    latencyMs: 420,
    totalTokens: 180,
    children: [
      { id: 'obs_901', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '01:18:25.100', latency: '8ms', latencyMs: 8, input: '情感分析任务', output: 'sentiment_analysis_skill' },
      { id: 'obs_902', isObservation: true, type: 'llm_request', name: 'GPT-3.5 请求', status: 'success', startTime: '01:18:25.108', latency: '356ms', latencyMs: 356, tokens: 100, model: 'gpt-3.5-turbo', input: '分析情感倾向...', output: '正在分析...', children: [
        { id: 'obs_903', isObservation: true, type: 'llm_response', name: 'GPT-3.5 响应', status: 'success', startTime: '01:18:25.464', latency: '-', latencyMs: 0, tokens: 80, model: 'gpt-3.5-turbo', input: '流式接收中...', output: '情感分析结果：正面情感（置信度：0.72）' }
      ]},
      { id: 'obs_904', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '01:18:25.500', latency: '6ms', latencyMs: 6 }
    ]
  },
  {
    id: 'trace_efg123',
    name: '知识图谱查询',
    status: 'success',
    startTime: '2026-03-26 00:05:33',
    input: '马斯克和特斯拉是什么关系？',
    output: '马斯克是特斯拉的CEO和联合创始人...',
    totalLatency: '1.5s',
    latencyMs: 1500,
    totalTokens: 2100,
    children: [
      { id: 'obs_a01', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '00:05:33.100', latency: '10ms', latencyMs: 10, input: '知识查询任务', output: 'knowledge_graph_skill' },
      { id: 'obs_a02', isObservation: true, type: 'rag_retrieve', name: '知识图谱检索', status: 'success', startTime: '00:05:33.110', latency: '678ms', latencyMs: 678, input: '马斯克 特斯拉 关系', output: '检索到相关三元组15个' },
      { id: 'obs_a03', isObservation: true, type: 'llm_request', name: 'GPT-4 请求', status: 'success', startTime: '00:05:33.788', latency: '680ms', latencyMs: 680, tokens: 1700, model: 'gpt-4', input: '根据知识图谱回答...', output: '正在生成回答...', children: [
        { id: 'obs_a04', isObservation: true, type: 'llm_response', name: 'GPT-4 响应', status: 'success', startTime: '00:05:34.468', latency: '-', latencyMs: 0, tokens: 400, model: 'gpt-4', input: '流式接收中...', output: '马斯克是特斯拉的CEO和联合创始人...' }
      ]},
      { id: 'obs_a05', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '00:05:34.580', latency: '12ms', latencyMs: 12 }
    ]
  },
  {
    id: 'trace_hij456',
    name: '数据清洗任务',
    status: 'success',
    startTime: '2026-03-25 23:50:18',
    input: '清洗这个CSV文件中的重复数据',
    output: '已清洗完成，删除了234条重复记录',
    totalLatency: '4.2s',
    latencyMs: 4200,
    totalTokens: 560,
    children: [
      { id: 'obs_b01', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '23:50:18.100', latency: '15ms', latencyMs: 15, input: '数据清洗任务', output: 'data_cleaning_skill' },
      { id: 'obs_b02', isObservation: true, type: 'tool_call', name: '读取CSV文件', status: 'success', startTime: '23:50:18.115', latency: '1.2s', latencyMs: 1200, input: 'data.csv', output: '读取到5000条记录' },
      { id: 'obs_b03', isObservation: true, type: 'tool_call', name: '检测重复数据', status: 'success', startTime: '23:50:19.315', latency: '1.8s', latencyMs: 1800, input: '5000条记录', output: '检测到234条重复' },
      { id: 'obs_b04', isObservation: true, type: 'tool_call', name: '删除重复记录', status: 'success', startTime: '23:50:21.115', latency: '980ms', latencyMs: 980, input: '删除234条', output: '删除成功' },
      { id: 'obs_b05', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '23:50:22.095', latency: '18ms', latencyMs: 18 }
    ]
  },
  {
    id: 'trace_klm789',
    name: 'API调用测试',
    status: 'success',
    startTime: '2026-03-25 22:35:42',
    input: '测试这个REST API接口是否正常工作',
    output: 'API测试通过，响应时间: 156ms',
    totalLatency: '780ms',
    latencyMs: 780,
    totalTokens: 450,
    children: [
      { id: 'obs_c01', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '22:35:42.100', latency: '10ms', latencyMs: 10, input: 'API测试任务', output: 'api_test_skill' },
      { id: 'obs_c02', isObservation: true, type: 'tool_call', name: '发送HTTP请求', status: 'success', startTime: '22:35:42.110', latency: '456ms', latencyMs: 456, input: 'GET /api/health', output: '200 OK' },
      { id: 'obs_c03', isObservation: true, type: 'tool_call', name: '验证响应', status: 'success', startTime: '22:35:42.566', latency: '234ms', latencyMs: 234, input: '响应数据', output: '验证通过' },
      { id: 'obs_c04', isObservation: true, type: 'llm_request', name: 'GPT-3.5 请求', status: 'success', startTime: '22:35:42.800', latency: '56ms', latencyMs: 56, tokens: 300, model: 'gpt-3.5-turbo', input: '生成测试报告...', output: '正在生成...', children: [
        { id: 'obs_c05', isObservation: true, type: 'llm_response', name: 'GPT-3.5 响应', status: 'success', startTime: '22:35:42.856', latency: '-', latencyMs: 0, tokens: 150, model: 'gpt-3.5-turbo', input: '流式接收中...', output: 'API测试通过，响应时间: 156ms' }
      ]},
      { id: 'obs_c06', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '22:35:42.860', latency: '8ms', latencyMs: 8 }
    ]
  },
  {
    id: 'trace_nop012',
    name: '自动化报告生成',
    status: 'success',
    startTime: '2026-03-25 21:20:15',
    input: '生成本周销售周报',
    output: '周报已生成并发送至邮箱',
    totalLatency: '5.8s',
    latencyMs: 5800,
    totalTokens: 3200,
    children: [
      { id: 'obs_d01', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '21:20:15.100', latency: '12ms', latencyMs: 12, input: '报告生成任务', output: 'report_generation_skill' },
      { id: 'obs_d02', isObservation: true, type: 'tool_call', name: '查询销售数据', status: 'success', startTime: '21:20:15.112', latency: '1.5s', latencyMs: 1500, input: '上周销售数据', output: '获取到销售记录' },
      { id: 'obs_d03', isObservation: true, type: 'llm_request', name: 'GPT-4 请求', status: 'success', startTime: '21:20:16.612', latency: '2.8s', latencyMs: 2800, tokens: 2500, model: 'gpt-4', input: '根据数据生成周报...', output: '正在生成...', children: [
        { id: 'obs_d04', isObservation: true, type: 'llm_response', name: 'GPT-4 响应', status: 'success', startTime: '21:20:19.412', latency: '-', latencyMs: 0, tokens: 700, model: 'gpt-4', input: '流式接收中...', output: '周报内容...' }
      ]},
      { id: 'obs_d05', isObservation: true, type: 'tool_call', name: '发送邮件', status: 'success', startTime: '21:20:20.812', latency: '890ms', latencyMs: 890, input: '周报内容', output: '邮件发送成功' },
      { id: 'obs_d06', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '21:20:21.702', latency: '15ms', latencyMs: 15 }
    ]
  },
  {
    id: 'trace_qrs345',
    name: '语音识别任务',
    status: 'success',
    startTime: '2026-03-25 20:08:37',
    input: '[音频文件] 将这段语音转成文字',
    output: '这段语音的内容是：今天的天气真好...',
    totalLatency: '2.3s',
    latencyMs: 2300,
    totalTokens: 280,
    children: [
      { id: 'obs_e01', isObservation: true, type: 'skill_select', name: 'Skill 选择', status: 'success', startTime: '20:08:37.100', latency: '10ms', latencyMs: 10, input: '语音识别任务', output: 'speech_to_text_skill' },
      { id: 'obs_e02', isObservation: true, type: 'tool_call', name: '调用语音识别API', status: 'success', startTime: '20:08:37.110', latency: '2.1s', latencyMs: 2100, input: '音频文件', output: '识别文本' },
      { id: 'obs_e03', isObservation: true, type: 'llm_request', name: 'GPT-3.5 请求', status: 'success', startTime: '20:08:39.210', latency: '120ms', latencyMs: 120, tokens: 150, model: 'gpt-3.5-turbo', input: '格式化输出...', output: '正在格式化...', children: [
        { id: 'obs_e04', isObservation: true, type: 'llm_response', name: 'GPT-3.5 响应', status: 'success', startTime: '20:08:39.330', latency: '-', latencyMs: 0, tokens: 130, model: 'gpt-3.5-turbo', input: '流式接收中...', output: '这段语音的内容是：今天的天气真好...' }
      ]},
      { id: 'obs_e05', isObservation: true, type: 'skill_execute', name: 'Skill 执行完成', status: 'success', startTime: '20:08:39.380', latency: '8ms', latencyMs: 8 }
    ]
  }
])

const observations = ref([
  { id: 'obs_001', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'skill_select', name: 'Skill 选择', startTime: '2026-03-26 10:24:38', latency: '15ms', latencyMs: 15, status: 'success', input: '用户问题：最近有什么优惠活动吗？', output: 'selected_skill: customer_service_skill' },
  { id: 'obs_002', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'rag_retrieve', name: '知识库检索', startTime: '2026-03-26 10:24:38', latency: '156ms', latencyMs: 156, status: 'success', input: '优惠活动', output: '检索到5个相关文档' },
  { id: 'obs_003', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'reranker', name: '文档重排序', startTime: '2026-03-26 10:24:38', latency: '45ms', latencyMs: 45, status: 'success', input: '5个候选文档', output: 'Top3: 促销活动文档(0.95)' },
  { id: 'obs_004', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'llm_request', name: 'GPT-4 请求', startTime: '2026-03-26 10:24:38', latency: '856ms', latencyMs: 856, tokens: 2100, model: 'gpt-4', status: 'success', input: '你是一个客服助手，请根据检索到的信息回答用户问题...', output: '正在生成回答...' },
  { id: 'obs_005', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'llm_response', name: 'GPT-4 响应', startTime: '2026-03-26 10:24:39', latency: '-', latencyMs: 0, tokens: 350, model: 'gpt-4', status: 'success', input: '流式接收中...', output: '当前我们有以下优惠活动：1. 新用户首单立减50元...' },
  { id: 'obs_006', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'tool_call', name: '获取用户信息', startTime: '2026-03-26 10:24:39', latency: '89ms', latencyMs: 89, status: 'success', input: '{"user_id": "u_12345"}', output: '{"name": "张三", "level": "VIP"}' },
  { id: 'obs_007', traceId: 'trace_abc123', traceName: '智能客服对话', type: 'skill_execute', name: 'Skill 执行完成', startTime: '2026-03-26 10:24:39', latency: '12ms', latencyMs: 12, status: 'success' }
])
</script>

<style scoped>
.tracing-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.page-header {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.header-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
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

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 8px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.tab:hover {
  color: #409eff;
  background-color: #f5f7fa;
}

.tab.active {
  color: #409eff;
  background-color: #ecf5ff;
  font-weight: 500;
}

.tab-count {
  font-size: 12px;
  background-color: #e4e7ed;
  padding: 1px 6px;
  border-radius: 10px;
  color: #909399;
}

.tab.active .tab-count {
  background-color: #409eff;
  color: #fff;
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

.traces-section,
.observations-section {
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

.trace-table-wrapper,
.obs-table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.trace-table,
.obs-table {
  --el-table-border-color: #f0f0f0;
}

.trace-table :deep(.el-table__header th),
.obs-table :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 500;
  font-size: 13px;
  color: #606266;
}

.trace-table :deep(.el-table__row),
.obs-table :deep(.el-table__row) {
  font-size: 13px;
}

.trace-table :deep(.el-table__row--level-1),
.trace-table :deep(.el-table__row--level-2) {
  background-color: #fafafa;
}

.trace-table :deep(.el-table__row--level-1:hover),
.trace-table :deep(.el-table__row--level-2:hover) {
  background-color: #f5f7fa;
}

.obs-table :deep(.el-table__expanded-cell) {
  padding: 0;
}

.trace-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trace-name {
  font-weight: 500;
  color: #303133;
}

.obs-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
}

.obs-name {
  color: #606266;
}

.id-text {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.obs-id {
  color: #c0c4cc;
  font-size: 11px;
}

.time-text {
  font-family: monospace;
  font-size: 12px;
  color: #606266;
}

.io-cell {
  max-width: 100%;
}

.io-text {
  font-size: 12px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  cursor: pointer;
}

.io-text:hover {
  color: #409eff;
}

.model-text {
  color: #606266;
  font-size: 12px;
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

.obs-expand-content {
  padding: 16px 20px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.expand-section {
  margin-bottom: 12px;
}

.expand-section:last-child {
  margin-bottom: 0;
}

.expand-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.expand-value {
  font-size: 13px;
  color: #606266;
}

.trace-name-inline {
  color: #909399;
}

.code-block {
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.obs-id-text {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.obs-name-text {
  color: #303133;
}

.io-preview {
  max-width: 100%;
  overflow: hidden;
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