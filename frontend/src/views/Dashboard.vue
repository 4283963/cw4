<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-total">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="40"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total || 0 }}</div>
              <div class="stat-label">处方总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-pending">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="40"><EditPen /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">待审处方</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-passed">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="40"><CircleCheck /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.passed || 0 }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card stat-rejected">
          <div class="stat-content">
            <div class="stat-icon"><el-icon :size="40"><CircleClose /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.rejected || 0 }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>待审任务提醒</span>
              <el-tag type="warning" effect="dark" size="small">{{ pendingCount }} 条</el-tag>
            </div>
          </template>
          <div class="todo-list">
            <div class="todo-item" @click="goToReview('first')">
              <div class="todo-left">
                <el-tag type="warning" effect="dark">一审</el-tag>
                <span class="todo-title">处方待一审</span>
              </div>
              <div class="todo-right">
                <el-badge :value="statistics.pendingFirst" class="badge-item" />
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="todo-item" @click="goToReview('second')">
              <div class="todo-left">
                <el-tag type="danger" effect="dark">二审</el-tag>
                <span class="todo-title">处方待二审</span>
              </div>
              <div class="todo-right">
                <el-badge :value="statistics.pendingSecond" class="badge-item" />
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Warning /></el-icon>
              <span>配伍冲突说明</span>
            </div>
          </template>
          <div class="conflict-guide">
            <el-alert
              title="严重冲突（DANGER）"
              type="error"
              description="严禁通过审核，必须联系医生修改处方或直接驳回。"
              show-icon
              :closable="false"
              style="margin-bottom: 16px"
            />
            <el-alert
              title="警告冲突（WARNING）"
              type="warning"
              description="存在潜在用药风险，请药师根据临床情况综合判断，确认后可通过审核。"
              show-icon
              :closable="false"
              style="margin-bottom: 16px"
            />
            <el-alert
              title="系统机制"
              type="info"
              description="药师在点击『通过审核』前，系统会自动检测配伍禁忌，弹出警告并在必要时阻止操作。"
              show-icon
              :closable="false"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>最近待审处方</span>
              <el-button text type="primary" size="small" @click="goToReview('first')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingList" v-loading="loading" stripe>
            <el-table-column prop="prescriptionNo" label="处方编号" width="200" />
            <el-table-column prop="patientName" label="患者" width="100">
              <template #default="{ row }">
                {{ row.patientName }}
                <el-tag size="small" style="margin-left: 4px">{{ row.patientGender === 'male' ? '男' : row.patientGender === 'female' ? '女' : '-' }}{{ row.patientAge }}岁</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="科室" width="140" />
            <el-table-column prop="doctorName" label="开方医生" width="120" />
            <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="开方时间" width="180">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Document, EditPen, CircleCheck, CircleClose, Bell, ArrowRight, Warning, List
} from '@element-plus/icons-vue';
import { getReviewStatistics, getPrescriptionList } from '@/api/prescription';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_MAP } from '@/utils/constants';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const statistics = ref({});
const pendingList = ref([]);

const pendingCount = computed(() => {
  return (statistics.value.pendingFirst || 0) + (statistics.value.pendingSecond || 0);
});

const fetchStatistics = async () => {
  try {
    const res = await getReviewStatistics();
    statistics.value = res.data || {};
  } catch (e) {
    console.error(e);
  }
};

const fetchPendingList = async () => {
  loading.value = true;
  try {
    const res = await getPrescriptionList({
      status: PRESCRIPTION_STATUS.PENDING_FIRST_REVIEW,
      pageSize: 5
    });
    pendingList.value = res.data?.list || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const goToReview = (type) => {
  router.push(type === 'first' ? '/review/first' : '/review/second');
};

const getStatusType = (status) => PRESCRIPTION_STATUS_MAP[status]?.type || 'info';
const getStatusLabel = (status) => PRESCRIPTION_STATUS_MAP[status]?.label || status;
const formatDate = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';

onMounted(() => {
  fetchStatistics();
  fetchPendingList();
});
</script>

<style scoped>
.stats-row .el-col {
  margin-bottom: 0;
}

.stat-card {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

.stat-card .el-card__body {
  padding: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-total .stat-icon {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}
.stat-pending .stat-icon {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}
.stat-passed .stat-icon {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}
.stat-rejected .stat-icon {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-header .el-tag {
  margin-left: auto;
}

.card-header .el-button {
  margin-left: auto;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.todo-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-title {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.todo-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.badge-item :deep(.el-badge__content) {
  font-size: 13px;
  padding: 0 8px;
  height: 20px;
  line-height: 20px;
}

.conflict-guide {
  padding: 4px 0;
}
</style>
