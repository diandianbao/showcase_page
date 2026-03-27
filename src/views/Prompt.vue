<template>
  <div class="prompt-page">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">服务列表</h2>
        <el-button type="primary" link size="small" @click="handleAddService">
          <el-icon><Plus /></el-icon>
          新增服务
        </el-button>
      </div>
      <el-menu
        :default-active="activeService"
        class="sidebar-menu"
        @select="handleServiceSelect"
      >
        <el-menu-item v-for="service in services" :key="service.id" :index="service.id">
          <el-icon><Box /></el-icon>
          <span>{{ service.name }}</span>
          <el-tag size="small" type="info" style="margin-left: auto;">{{ service.promptCount }}</el-tag>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="main-content">
      <template v-if="currentService">
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">{{ currentService.name }}</h1>
            <p class="page-desc">{{ currentService.description }}</p>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddPrompt">
              <el-icon><Plus /></el-icon>
              新建提示词
            </el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="content-tabs">
          <el-tab-pane label="提示词配置" name="config">
            <div class="prompt-list">
              <el-row :gutter="16">
                <el-col v-for="prompt in servicePrompts" :key="prompt.id" :span="12">
                  <el-card shadow="hover" class="prompt-card" @click="handleEditPrompt(prompt)">
                    <div class="prompt-card-header">
                      <div class="prompt-name">
                        <span class="name-text">{{ prompt.name }}</span>
                        <el-tag v-if="prompt.isDefault" size="small" type="success">默认</el-tag>
                        <el-tag :type="prompt.status === '启用' ? 'success' : 'info'" size="small">{{ prompt.status }}</el-tag>
                      </div>
                      <div class="prompt-version">v{{ prompt.version }}</div>
                    </div>
                    <div class="prompt-content">
                      <el-tooltip :content="prompt.content" placement="top">
                        <span class="content-text">{{ prompt.content }}</span>
                      </el-tooltip>
                    </div>
                    <div class="prompt-footer">
                      <div class="prompt-variables">
                        <el-tag v-for="v in prompt.variableList.slice(0, 3)" :key="v.name" size="small" style="margin-right: 4px;">
                          {{ v.name }}
                        </el-tag>
                        <span v-if="prompt.variableList.length > 3" class="more-text">+{{ prompt.variableList.length - 3 }}</span>
                      </div>
                      <div class="prompt-actions">
                        <el-button type="primary" link size="small" @click.stop="handleTestPrompt(prompt)">
                          <el-icon><VideoPlay /></el-icon>
                          测试
                        </el-button>
                        <el-button type="primary" link size="small" @click.stop="handleEditPrompt(prompt)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <el-tab-pane label="效果测试" name="test">
            <div class="test-workspace">
              <el-row :gutter="20" class="test-row">
                <el-col :span="10">
                  <div class="test-panel">
                    <div class="panel-header">
                      <span class="panel-title">测试配置</span>
                    </div>
                    <div class="panel-body">
                      <el-form :model="testForm" label-width="90px" label-position="top">
                        <el-form-item label="选择提示词">
                          <el-select v-model="testForm.promptId" placeholder="选择要测试的提示词" style="width: 100%;" @change="handlePromptChange">
                            <el-option v-for="p in servicePrompts" :key="p.id" :label="p.name" :value="p.id" />
                          </el-select>
                        </el-form-item>
                        <el-form-item v-if="selectedPrompt" label="模型选择">
                          <el-select v-model="testForm.model" style="width: 100%;">
                            <el-option label="GPT-4" value="gpt-4" />
                            <el-option label="GPT-3.5-turbo" value="gpt-3.5-turbo" />
                            <el-option label="Claude-3-opus" value="claude-3-opus" />
                            <el-option label="Claude-3-sonnet" value="claude-3-sonnet" />
                          </el-select>
                        </el-form-item>
                        <el-form-item v-if="selectedPrompt" label="Temperature">
                          <el-slider v-model="testForm.temperature" :min="0" :max="1" :step="0.1" show-input />
                        </el-form-item>
                        <el-divider v-if="selectedPrompt" content-position="left">变量输入</el-divider>
                        <el-form-item v-for="variable in testVariables" :key="variable.name" :label="variable.name">
                          <el-input 
                            v-model="variable.value" 
                            :placeholder="variable.description" 
                            :type="variable.type === 'text' ? 'textarea' : 'text'"
                            :rows="variable.type === 'text' ? 3 : 1"
                          />
                        </el-form-item>
                        <el-form-item>
                          <el-button type="primary" @click="handleRunTest" :loading="testing">
                            <el-icon><VideoPlay /></el-icon>
                            运行测试
                          </el-button>
                          <el-button @click="handleClearTest">清空</el-button>
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>
                </el-col>
                <el-col :span="14">
                  <div class="test-panel result-panel">
                    <div class="panel-header">
                      <span class="panel-title">测试结果</span>
                      <div v-if="testResult" class="result-stats">
                        <el-tag size="small" type="info">Tokens: {{ testResult.tokens }}</el-tag>
                        <el-tag size="small" type="info">耗时: {{ testResult.latency }}ms</el-tag>
                      </div>
                    </div>
                    <div class="panel-body">
                      <div v-if="!testResult" class="empty-result">
                        <el-empty description="请配置测试参数并运行测试" />
                      </div>
                      <template v-else>
                        <div class="result-section">
                          <div class="result-label">最终提示词</div>
                          <div class="result-content prompt-preview">{{ testResult.finalPrompt }}</div>
                        </div>
                        <div class="result-section">
                          <div class="result-label">模型输出</div>
                          <div class="result-content output-preview">{{ testResult.output }}</div>
                        </div>
                        <div class="result-actions">
                          <el-button size="small" @click="handleCopyResult">
                            <el-icon><CopyDocument /></el-icon>
                            复制结果
                          </el-button>
                          <el-button size="small" @click="handleSaveAsSample">
                            <el-icon><Collection /></el-icon>
                            保存为样本
                          </el-button>
                        </div>
                      </template>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <el-tab-pane label="历史版本" name="history">
            <div class="table-wrapper">
              <el-table :data="promptHistory" style="width: 100%" size="default">
                <el-table-column prop="name" label="提示词名称" width="180" />
                <el-table-column prop="version" label="版本" width="80" align="center" />
                <el-table-column prop="content" label="内容" min-width="300">
                  <template #default="{ row }">
                    <el-tooltip :content="row.content" placement="top">
                      <span class="truncate-text">{{ row.content }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="operator" label="操作人" width="100" />
                <el-table-column prop="updateTime" label="更新时间" width="160" />
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleViewHistory(row)">查看</el-button>
                    <el-button type="primary" link size="small" @click="handleRollback(row)">回滚</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>

      <template v-else>
        <el-empty description="请选择一个服务" />
      </template>
    </main>

    <el-drawer v-model="promptDrawerVisible" :title="isEditPrompt ? '编辑提示词' : '新建提示词'" size="650px">
      <el-form :model="promptForm" label-width="100px">
        <el-form-item label="提示词名称" required>
          <el-input v-model="promptForm.name" placeholder="请输入提示词名称" />
        </el-form-item>
        <el-form-item label="提示词内容" required>
          <el-input 
            v-model="promptForm.content" 
            type="textarea" 
            :rows="10" 
            placeholder="请输入提示词内容，使用 {{变量名}} 表示变量，例如：{{user_question}}" 
          />
          <div class="form-tip">提示：使用 {{变量名}} 格式定义变量，系统会自动解析</div>
        </el-form-item>
        <el-form-item label="变量列表">
          <div class="variable-list">
            <div v-for="(v, index) in promptForm.variableList" :key="index" class="variable-item">
              <el-input v-model="v.name" placeholder="变量名" style="width: 120px;" />
              <el-input v-model="v.description" placeholder="变量说明" style="flex: 1; margin: 0 8px;" />
              <el-select v-model="v.type" style="width: 100px; margin-right: 8px;">
                <el-option label="文本" value="text" />
                <el-option label="字符串" value="string" />
                <el-option label="数字" value="number" />
              </el-select>
              <el-button type="danger" link @click="removeVariable(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addVariable">+ 添加变量</el-button>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="promptForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="promptForm.isDefault" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="promptForm.remark" type="textarea" :rows="2" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="promptDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePrompt">保存</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="serviceDialogVisible" title="新增服务" width="500px">
      <el-form :model="serviceForm" label-width="80px">
        <el-form-item label="服务名称" required>
          <el-input v-model="serviceForm.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务描述">
          <el-input v-model="serviceForm.description" type="textarea" :rows="2" placeholder="请输入服务描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveService">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Box, VideoPlay, Edit, CopyDocument, Collection, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeService = ref('chatbot')
const activeTab = ref('config')
const promptDrawerVisible = ref(false)
const serviceDialogVisible = ref(false)
const isEditPrompt = ref(false)
const testing = ref(false)
const testResult = ref(null)

const services = ref([
  { id: 'chatbot', name: '智能客服', description: '7x24小时智能客服，处理用户咨询、问题解答等场景', promptCount: 5 },
  { id: 'csp', name: 'CSP助手', description: 'CSP业务助手，协助处理业务流程和客户服务', promptCount: 4 },
  { id: 'agent2c', name: '2cAgent', description: '面向C端用户的智能代理，提供个性化服务', promptCount: 3 },
  { id: 'store', name: '门店助手', description: '门店运营助手，支持店员日常工作和客户服务', promptCount: 4 },
  { id: 'sales', name: '销售助手', description: '销售场景智能助手，辅助销售人员和客户沟通', promptCount: 3 },
  { id: 'technical', name: '技术支持', description: '技术问题解答和故障排查支持', promptCount: 2 }
])

const currentService = computed(() => services.value.find(s => s.id === activeService.value))

const servicePrompts = computed(() => {
  const prompts = {
    chatbot: [
      { id: 'p1', name: '客服对话主模板', version: '2.3', status: '启用', isDefault: true, content: '你是一名专业的客服助手。请根据用户的问题{{user_question}}，结合知识库信息{{knowledge}}，给出准确、友好的回复。回复时请注意：1. 保持礼貌和专业；2. 回答简洁明了；3. 如无法回答，请引导用户联系人工客服。', variableList: [{ name: 'user_question', description: '用户问题', type: 'text' }, { name: 'knowledge', description: '知识库内容', type: 'text' }] },
      { id: 'p2', name: '投诉处理模板', version: '1.5', status: '启用', isDefault: false, content: '用户反馈了以下投诉内容：{{complaint_content}}。请分析投诉原因，并给出解决方案。回复语气要诚恳，表达对用户的理解和歉意。', variableList: [{ name: 'complaint_content', description: '投诉内容', type: 'text' }] },
      { id: 'p3', name: '产品咨询模板', version: '1.2', status: '启用', isDefault: false, content: '用户正在咨询产品信息。产品名称：{{product_name}}，产品详情：{{product_info}}。请根据用户问题{{user_question}}，提供专业的产品介绍和建议。', variableList: [{ name: 'product_name', description: '产品名称', type: 'string' }, { name: 'product_info', description: '产品信息', type: 'text' }, { name: 'user_question', description: '用户问题', type: 'text' }] },
      { id: 'p4', name: '订单查询模板', version: '1.0', status: '启用', isDefault: false, content: '用户想查询订单信息。订单号：{{order_id}}，订单状态：{{order_status}}。请帮助用户了解订单详情。', variableList: [{ name: 'order_id', description: '订单ID', type: 'string' }, { name: 'order_status', description: '订单状态', type: 'string' }] },
      { id: 'p5', name: '退款处理模板', version: '1.1', status: '禁用', isDefault: false, content: '用户申请退款。订单号：{{order_id}}，退款原因：{{refund_reason}}。请判断是否符合退款条件，并给出处理建议。', variableList: [{ name: 'order_id', description: '订单ID', type: 'string' }, { name: 'refund_reason', description: '退款原因', type: 'text' }] }
    ],
    csp: [
      { id: 'p6', name: '业务受理模板', version: '2.0', status: '启用', isDefault: true, content: '你是CSP业务助手。当前业务类型：{{business_type}}，客户信息：{{customer_info}}。请协助完成业务受理流程，确保信息准确无误。', variableList: [{ name: 'business_type', description: '业务类型', type: 'string' }, { name: 'customer_info', description: '客户信息', type: 'text' }] },
      { id: 'p7', name: '工单处理模板', version: '1.3', status: '启用', isDefault: false, content: '工单编号：{{ticket_id}}，工单内容：{{ticket_content}}。请分析工单，给出处理建议和下一步操作指引。', variableList: [{ name: 'ticket_id', description: '工单ID', type: 'string' }, { name: 'ticket_content', description: '工单内容', type: 'text' }] },
      { id: 'p8', name: '客户回访模板', version: '1.0', status: '启用', isDefault: false, content: '客户：{{customer_name}}，回访目的：{{visit_purpose}}。请生成回访话术和注意事项。', variableList: [{ name: 'customer_name', description: '客户名称', type: 'string' }, { name: 'visit_purpose', description: '回访目的', type: 'string' }] },
      { id: 'p9', name: '异常预警模板', version: '1.2', status: '启用', isDefault: false, content: '检测到业务异常：{{exception_type}}，详情：{{exception_detail}}。请分析原因并给出处理方案。', variableList: [{ name: 'exception_type', description: '异常类型', type: 'string' }, { name: 'exception_detail', description: '异常详情', type: 'text' }] }
    ],
    agent2c: [
      { id: 'p10', name: '个性化推荐模板', version: '1.5', status: '启用', isDefault: true, content: '用户画像：{{user_profile}}，历史行为：{{user_behavior}}。请为用户推荐合适的产品或服务，并给出推荐理由。', variableList: [{ name: 'user_profile', description: '用户画像', type: 'text' }, { name: 'user_behavior', description: '历史行为', type: 'text' }] },
      { id: 'p11', name: '智能问答模板', version: '2.0', status: '启用', isDefault: false, content: '用户提问：{{question}}，用户偏好：{{preference}}。请给出个性化、有温度的回答。', variableList: [{ name: 'question', description: '用户问题', type: 'text' }, { name: 'preference', description: '用户偏好', type: 'string' }] },
      { id: 'p12', name: '活动推送模板', version: '1.0', status: '启用', isDefault: false, content: '活动名称：{{activity_name}}，活动内容：{{activity_content}}，目标用户特征：{{target_features}}。请生成个性化的活动推送文案。', variableList: [{ name: 'activity_name', description: '活动名称', type: 'string' }, { name: 'activity_content', description: '活动内容', type: 'text' }, { name: 'target_features', description: '目标用户特征', type: 'string' }] }
    ],
    store: [
      { id: 'p13', name: '店员工作指引模板', version: '2.1', status: '启用', isDefault: true, content: '门店：{{store_name}}，当前任务：{{task_type}}。请提供详细的工作指引和注意事项。', variableList: [{ name: 'store_name', description: '门店名称', type: 'string' }, { name: 'task_type', description: '任务类型', type: 'string' }] },
      { id: 'p14', name: '客户接待模板', version: '1.2', status: '启用', isDefault: false, content: '客户到店，需求：{{customer_need}}，门店促销信息：{{promotion_info}}。请提供接待话术和产品介绍建议。', variableList: [{ name: 'customer_need', description: '客户需求', type: 'text' }, { name: 'promotion_info', description: '促销信息', type: 'text' }] },
      { id: 'p15', name: '库存管理模板', version: '1.0', status: '启用', isDefault: false, content: '商品：{{product_name}}，当前库存：{{stock}}，安全库存：{{safe_stock}}。请分析库存状况并给出补货建议。', variableList: [{ name: 'product_name', description: '商品名称', type: 'string' }, { name: 'stock', description: '当前库存', type: 'number' }, { name: 'safe_stock', description: '安全库存', type: 'number' }] },
      { id: 'p16', name: '门店巡检模板', version: '1.0', status: '启用', isDefault: false, content: '巡检项目：{{check_items}}，门店：{{store_name}}。请生成巡检清单和标准要求。', variableList: [{ name: 'check_items', description: '巡检项目', type: 'text' }, { name: 'store_name', description: '门店名称', type: 'string' }] }
    ],
    sales: [
      { id: 'p17', name: '销售话术模板', version: '1.5', status: '启用', isDefault: true, content: '产品：{{product_name}}，客户画像：{{customer_profile}}，销售场景：{{scenario}}。请生成针对性的销售话术。', variableList: [{ name: 'product_name', description: '产品名称', type: 'string' }, { name: 'customer_profile', description: '客户画像', type: 'text' }, { name: 'scenario', description: '销售场景', type: 'string' }] },
      { id: 'p18', name: '异议处理模板', version: '1.2', status: '启用', isDefault: false, content: '客户提出异议：{{objection}}，产品信息：{{product_info}}。请给出有效的异议处理方案。', variableList: [{ name: 'objection', description: '客户异议', type: 'text' }, { name: 'product_info', description: '产品信息', type: 'text' }] },
      { id: 'p19', name: '报价单生成模板', version: '1.0', status: '启用', isDefault: false, content: '客户：{{customer_name}}，需求产品：{{products}}，折扣政策：{{discount_policy}}。请生成专业的报价单说明。', variableList: [{ name: 'customer_name', description: '客户名称', type: 'string' }, { name: 'products', description: '产品清单', type: 'text' }, { name: 'discount_policy', description: '折扣政策', type: 'string' }] }
    ],
    technical: [
      { id: 'p20', name: '问题诊断模板', version: '2.0', status: '启用', isDefault: true, content: '用户描述的问题：{{problem_description}}，环境信息：{{environment}}。请进行问题诊断，给出可能的原因和排查步骤。', variableList: [{ name: 'problem_description', description: '问题描述', type: 'text' }, { name: 'environment', description: '环境信息', type: 'text' }] },
      { id: 'p21', name: '解决方案模板', version: '1.3', status: '启用', isDefault: false, content: '问题：{{problem}}，已确认原因：{{root_cause}}。请给出详细的解决方案和操作步骤。', variableList: [{ name: 'problem', description: '问题', type: 'text' }, { name: 'root_cause', description: '根因', type: 'string' }] }
    ]
  }
  return prompts[activeService.value] || []
})

const testForm = reactive({
  promptId: '',
  model: 'gpt-4',
  temperature: 0.7
})

const testVariables = ref([])

const selectedPrompt = computed(() => {
  if (!testForm.promptId) return null
  return servicePrompts.value.find(p => p.id === testForm.promptId)
})

const promptForm = reactive({
  id: '',
  name: '',
  content: '',
  variableList: [],
  status: '启用',
  isDefault: false,
  remark: ''
})

const serviceForm = reactive({
  name: '',
  description: ''
})

const promptHistory = ref([
  { name: '客服对话主模板', version: 'v2.3', content: '你是一名专业的客服助手...', operator: '张三', updateTime: '2026-03-26 10:30' },
  { name: '客服对话主模板', version: 'v2.2', content: '你是一个客服助手，请回答用户问题...', operator: '李四', updateTime: '2026-03-25 14:20' },
  { name: '客服对话主模板', version: 'v2.1', content: '作为客服，请帮助用户解决问题...', operator: '张三', updateTime: '2026-03-24 09:15' },
  { name: '投诉处理模板', version: 'v1.5', content: '用户反馈了投诉内容...', operator: '王五', updateTime: '2026-03-23 16:00' }
])

const handleServiceSelect = (index) => {
  activeService.value = index
  activeTab.value = 'config'
  testForm.promptId = ''
  testVariables.value = []
  testResult.value = null
}

const handleAddService = () => {
  Object.assign(serviceForm, { name: '', description: '' })
  serviceDialogVisible.value = true
}

const handleSaveService = () => {
  services.value.push({
    id: 'service_' + Date.now(),
    name: serviceForm.name,
    description: serviceForm.description,
    promptCount: 0
  })
  serviceDialogVisible.value = false
  ElMessage.success('服务创建成功')
}

const handleAddPrompt = () => {
  isEditPrompt.value = false
  Object.assign(promptForm, { id: '', name: '', content: '', variableList: [], status: '启用', isDefault: false, remark: '' })
  promptDrawerVisible.value = true
}

const handleEditPrompt = (prompt) => {
  isEditPrompt.value = true
  Object.assign(promptForm, { ...prompt })
  promptDrawerVisible.value = true
}

const handleTestPrompt = (prompt) => {
  testForm.promptId = prompt.id
  activeTab.value = 'test'
}

const handlePromptChange = () => {
  if (selectedPrompt.value) {
    testVariables.value = selectedPrompt.value.variableList.map(v => ({
      name: v.name,
      description: v.description,
      type: v.type,
      value: ''
    }))
  } else {
    testVariables.value = []
  }
  testResult.value = null
}

const handleRunTest = () => {
  if (!selectedPrompt.value) {
    ElMessage.warning('请先选择提示词')
    return
  }
  
  testing.value = true
  
  setTimeout(() => {
    let finalPrompt = selectedPrompt.value.content
    testVariables.value.forEach(v => {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${v.name}}}`, 'g'), v.value || `[${v.name}]`)
    })
    
    testResult.value = {
      finalPrompt,
      output: `这是基于"${selectedPrompt.value.name}"模板生成的测试输出内容。您输入的变量值已经被正确替换到提示词中，模型会根据这个提示词生成相应的回复。\n\n实际使用时，这里会显示真实的大模型输出结果。`,
      tokens: Math.floor(Math.random() * 500) + 200,
      latency: Math.floor(Math.random() * 1000) + 500
    }
    
    testing.value = false
  }, 1500)
}

const handleClearTest = () => {
  testVariables.value.forEach(v => v.value = '')
  testResult.value = null
}

const handleCopyResult = () => {
  if (testResult.value) {
    navigator.clipboard.writeText(testResult.value.output)
    ElMessage.success('已复制到剪贴板')
  }
}

const handleSaveAsSample = () => {
  ElMessage.success('已保存为测试样本')
}

const addVariable = () => promptForm.variableList.push({ name: '', description: '', type: 'string' })
const removeVariable = (index) => promptForm.variableList.splice(index, 1)

const handleSavePrompt = () => {
  console.log('Save prompt:', promptForm)
  promptDrawerVisible.value = false
  ElMessage.success('保存成功')
}

const handleViewHistory = (row) => console.log('View history:', row)
const handleRollback = (row) => {
  ElMessage.success(`已回滚到版本 ${row.version}`)
}
</script>

<style scoped>
.prompt-page {
  height: 100%;
  display: flex;
  background-color: #f5f7fa;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  border: none;
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  display: flex;
  align-items: center;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.content-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.content-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.prompt-list {
  min-height: 400px;
}

.prompt-card {
  cursor: pointer;
  transition: all 0.2s;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.prompt-card :deep(.el-card__body) {
  padding: 16px;
}

.prompt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.prompt-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  font-weight: 500;
  color: #303133;
}

.prompt-version {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.prompt-content {
  margin-bottom: 12px;
}

.content-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.prompt-variables {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.more-text {
  font-size: 12px;
  color: #909399;
}

.test-workspace {
  min-height: 500px;
}

.test-row {
  height: 100%;
}

.test-panel {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.panel-body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.result-stats {
  display: flex;
  gap: 8px;
}

.empty-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.result-section {
  margin-bottom: 20px;
}

.result-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.result-content {
  padding: 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.8;
}

.prompt-preview {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #606266;
  white-space: pre-wrap;
}

.output-preview {
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  color: #409eff;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.table-wrapper :deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 500;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.variable-list {
  width: 100%;
}

.variable-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>