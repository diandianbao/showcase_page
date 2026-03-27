<template>
  <div class="knowledge-page">
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
          <el-tag size="small" type="info" style="margin-left: auto;">{{ service.kbCount }}</el-tag>
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
            <el-button type="primary" @click="handleCreateKnowledgeBase">
              <el-icon><Plus /></el-icon>
              新建知识库
            </el-button>
          </div>
        </div>

        <div class="knowledge-list">
          <el-row :gutter="20">
            <el-col v-for="kb in serviceKnowledgeBases" :key="kb.id" :span="8">
              <el-card shadow="hover" class="knowledge-card" @click="handleViewKnowledgeBase(kb)">
                <div class="card-header">
                  <div class="kb-icon" :style="{ background: kb.color }">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="kb-info">
                    <div class="kb-name">{{ kb.name }}</div>
                    <div class="kb-type">{{ kb.type }}</div>
                  </div>
                  <el-tag :type="kb.status === '启用' ? 'success' : 'info'" size="small">{{ kb.status }}</el-tag>
                </div>
                <div class="card-body">
                  <div class="kb-description">{{ kb.description }}</div>
                  <div class="kb-stats">
                    <div class="stat-item">
                      <span class="stat-label">文档数</span>
                      <span class="stat-value">{{ kb.docCount }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">片段数</span>
                      <span class="stat-value">{{ kb.chunkCount }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">容量</span>
                      <span class="stat-value">{{ kb.size }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-footer" @click.stop>
                  <el-button type="primary" link size="small" @click="handleViewKnowledgeBase(kb)">
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  <el-button type="primary" link size="small" @click="handleEditKnowledgeBase(kb)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="primary" link size="small" @click="handleManageDocs(kb)">
                    <el-icon><Folder /></el-icon>
                    文档
                  </el-button>
                  <el-dropdown trigger="click" @command="handleKnowledgeCommand">
                    <el-button link size="small" :data-kb="kb.id">
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ command: 'test', kb }">
                          <el-icon><Monitor /></el-icon>
                          测试检索
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ command: 'export', kb }">
                          <el-icon><Download /></el-icon>
                          导出
                        </el-dropdown-item>
                        <el-dropdown-item divided :command="{ command: 'delete', kb }">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-empty v-if="serviceKnowledgeBases.length === 0" description="暂无知识库，请点击右上角新建" />
        </div>
      </template>

      <template v-else>
        <el-empty description="请选择一个服务" />
      </template>
    </main>

    <!-- 查看知识库详情 -->
    <el-drawer v-model="viewDrawerVisible" title="知识库详情" size="800px">
      <div v-if="currentKnowledgeBase" class="view-content">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="知识库名称">{{ currentKnowledgeBase.name }}</el-descriptions-item>
            <el-descriptions-item label="知识库类型">{{ currentKnowledgeBase.type }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentKnowledgeBase.status === '启用' ? 'success' : 'info'" size="small">
                {{ currentKnowledgeBase.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentKnowledgeBase.createTime }}</el-descriptions-item>
            <el-descriptions-item label="文档数量">{{ currentKnowledgeBase.docCount }}</el-descriptions-item>
            <el-descriptions-item label="文本片段">{{ currentKnowledgeBase.chunkCount }}</el-descriptions-item>
            <el-descriptions-item label="存储容量">{{ currentKnowledgeBase.size }}</el-descriptions-item>
            <el-descriptions-item label="嵌入模型">{{ currentKnowledgeBase.embeddingModel }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h3 class="section-title">知识库描述</h3>
          <p class="description-text">{{ currentKnowledgeBase.description }}</p>
        </div>

        <div class="detail-section">
          <h3 class="section-title">文档列表</h3>
          <el-table :data="currentKnowledgeBaseDocs" style="width: 100%" size="small">
            <el-table-column prop="name" label="文档名称" min-width="200">
              <template #default="{ row }">
                <div class="doc-name">
                  <el-icon :class="getDocIconClass(row.type)"><Document /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="80" align="center" />
            <el-table-column prop="chunkCount" label="片段数" width="80" align="center" />
            <el-table-column prop="size" label="大小" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '已解析' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uploadTime" label="上传时间" width="150" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreviewDoc(row)">预览</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h3 class="section-title">检索配置</h3>
          <el-form label-width="120px">
            <el-form-item label="检索方式">
              <el-select v-model="currentKnowledgeBase.retrievalConfig.mode" style="width: 200px;">
                <el-option label="语义检索" value="semantic" />
                <el-option label="关键词检索" value="keyword" />
                <el-option label="混合检索" value="hybrid" />
              </el-select>
            </el-form-item>
            <el-form-item label="返回数量">
              <el-slider v-model="currentKnowledgeBase.retrievalConfig.topK" :min="1" :max="20" :step="1" show-input style="width: 200px;" />
            </el-form-item>
            <el-form-item label="相似度阈值">
              <el-slider v-model="currentKnowledgeBase.retrievalConfig.threshold" :min="0" :max="1" :step="0.05" show-input style="width: 200px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveRetrievalConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-drawer>

    <!-- 新建/编辑知识库 -->
    <el-dialog v-model="kbDialogVisible" :title="isEditKnowledgeBase ? '编辑知识库' : '新建知识库'" width="600px">
      <el-form :model="kbForm" label-width="100px">
        <el-form-item label="知识库名称" required>
          <el-input v-model="kbForm.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="知识库类型" required>
          <el-select v-model="kbForm.type" style="width: 100%;" placeholder="请选择类型">
            <el-option label="文档知识库" value="document" />
            <el-option label="QA 知识库" value="qa" />
            <el-option label="结构化知识库" value="structured" />
            <el-option label="混合知识库" value="hybrid" />
          </el-select>
        </el-form-item>
        <el-form-item label="嵌入模型" required>
          <el-select v-model="kbForm.embeddingModel" style="width: 100%;" placeholder="请选择嵌入模型">
            <el-option label="text-embedding-3-small" value="text-embedding-3-small" />
            <el-option label="text-embedding-3-large" value="text-embedding-3-large" />
            <el-option label="bge-large-zh-v1.5" value="bge-large-zh-v1.5" />
            <el-option label="m3e-base" value="m3e-base" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="kbForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色标识">
          <el-color-picker v-model="kbForm.color" />
        </el-form-item>
        <el-form-item label="知识库描述">
          <el-input v-model="kbForm.description" type="textarea" :rows="3" placeholder="请输入知识库描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="kbDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveKnowledgeBase">保存</el-button>
      </template>
    </el-dialog>

    <!-- 文档管理 -->
    <el-dialog v-model="docDialogVisible" title="文档管理" width="700px">
      <div class="doc-manager">
        <div class="doc-upload-section">
          <el-upload
            v-model:file-list="uploadFileList"
            class="upload-demo"
            drag
            :auto-upload="false"
            multiple
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 txt/md/pdf/docx/json 等格式文件
              </div>
            </template>
          </el-upload>
          <div class="upload-actions">
            <el-button type="primary" @click="handleBatchUpload" :loading="uploading">
              <el-icon><Upload /></el-icon>
              批量上传
            </el-button>
            <el-button @click="handleCreateQAPair">
              <el-icon><Edit /></el-icon>
              手动录入 QA
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="doc-list-section">
          <div class="list-header">
            <span class="list-title">已上传文档</span>
            <el-button size="small" @click="handleSyncDocs">
              <el-icon><Refresh /></el-icon>
              同步
            </el-button>
          </div>
          <el-table :data="currentKnowledgeBaseDocs" style="width: 100%" size="small">
            <el-table-column prop="name" label="文档名称" min-width="200">
              <template #default="{ row }">
                <div class="doc-name">
                  <el-icon :class="getDocIconClass(row.type)"><Document /></el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="chunkCount" label="片段数" width="80" align="center" />
            <el-table-column prop="size" label="大小" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '已解析' ? 'success' : 'warning'" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handlePreviewDoc(row)">预览</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteDoc(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="docDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- QA 对录入 -->
    <el-drawer v-model="qaDrawerVisible" title="录入 QA 对" size="600px">
      <el-form :model="qaForm" label-width="80px">
        <el-form-item label="问题" required>
          <el-input v-model="qaForm.question" type="textarea" :rows="3" placeholder="请输入问题" />
        </el-form-item>
        <el-form-item label="答案" required>
          <el-input v-model="qaForm.answer" type="textarea" :rows="6" placeholder="请输入答案" />
        </el-form-item>
        <el-form-item label="相似问题">
          <el-select v-model="qaForm.similarQuestions" multiple filterable allow-create placeholder="输入相似问法后回车" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader v-model="qaForm.category" :options="categoryOptions" style="width: 100%;" placeholder="选择分类" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="qaForm.tags" multiple filterable allow-create placeholder="输入标签后回车" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qaDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveQAPair">保存</el-button>
      </template>
    </el-drawer>

    <!-- 新增服务 -->
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

    <!-- 文档预览 -->
    <el-dialog v-model="previewDialogVisible" :title="previewDocName" width="800px">
      <div class="doc-preview">
        <div class="preview-tabs">
          <el-tabs v-model="previewActiveTab">
            <el-tab-pane label="原始内容" name="raw">
              <div class="preview-content">{{ previewContent.raw }}</div>
            </el-tab-pane>
            <el-tab-pane label="分块结果" name="chunks">
              <div class="chunks-list">
                <div v-for="(chunk, index) in previewContent.chunks" :key="index" class="chunk-item">
                  <div class="chunk-header">
                    <span class="chunk-index">块 {{ index + 1 }}</span>
                    <span class="chunk-size">{{ chunk.size }} chars</span>
                  </div>
                  <div class="chunk-content">{{ chunk.content }}</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Box, Document, View, Edit, Folder, More, Monitor, Download, Delete, Upload, UploadFilled, Refresh, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeService = ref('chatbot')

const services = ref([
  { id: 'chatbot', name: '智能客服', description: '7x24 小时智能客服，处理用户咨询、问题解答等场景', kbCount: 3 },
  { id: 'csp', name: 'CSP 助手', description: 'CSP 业务助手，协助处理业务流程和客户服务', kbCount: 2 },
  { id: 'agent2c', name: '2cAgent', description: '面向 C 端用户的智能代理，提供个性化服务', kbCount: 2 },
  { id: 'store', name: '门店助手', description: '门店运营助手，支持店员日常工作和客户服务', kbCount: 1 },
  { id: 'sales', name: '销售助手', description: '销售场景智能助手，辅助销售人员和客户沟通', kbCount: 2 },
  { id: 'technical', name: '技术支持', description: '技术问题解答和故障排查支持', kbCount: 1 }
])

const currentService = computed(() => services.value.find(s => s.id === activeService.value))

const serviceKnowledgeBases = computed(() => {
  const knowledgeBases = {
    chatbot: [
      { id: 'kb1', name: '产品知识库', type: '文档知识库', description: '包含公司产品的详细信息、规格参数、使用说明等', status: '启用', docCount: 45, chunkCount: 1280, size: '12.5 MB', color: '#409eff', createTime: '2026-03-01', embeddingModel: 'text-embedding-3-small', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } },
      { id: 'kb2', name: 'FAQ 知识库', type: 'QA 知识库', description: '常见问题解答，覆盖用户咨询的高频问题', status: '启用', docCount: 156, chunkCount: 156, size: '2.8 MB', color: '#67c23a', createTime: '2026-03-05', embeddingModel: 'text-embedding-3-small', retrievalConfig: { mode: 'semantic', topK: 3, threshold: 0.75 } },
      { id: 'kb3', name: '售后政策库', type: '结构化知识库', description: '退换货政策、保修条款、服务承诺等', status: '启用', docCount: 12, chunkCount: 85, size: '1.2 MB', color: '#e6a23c', createTime: '2026-03-10', embeddingModel: 'bge-large-zh-v1.5', retrievalConfig: { mode: 'hybrid', topK: 3, threshold: 0.8 } }
    ],
    csp: [
      { id: 'kb4', name: '业务流程库', type: '文档知识库', description: 'CSP 业务流程文档和操作指引', status: '启用', docCount: 28, chunkCount: 420, size: '5.6 MB', color: '#409eff', createTime: '2026-03-08', embeddingModel: 'text-embedding-3-small', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } },
      { id: 'kb5', name: '话术知识库', type: '混合知识库', description: '客服标准话术和应答模板', status: '启用', docCount: 65, chunkCount: 320, size: '3.2 MB', color: '#909399', createTime: '2026-03-12', embeddingModel: 'bge-large-zh-v1.5', retrievalConfig: { mode: 'semantic', topK: 5, threshold: 0.75 } }
    ],
    agent2c: [
      { id: 'kb6', name: '用户画像库', type: '结构化知识库', description: '用户特征、偏好、行为数据等', status: '启用', docCount: 8, chunkCount: 150, size: '8.9 MB', color: '#67c23a', createTime: '2026-03-15', embeddingModel: 'text-embedding-3-large', retrievalConfig: { mode: 'keyword', topK: 10, threshold: 0.6 } },
      { id: 'kb7', name: '推荐规则库', type: '混合知识库', description: '产品推荐规则和策略', status: '禁用', docCount: 15, chunkCount: 85, size: '1.5 MB', color: '#f56c6c', createTime: '2026-03-18', embeddingModel: 'bge-large-zh-v1.5', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } }
    ],
    store: [
      { id: 'kb8', name: '门店运营库', type: '文档知识库', description: '门店运营标准、工作流程、管理制度', status: '启用', docCount: 22, chunkCount: 280, size: '3.8 MB', color: '#409eff', createTime: '2026-03-20', embeddingModel: 'text-embedding-3-small', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } }
    ],
    sales: [
      { id: 'kb9', name: '产品话术库', type: 'QA 知识库', description: '产品销售话术和异议处理方案', status: '启用', docCount: 48, chunkCount: 48, size: '1.8 MB', color: '#e6a23c', createTime: '2026-03-08', embeddingModel: 'bge-large-zh-v1.5', retrievalConfig: { mode: 'semantic', topK: 3, threshold: 0.75 } },
      { id: 'kb10', name: '竞品分析库', type: '文档知识库', description: '竞品信息、对比分析、优势话术', status: '启用', docCount: 18, chunkCount: 220, size: '4.2 MB', color: '#f56c6c', createTime: '2026-03-22', embeddingModel: 'text-embedding-3-small', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } }
    ],
    technical: [
      { id: 'kb11', name: '技术文档库', type: '文档知识库', description: '产品技术文档、API 说明、故障排查指南', status: '启用', docCount: 35, chunkCount: 580, size: '8.5 MB', color: '#409eff', createTime: '2026-03-05', embeddingModel: 'text-embedding-3-large', retrievalConfig: { mode: 'hybrid', topK: 5, threshold: 0.7 } }
    ]
  }
  return knowledgeBases[activeService.value] || []
})

