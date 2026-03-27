<template>
  <div class="vocabulary-page">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">服务列表</h2>
      </div>
      <el-menu
        :default-active="activeService"
        class="sidebar-menu"
        @select="handleServiceSelect"
      >
        <el-menu-item v-for="service in services" :key="service.id" :index="service.id">
          <el-icon><Box /></el-icon>
          <span>{{ service.name }}</span>
          <el-tag size="small" type="info" style="margin-left: auto;">{{ service.vocabularyCount }} 词</el-tag>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="main-content">
      <template v-if="currentService">
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">{{ currentService.name }} - 词汇表管理</h1>
            <p class="page-desc">{{ currentService.description }}</p>
          </div>
          <div class="header-actions">
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click="handleImport">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="content-tabs">
          <el-tab-pane label="词根管理" name="roots">
            <div class="roots-section">
              <div class="section-header">
                <div class="search-bar">
                  <el-input v-model="rootSearch" placeholder="搜索词根名称或定义" clearable style="width: 280px;">
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-select v-model="rootCategory" placeholder="选择分类" clearable style="width: 150px; margin-left: 12px;">
                    <el-option label="技术术语" value="tech" />
                    <el-option label="业务术语" value="business" />
                    <el-option label="产品术语" value="product" />
                    <el-option label="通用词汇" value="general" />
                  </el-select>
                </div>
                <el-button type="primary" @click="handleAddRoot">
                  <el-icon><Plus /></el-icon>
                  添加词根
                </el-button>
              </div>

              <el-table :data="filteredRoots" style="width: 100%" size="default">
                <el-table-column prop="word" label="词根" width="150">
                  <template #default="{ row }">
                    <span class="root-word">{{ row.word }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="category" label="分类" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ getCategoryLabel(row.category) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="definition" label="定义" min-width="250">
                  <template #default="{ row }">
                    <el-tooltip :content="row.definition" placement="top">
                      <span class="truncate-text">{{ row.definition }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="examples" label="使用示例" min-width="180">
                  <template #default="{ row }">
                    <el-tooltip :content="row.examples" placement="top">
                      <span class="truncate-text">{{ row.examples }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="synonyms" label="近义词" width="150">
                  <template #default="{ row }">
                    <el-tag v-for="syn in row.synonyms.slice(0, 2)" :key="syn" size="small" style="margin-right: 4px;">{{ syn }}</el-tag>
                    <span v-if="row.synonyms.length > 2" class="more-text">+{{ row.synonyms.length - 2 }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="150" />
                <el-table-column label="操作" width="180" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditRoot(row)">编辑</el-button>
                    <el-button type="primary" link size="small" @click="handleGenerateSynonyms(row)">生成近义词</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteRoot(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="近义词管理" name="synonyms">
            <div class="synonyms-section">
              <div class="section-header">
                <div class="search-bar">
                  <el-input v-model="synonymSearch" placeholder="搜索单词" clearable style="width: 280px;">
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <el-button type="primary" @click="handleAddSynonymGroup">
                  <el-icon><Plus /></el-icon>
                  添加近义词组
                </el-button>
              </div>

              <div class="synonym-groups">
                <el-card v-for="group in filteredSynonymGroups" :key="group.id" shadow="hover" class="synonym-card">
                  <div class="synonym-header">
                    <div class="header-left">
                      <span class="main-word">{{ group.mainWord }}</span>
                      <el-tag size="small" type="info">{{ group.synonyms.length }} 个近义词</el-tag>
                    </div>
                    <div class="header-right">
                      <el-button type="primary" link size="small" @click="handleEditSynonymGroup(group)">编辑</el-button>
                      <el-button type="danger" link size="small" @click="handleDeleteSynonymGroup(group)">删除</el-button>
                    </div>
                  </div>
                  <div class="synonym-list">
                    <el-tag
                      v-for="word in group.synonyms"
                      :key="word"
                      closable
                      size="small"
                      @close="handleRemoveSynonym(group.id, word)"
                      @click="handleSetAsMainWord(group.id, word)"
                    >
                      {{ word }}
                    </el-tag>
                    <el-button type="primary" link size="small" @click="handleAddSynonymWord(group)">
                      <el-icon><Plus /></el-icon>
                      添加
                    </el-button>
                  </div>
                  <div class="synonym-actions">
                    <el-button size="small" @click="handleGenerateSynonymsForGroup(group)">
                      <el-icon><MagicStick /></el-icon>
                      AI 生成
                    </el-button>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="提示词配置" name="prompt">
            <div class="prompt-section">
              <el-card shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">近义词生成提示词</span>
                    <el-button type="primary" size="small" @click="handleSavePrompt">保存配置</el-button>
                  </div>
                </template>

                <el-alert
                  title="使用大模型生成近义词"
                  type="info"
                  :closable="false"
                  style="margin-bottom: 16px;"
                >
                  <template #default>
                    <p>在词根管理或近义词管理页面，点击「生成近义词」或「AI 生成」按钮，即可使用下方配置的提示词调用大模型生成近义词。</p>
                  </template>
                </el-alert>

                <el-form :model="promptConfig" label-width="140px">
                  <el-form-item label="使用模型">
                    <el-select v-model="promptConfig.model" style="width: 250px;">
                      <el-option label="GPT-4" value="gpt-4" />
                      <el-option label="GPT-3.5-turbo" value="gpt-3.5-turbo" />
                      <el-option label="Claude-3-sonnet" value="claude-3-sonnet" />
                      <el-option label="Claude-3-haiku" value="claude-3-haiku" />
                      <el-option label="通义千问" value="qwen-max" />
                      <el-option label="文心一言" value="ernie-bot" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="Temperature">
                    <el-slider v-model="promptConfig.temperature" :min="0" :max="1" :step="0.1" :format="(val) => val.toFixed(1)" />
                    <span class="form-tip">越高越随机，越低越确定</span>
                  </el-form-item>
                  <el-form-item label="最大生成数">
                    <el-input-number v-model="promptConfig.maxCount" :min="3" :max="20" />
                    <span class="form-tip">每次生成近义词的最大数量</span>
                  </el-form-item>
                  <el-form-item label="系统提示词" required>
                    <el-input
                      v-model="promptConfig.systemPrompt"
                      type="textarea"
                      :rows="8"
                      placeholder="输入系统提示词..."
                      class="prompt-textarea"
                    />
                  </el-form-item>
                  <el-form-item label="用户提示词模板">
                    <el-input
                      v-model="promptConfig.userPromptTemplate"
                      type="textarea"
                      :rows="3"
                      placeholder="输入用户提示词模板，{word} 将被替换为目标词汇..."
                      class="prompt-textarea"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleTestPrompt">
                      <el-icon><VideoPlay /></el-icon>
                      测试提示词
                    </el-button>
                    <el-button @click="handleResetPrompt">重置为默认</el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <span>生成示例</span>
                </template>
                <div class="example-section">
                  <div class="example-item">
                    <div class="example-label">输入词：</div>
                    <el-tag type="primary">购买</el-tag>
                  </div>
                  <div class="example-arrow">
                    <el-icon><Bottom /></el-icon>
                  </div>
                  <div class="example-item">
                    <div class="example-label">生成结果：</div>
                    <el-tag v-for="word in ['买', '下单', '订购', '采购', '购置', '添置']" :key="word" style="margin-right: 4px;">
                      {{ word }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </main>

    <!-- 词根编辑对话框 -->
    <el-dialog v-model="rootDialogVisible" :title="isEditRoot ? '编辑词根' : '添加词根'" width="600px">
      <el-form :model="rootForm" label-width="100px">
        <el-form-item label="词根" required>
          <el-input v-model="rootForm.word" placeholder="如：LLM" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="rootForm.category" style="width: 100%;">
            <el-option label="技术术语" value="tech" />
            <el-option label="业务术语" value="business" />
            <el-option label="产品术语" value="product" />
            <el-option label="通用词汇" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="定义" required>
          <el-input v-model="rootForm.definition" type="textarea" :rows="3" placeholder="输入词根的定义" />
        </el-form-item>
        <el-form-item label="使用示例">
          <el-input v-model="rootForm.examples" type="textarea" :rows="2" placeholder="输入使用示例" />
        </el-form-item>
        <el-form-item label="近义词">
          <el-select v-model="rootForm.synonyms" multiple filterable allow-create placeholder="输入近义词后回车" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="rootForm.notes" type="textarea" :rows="2" placeholder="可选备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rootDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRoot">保存</el-button>
      </template>
    </el-dialog>

    <!-- 近义词组编辑对话框 -->
    <el-dialog v-model="synonymGroupDialogVisible" :title="isEditSynonymGroup ? '编辑近义词组' : '添加近义词组'" width="550px">
      <el-form :model="synonymGroupForm" label-width="100px">
        <el-form-item label="主词" required>
          <el-input v-model="synonymGroupForm.mainWord" placeholder="如：购买" />
        </el-form-item>
        <el-form-item label="近义词" required>
          <el-select v-model="synonymGroupForm.synonyms" multiple filterable allow-create placeholder="输入近义词后回车" style="width: 100%;" />
          <span class="form-tip">输入词语后按回车添加</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="synonymGroupForm.notes" type="textarea" :rows="2" placeholder="可选备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="synonymGroupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSynonymGroup">保存</el-button>
      </template>
    </el-dialog>

    <!-- 添加近义词快捷对话框 -->
    <el-dialog v-model="addSynonymWordDialogVisible" title="添加近义词" width="450px">
      <el-form :model="addSynonymWordForm" label-width="80px">
        <el-form-item label="近义词">
          <el-input v-model="addSynonymWordForm.word" placeholder="输入近义词，多个用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addSynonymWordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSynonymWord">添加</el-button>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入词汇表" width="550px">
      <el-form label-width="100px">
        <el-form-item label="导入方式">
          <el-radio-group v-model="importMode">
            <el-radio value="file">文件导入</el-radio>
            <el-radio value="paste">粘贴导入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="importMode === 'file'" label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".json,.csv"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 JSON 和 CSV 格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item v-else label="粘贴数据">
          <el-input
            v-model="importPasteData"
            type="textarea"
            :rows="8"
            placeholder="粘贴 JSON 格式的词汇表数据..."
          />
        </el-form-item>
        <el-form-item label="导入选项">
          <el-checkbox-group v-model="importOptions">
            <el-checkbox value="merge">合并导入（不覆盖现有）</el-checkbox>
            <el-checkbox value="skipDuplicates">跳过重复项</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmImport">开始导入</el-button>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出词汇表" width="450px">
      <el-form label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportFormat">
            <el-radio value="json">JSON</el-radio>
            <el-radio value="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导出内容">
          <el-checkbox-group v-model="exportContent">
            <el-checkbox value="roots">词根</el-checkbox>
            <el-checkbox value="synonyms">近义词</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="预览">
          <div class="export-preview">{{ exportPreview }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
      </template>
    </el-dialog>

    <!-- AI 生成近义词结果对话框 -->
    <el-dialog v-model="generateResultDialogVisible" title="AI 生成近义词" width="600px">
      <div class="generate-result">
        <div class="result-header">
          <span class="target-word">{{ generatingForWord }}</span>
          <el-tag v-if="generateLoading" type="info">生成中...</el-tag>
        </div>
        <div v-if="!generateLoading && generatedSynonyms.length > 0" class="result-list">
          <div class="result-label">生成的近义词：</div>
          <el-tag
            v-for="word in generatedSynonyms"
            :key="word"
            type="success"
            size="large"
            style="margin: 4px; cursor: pointer;"
            @click="handleSelectGeneratedWord(word)"
          >
            {{ word }}
          </el-tag>
        </div>
        <div v-else-if="!generateLoading" class="empty-result">
          <el-empty description="未能生成近义词，请尝试修改提示词后重试" :image-size="80" />
        </div>
        <div v-else class="loading-result">
          <el-skeleton :rows="3" animated />
        </div>
      </div>
      <template #footer>
        <el-button @click="generateResultDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="generateLoading || generatedSynonyms.length === 0" @click="handleConfirmAddGenerated">
          添加到词库
        </el-button>
      </template>
    </el-dialog>

    <!-- 测试提示词对话框 -->
    <el-dialog v-model="testPromptDialogVisible" title="测试提示词" width="550px">
      <el-form label-width="100px">
        <el-form-item label="测试词汇">
          <el-input v-model="testPromptWord" placeholder="输入要测试的词汇" />
        </el-form-item>
        <el-form-item label="生成结果">
          <div v-if="testPromptLoading" class="test-loading">
            <el-skeleton :rows="2" animated />
          </div>
          <div v-else-if="testPromptResult.length > 0" class="test-result">
            <el-tag v-for="word in testPromptResult" :key="word" type="success" style="margin: 4px;">{{ word }}</el-tag>
          </div>
          <div v-else class="test-empty">
            <el-empty description="点击开始测试" :image-size="60" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testPromptDialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="testPromptLoading" @click="handleRunTestPrompt">开始测试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Box, Plus, Search, Upload, Download, MagicStick, VideoPlay, Bottom } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeService = ref('chatbot')
const activeTab = ref('roots')
const rootSearch = ref('')
const rootCategory = ref('')
const synonymSearch = ref('')

const services = ref([
  { id: 'chatbot', name: '智能客服', description: '7x24 小时智能客服词汇管理', vocabularyCount: 2450 },
  { id: 'csp', name: 'CSP 助手', description: 'CSP 业务助手词汇管理', vocabularyCount: 1820 },
  { id: 'agent2c', name: '2cAgent', description: 'C 端用户代理词汇管理', vocabularyCount: 1560 },
  { id: 'store', name: '门店助手', description: '门店运营助手词汇管理', vocabularyCount: 980 },
  { id: 'sales', name: '销售助手', description: '销售场景助手词汇管理', vocabularyCount: 1240 },
  { id: 'technical', name: '技术支持', description: '技术支持词汇管理', vocabularyCount: 2100 }
])

const currentService = computed(() => services.value.find(s => s.id === activeService.value))

// 词根数据
const roots = ref([
  { id: 1, word: 'LLM', category: 'tech', definition: 'Large Language Model，大型语言模型，一种基于深度学习的自然语言处理模型', examples: 'GPT-4、Claude-3 都是典型的 LLM', synonyms: ['大语言模型', '大模型'], updateTime: '2026-03-25 10:00' },
  { id: 2, word: 'RAG', category: 'tech', definition: 'Retrieval-Augmented Generation，检索增强生成，结合检索和生成的技术', examples: '使用 RAG 可以提升问答系统的准确性', synonyms: ['检索增强'], updateTime: '2026-03-24 15:30' },
  { id: 3, word: 'Token', category: 'tech', definition: '文本的最小处理单元，在 LLM 中表示词或子词的编码单位', examples: '这段文本大约有 500 个 token', synonyms: ['标记', '词元'], updateTime: '2026-03-23 09:00' },
  { id: 4, word: 'VIP 用户', category: 'business', definition: 'Very Important Person，重要客户，享受特殊权益和服务的用户群体', examples: 'VIP 用户可享受专属客服和优先配送', synonyms: ['会员', '贵宾'], updateTime: '2026-03-22 14:00' },
  { id: 5, word: 'SKU', category: 'product', definition: 'Stock Keeping Unit，库存量单位，产品的最小管理单元', examples: '这款商品有 3 个 SKU，分别是不同颜色', synonyms: ['规格', '货号'], updateTime: '2026-03-21 11:00' },
  { id: 6, word: '购买', category: 'general', definition: '用户表达想要获取商品的意图', examples: '我想买个手机', synonyms: ['买', '下单', '订购'], updateTime: '2026-03-20 16:00' }
])

// 近义词组数据
const synonymGroups = ref([
  { id: 1, mainWord: '购买', synonyms: ['买', '下单', '订购', '采购', '购置'] },
  { id: 2, mainWord: '退款', synonyms: ['退钱', '返还', '退还'] },
  { id: 3, mainWord: '客服', synonyms: ['客服人员', '客服代表', '服务人员', '在线客服'] },
  { id: 4, mainWord: '发货', synonyms: ['送货', '寄送', '配送', '发出'] },
  { id: 5, mainWord: '手机', synonyms: ['电话', '移动电话', '智能机', '电话机'] }
])

// 提示词配置
const promptConfig = reactive({
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxCount: 10,
  systemPrompt: `你是一个词汇学助手，擅长为给定词汇生成相关的近义词。

## 任务
为输入的词生成语义相近的近义词列表。

## 要求
1. 生成的近义词应该是日常使用的词语
2. 近义词应该在大多数上下文中可以互换使用
3. 返回纯 JSON 数组格式：["近义词 1", "近义词 2", ...]
4. 不要包含解释或额外文字

## 输出示例
["买", "下单", "订购", "采购", "购置", "添置"]`,
  userPromptTemplate: '请为"{word}"生成近义词列表。'
})

// 对话框状态
const rootDialogVisible = ref(false)
const isEditRoot = ref(false)
const synonymGroupDialogVisible = ref(false)
const isEditSynonymGroup = ref(false)
const addSynonymWordDialogVisible = ref(false)
const importDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const generateResultDialogVisible = ref(false)
const testPromptDialogVisible = ref(false)

// 表单数据
const rootForm = reactive({ id: '', word: '', category: 'general', definition: '', examples: '', synonyms: [], notes: '' })
const synonymGroupForm = reactive({ id: '', mainWord: '', synonyms: [], notes: '' })
const addSynonymWordForm = reactive({ word: '', groupId: '' })

// 导入导出
const importMode = ref('file')
const importPasteData = ref('')
const importOptions = ref(['merge', 'skipDuplicates'])
const importFileData = ref(null)
const exportFormat = ref('json')
const exportContent = ref(['roots', 'synonyms'])
const exportPreview = ref('待生成预览')

// AI 生成相关
const generateLoading = ref(false)
const generatedSynonyms = ref([])
const generatingForWord = ref('')
const currentEditingGroup = ref(null)
const testPromptWord = ref('')
const testPromptLoading = ref(false)
const testPromptResult = ref([])

// 过滤后的数据
const filteredRoots = computed(() => {
  let result = roots.value
  if (rootSearch.value) {
    const search = rootSearch.value.toLowerCase()
    result = result.filter(r => r.word.toLowerCase().includes(search) || r.definition.toLowerCase().includes(search))
  }
  if (rootCategory.value) {
    result = result.filter(r => r.category === rootCategory.value)
  }
  return result
})

const filteredSynonymGroups = computed(() => {
  if (!synonymSearch.value) return synonymGroups.value
  const search = synonymSearch.value.toLowerCase()
  return synonymGroups.value.filter(g =>
    g.mainWord.toLowerCase().includes(search) ||
    g.synonyms.some(s => s.toLowerCase().includes(search))
  )
})

const getCategoryLabel = (category) => {
  const labels = { tech: '技术术语', business: '业务术语', product: '产品术语', general: '通用词汇' }
  return labels[category] || category
}

const handleServiceSelect = (index) => {
  activeService.value = index
  // 重置搜索
  rootSearch.value = ''
  rootCategory.value = ''
  synonymSearch.value = ''
}

// 词根操作
const handleAddRoot = () => {
  isEditRoot.value = false
  Object.assign(rootForm, { id: '', word: '', category: 'general', definition: '', examples: '', synonyms: [], notes: '' })
  rootDialogVisible.value = true
}

const handleEditRoot = (row) => {
  isEditRoot.value = true
  Object.assign(rootForm, JSON.parse(JSON.stringify(row)))
  rootDialogVisible.value = true
}

const handleSaveRoot = () => {
  if (isEditRoot.value) {
    const index = roots.value.findIndex(r => r.id === rootForm.id)
    if (index !== -1) {
      roots.value[index] = { ...rootForm, updateTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') }
    }
  } else {
    roots.value.unshift({
      ...rootForm,
      id: Date.now(),
      updateTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')
    })
  }
  rootDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleDeleteRoot = (row) => {
  ElMessageBox.confirm('确定要删除这个词根吗？', '确认删除', { type: 'warning' })
    .then(() => {
      roots.value = roots.value.filter(r => r.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 近义词组操作
const handleAddSynonymGroup = () => {
  isEditSynonymGroup.value = false
  Object.assign(synonymGroupForm, { id: '', mainWord: '', synonyms: [], notes: '' })
  synonymGroupDialogVisible.value = true
}

const handleEditSynonymGroup = (row) => {
  isEditSynonymGroup.value = true
  Object.assign(synonymGroupForm, JSON.parse(JSON.stringify(row)))
  synonymGroupDialogVisible.value = true
}

const handleSaveSynonymGroup = () => {
  if (isEditSynonymGroup.value) {
    const index = synonymGroups.value.findIndex(g => g.id === synonymGroupForm.id)
    if (index !== -1) {
      synonymGroups.value[index] = { ...synonymGroupForm }
    }
  } else {
    synonymGroups.value.unshift({
      ...synonymGroupForm,
      id: Date.now()
    })
  }
  synonymGroupDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleDeleteSynonymGroup = (row) => {
  ElMessageBox.confirm('确定要删除这个近义词组吗？', '确认删除', { type: 'warning' })
    .then(() => {
      synonymGroups.value = synonymGroups.value.filter(g => g.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleRemoveSynonym = (groupId, word) => {
  const group = synonymGroups.value.find(g => g.id === groupId)
  if (group) {
    group.synonyms = group.synonyms.filter(s => s !== word)
    ElMessage.success('已移除近义词')
  }
}

const handleAddSynonymWord = (group) => {
  currentEditingGroup.value = group
  addSynonymWordForm.word = ''
  addSynonymWordForm.groupId = group.id
  addSynonymWordDialogVisible.value = true
}

const handleSaveSynonymWord = () => {
  if (!addSynonymWordForm.word.trim()) {
    ElMessage.warning('请输入近义词')
    return
  }
  const group = synonymGroups.value.find(g => g.id === addSynonymWordForm.groupId)
  if (group) {
    const newWords = addSynonymWordForm.word.split(/[,,]/).map(w => w.trim()).filter(w => w)
    newWords.forEach(w => {
      if (!group.synonyms.includes(w)) {
        group.synonyms.push(w)
      }
    })
    ElMessage.success('添加成功')
  }
  addSynonymWordDialogVisible.value = false
}

const handleSetAsMainWord = (groupId, word) => {
  const group = synonymGroups.value.find(g => g.id === groupId)
  if (group) {
    group.synonyms = group.synonyms.filter(s => s !== word)
    group.synonyms.push(group.mainWord)
    group.mainWord = word
    ElMessage.success('已设置主词')
  }
}

// AI 生成近义词
const handleGenerateSynonyms = (row) => {
  generatingForWord.value = row.word
  generatedSynonyms.value = []
  generateResultDialogVisible.value = true
  callGenerateAPI(row.word, row.synonyms)
}

const handleGenerateSynonymsForGroup = (group) => {
  currentEditingGroup.value = group
  generatingForWord.value = group.mainWord
  generatedSynonyms.value = []
  generateResultDialogVisible.value = true
  callGenerateAPI(group.mainWord, group.synonyms)
}

const callGenerateAPI = (word, existingSynonyms = []) => {
  generateLoading.value = true

  // 模拟调用大模型 API
  setTimeout(() => {
    // 模拟生成结果
    const mockResults = {
      '购买': ['买', '下单', '订购', '采购', '购置', '添置', '买入', '购进'],
      '退款': ['退钱', '返还', '退还', '退回', '返款', '退款到账'],
      '客服': ['客服人员', '客服代表', '服务人员', '在线客服', '客户支持', '售后'],
      '手机': ['电话', '移动电话', '智能机', '电话机', '移动设备', '智能手机'],
      'LLM': ['大语言模型', '大模型', '语言模型', 'AI 模型', '神经网络模型'],
      'Token': ['标记', '词元', '令牌', '编码单元', '文本单元']
    }

    generatedSynonyms.value = mockResults[word] || [`生成的${word}近义词 1`, `生成的${word}近义词 2`, `生成的${word}近义词 3`]
    // 过滤掉已存在的近义词
    generatedSynonyms.value = generatedSynonyms.value.filter(s => !existingSynonyms.includes(s))
    generateLoading.value = false
  }, 1500)
}

const handleSelectGeneratedWord = (word) => {
  // 可以在点击时做一些处理
  ElMessage.info(`已选择：${word}`)
}

const handleConfirmAddGenerated = () => {
  if (currentEditingGroup.value) {
    // 添加到近义词组
    generatedSynonyms.value.forEach(word => {
      if (!currentEditingGroup.value.synonyms.includes(word)) {
        currentEditingGroup.value.synonyms.push(word)
      }
    })
    ElMessage.success('已添加到近义词组')
  } else {
    // 添加到词根的近义词列表
    const root = roots.value.find(r => r.word === generatingForWord.value)
    if (root) {
      generatedSynonyms.value.forEach(word => {
        if (!root.synonyms.includes(word)) {
          root.synonyms.push(word)
        }
      })
      ElMessage.success('已添加到词根近义词')
    }
  }
  generateResultDialogVisible.value = false
}

// 提示词配置
const handleSavePrompt = () => {
  ElMessage.success('提示词配置已保存')
}

const handleResetPrompt = () => {
  ElMessageBox.confirm('确定要重置提示词为默认配置吗？', '确认重置', { type: 'warning' })
    .then(() => {
      promptConfig.model = 'gpt-3.5-turbo'
      promptConfig.temperature = 0.7
      promptConfig.maxCount = 10
      promptConfig.systemPrompt = `你是一个词汇学助手，擅长为给定词汇生成相关的近义词。

## 任务
为输入的词生成语义相近的近义词列表。

## 要求
1. 生成的近义词应该是日常使用的词语
2. 近义词应该在大多数上下文中可以互换使用
3. 返回纯 JSON 数组格式：["近义词 1", "近义词 2", ...]
4. 不要包含解释或额外文字

## 输出示例
["买", "下单", "订购", "采购", "购置", "添置"]`
      promptConfig.userPromptTemplate = '请为"{word}"生成近义词列表。'
      ElMessage.success('已重置为默认配置')
    })
    .catch(() => {})
}

const handleTestPrompt = () => {
  testPromptWord.value = ''
  testPromptResult.value = []
  testPromptDialogVisible.value = true
}

const handleRunTestPrompt = () => {
  if (!testPromptWord.value.trim()) {
    ElMessage.warning('请输入测试词汇')
    return
  }

  testPromptLoading.value = true

  // 模拟 API 调用
  setTimeout(() => {
    const mockResults = {
      '购买': ['买', '下单', '订购', '采购', '购置'],
      '退款': ['退钱', '返还', '退还'],
      '客服': ['客服人员', '客服代表', '服务人员'],
      '手机': ['电话', '移动电话', '智能机']
    }
    testPromptResult.value = mockResults[testPromptWord.value] || [`测试近义词 1`, `测试近义词 2`, `测试近义词 3`]
    testPromptLoading.value = false
  }, 1200)
}

// 导出功能
const handleExport = () => {
  exportPreview.value = generateExportPreview()
  exportDialogVisible.value = true
}

const generateExportPreview = () => {
  const data = {}
  if (exportContent.value.includes('roots')) {
    data.roots = roots.value.length
  }
  if (exportContent.value.includes('synonyms')) {
    data.synonyms = synonymGroups.value.length
  }
  return `将导出 ${data.roots || 0} 个词根，${data.synonyms || 0} 个近义词组\n格式：${exportFormat.value.toUpperCase()}`
}

const handleConfirmExport = () => {
  const exportData = {}
  if (exportContent.value.includes('roots')) {
    exportData.roots = roots.value
  }
  if (exportContent.value.includes('synonyms')) {
    exportData.synonymGroups = synonymGroups.value
  }

  let content = ''
  let mimeType = ''
  let extension = exportFormat.value

  if (exportFormat.value === 'json') {
    content = JSON.stringify(exportData, null, 2)
    mimeType = 'application/json'
  } else {
    // CSV 格式
    content = 'type,id,word,definition,synonyms\n'
    if (exportContent.value.includes('roots')) {
      roots.value.forEach(r => {
        content += `root,${r.id},"${r.word}","${r.definition}","${r.synonyms.join(';')}"\n`
      })
    }
    if (exportContent.value.includes('synonyms')) {
      synonymGroups.value.forEach(g => {
        content += `synonym,${g.id},"${g.mainWord}","${g.synonyms.join(';')}"\n`
      })
    }
    mimeType = 'text/csv'
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vocabulary_${currentService.value.id}_${Date.now()}.${extension}`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
  exportDialogVisible.value = false
}

// 导入功能
const handleImport = () => {
  importMode.value = 'file'
  importPasteData.value = ''
  importFileData.value = null
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      importFileData.value = JSON.parse(e.target.result)
      ElMessage.success('文件解析成功')
    } catch (err) {
      ElMessage.error('文件格式不正确，请检查 JSON 格式')
    }
  }
  reader.readAsText(file.raw)
}

const handleConfirmImport = () => {
  let dataToImport = null

  if (importMode.value === 'file') {
    dataToImport = importFileData.value
  } else {
    try {
      dataToImport = JSON.parse(importPasteData.value)
    } catch (err) {
      ElMessage.error('JSON 格式不正确，请检查')
      return
    }
  }

  if (!dataToImport) {
    ElMessage.warning('请选择或粘贴要导入的数据')
    return
  }

  let importedCount = 0

  if (dataToImport.roots) {
    if (importOptions.value.includes('skipDuplicates')) {
      const existingWords = new Set(roots.value.map(r => r.word))
      dataToImport.roots.forEach(root => {
        if (!existingWords.has(root.word)) {
          roots.value.push({
            ...root,
            id: Date.now() + Math.random(),
            updateTime: new Date().toLocaleString()
          })
          importedCount++
        }
      })
    } else {
      dataToImport.roots.forEach(root => {
        roots.value.push({
          ...root,
          id: Date.now() + Math.random(),
          updateTime: new Date().toLocaleString()
        })
        importedCount++
      })
    }
  }

  if (dataToImport.synonymGroups) {
    dataToImport.synonymGroups.forEach(group => {
      synonymGroups.value.push({
        ...group,
        id: Date.now() + Math.random()
      })
      importedCount++
    })
  }

  ElMessage.success(`成功导入 ${importedCount} 条数据`)
  importDialogVisible.value = false
}

</script>

<style scoped>
.vocabulary-page {
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
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
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

.header-actions {
  display: flex;
  gap: 12px;
}

.content-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.roots-section,
.synonyms-section {
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 500;
}

.root-word {
  font-weight: 500;
  color: #303133;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-text {
  font-size: 12px;
  color: #909399;
}

.synonym-groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.synonym-card {
  position: relative;
  transition: transform 0.2s;
}

.synonym-card:hover {
  transform: translateY(-2px);
}

.synonym-card :deep(.el-card__body) {
  padding: 16px;
}

.synonym-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-word {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 8px;
}

.synonym-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 32px;
}

.synonym-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.prompt-section {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.prompt-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  line-height: 1.6;
}

.example-section {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.example-arrow {
  color: #409eff;
  font-size: 20px;
  margin: 8px 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.export-preview {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  white-space: pre-line;
}

.generate-result {
  padding: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.target-word {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.result-list {
  padding: 16px 0;
}

.result-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.loading-result,
.empty-result {
  padding: 20px 0;
}

.test-loading,
.test-empty,
.test-result {
  min-height: 80px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.test-result {
  padding: 12px 0;
}
</style>
