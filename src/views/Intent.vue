<template>
  <div class="intent-page">
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
          <el-tag size="small" type="info" style="margin-left: auto;">{{ service.groupCount }}</el-tag>
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
            <el-button type="primary" @click="handleAddGroup">
              <el-icon><Plus /></el-icon>
              新建意图组
            </el-button>
          </div>
        </div>

        <div class="intent-groups">
          <el-collapse v-model="expandedGroups" accordion>
            <el-collapse-item v-for="group in serviceGroups" :key="group.id" :name="group.id">
              <template #title>
                <div class="group-header">
                  <div class="group-info">
                    <el-icon class="group-icon" :style="{ color: group.color }"><Folder /></el-icon>
                    <span class="group-name">{{ group.name }}</span>
                    <el-tag size="small" type="info">{{ group.intents.length }} 个意图</el-tag>
                  </div>
                  <div class="group-actions" @click.stop>
                    <el-button type="primary" size="small" @click="handleDebugGroup(group)">
                      <el-icon><Monitor /></el-icon>
                      调试
                    </el-button>
                    <el-button type="primary" link size="small" @click="handleEditGroup(group)">编辑</el-button>
                    <el-button type="primary" link size="small" @click="handleAddIntentToGroup(group)">添加意图</el-button>
                  </div>
                </div>
              </template>

              <div class="intent-list">
                <el-table :data="group.intents" style="width: 100%" size="small">
                  <el-table-column prop="name" label="意图名称" width="150">
                    <template #default="{ row }">
                      <div class="intent-name">
                        <el-icon :style="{ color: row.color }"><PriceTag /></el-icon>
                        <span>{{ row.name }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="displayName" label="显示名称" width="120" />
                  <el-table-column prop="keywords" label="关键词" width="180">
                    <template #default="{ row }">
                      <el-tag v-for="kw in row.keywords.slice(0, 2)" :key="kw" size="small" style="margin-right: 4px;">{{ kw }}</el-tag>
                      <span v-if="row.keywords.length > 2" class="more-text">+{{ row.keywords.length - 2 }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="slots" label="槽位" width="120">
                    <template #default="{ row }">
                      <el-popover placement="top" :width="300" trigger="hover">
                        <template #reference>
                          <el-tag size="small" type="info" style="cursor: pointer;">{{ row.slots.length }} 个槽位</el-tag>
                        </template>
                        <div class="slot-popover">
                          <div v-for="slot in row.slots" :key="slot.name" class="slot-item">
                            <span class="slot-name">{{ slot.displayName }}</span>
                            <el-tag v-if="slot.required" size="small" type="danger">必填</el-tag>
                          </div>
                        </div>
                      </el-popover>
                    </template>
                  </el-table-column>
                  <el-table-column prop="confidence" label="置信度" width="80" align="center">
                    <template #default="{ row }">
                      <span class="confidence-text">{{ row.confidence }}%</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="samples" label="样本" width="70" align="right" />
                  <el-table-column prop="status" label="状态" width="70" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="240" align="center">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleDebugIntent(row, group)">
                        <el-icon><Monitor /></el-icon>
                        调试
                      </el-button>
                      <el-button type="primary" link size="small" @click="handleEditIntent(row, group)">编辑</el-button>
                      <el-button type="primary" link size="small" @click="handleManageSlots(row)">槽位</el-button>
                      <el-button type="danger" link size="small" @click="handleDeleteIntent(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <el-tabs v-model="activeTab" class="bottom-tabs" v-if="showDetailTabs">
          <el-tab-pane label="槽位管理" name="slots">
            <div class="slots-panel">
              <div class="panel-header">
                <span class="panel-title">意图：{{ currentIntent?.name }} - 槽位配置</span>
                <el-button type="primary" size="small" @click="handleAddSlot">
                  <el-icon><Plus /></el-icon>
                  添加槽位
                </el-button>
              </div>
              <el-table :data="currentIntentSlots" style="width: 100%" size="default">
                <el-table-column prop="name" label="槽位名称" width="120" />
                <el-table-column prop="displayName" label="显示名称" width="100" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="required" label="必填" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">{{ row.required ? '是' : '否' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150" />
                <el-table-column prop="prompt" label="追问话术" min-width="180">
                  <template #default="{ row }">
                    <el-tooltip :content="row.prompt" placement="top">
                      <span class="truncate-text">{{ row.prompt || '-' }}</span>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column prop="defaultValue" label="默认值" width="100" />
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditSlot(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteSlot(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="训练样本" name="samples">
            <div class="samples-panel">
              <div class="panel-header">
                <span class="panel-title">意图：{{ currentIntent?.name }} - 训练样本</span>
                <div class="panel-actions">
                  <el-button size="small" @click="handleImportSamples">
                    <el-icon><Upload /></el-icon>
                    批量导入
                  </el-button>
                  <el-button type="primary" size="small" @click="handleAddSample">
                    <el-icon><Plus /></el-icon>
                    添加样本
                  </el-button>
                </div>
              </div>
              <el-table :data="currentIntentSamples" style="width: 100%" size="default">
                <el-table-column prop="text" label="样本语句" min-width="300" />
                <el-table-column prop="slots" label="槽位标注" width="250">
                  <template #default="{ row }">
                    <div class="sample-slots">
                      <el-tag v-for="(value, key) in row.slotValues" :key="key" size="small" style="margin-right: 4px;">
                        {{ key }}: {{ value }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="source" label="来源" width="100" />
                <el-table-column prop="createTime" label="创建时间" width="150" />
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditSample(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteSample(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane label="意图测试" name="test">
            <div class="test-panel">
              <el-row :gutter="20">
                <el-col :span="10">
                  <div class="test-input-panel">
                    <div class="panel-section-title">测试输入</div>
                    <el-form label-width="80px">
                      <el-form-item label="测试语句">
                        <el-input v-model="testInput" type="textarea" :rows="4" placeholder="输入用户语句进行意图识别测试" />
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" @click="handleTest" :loading="testing">
                          <el-icon><VideoPlay /></el-icon>
                          开始识别
                        </el-button>
                        <el-button @click="testInput = ''; testResult = null">清空</el-button>
                      </el-form-item>
                    </el-form>
                    <div class="quick-samples">
                      <div class="quick-title">快速测试</div>
                      <div class="quick-list">
                        <el-tag v-for="sample in quickTestSamples" :key="sample" class="quick-tag" @click="testInput = sample">
                          {{ sample }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="14">
                  <div class="test-result-panel">
                    <div class="panel-section-title">识别结果</div>
                    <div v-if="!testResult" class="empty-result">
                      <el-empty description="输入测试语句并点击开始识别" :image-size="100" />
                    </div>
                    <template v-else>
                      <div class="result-item">
                        <div class="result-label">匹配意图</div>
                        <div class="result-value">
                          <el-tag :type="testResult.matched ? 'success' : 'warning'" size="large">
                            {{ testResult.intentName }}
                          </el-tag>
                          <span v-if="!testResult.matched" class="match-tip">（置信度不足，需人工确认）</span>
                        </div>
                      </div>
                      <div class="result-item">
                        <div class="result-label">置信度</div>
                        <el-progress :percentage="testResult.confidence" :color="getConfidenceColor(testResult.confidence)" />
                      </div>
                      <div class="result-item">
                        <div class="result-label">槽位提取</div>
                        <div class="extracted-slots">
                          <div v-for="slot in testResult.extractedSlots" :key="slot.name" class="extracted-slot">
                            <span class="slot-label">{{ slot.displayName }}:</span>
                            <span v-if="slot.value" class="slot-value">{{ slot.value }}</span>
                            <span v-else class="slot-empty">未提取</span>
                          </div>
                        </div>
                      </div>
                      <div class="result-item">
                        <div class="result-label">候选意图</div>
                        <div class="candidate-intents">
                          <div v-for="candidate in testResult.candidates" :key="candidate.name" class="candidate-item">
                            <span class="candidate-name">{{ candidate.name }}</span>
                            <el-progress :percentage="candidate.confidence" :stroke-width="6" style="width: 150px;" />
                          </div>
                        </div>
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

    <el-dialog v-model="groupDialogVisible" :title="isEditGroup ? '编辑意图组' : '新建意图组'" width="500px">
      <el-form :model="groupForm" label-width="80px">
        <el-form-item label="组名称" required>
          <el-input v-model="groupForm.name" placeholder="如：购买产品、售后维修" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="groupForm.description" type="textarea" :rows="2" placeholder="描述该意图组的用途" />
        </el-form-item>
        <el-form-item label="颜色标识">
          <el-color-picker v-model="groupForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveGroup">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="intentDrawerVisible" :title="isEditIntent ? '编辑意图' : '新建意图'" size="650px">
      <el-form :model="intentForm" label-width="100px">
        <el-form-item label="意图名称" required>
          <el-input v-model="intentForm.name" placeholder="如：buy_phone" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="intentForm.displayName" placeholder="如：购买手机" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="intentForm.description" type="textarea" :rows="2" placeholder="描述该意图的用途" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-select v-model="intentForm.keywords" multiple filterable allow-create placeholder="输入关键词后回车" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="置信度阈值">
          <el-slider v-model="intentForm.confidence" :min="0" :max="100" :format="(val) => val + '%'" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="intentForm.priority" :max="3" show-score />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="intentForm.status">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="intentForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="intentDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveIntent">保存</el-button>
      </template>
    </el-drawer>

    <el-drawer v-model="slotDrawerVisible" :title="isEditSlot ? '编辑槽位' : '新建槽位'" width="550px">
      <el-form :model="slotForm" label-width="100px">
        <el-form-item label="槽位名称" required>
          <el-input v-model="slotForm.name" placeholder="如：brand" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model="slotForm.displayName" placeholder="如：品牌" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="slotForm.type" style="width: 100%;">
            <el-option label="字符串" value="string" />
            <el-option label="数字" value="number" />
            <el-option label="日期" value="date" />
            <el-option label="时间" value="time" />
            <el-option label="枚举" value="enum" />
            <el-option label="实体" value="entity" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="slotForm.type === 'enum'" label="枚举值">
          <el-select v-model="slotForm.enumValues" multiple filterable allow-create style="width: 100%;" />
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch v-model="slotForm.required" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="slotForm.defaultValue" placeholder="可选" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="slotForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="追问话术">
          <el-input v-model="slotForm.prompt" placeholder="如：请问您想要什么品牌？" />
        </el-form-item>
        <el-form-item label="正则匹配">
          <el-input v-model="slotForm.regex" placeholder="用于提取的正则表达式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="slotDrawerVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSlot">保存</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="sampleDialogVisible" :title="isEditSample ? '编辑样本' : '添加样本'" width="600px">
      <el-form :model="sampleForm" label-width="80px">
        <el-form-item label="样本语句">
          <el-input v-model="sampleForm.text" type="textarea" :rows="3" placeholder="输入用户可能的表述" />
        </el-form-item>
        <el-form-item label="槽位标注">
          <div class="sample-annotation">
            <div v-for="slot in currentIntentSlots" :key="slot.name" class="annotation-item">
              <span class="annotation-label">{{ slot.displayName }}:</span>
              <el-input v-model="sampleForm.slotValues[slot.name]" :placeholder="'输入' + slot.displayName" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="sampleForm.source" style="width: 100%;">
            <el-option label="人工标注" value="人工标注" />
            <el-option label="系统采集" value="系统采集" />
            <el-option label="用户反馈" value="用户反馈" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sampleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSample">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="debugPanelVisible" title="意图调试" size="800px" direction="rtl">
      <div class="debug-panel">
        <div class="debug-input-section">
          <el-form label-width="80px">
            <el-form-item label="测试语句">
              <el-input v-model="debugInput" type="textarea" :rows="3" placeholder="输入用户语句进行意图识别测试" />
            </el-form-item>
            <el-form-item label="上下文">
              <el-input v-model="debugContext" placeholder="可选：输入对话上下文" />
            </el-form-item>
            <el-form-item label="调试模式">
              <el-radio-group v-model="debugMode">
                <el-radio value="auto">自动识别</el-radio>
                <el-radio value="group">指定意图组</el-radio>
                <el-radio value="intent">指定意图</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="debugMode === 'group'" label="选择意图组">
              <el-select v-model="debugSelectedGroup" placeholder="选择意图组" style="width: 100%;">
                <el-option v-for="group in serviceGroups" :key="group.id" :label="group.name" :value="group.id" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="debugMode === 'intent'" label="选择意图">
              <el-cascader
                v-model="debugSelectedIntent"
                :options="intentCascaderOptions"
                :props="{ value: 'id', label: 'name', children: 'intents' }"
                placeholder="选择意图组/意图"
                style="width: 100%;"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleDebug" :loading="debugLoading">
                <el-icon><VideoPlay /></el-icon>
                开始调试
              </el-button>
              <el-button @click="handleClearDebug">清空</el-button>
            </el-form-item>
          </el-form>

          <div class="quick-test-section">
            <div class="quick-title">快速测试语句</div>
            <div class="quick-list">
              <el-tag 
                v-for="sample in quickTestSamples" 
                :key="sample" 
                class="quick-tag"
                @click="debugInput = sample"
              >
                {{ sample }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="debug-result-section" v-if="debugResult">
          <el-divider content-position="left">调试结果</el-divider>
          
          <div class="result-block">
            <div class="result-header">
              <span class="result-title">意图识别</span>
              <el-tag v-if="debugResult.matched" type="success">识别成功</el-tag>
              <el-tag v-else type="warning">需人工确认</el-tag>
            </div>
            <div class="result-body">
              <div class="matched-intent">
                <div class="intent-info">
                  <el-tag :color="debugResult.intent.color" effect="dark" size="large">
                    {{ debugResult.intent.displayName }}
                  </el-tag>
                  <span class="intent-name-technical">{{ debugResult.intent.name }}</span>
                </div>
                <div class="confidence-display">
                  <span class="confidence-value" :style="{ color: getConfidenceColor(debugResult.confidence) }">
                    {{ debugResult.confidence }}%
                  </span>
                  <span class="confidence-label">置信度</span>
                </div>
              </div>
              <div class="intent-breadcrumb">
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item>{{ currentService?.name }}</el-breadcrumb-item>
                  <el-breadcrumb-item>{{ debugResult.groupName }}</el-breadcrumb-item>
                  <el-breadcrumb-item>{{ debugResult.intent.displayName }}</el-breadcrumb-item>
                </el-breadcrumb>
              </div>
            </div>
          </div>

          <div class="result-block">
            <div class="result-header">
              <span class="result-title">槽位提取</span>
              <el-tag type="info" size="small">{{ debugResult.extractedSlots.filter(s => s.matched).length }}/{{ debugResult.extractedSlots.length }} 已提取</el-tag>
            </div>
            <div class="result-body">
              <el-table :data="debugResult.extractedSlots" size="small">
                <el-table-column prop="displayName" label="槽位名称" width="100" />
                <el-table-column prop="type" label="类型" width="80">
                  <template #default="{ row }">
                    <el-tag size="small">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="提取结果" min-width="150">
                  <template #default="{ row }">
                    <div v-if="row.matched" class="slot-matched">
                      <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
                      <span class="slot-value">{{ row.value }}</span>
                    </div>
                    <div v-else class="slot-unmatched">
                      <el-icon class="empty-icon"><Remove /></el-icon>
                      <span class="empty-text">未提取</span>
                      <el-button v-if="row.required" type="primary" link size="small">追问</el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="originText" label="原文匹配" min-width="120">
                  <template #default="{ row }">
                    <span v-if="row.originText" class="origin-text">{{ row.originText }}</span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="required" label="必填" width="60" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.required" size="small" type="danger">是</el-tag>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div class="result-block">
            <div class="result-header">
              <span class="result-title">匹配详情</span>
            </div>
            <div class="result-body">
              <div class="match-detail">
                <div class="detail-item">
                  <span class="detail-label">关键词匹配：</span>
                  <div class="matched-keywords">
                    <el-tag v-for="kw in debugResult.matchedKeywords" :key="kw" type="success" size="small" style="margin-right: 4px;">
                      {{ kw }}
                    </el-tag>
                    <span v-if="debugResult.matchedKeywords.length === 0" class="empty-text">无</span>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="detail-label">匹配时间：</span>
                  <span class="detail-value">{{ debugResult.matchTime }}ms</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">匹配模式：</span>
                  <el-tag size="small">{{ debugResult.matchMode }}</el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="result-block">
            <div class="result-header">
              <span class="result-title">候选意图</span>
            </div>
            <div class="result-body">
              <el-table :data="debugResult.candidates" size="small">
                <el-table-column label="意图" min-width="150">
                  <template #default="{ row }">
                    <div class="candidate-info">
                      <el-tag :color="row.color" size="small">{{ row.displayName }}</el-tag>
                      <span class="candidate-name">{{ row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="置信度" width="200">
                  <template #default="{ row }">
                    <div class="candidate-confidence">
                      <el-progress :percentage="row.confidence" :color="getConfidenceColor(row.confidence)" :stroke-width="8" />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="匹配槽位" width="100" align="center">
                  <template #default="{ row }">
                    <span class="slot-count">{{ row.matchedSlots }}/{{ row.totalSlots }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleSelectCandidate(row)">选择</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div class="debug-actions">
            <el-button type="primary" @click="handleSaveAsSample">
              <el-icon><Collection /></el-icon>
              保存为样本
            </el-button>
            <el-button @click="handleCopyResult">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
            <el-button @click="handleExportResult">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </div>
        </div>

        <div v-else class="debug-empty">
          <el-empty description="输入测试语句并点击开始调试" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Box, Plus, Folder, PriceTag, VideoPlay, Upload, Monitor, CircleCheckFilled, Remove, Collection, CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeService = ref('chatbot')
const activeTab = ref('slots')
const expandedGroups = ref([])
const showDetailTabs = ref(false)
const currentIntent = ref(null)
const currentGroup = ref(null)

const debugPanelVisible = ref(false)
const debugInput = ref('')
const debugContext = ref('')
const debugMode = ref('auto')
const debugSelectedGroup = ref('')
const debugSelectedIntent = ref('')
const debugLoading = ref(false)
const debugResult = ref(null)

const groupDialogVisible = ref(false)
const intentDrawerVisible = ref(false)
const slotDrawerVisible = ref(false)
const sampleDialogVisible = ref(false)

const isEditGroup = ref(false)
const isEditIntent = ref(false)
const isEditSlot = ref(false)
const isEditSample = ref(false)

const testing = ref(false)
const testInput = ref('')
const testResult = ref(null)

const services = ref([
  { id: 'chatbot', name: '智能客服', description: '7x24小时智能客服，处理用户咨询、问题解答等场景', groupCount: 5 },
  { id: 'csp', name: 'CSP助手', description: 'CSP业务助手，协助处理业务流程和客户服务', groupCount: 3 },
  { id: 'agent2c', name: '2cAgent', description: '面向C端用户的智能代理，提供个性化服务', groupCount: 2 },
  { id: 'store', name: '门店助手', description: '门店运营助手，支持店员日常工作和客户服务', groupCount: 3 },
  { id: 'sales', name: '销售助手', description: '销售场景智能助手，辅助销售人员和客户沟通', groupCount: 2 },
  { id: 'technical', name: '技术支持', description: '技术问题解答和故障排查支持', groupCount: 2 }
])

const currentService = computed(() => services.value.find(s => s.id === activeService.value))

const serviceGroups = computed(() => {
  const groups = {
    chatbot: [
      {
        id: 'g1',
        name: '购买产品',
        description: '用户购买各类产品的意图',
        color: '#409eff',
        intents: [
          { id: 'i1', name: 'buy_phone', displayName: '购买手机', keywords: ['买手机', '手机', '新手机'], slots: [
            { name: 'brand', displayName: '品牌', type: 'string', required: true, description: '手机品牌', prompt: '请问您想要哪个品牌的手机？' },
            { name: 'model', displayName: '型号', type: 'string', required: false, description: '手机型号', prompt: '请问您有特定型号需求吗？' },
            { name: 'color', displayName: '颜色', type: 'string', required: false, description: '手机颜色', prompt: '请问您想要什么颜色？' },
            { name: 'storage', displayName: '存储', type: 'string', required: false, description: '存储容量', prompt: '请问您需要多大存储容量？' }
          ], confidence: 85, samples: 45, status: '启用', color: '#409eff' },
          { id: 'i2', name: 'buy_tablet', displayName: '购买平板', keywords: ['买平板', 'iPad', '平板电脑'], slots: [
            { name: 'brand', displayName: '品牌', type: 'string', required: true, description: '平板品牌', prompt: '请问您想要哪个品牌的平板？' },
            { name: 'size', displayName: '尺寸', type: 'string', required: false, description: '屏幕尺寸', prompt: '请问您需要多大尺寸？' },
            { name: 'cellular', displayName: '蜂窝版', type: 'boolean', required: false, description: '是否需要蜂窝版', prompt: '请问需要蜂窝版吗？' }
          ], confidence: 80, samples: 32, status: '启用', color: '#67c23a' },
          { id: 'i3', name: 'buy_wearable', displayName: '购买穿戴设备', keywords: ['手表', '手环', '穿戴'], slots: [
            { name: 'type', displayName: '类型', type: 'enum', enumValues: ['手表', '手环', '耳机'], required: true, description: '设备类型', prompt: '请问您需要手表、手环还是耳机？' },
            { name: 'brand', displayName: '品牌', type: 'string', required: false, description: '品牌', prompt: '请问您偏好哪个品牌？' }
          ], confidence: 75, samples: 28, status: '启用', color: '#e6a23c' },
          { id: 'i4', name: 'buy_tv', displayName: '购买电视', keywords: ['电视', 'TV', '电视机'], slots: [
            { name: 'size', displayName: '尺寸', type: 'string', required: true, description: '电视尺寸', prompt: '请问您需要多大尺寸的电视？' },
            { name: 'brand', displayName: '品牌', type: 'string', required: false, description: '品牌', prompt: '请问您偏好哪个品牌？' },
            { name: 'resolution', displayName: '分辨率', type: 'string', required: false, description: '分辨率要求', prompt: '请问对分辨率有要求吗？' }
          ], confidence: 80, samples: 22, status: '启用', color: '#f56c6c' }
        ]
      },
      {
        id: 'g2',
        name: '售后维修',
        description: '产品售后和维修相关意图',
        color: '#e6a23c',
        intents: [
          { id: 'i5', name: 'repair_request', displayName: '维修申请', keywords: ['维修', '修一下', '坏了'], slots: [
            { name: 'product_type', displayName: '产品类型', type: 'string', required: true, description: '需要维修的产品', prompt: '请问是什么产品需要维修？' },
            { name: 'issue', displayName: '故障描述', type: 'text', required: true, description: '故障问题', prompt: '请问具体是什么问题？' }
          ], confidence: 85, samples: 35, status: '启用', color: '#e6a23c' },
          { id: 'i6', name: 'repair_status', displayName: '维修进度查询', keywords: ['维修进度', '修好了吗', '维修状态'], slots: [
            { name: 'repair_id', displayName: '维修单号', type: 'string', required: true, description: '维修单号', prompt: '请问您的维修单号是多少？' }
          ], confidence: 90, samples: 18, status: '启用', color: '#909399' },
          { id: 'i7', name: 'repair_cancel', displayName: '取消维修', keywords: ['取消维修', '不想修了'], slots: [
            { name: 'repair_id', displayName: '维修单号', type: 'string', required: true, description: '维修单号', prompt: '请问您的维修单号是多少？' }
          ], confidence: 85, samples: 12, status: '启用', color: '#f56c6c' }
        ]
      },
      {
        id: 'g3',
        name: '产品咨询',
        description: '产品信息咨询相关意图',
        color: '#67c23a',
        intents: [
          { id: 'i8', name: 'product_info', displayName: '功能咨询', keywords: ['功能', '怎么用', '如何使用'], slots: [
            { name: 'product', displayName: '产品', type: 'string', required: true, description: '产品名称', prompt: '请问您咨询哪个产品？' },
            { name: 'feature', displayName: '功能', type: 'string', required: false, description: '具体功能', prompt: '请问您想了解哪个功能？' }
          ], confidence: 75, samples: 52, status: '启用', color: '#67c23a' },
          { id: 'i9', name: 'price_inquiry', displayName: '价格咨询', keywords: ['多少钱', '价格', '报价'], slots: [
            { name: 'product', displayName: '产品', type: 'string', required: true, description: '产品名称', prompt: '请问您想了解哪个产品的价格？' }
          ], confidence: 85, samples: 68, status: '启用', color: '#409eff' },
          { id: 'i10', name: 'spec_inquiry', displayName: '规格咨询', keywords: ['规格', '参数', '配置'], slots: [
            { name: 'product', displayName: '产品', type: 'string', required: true, description: '产品名称', prompt: '请问您想了解哪个产品的规格？' }
          ], confidence: 80, samples: 34, status: '启用', color: '#909399' }
        ]
      },
      {
        id: 'g4',
        name: '订单服务',
        description: '订单相关服务意图',
        color: '#909399',
        intents: [
          { id: 'i11', name: 'order_query', displayName: '订单查询', keywords: ['订单', '物流', '到哪了'], slots: [
            { name: 'order_id', displayName: '订单号', type: 'string', required: false, description: '订单编号', prompt: '请问您的订单号是多少？' }
          ], confidence: 90, samples: 85, status: '启用', color: '#409eff' },
          { id: 'i12', name: 'order_cancel', displayName: '取消订单', keywords: ['取消订单', '退单'], slots: [
            { name: 'order_id', displayName: '订单号', type: 'string', required: true, description: '订单编号', prompt: '请问您要取消哪个订单？' }
          ], confidence: 85, samples: 42, status: '启用', color: '#f56c6c' }
        ]
      },
      {
        id: 'g5',
        name: '退换货',
        description: '退换货相关意图',
        color: '#f56c6c',
        intents: [
          { id: 'i13', name: 'return_request', displayName: '退货申请', keywords: ['退货', '退回去'], slots: [
            { name: 'order_id', displayName: '订单号', type: 'string', required: true, description: '订单编号', prompt: '请问您要退货的订单号？' },
            { name: 'reason', displayName: '原因', type: 'text', required: true, description: '退货原因', prompt: '请问退货原因是什么？' }
          ], confidence: 85, samples: 38, status: '启用', color: '#f56c6c' },
          { id: 'i14', name: 'exchange_request', displayName: '换货申请', keywords: ['换货', '换一个'], slots: [
            { name: 'order_id', displayName: '订单号', type: 'string', required: true, description: '订单编号', prompt: '请问您要换货的订单号？' },
            { name: 'reason', displayName: '原因', type: 'text', required: false, description: '换货原因', prompt: '请问换货原因是什么？' }
          ], confidence: 80, samples: 25, status: '启用', color: '#e6a23c' }
        ]
      }
    ],
    csp: [
      {
        id: 'g6',
        name: '业务受理',
        color: '#409eff',
        intents: [
          { id: 'i15', name: 'business_accept', displayName: '业务办理', keywords: ['办理', '开通', '申请'], slots: [
            { name: 'business_type', displayName: '业务类型', type: 'string', required: true, description: '业务类型', prompt: '请问您想办理什么业务？' }
          ], confidence: 85, samples: 55, status: '启用', color: '#409eff' }
        ]
      },
      {
        id: 'g7',
        name: '工单处理',
        color: '#67c23a',
        intents: [
          { id: 'i16', name: 'ticket_create', displayName: '创建工单', keywords: ['创建工单', '提工单'], slots: [], confidence: 80, samples: 20, status: '启用', color: '#67c23a' },
          { id: 'i17', name: 'ticket_query', displayName: '工单查询', keywords: ['工单状态', '工单进度'], slots: [], confidence: 85, samples: 18, status: '启用', color: '#909399' }
        ]
      }
    ],
    agent2c: [
      {
        id: 'g8',
        name: '推荐服务',
        color: '#409eff',
        intents: [
          { id: 'i18', name: 'product_recommend', displayName: '产品推荐', keywords: ['推荐', '建议', '哪个好'], slots: [
            { name: 'category', displayName: '类别', type: 'string', required: false, description: '产品类别', prompt: '请问您想看哪类产品？' }
          ], confidence: 80, samples: 45, status: '启用', color: '#409eff' }
        ]
      }
    ],
    store: [
      {
        id: 'g9',
        name: '门店服务',
        color: '#67c23a',
        intents: [
          { id: 'i19', name: 'store_location', displayName: '门店位置', keywords: ['在哪', '地址', '位置'], slots: [
            { name: 'store_name', displayName: '门店名称', type: 'string', required: false, description: '门店名称', prompt: '请问您找哪个门店？' }
          ], confidence: 85, samples: 32, status: '启用', color: '#67c23a' },
          { id: 'i20', name: 'inventory_check', displayName: '库存查询', keywords: ['有货吗', '库存', '有没有'], slots: [
            { name: 'product', displayName: '商品', type: 'string', required: true, description: '商品名称', prompt: '请问您想查询什么商品？' }
          ], confidence: 80, samples: 28, status: '启用', color: '#e6a23c' }
        ]
      }
    ],
    sales: [
      {
        id: 'g10',
        name: '销售支持',
        color: '#409eff',
        intents: [
          { id: 'i21', name: 'price_quote', displayName: '报价', keywords: ['报价', '多少钱'], slots: [], confidence: 85, samples: 38, status: '启用', color: '#409eff' },
          { id: 'i22', name: 'discount_inquiry', displayName: '优惠咨询', keywords: ['优惠', '折扣', '活动'], slots: [], confidence: 80, samples: 25, status: '启用', color: '#e6a23c' }
        ]
      }
    ],
    technical: [
      {
        id: 'g11',
        name: '技术支持',
        color: '#f56c6c',
        intents: [
          { id: 'i23', name: 'bug_report', displayName: '故障申报', keywords: ['故障', '报错', '问题'], slots: [], confidence: 85, samples: 22, status: '启用', color: '#f56c6c' },
          { id: 'i24', name: 'usage_help', displayName: '使用帮助', keywords: ['怎么用', '如何使用', '教程'], slots: [], confidence: 75, samples: 35, status: '启用', color: '#409eff' }
        ]
      }
    ]
  }
  return groups[activeService.value] || []
})

const currentIntentSlots = computed(() => currentIntent.value?.slots || [])

const currentIntentSamples = computed(() => {
  if (!currentIntent.value) return []
  return [
    { id: 's1', text: '我想买个华为手机', slotValues: { brand: '华为' }, source: '人工标注', createTime: '2026-03-26 10:00' },
    { id: 's2', text: '有什么iPhone推荐吗', slotValues: { brand: 'iPhone' }, source: '系统采集', createTime: '2026-03-25 14:20' },
    { id: 's3', text: '想买个小尺寸的平板', slotValues: { size: '小尺寸' }, source: '人工标注', createTime: '2026-03-25 09:30' }
  ]
})

const quickTestSamples = computed(() => {
  const samples = {
    chatbot: ['我想买个华为手机', 'iPhone 15多少钱', '我的订单到哪了', '想退货怎么操作', '这个产品有什么功能'],
    csp: ['我想办理宽带', '查一下工单进度', '修改客户信息'],
    agent2c: ['帮我推荐一款笔记本', '有什么好的耳机推荐'],
    store: ['你们店在哪', '这款产品有货吗', '营业时间'],
    sales: ['这个多少钱', '有什么优惠活动'],
    technical: ['系统报错了', '这个功能怎么用']
  }
  return samples[activeService.value] || []
})

const groupForm = reactive({ id: '', name: '', description: '', color: '#409eff' })
const intentForm = reactive({ id: '', name: '', displayName: '', description: '', keywords: [], confidence: 75, priority: 2, status: '启用', color: '#409eff', groupId: '' })
const slotForm = reactive({ name: '', displayName: '', type: 'string', required: false, defaultValue: '', description: '', prompt: '', regex: '', enumValues: [] })
const sampleForm = reactive({ text: '', slotValues: {}, source: '人工标注' })

const handleServiceSelect = (index) => {
  activeService.value = index
  expandedGroups.value = []
  showDetailTabs.value = false
  currentIntent.value = null
  testResult.value = null
}

const handleAddGroup = () => {
  isEditGroup.value = false
  Object.assign(groupForm, { id: '', name: '', description: '', color: '#409eff' })
  groupDialogVisible.value = true
}

const handleEditGroup = (group) => {
  isEditGroup.value = true
  Object.assign(groupForm, group)
  groupDialogVisible.value = true
}

const handleSaveGroup = () => {
  groupDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleAddIntentToGroup = (group) => {
  currentGroup.value = group
  isEditIntent.value = false
  Object.assign(intentForm, { id: '', name: '', displayName: '', description: '', keywords: [], confidence: 75, priority: 2, status: '启用', color: '#409eff', groupId: group.id })
  intentDrawerVisible.value = true
}

const handleEditIntent = (intent, group) => {
  currentGroup.value = group
  isEditIntent.value = true
  Object.assign(intentForm, intent, { groupId: group.id })
  intentDrawerVisible.value = true
}

const handleDeleteIntent = (intent) => {
  ElMessage.success('删除成功')
}

const handleSaveIntent = () => {
  intentDrawerVisible.value = false
  ElMessage.success('保存成功')
}

const handleManageSlots = (intent) => {
  currentIntent.value = intent
  showDetailTabs.value = true
  activeTab.value = 'slots'
}

const handleManageSamples = (intent) => {
  currentIntent.value = intent
  showDetailTabs.value = true
  activeTab.value = 'samples'
}

const handleAddSlot = () => {
  isEditSlot.value = false
  Object.assign(slotForm, { name: '', displayName: '', type: 'string', required: false, defaultValue: '', description: '', prompt: '', regex: '', enumValues: [] })
  slotDrawerVisible.value = true
}

const handleEditSlot = (slot) => {
  isEditSlot.value = true
  slotDrawerVisible.value = true
}

const handleDeleteSlot = (slot) => {
  ElMessage.success('删除成功')
}

const handleSaveSlot = () => {
  slotDrawerVisible.value = false
  ElMessage.success('保存成功')
}

const handleAddSample = () => {
  isEditSample.value = false
  Object.assign(sampleForm, { text: '', slotValues: {}, source: '人工标注' })
  sampleDialogVisible.value = true
}

const handleEditSample = (sample) => {
  isEditSample.value = true
  sampleDialogVisible.value = true
}

const handleDeleteSample = (sample) => {
  ElMessage.success('删除成功')
}

const handleSaveSample = () => {
  sampleDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleImportSamples = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleTest = () => {
  if (!testInput.value.trim()) {
    ElMessage.warning('请输入测试语句')
    return
  }
  testing.value = true
  setTimeout(() => {
    testResult.value = {
      matched: true,
      intentName: '购买手机',
      confidence: 87,
      extractedSlots: [
        { name: 'brand', displayName: '品牌', value: '华为' },
        { name: 'model', displayName: '型号', value: '' },
        { name: 'color', displayName: '颜色', value: '' },
        { name: 'storage', displayName: '存储', value: '' }
      ],
      candidates: [
        { name: '购买手机', confidence: 87 },
        { name: '产品推荐', confidence: 45 },
        { name: '价格咨询', confidence: 32 }
      ]
    }
    testing.value = false
  }, 800)
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#67c23a'
  if (confidence >= 60) return '#e6a23c'
  return '#f56c6c'
}

const intentCascaderOptions = computed(() => {
  return serviceGroups.value.map(group => ({
    id: group.id,
    name: group.name,
    intents: group.intents.map(intent => ({
      id: intent.id,
      name: intent.displayName
    }))
  }))
})

const handleDebug = () => {
  if (!debugInput.value.trim()) {
    ElMessage.warning('请输入测试语句')
    return
  }

  debugLoading.value = true

  setTimeout(() => {
    const matchedKeywords = ['买', '手机', '华为']
    
    debugResult.value = {
      matched: true,
      groupName: '购买产品',
      intent: {
        id: 'i1',
        name: 'buy_phone',
        displayName: '购买手机',
        color: '#409eff'
      },
      confidence: 87,
      matchedKeywords,
      matchTime: 23,
      matchMode: debugMode.value === 'auto' ? '自动识别' : debugMode.value === 'group' ? '意图组匹配' : '指定意图',
      extractedSlots: [
        { name: 'brand', displayName: '品牌', type: 'string', required: true, matched: true, value: '华为', originText: '华为' },
        { name: 'model', displayName: '型号', type: 'string', required: false, matched: false, value: '', originText: '' },
        { name: 'color', displayName: '颜色', type: 'string', required: false, matched: false, value: '', originText: '' },
        { name: 'storage', displayName: '存储', type: 'string', required: false, matched: false, value: '', originText: '' }
      ],
      candidates: [
        { id: 'i1', name: 'buy_phone', displayName: '购买手机', confidence: 87, matchedSlots: 1, totalSlots: 4, color: '#409eff' },
        { id: 'i2', name: 'buy_tablet', displayName: '购买平板', confidence: 45, matchedSlots: 0, totalSlots: 3, color: '#67c23a' },
        { id: 'i8', name: 'product_info', displayName: '功能咨询', confidence: 32, matchedSlots: 0, totalSlots: 2, color: '#67c23a' },
        { id: 'i9', name: 'price_inquiry', displayName: '价格咨询', confidence: 28, matchedSlots: 0, totalSlots: 1, color: '#409eff' }
      ]
    }

    debugLoading.value = false
  }, 800)
}

const handleClearDebug = () => {
  debugInput.value = ''
  debugContext.value = ''
  debugResult.value = null
  debugSelectedGroup.value = ''
  debugSelectedIntent.value = ''
}

const handleDebugGroup = (group) => {
  debugMode.value = 'group'
  debugSelectedGroup.value = group.id
  debugPanelVisible.value = true
}

const handleDebugIntent = (intent, group) => {
  debugMode.value = 'intent'
  debugSelectedIntent.value = [group.id, intent.id]
  debugPanelVisible.value = true
}

const handleSelectCandidate = (candidate) => {
  debugResult.value.intent = {
    id: candidate.id,
    name: candidate.name,
    displayName: candidate.displayName,
    color: candidate.color
  }
  debugResult.value.confidence = candidate.confidence
  ElMessage.success(`已选择意图：${candidate.displayName}`)
}

const handleSaveAsSample = () => {
  ElMessage.success('已保存为训练样本')
}

const handleCopyResult = () => {
  if (debugResult.value) {
    const text = `意图: ${debugResult.value.intent.displayName}
置信度: ${debugResult.value.confidence}%
提取槽位: ${debugResult.value.extractedSlots.map(s => `${s.displayName}=${s.value || '未提取'}`).join(', ')}`
    navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  }
}

const handleExportResult = () => {
  ElMessage.success('导出功能开发中')
}
</script>

<style scoped>
.intent-page {
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
  display: flex;
  flex-direction: column;
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

.intent-groups {
  background-color: #fff;
  border-radius: 8px;
  flex: 1;
  overflow: auto;
}

.intent-groups :deep(.el-collapse) {
  border: none;
}

.intent-groups :deep(.el-collapse-item__header) {
  height: auto;
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.intent-groups :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.intent-groups :deep(.el-collapse-item__content) {
  padding: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 20px;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-icon {
  font-size: 20px;
}

.group-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.intent-list {
  padding: 16px 20px;
  background-color: #fafafa;
}

.intent-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-text {
  font-size: 12px;
  color: #909399;
}

.confidence-text {
  font-family: monospace;
  font-weight: 500;
}

.slot-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-popover .slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slot-popover .slot-name {
  font-size: 13px;
  color: #606266;
}

.bottom-tabs {
  background-color: #fff;
  border-radius: 8px;
  margin-top: 20px;
  flex-shrink: 0;
}

.bottom-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.bottom-tabs :deep(.el-tabs__content) {
  padding: 20px;
}

.slots-panel,
.samples-panel,
.test-panel {
  min-height: 300px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sample-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.test-input-panel,
.test-result-panel {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  min-height: 350px;
}

.panel-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.quick-samples {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.quick-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
}

.quick-tag:hover {
  opacity: 0.8;
}

.empty-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
}

.result-item {
  margin-bottom: 20px;
}

.result-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.result-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-tip {
  font-size: 12px;
  color: #e6a23c;
}

.extracted-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extracted-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 4px;
}

.slot-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.slot-value {
  font-size: 13px;
  color: #409eff;
}

.slot-empty {
  font-size: 13px;
  color: #c0c4cc;
}

.candidate-intents {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 4px;
}

.candidate-name {
  width: 100px;
  font-size: 13px;
  color: #606266;
}

.sample-annotation {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.annotation-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.annotation-label {
  width: 80px;
  font-size: 13px;
  color: #606266;
}

.debug-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.debug-input-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.quick-test-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.quick-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.debug-result-section {
  flex: 1;
  overflow-y: auto;
  padding-top: 20px;
}

.result-block {
  margin-bottom: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.result-body {
  padding: 16px;
}

.matched-intent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.intent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.intent-name-technical {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.confidence-display {
  text-align: right;
}

.confidence-value {
  font-size: 24px;
  font-weight: 600;
}

.confidence-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.intent-breadcrumb {
  margin-top: 8px;
}

.slot-matched {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-matched .success-icon {
  color: #67c23a;
}

.slot-matched .slot-value {
  color: #409eff;
  font-weight: 500;
}

.slot-unmatched {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-unmatched .empty-icon {
  color: #c0c4cc;
}

.slot-unmatched .empty-text {
  color: #c0c4cc;
}

.origin-text {
  background-color: #fef0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #f56c6c;
}

.match-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  min-width: 80px;
}

.detail-value {
  font-size: 13px;
  color: #303133;
}

.matched-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.candidate-name {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

.candidate-confidence {
  display: flex;
  align-items: center;
}

.slot-count {
  font-size: 12px;
  color: #606266;
}

.debug-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 20px;
}

.debug-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>