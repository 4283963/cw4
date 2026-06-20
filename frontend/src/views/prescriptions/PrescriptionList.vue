<template>
  <div class="prescription-list">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="page-title">
            <el-icon><Document /></el-icon>
            <span>处方管理</span>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="searchForm.keyword"
            placeholder="处方编号/患者姓名/身份证号"
            clearable
            style="width: 260px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="处方状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in PRESCRIPTION_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科室">
          <el-input
            v-model="searchForm.department"
            placeholder="请输入科室"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="开方日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="prescriptionNo" label="处方编号" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">{{ row.prescriptionNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="患者信息" width="200">
          <template #default="{ row }">
            <div class="patient-info">
              <div class="patient-name">{{ row.patientName }}</div>
              <div class="patient-extra">
                {{ row.patientGender === 'male' ? '男' : row.patientGender === 'female' ? '女' : '-' }}
                {{ row.patientAge || '-' }}岁
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="就诊科室" width="140" />
        <el-table-column prop="diagnosis" label="诊断" min-width="180" show-overflow-tooltip />
        <el-table-column prop="doctorName" label="开方医生" width="120" />
        <el-table-column label="药物数量" width="100" align="center">
          <template #default="{ row }">{{ row.itemCount || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="开方时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW"
              type="warning"
              link
              size="small"
              @click="goFirstReview(row)"
            >一审</el-button>
            <el-button
              v-if="row.status === PRESCRIPTION_STATUS.PENDING_SECOND_REVIEW"
              type="success"
              link
              size="small"
              @click="goSecondReview(row)"
            >二审</el-button>
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
import { useRouter } from 'vue-router';
import { Search, RefreshLeft, Document } from '@element-plus/icons-vue';
import { getPrescriptionList } from '@/api/prescription';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_MAP, PRESCRIPTION_STATUS_OPTIONS } from '@/utils/constants';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const tableData = ref([]);
const dateRange = ref([]);

const searchForm = reactive({
  keyword: '',
  status: '',
  department: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const getStatusType = (s) => PRESCRIPTION_STATUS_MAP[s]?.type || 'info';
const getStatusLabel = (s) => PRESCRIPTION_STATUS_MAP[s]?.label || s;
const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';

const fetchList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }
    const res = await getPrescriptionList(params);
    tableData.value = res.data?.list || [];
    pagination.total = res.data?.total || 0;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchList();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  searchForm.department = '';
  dateRange.value = [];
  handleSearch();
};

const viewDetail = (row) => {
  router.push(`/prescriptions/${row.id}`);
};

const goFirstReview = (row) => {
  router.push({ path: '/review/first', query: { id: row.id } });
};

const goSecondReview = (row) => {
  router.push({ path: '/review/second', query: { id: row.id } });
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

.patient-info {
  line-height: 1.4;
}

.patient-name {
  font-weight: 500;
  color: #303133;
}

.patient-extra {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