const currentKnowledgeBaseDocs = computed(() => {
  const docs = {
    kb1: [
      { id: 'd1', name: '产品 A 详细规格说明书.pdf', type: 'PDF', chunkCount: 45, size: '2.1 MB', status: '已解析', uploadTime: '2026-03-20 10:30' },
      { id: 'd2', name: '产品 B 用户手册.docx', type: 'DOCX', chunkCount: 32, size: '1.5 MB', status: '已解析', uploadTime: '2026-03-21 14:20' },
      { id: 'd3', name: '常见问题汇总.txt', type: 'TXT', chunkCount: 18, size: '0.3 MB', status: '已解析', uploadTime: '2026-03-22 09:15' },
      { id: 'd4', name: '产品对比分析.md', type: 'MD', chunkCount: 12, size: '0.2 MB', status: '解析中', uploadTime: '2026-03-26 16:00' }
    ],
    kb2: [
      { id: 'd5', name: '客服 FAQ 标准问答.json', type: 'JSON', chunkCount: 156, size: '2.8 MB', status: '已解析', uploadTime: '2026-03-15 11:00' }
    ],
    kb3: [],
    kb4: [],
    kb5: [],
    kb6: [],
    kb7: [],
    kb8: [],
    kb9: [],
    kb10: [],
    kb11: []
  }
  const currentKb = currentKnowledgeBase.value
  return docs[currentKb?.id] || []
})

