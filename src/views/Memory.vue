<template>
  <div class="memory-page">
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
          <el-tag size="small" :type="service.enabled ? 'success' : 'info'" style="margin-left: auto;">
            {{ service.enabled ? '已启用' : '未启用' }}
          </el-tag>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="main-content">
      <template v-if="currentService">
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">{{ currentService.name }} - 记忆配置</h1>
            <p class="page-desc">{{ currentService.description }}</p>
          </div>
          <div class="header-actions">
            <el-switch v-model="currentService.enabled" active-text="启用记忆" inactive-text="禁用记忆" />
          </div>
        </div>

        <el-tabs v-model="activeTab" class="content-tabs">
          <el-tab-pane label="基本配置" name="basic">
            <div class="config-section">
              <el-card shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">记忆提取配置</span>
                    <el-button type="primary" size="small" @click="handleSaveBasic">保存配置</el-button>
                  </div>
                </template>
                <el-form :model="basicConfig" label-width="140px">
                  <el-form-item label="记忆提取周期">
                    <el-radio-group v-model="basicConfig.extractCycle">
                      <el-radio value="realtime">实时提取</el-radio>
                      <el-radio value="scheduled">定时提取</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="basicConfig.extractCycle === 'scheduled'" label="提取时间">
                    <el-time-picker v-model="basicConfig.extractTime" placeholder="选择提取时间" />
                    <span class="form-tip">每天定时提取并压缩记忆</span>
                  </el-form-item>
                  <el-form-item label="最大记忆条数">
                    <el-input-number v-model="basicConfig.maxMemoryCount" :min="10" :max="10000" />
                    <span class="form-tip">超过限制后，旧的记忆将被自动压缩或删除</span>
                  </el-form-item>
                  <el-form-item label="记忆保留天数">
                    <el-input-number v-model="basicConfig.retentionDays" :min="1" :max="365" />
                    <span class="form-tip">超过天数的记忆将被自动清理</span>
                  </el-form-item>
                  <el-form-item label="压缩触发阈值">
                    <el-slider v-model="basicConfig.compressThreshold" :min="50" :max="100" :format="(val) => val + '%'" />
                    <span class="form-tip">当记忆条数达到最大条数的该比例时，触发自动压缩</span>
                  </el-form-item>
                  <el-form-item label="压缩后保留比例">
                    <el-slider v-model="basicConfig.compressKeepRatio" :min="10" :max="80" :format="(val) => val + '%'" />
                    <span class="form-tip">压缩后保留的原始记忆比例</span>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">记忆保存策略</span>
                  </div>
                </template>
                <el-form :model="basicConfig" label-width="140px">
                  <el-form-item label="保存策略">
                    <el-radio-group v-model="basicConfig.saveStrategy">
                      <el-radio value="importance">按重要性</el-radio>
                      <el-radio value="recency">按时间顺序</el-radio>
                      <el-radio value="hybrid">混合策略</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="重要性计算">
                    <el-checkbox-group v-model="basicConfig.importanceFactors">
                      <el-checkbox value="frequency">访问频率</el-checkbox>
                      <el-checkbox value="recency">最近访问时间</el-checkbox>
                      <el-checkbox value="feedback">用户反馈</el-checkbox>
                      <el-checkbox value="context">上下文相关性</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="去重策略">
                    <el-radio-group v-model="basicConfig.dedupStrategy">
                      <el-radio value="semantic">语义去重</el-radio>
                      <el-radio value="exact">精确去重</el-radio>
                      <el-radio value="none">不去重</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="相似度阈值">
                    <el-slider v-model="basicConfig.similarityThreshold" :min="50" :max="99" :format="(val) => val + '%'" />
                    <span class="form-tip">语义相似度超过此阈值将被视为重复</span>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">记忆检索配置</span>
                  </div>
                </template>
                <el-form :model="basicConfig" label-width="140px">
                  <el-form-item label="检索方式">
                    <el-checkbox-group v-model="basicConfig.retrievalMethods">
                      <el-checkbox value="vector">向量检索</el-checkbox>
                      <el-checkbox value="keyword">关键词检索</el-checkbox>
                      <el-checkbox value="time">时间范围检索</el-checkbox>
                      <el-checkbox value="user">用户关联检索</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="返回数量">
                    <el-input-number v-model="basicConfig.topK" :min="1" :max="20" />
                    <span class="form-tip">每次检索返回的最大记忆条数</span>
                  </el-form-item>
                  <el-form-item label="最小相关度">
                    <el-slider v-model="basicConfig.minRelevance" :min="0" :max="100" :format="(val) => val + '%'" />
                    <span class="form-tip">相关度低于此阈值的记忆将被过滤</span>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="提取提示词" name="prompt">
            <div class="prompt-section">
              <div class="prompt-header">
                <div class="prompt-info">
                  <span class="prompt-title">记忆提取提示词</span>
                  <span class="prompt-desc">配置大模型如何从对话中提取和压缩记忆</span>
                </div>
                <div class="prompt-actions">
                  <el-button size="small" @click="handleResetPrompt">重置为默认</el-button>
                  <el-button type="primary" size="small" @click="handleSavePrompt">保存</el-button>
                </div>
              </div>

              <div class="prompt-content">
                <div class="prompt-editor">
                  <div class="editor-header">
                    <span class="editor-title">系统提示词</span>
                    <div class="editor-tips">
                      <el-tag size="small" type="info">支持变量：{dialogue}, {user_info}, {time_range}</el-tag>
                    </div>
                  </div>
                  <el-input
                    v-model="extractPrompt.systemPrompt"
                    type="textarea"
                    :rows="12"
                    placeholder="输入系统提示词..."
                    class="prompt-textarea"
                  />
                </div>

                <div class="prompt-preview">
                  <div class="preview-header">
                    <span class="preview-title">预览</span>
                    <el-button size="small" @click="handleTestPrompt">测试提示词</el-button>
                  </div>
                  <div class="preview-content">
                    <div class="preview-item">
                      <span class="preview-label">目标：</span>
                      <span class="preview-value">从对话中提取关键信息并压缩为结构化记忆</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">输入变量：</span>
                      <div class="preview-variables">
                        <el-tag size="small">{dialogue}</el-tag>
                        <el-tag size="small">{user_info}</el-tag>
                        <el-tag size="small">{time_range}</el-tag>
                      </div>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">预期输出：</span>
                      <pre class="preview-output">{
  "facts": ["事实1", "事实2"],
  "preferences": ["偏好1", "偏好2"],
  "summary": "对话摘要",
  "importance": 0.85
}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <span>提取规则配置</span>
                </template>
                <div class="extract-rules">
                  <div class="rule-item">
                    <div class="rule-header">
                      <span class="rule-name">用户偏好提取</span>
                      <el-switch v-model="extractRules.userPreference" />
                    </div>
                    <div class="rule-desc">从对话中识别用户的偏好、习惯和兴趣</div>
                  </div>
                  <div class="rule-item">
                    <div class="rule-header">
                      <span class="rule-name">事实信息提取</span>
                      <el-switch v-model="extractRules.factualInfo" />
                    </div>
                    <div class="rule-desc">提取用户提到的具体事实、数据和信息</div>
                  </div>
                  <div class="rule-item">
                    <div class="rule-header">
                      <span class="rule-name">情感状态识别</span>
                      <el-switch v-model="extractRules.emotionState" />
                    </div>
                    <div class="rule-desc">识别用户的情感状态和情绪变化</div>
                  </div>
                  <div class="rule-item">
                    <div class="rule-header">
                      <span class="rule-name">意图历史记录</span>
                      <el-switch v-model="extractRules.intentHistory" />
                    </div>
                    <div class="rule-desc">记录用户的常见意图和行为模式</div>
                  </div>
                  <div class="rule-item">
                    <div class="rule-header">
                      <span class="rule-name">上下文关联</span>
                      <el-switch v-model="extractRules.contextRelation" />
                    </div>
                    <div class="rule-desc">建立记忆之间的关联关系</div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="压缩策略" name="compression">
            <div class="compression-section">
              <el-card shadow="never">
                <template #header>
                  <span>压缩策略配置</span>
                </template>
                <el-form :model="compressionConfig" label-width="140px">
                  <el-form-item label="压缩方式">
                    <el-radio-group v-model="compressionConfig.method">
                      <el-radio value="llm">大模型压缩</el-radio>
                      <el-radio value="summary">摘要压缩</el-radio>
                      <el-radio value="merge">合并压缩</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="压缩模型">
                    <el-select v-model="compressionConfig.model" style="width: 200px;">
                      <el-option label="GPT-4" value="gpt-4" />
                      <el-option label="GPT-3.5-turbo" value="gpt-3.5-turbo" />
                      <el-option label="Claude-3-sonnet" value="claude-3-sonnet" />
                      <el-option label="使用默认模型" value="default" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="压缩粒度">
                    <el-radio-group v-model="compressionConfig.granularity">
                      <el-radio value="session">按会话</el-radio>
                      <el-radio value="topic">按主题</el-radio>
                      <el-radio value="time">按时间段</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="合并时间窗口">
                    <el-input-number v-model="compressionConfig.mergeWindow" :min="1" :max="24" />
                    <span class="form-tip">小时，同一时间窗口内的记忆可合并</span>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <div class="card-header">
                    <span>压缩提示词</span>
                    <el-button type="primary" size="small" @click="handleSaveCompressionPrompt">保存</el-button>
                  </div>
                </template>
                <el-input
                  v-model="compressionConfig.prompt"
                  type="textarea"
                  :rows="10"
                  placeholder="输入压缩提示词，用于指导大模型如何压缩记忆..."
                />
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <span>压缩示例</span>
                </template>
                <div class="compression-example">
                  <div class="example-item">
                    <div class="example-label">原始记忆（5条）：</div>
                    <div class="example-content">
                      <div class="memory-line">1. 用户喜欢简洁的回答</div>
                      <div class="memory-line">2. 用户偏好使用Python语言</div>
                      <div class="memory-line">3. 用户熟悉后端开发</div>
                      <div class="memory-line">4. 用户从事科技行业</div>
                      <div class="memory-line">5. 用户习惯使用VSCode编辑器</div>
                    </div>
                  </div>
                  <div class="example-arrow">
                    <el-icon><Bottom /></el-icon>
                  </div>
                  <div class="example-item">
                    <div class="example-label">压缩后（1条）：</div>
                    <div class="example-content compressed">
                      <div class="memory-line">用户是科技行业后端开发者，偏好简洁回复和Python语言，常用VSCode编辑器</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="分类管理" name="categories">
            <div class="categories-section">
              <div class="categories-header">
                <span class="section-title">记忆分类</span>
                <el-button type="primary" size="small" @click="handleAddCategory">
                  <el-icon><Plus /></el-icon>
                  新增分类
                </el-button>
              </div>
              <el-table :data="memoryCategories" style="width: 100%">
                <el-table-column prop="name" label="分类名称" width="150" />
                <el-table-column prop="displayName" label="显示名称" width="120" />
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="priority" label="优先级" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.priority >= 3 ? 'danger' : row.priority >= 2 ? 'warning' : 'info'" size="small">
                      P{{ row.priority }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="retentionDays" label="保留天数" width="100" align="center" />
                <el-table-column prop="autoCompress" label="自动压缩" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.autoCompress ? 'success' : 'info'" size="small">
                      {{ row.autoCompress ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="memoryCount" label="记忆数" width="80" align="right" />
                <el-table-column label="操作" width="150" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditCategory(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteCategory(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="过期策略" name="expiration">
            <div class="expiration-section">
              <el-card shadow="never">
                <template #header>
                  <span>过期策略配置</span>
                </template>
                <el-form :model="expirationConfig" label-width="140px">
                  <el-form-item label="启用过期清理">
                    <el-switch v-model="expirationConfig.enabled" />
                  </el-form-item>
                  <el-form-item v-if="expirationConfig.enabled" label="清理周期">
                    <el-radio-group v-model="expirationConfig.cleanCycle">
                      <el-radio value="daily">每天</el-radio>
                      <el-radio value="weekly">每周</el-radio>
                      <el-radio value="monthly">每月</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="expirationConfig.enabled" label="清理时间">
                    <el-time-picker v-model="expirationConfig.cleanTime" placeholder="选择清理时间" />
                  </el-form-item>
                  <el-form-item label="默认保留期">
                    <el-input-number v-model="expirationConfig.defaultRetention" :min="1" :max="365" />
                    <span class="form-tip">天，未分类记忆的默认保留时间</span>
                  </el-form-item>
                  <el-form-item label="过期操作">
                    <el-radio-group v-model="expirationConfig.expiredAction">
                      <el-radio value="delete">直接删除</el-radio>
                      <el-radio value="archive">归档保存</el-radio>
                      <el-radio value="compress">压缩存储</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <span>分级过期规则</span>
                </template>
                <div class="expiration-rules">
                  <div class="rule-row header">
                    <span class="rule-cell">记忆类型</span>
                    <span class="rule-cell">保留期</span>
                    <span class="rule-cell">过期操作</span>
                    <span class="rule-cell">操作</span>
                  </div>
                  <div v-for="rule in expirationRules" :key="rule.type" class="rule-row">
                    <span class="rule-cell">{{ rule.name }}</span>
                    <span class="rule-cell">
                      <el-input-number v-model="rule.retention" size="small" :min="1" :max="365" /> 天
                    </span>
                    <span class="rule-cell">
                      <el-select v-model="rule.action" size="small">
                        <el-option label="删除" value="delete" />
                        <el-option label="归档" value="archive" />
                        <el-option label="压缩" value="compress" />
                      </el-select>
                    </span>
                    <span class="rule-cell">
                      <el-button type="primary" link size="small" @click="handleSaveRule(rule)">保存</el-button>
                    </span>
                  </div>
                </div>
              </el-card>

              <el-card shadow="never" style="margin-top: 16px;">
                <template #header>
                  <span>即将过期的记忆</span>
                  <el-tag size="small" type="warning" style="margin-left: 8px;">23 条即将过期</el-tag>
                </template>
                <el-table :data="expiringMemories" size="small">
                  <el-table-column prop="content" label="记忆内容" min-width="250">
                    <template #default="{ row }">
                      <span class="truncate-text">{{ row.content }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="category" label="分类" width="100" />
                  <el-table-column prop="createdAt" label="创建时间" width="150" />
                  <el-table-column prop="expireAt" label="过期时间" width="150">
                    <template #default="{ row }">
                      <span class="expire-warning">{{ row.expireAt }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleExtendMemory(row)">延长</el-button>
                      <el-button type="primary" link size="small" @click="handleArchiveMemory(row)">归档</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </el-tab-pane>

          <el-tab-pane label="记忆测试" name="test">
            <div class="test-section">
              <el-row :gutter="20">
                <el-col :span="10">
                  <div class="test-input-panel">
                    <div class="panel-title">记忆提取测试</div>
                    <el-form label-width="80px">
                      <el-form-item label="对话内容">
                        <el-input v-model="testInput" type="textarea" :rows="8" placeholder="输入对话内容进行记忆提取测试" />
                      </el-form-item>
                      <el-form-item label="用户信息">
                        <el-input v-model="testUserInfo" placeholder="用户ID或标识" />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="handleTestExtract" :loading="testLoading">
                          <el-icon><VideoPlay /></el-icon>
                          开始提取
                        </el-button>
                        <el-button @click="testInput = ''; testResult = null">清空</el-button>
                      </el-form-item>
                    </el-form>

                    <div class="test-presets">
                      <div class="preset-title">测试示例</div>
                      <div class="preset-list">
                        <el-tag v-for="preset in testPresets" :key="preset" class="preset-tag" @click="testInput = preset">
                          {{ preset.slice(0, 20) }}...
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="14">
                  <div class="test-result-panel">
                    <div class="panel-title">提取结果</div>
                    <div v-if="!testResult" class="empty-result">
                      <el-empty description="输入对话内容并点击开始提取" :image-size="100" />
                    </div>
                    <template v-else>
                      <div class="result-section">
                        <div class="result-label">提取的记忆</div>
                        <div class="extracted-memories">
                          <div v-for="memory in testResult.memories" :key="memory.id" class="memory-card">
                            <div class="memory-header">
                              <el-tag :type="memory.category === '偏好' ? 'success' : memory.category === '事实' ? 'primary' : 'info'" size="small">
                                {{ memory.category }}
                              </el-tag>
                              <span class="memory-importance">重要性: {{ memory.importance }}</span>
                            </div>
                            <div class="memory-content">{{ memory.content }}</div>
                            <div class="memory-meta">
                              <span>来源: {{ memory.source }}</span>
                              <span>置信度: {{ memory.confidence }}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="result-section">
                        <div class="result-label">压缩摘要</div>
                        <div class="compressed-summary">{{ testResult.summary }}</div>
                      </div>

                      <div class="result-section">
                        <div class="result-label">提取统计</div>
                        <el-descriptions :column="2" border size="small">
                          <el-descriptions-item label="提取条数">{{ testResult.stats.extracted }}</el-descriptions-item>
                          <el-descriptions-item label="压缩条数">{{ testResult.stats.compressed }}</el-descriptions-item>
                          <el-descriptions-item label="去重条数">{{ testResult.stats.deduplicated }}</el-descriptions-item>
                          <el-descriptions-item label="处理耗时">{{ testResult.stats.duration }}ms</el-descriptions-item>
                        </el-descriptions>
                      </div>

                      <div class="result-actions">
                        <el-button type="primary" @click="handleSaveTestResult">保存结果</el-button>
                        <el-button @click="handleCopyTestResult">复制结果</el-button>
                      </div>
                    </template>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </main>

    <el-dialog v-model="categoryDialogVisible" :title="isEditCategory ? '编辑分类' : '新增分类'" width="500px">
      <el-form :model="categoryForm" label-width="100px">
        <el-form-item label="分类名称" required>
          <el-input v-model="categoryForm.name" placeholder="如：user_preference" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="categoryForm.displayName" placeholder="如：用户偏好" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" type="textarea" :rows="2" placeholder="分类描述" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="categoryForm.priority" :max="3" show-score />
        </el-form-item>
        <el-form-item label="保留天数">
          <el-input-number v-model="categoryForm.retentionDays" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="自动压缩">
          <el-switch v-model="categoryForm.autoCompress" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Box, Plus, VideoPlay, Bottom } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeService = ref('chatbot')
const activeTab = ref('basic')
const categoryDialogVisible = ref(false)
const isEditCategory = ref(false)
const testLoading = ref(false)
const testInput = ref('')
const testUserInfo = ref('')
const testResult = ref(null)

const services = ref([
  { id: 'chatbot', name: '智能客服', description: '7x24小时智能客服记忆管理', enabled: true },
  { id: 'csp', name: 'CSP助手', description: 'CSP业务助手记忆管理', enabled: true },
  { id: 'agent2c', name: '2cAgent', description: 'C端用户代理记忆管理', enabled: true },
  { id: 'store', name: '门店助手', description: '门店运营助手记忆管理', enabled: false },
  { id: 'sales', name: '销售助手', description: '销售场景助手记忆管理', enabled: true },
  { id: 'technical', name: '技术支持', description: '技术支持记忆管理', enabled: true }
])

const currentService = computed(() => services.value.find(s => s.id === activeService.value))

const basicConfig = reactive({
  extractCycle: 'scheduled',
  extractTime: new Date(2024, 0, 1, 2, 0),
  maxMemoryCount: 1000,
  retentionDays: 30,
  compressThreshold: 80,
  compressKeepRatio: 30,
  saveStrategy: 'hybrid',
  importanceFactors: ['frequency', 'recency', 'feedback'],
  dedupStrategy: 'semantic',
  similarityThreshold: 85,
  retrievalMethods: ['vector', 'keyword'],
  topK: 5,
  minRelevance: 60
})

const extractPrompt = reactive({
  systemPrompt: `你是一个记忆提取助手，负责从对话中提取和压缩重要信息。

## 任务
分析用户对话，提取以下类型的记忆：
1. 用户偏好和习惯
2. 重要的个人信息
3. 上下文相关的关键事实
4. 用户情感状态

## 输出格式
返回JSON格式的结构化记忆：
{
  "memories": [
    {
      "type": "preference|fact|emotion|context",
      "content": "记忆内容",
      "confidence": 0.0-1.0,
      "importance": 0.0-1.0,
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "对话摘要"
}

## 对话内容
{dialogue}

## 用户信息
{user_info}

## 时间范围
{time_range}`
})

const extractRules = reactive({
  userPreference: true,
  factualInfo: true,
  emotionState: false,
  intentHistory: true,
  contextRelation: true
})

const compressionConfig = reactive({
  method: 'llm',
  model: 'gpt-3.5-turbo',
  granularity: 'topic',
  mergeWindow: 6,
  prompt: `请将以下多条相关记忆压缩为一条简洁的记忆，保留关键信息：

记忆列表：
{memories}

要求：
1. 合并相似信息
2. 去除冗余内容
3. 保留重要细节
4. 保持语义完整`
})

const expirationConfig = reactive({
  enabled: true,
  cleanCycle: 'daily',
  cleanTime: new Date(2024, 0, 1, 3, 0),
  defaultRetention: 30,
  expiredAction: 'archive'
})

const expirationRules = ref([
  { type: 'preference', name: '用户偏好', retention: 90, action: 'compress' },
  { type: 'fact', name: '事实信息', retention: 60, action: 'archive' },
  { type: 'emotion', name: '情感状态', retention: 7, action: 'delete' },
  { type: 'context', name: '上下文关联', retention: 30, action: 'compress' },
  { type: 'behavior', name: '行为记录', retention: 14, action: 'delete' }
])

const memoryCategories = ref([
  { id: 'c1', name: 'user_preference', displayName: '用户偏好', description: '用户的偏好和习惯设置', priority: 3, retentionDays: 90, autoCompress: true, memoryCount: 156 },
  { id: 'c2', name: 'personal_info', displayName: '个人信息', description: '用户的个人资料信息', priority: 3, retentionDays: 180, autoCompress: false, memoryCount: 45 },
  { id: 'c3', name: 'interaction_history', displayName: '交互历史', description: '用户的历史对话记录', priority: 1, retentionDays: 30, autoCompress: true, memoryCount: 892 },
  { id: 'c4', name: 'context_memory', displayName: '上下文记忆', description: '对话上下文相关信息', priority: 2, retentionDays: 7, autoCompress: true, memoryCount: 234 },
  { id: 'c5', name: 'emotional_state', displayName: '情感状态', description: '用户的情感和情绪记录', priority: 1, retentionDays: 3, autoCompress: false, memoryCount: 67 }
])

const categoryForm = reactive({
  id: '',
  name: '',
  displayName: '',
  description: '',
  priority: 1,
  retentionDays: 30,
  autoCompress: false
})

const testPresets = ref([
  '用户说：我比较喜欢简洁的回答，不需要太多客套话',
  '用户说：我是做后端开发的，主要用Java和Python',
  '用户说：最近在学机器学习，有什么好的入门教程推荐吗？',
  '用户说：我不喜欢早上被打扰，下午联系我比较好'
])

const expiringMemories = ref([
  { id: 'm1', content: '用户偏好使用深色主题模式', category: '偏好', createdAt: '2026-02-25', expireAt: '2026-03-28' },
  { id: 'm2', content: '用户对价格敏感，喜欢性价比高的产品', category: '偏好', createdAt: '2026-02-20', expireAt: '2026-03-27' },
  { id: 'm3', content: '用户正在考虑购买新手机', category: '事实', createdAt: '2026-03-01', expireAt: '2026-03-29' }
])

const handleServiceSelect = (index) => {
  activeService.value = index
}

const handleSaveBasic = () => ElMessage.success('配置已保存')
const handleSavePrompt = () => ElMessage.success('提示词已保存')
const handleResetPrompt = () => {
  ElMessage.success('已重置为默认提示词')
}
const handleTestPrompt = () => ElMessage.info('测试功能开发中')
const handleSaveCompressionPrompt = () => ElMessage.success('压缩提示词已保存')

const handleAddCategory = () => {
  isEditCategory.value = false
  Object.assign(categoryForm, { id: '', name: '', displayName: '', description: '', priority: 1, retentionDays: 30, autoCompress: false })
  categoryDialogVisible.value = true
}

const handleEditCategory = (row) => {
  isEditCategory.value = true
  Object.assign(categoryForm, row)
  categoryDialogVisible.value = true
}

const handleDeleteCategory = (row) => {
  ElMessage.success('分类已删除')
}

const handleSaveCategory = () => {
  categoryDialogVisible.value = false
  ElMessage.success('分类已保存')
}

const handleSaveRule = (rule) => {
  ElMessage.success(`规则 ${rule.name} 已保存`)
}

const handleExtendMemory = (row) => {
  ElMessage.success('已延长记忆保留期')
}

const handleArchiveMemory = (row) => {
  ElMessage.success('已归档记忆')
}

const handleTestExtract = () => {
  if (!testInput.value.trim()) {
    ElMessage.warning('请输入对话内容')
    return
  }

  testLoading.value = true
  setTimeout(() => {
    testResult.value = {
      memories: [
        { id: 'tm1', category: '偏好', content: '用户偏好简洁的回答风格', importance: 0.85, confidence: 92, source: '对话提取' },
        { id: 'tm2', category: '事实', content: '用户从事后端开发工作', importance: 0.75, confidence: 88, source: '对话提取' },
        { id: 'tm3', category: '偏好', content: '用户使用Python和Java语言', importance: 0.70, confidence: 85, source: '对话提取' }
      ],
      summary: '用户是后端开发者，偏好简洁的回复风格，主要使用Python和Java语言',
      stats: {
        extracted: 3,
        compressed: 1,
        deduplicated: 0,
        duration: 156
      }
    }
    testLoading.value = false
  }, 800)
}

const handleSaveTestResult = () => {
  ElMessage.success('测试结果已保存')
}

const handleCopyTestResult = () => {
  if (testResult.value) {
    navigator.clipboard.writeText(JSON.stringify(testResult.value, null, 2))
    ElMessage.success('已复制到剪贴板')
  }
}
</script>

<style scoped>
.memory-page {
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

.content-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.config-section {
  display: flex;
  flex-direction: column;
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

.prompt-section {
  min-height: 500px;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.prompt-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.prompt-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.prompt-content {
  display: flex;
  gap: 20px;
}

.prompt-editor {
  flex: 1;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.editor-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.prompt-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  line-height: 1.6;
}

.prompt-preview {
  width: 320px;
  flex-shrink: 0;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.preview-content {
  font-size: 13px;
}

.preview-item {
  margin-bottom: 12px;
}

.preview-label {
  color: #909399;
  margin-right: 8px;
}

.preview-value {
  color: #606266;
}

.preview-variables {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.preview-output {
  background-color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #606266;
  overflow-x: auto;
}

.extract-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 6px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rule-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.rule-desc {
  font-size: 12px;
  color: #909399;
}

.compression-section {
  min-height: 400px;
}

.compression-example {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
}

.example-item {
  margin-bottom: 16px;
}

.example-item:last-child {
  margin-bottom: 0;
}

.example-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.example-content {
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.example-content.compressed {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
}

.memory-line {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.example-arrow {
  text-align: center;
  color: #409eff;
  font-size: 24px;
  margin: 12px 0;
}

.categories-section {
  min-height: 400px;
}

.categories-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.expiration-section {
  min-height: 400px;
}

.expiration-rules {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.rule-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}

.rule-row:last-child {
  border-bottom: none;
}

.rule-row.header {
  background-color: #fafafa;
  font-weight: 500;
  color: #606266;
}

.rule-cell {
  flex: 1;
  padding: 12px 16px;
  font-size: 13px;
}

.rule-row.header .rule-cell {
  font-size: 13px;
}

.expire-warning {
  color: #e6a23c;
  font-weight: 500;
}

.test-section {
  min-height: 500px;
}

.test-input-panel,
.test-result-panel {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  min-height: 450px;
}

.panel-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.test-presets {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.preset-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-tag {
  cursor: pointer;
}

.preset-tag:hover {
  opacity: 0.8;
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
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}

.extracted-memories {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.memory-card {
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  padding: 12px;
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.memory-importance {
  font-size: 12px;
  color: #909399;
}

.memory-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 8px;
}

.memory-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.compressed-summary {
  background-color: #fff;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>