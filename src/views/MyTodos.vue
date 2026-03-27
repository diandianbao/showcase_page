<template>
  <div class="my-todos-page">
    <div class="page-header">
      <h1 class="page-title">我的代办</h1>
    </div>
    <div class="todos-content">
      <el-card>
        <el-table :data="todoData" style="width: 100%">
          <el-table-column type="selection" width="40" />
          <el-table-column prop="priority" label="优先级" width="80">
            <template #default="{ row }">
              <el-tag :type="row.priorityType" size="small">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="task" label="任务" min-width="200" />
          <el-table-column prop="module" label="模块" width="120" />
          <el-table-column prop="dueDate" label="截止日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const todoData = ref([
  { priority: '高', priorityType: 'danger', task: 'Review BadCase #1234', module: 'BadCase', dueDate: '2026-03-27', status: '待处理', statusType: '' },
  { priority: '中', priorityType: 'warning', task: '配置新的评估指标', module: '评估', dueDate: '2026-03-28', status: '进行中', statusType: 'primary' },
  { priority: '低', priorityType: 'info', task: '更新数据集文档', module: '数据集', dueDate: '2026-03-30', status: '待处理', statusType: '' }
])
</script>

<style scoped>
.my-todos-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
</style>