const viewDrawerVisible = ref(false)
const kbDialogVisible = ref(false)
const docDialogVisible = ref(false)
const qaDrawerVisible = ref(false)
const serviceDialogVisible = ref(false)
const previewDialogVisible = ref(false)

const isEditKnowledgeBase = ref(false)
const uploading = ref(false)
const previewActiveTab = ref('raw')
const previewDocName = ref('')
const previewContent = ref({ raw: '', chunks: [] })

const currentKnowledgeBase = ref(null)
const currentManageDocKb = ref(null)

const kbForm = reactive({
  id: '',
  name: '',
  type: 'document',
  embeddingModel: 'text-embedding-3-small',
  status: '启用',
  color: '#409eff',
  description: ''
})

const qaForm = reactive({
  question: '',
  answer: '',
  similarQuestions: [],
  category: [],
  tags: []
})

const serviceForm = reactive({
  name: '',
  description: ''
})

const uploadFileList = ref([])

const categoryOptions = ref([
  { value: 'product', label: '产品类', children: [
    { value: 'product_specs', label: '产品规格' },
    { value: 'product_usage', label: '使用说明' },
    { value: 'product_price', label: '价格政策' }
  ]},
  { value: 'service', label: '服务类', children: [
    { value: 'after_sales', label: '售后服务' },
    { value: 'logistics', label: '物流配送' },
    { value: 'complaint', label: '投诉建议' }
  ]},
  { value: 'technical', label: '技术类', children: [
    { value: 'api', label: 'API 文档' },
    { value: 'troubleshooting', label: '故障排查' }
  ]}
])

