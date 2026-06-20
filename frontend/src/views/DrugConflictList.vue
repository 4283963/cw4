<template>
  <div class="conflict-list-page">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="page-title">
            <el-icon><Warning /></el-icon>
            <span>配伍禁忌规则库</span>
            <el-tag type="warning" effect="light" size="small" style="margin-left: 8px">
              审核系统会依据此库自动检测冲突
            </el-tag>
          </div>
          <el-button type="primary" :icon="Plus" size="large">新增配伍规则</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="药品名/冲突类型"
            clearable
            style="width: 260px"
            @keyup.enter="fetchList"
          />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select
            v-model="searchForm.severity"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="opt in CONFLICT_SEVERITY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="fetchList">查询</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="冲突药品" min-width="320">
          <template #default="{ row }">
            <div class="conflict-drugs">
              <el-tag type="info" size="large">{{ row.drugAName }}</el-tag>
              <el-icon style="color: #f56c6c"><Connection /></el-icon>
              <el-tag type="info" size="large">{{ row.drugBName }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="conflictType" label="冲突类型" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.conflictType || '配伍冲突' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="110">
          <template #default="{ row }">
            <el-tag
              :type="row.severity === 'danger' ? 'danger' : 'warning'"
              effect="dark"
            >
              {{ row.severity === 'danger' ? '严重' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="冲突描述" min-width="280" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="处理建议" min-width="260" show-overflow-tooltip />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">查看</el-button>
            <el-button type="primary" link size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Warning, Plus, Search, RefreshLeft, Connection } from '@element-plus/icons-vue';
import { getDrugConflictList } from '@/api/drug';
import { CONFLICT_SEVERITY_OPTIONS } from '@/utils/constants';

const loading = ref(false);
const tableData = ref([]);

const searchForm = reactive({
  keyword: '',
  severity: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getDrugConflictList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    });
    tableData.value = res.data?.list || [];
    pagination.total = res.data?.total || 0;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.severity = '';
  pagination.page = 1;
  fetchList();
};

onMounted(fetchList);
</script>

<style scoped>
.page-card {
  border-radius: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.conflict-drugs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
