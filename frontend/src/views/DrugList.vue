<template>
  <div class="drug-list-page">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="page-title">
            <el-icon><Box /></el-icon>
            <span>药品目录</span>
          </div>
          <el-button type="primary" :icon="Plus" size="large">新增药品</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="药品名称/编码"
            clearable
            style="width: 260px"
            @keyup.enter="fetchList"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category"
            placeholder="全部分类"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="c in categories"
              :key="c"
              :label="c"
              :value="c"
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
        <el-table-column prop="code" label="药品编码" width="120" />
        <el-table-column prop="name" label="药品名称" min-width="180">
          <template #default="{ row }">
            <strong>{{ row.name }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="140">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格" min-width="160" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="180" show-overflow-tooltip />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="dosage" label="用法用量" min-width="220" show-overflow-tooltip />
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
import { ref, reactive, onMounted, computed } from 'vue';
import { Box, Plus, Search, RefreshLeft } from '@element-plus/icons-vue';
import { getDrugList } from '@/api/drug';

const loading = ref(false);
const tableData = ref([]);
const categories = ref([]);

const searchForm = reactive({
  keyword: '',
  category: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getDrugList({
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
  searchForm.category = '';
  pagination.page = 1;
  fetchList();
};

onMounted(async () => {
  await fetchList();
  const catSet = new Set(tableData.value.map(d => d.category).filter(Boolean));
  categories.value = [...catSet];
});
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