const handleServiceSelect = (index) => {
  activeService.value = index
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
    kbCount: 0
  })
  serviceDialogVisible.value = false
  ElMessage.success('服务创建成功')
}

const handleCreateKnowledgeBase = () => {
  isEditKnowledgeBase.value = false
  Object.assign(kbForm, { id: '', name: '', type: 'document', embeddingModel: 'text-embedding-3-small', status: '启用', color: '#409eff', description: '' })
  kbDialogVisible.value = true
}

const handleEditKnowledgeBase = (kb) => {
  isEditKnowledgeBase.value = true
  Object.assign(kbForm, { ...kb })
  kbDialogVisible.value = true
}

const handleSaveKnowledgeBase = () => {
  kbDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleViewKnowledgeBase = (kb) => {
  currentKnowledgeBase.value = kb
  viewDrawerVisible.value = true
}

const handleManageDocs = (kb) => {
  currentManageDocKb.value = kb
  docDialogVisible.value = true
}

const handleKnowledgeCommand = ({ command, kb }) => {
  const actions = {
    test: () => {
      ElMessage.info('测试检索功能开发中')
    },
    export: () => {
      ElMessage.success('导出功能开发中')
    },
    delete: () => {
      ElMessage.success('删除成功')
    }
  }
  actions[command]?.()
}

const handleSaveRetrievalConfig = () => {
  ElMessage.success('检索配置已保存')
}

const handleBatchUpload = () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  uploading.value = true
  setTimeout(() => {
    uploading.value = false
    uploadFileList.value = []
    ElMessage.success('上传成功')
  }, 2000)
}

const handleCreateQAPair = () => {
  Object.assign(qaForm, { question: '', answer: '', similarQuestions: [], category: [], tags: [] })
  qaDrawerVisible.value = true
}

const handleSaveQAPair = () => {
  qaDrawerVisible.value = false
  ElMessage.success('QA 对已保存')
}

const handleSyncDocs = () => {
  ElMessage.success('文档已同步')
}

const handlePreviewDoc = (row) => {
  previewDocName.value = row.name
  previewContent.value = {
    raw: `这是文档《${row.name}》的原始内容预览...\n\n由于这是一个演示页面，这里只显示占位内容。\n\n实际使用时，这里会展示文档的完整原始内容，支持 PDF、DOCX、TXT 等格式的在线预览。`,
    chunks: [
      { size: 512, content: `这是第 1 个文本块的内容。\n\n从文档《${row.name}》中解析得到的第一个片段。\n这里包含了文档的开头部分，通常是引言或概述内容。` },
      { size: 480, content: `这是第 2 个文本块的内容。\n\n包含了文档的主要章节内容。\n在实际应用中，每个块的大小会根据配置的分块策略自动调整。` },
      { size: 520, content: `这是第 3 个文本块的内容。\n\n这里是文档的后续内容，可能是详细说明、示例或总结部分。\n分块有助于提高检索的准确性和效率。` }
    ]
  }
  previewDialogVisible.value = true
}

const handleDeleteDoc = (row) => {
  ElMessage.success(`文档"${row.name}"已删除`)
}

const getDocIconClass = (type) => {
  const icons = { PDF: 'pdf-icon', DOCX: 'word-icon', TXT: 'text-icon', MD: 'md-icon', JSON: 'json-icon' }
  return icons[type] || ''
}

const handlePreview = (kb) => {
  currentKnowledgeBase.value = kb
  viewDrawerVisible.value = true
}
</script>

<style scoped>
.knowledge-page {
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

.knowledge-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
}

.knowledge-card {
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.knowledge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.knowledge-card :deep(.el-card__body) {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.kb-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
}

.kb-info {
  flex: 1;
  min-width: 0;
}

.kb-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.kb-type {
  font-size: 12px;
  color: #909399;
}

.card-body {
  padding: 16px;
}

.kb-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kb-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #909399;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.card-footer .el-button {
  flex: 1;
  justify-content: center;
}

.view-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.description-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
}

.doc-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-name .el-icon {
  color: #409eff;
}

.doc-manager {
  max-height: 500px;
  overflow-y: auto;
}

.doc-upload-section {
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}

.upload-demo :deep(.el-upload-dragger) {
  padding: 40px 20px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.list-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.pdf-icon { color: #f56c6c; }
.word-icon { color: #409eff; }
.text-icon { color: #909399; }
.md-icon { color: #67c23a; }
.json-icon { color: #e6a23c; }

.preview-content {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  max-height: 500px;
  overflow-y: auto;
}

.chunks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.chunk-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.chunk-index {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.chunk-size {
  font-size: 12px;
  color: #909399;
}

.chunk-content {
  padding: 16px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}
</style>
